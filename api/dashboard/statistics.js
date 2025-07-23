const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

// Helper function to build WHERE clause based on filters
function buildFilterWhereClause(filters) {
  let conditions = ["k.Kedja = 'Länsfast'"];
  
  // Time-based filters
  if (filters.month) {
    conditions.push(`MONTH(l.LogDate) = ${parseInt(filters.month)}`);
  }
  if (filters.year) {
    conditions.push(`YEAR(l.LogDate) = ${parseInt(filters.year)}`);
  }
  if (filters.quarter) {
    const quarter = parseInt(filters.quarter);
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    conditions.push(`MONTH(l.LogDate) BETWEEN ${startMonth} AND ${endMonth}`);
  }
  if (filters.lastDays) {
    const days = parseInt(filters.lastDays);
    if (days === 0) {
      conditions.push(`CAST(l.LogDate AS DATE) = CAST(GETDATE() AS DATE)`);
    } else {
      conditions.push(`l.LogDate >= DATEADD(day, -${days}, GETDATE())`);
    }
  }
  if (filters.city) {
    conditions.push(`k.Ort = '${filters.city.replace(/'/g, "''")}'`);
  }
  if (filters.volumeLevel) {
    if (filters.volumeLevel === 'low') {
      conditions.push(`l.AntalSidor BETWEEN 1 AND 10`);
    } else if (filters.volumeLevel === 'medium') {
      conditions.push(`l.AntalSidor BETWEEN 11 AND 50`);
    } else if (filters.volumeLevel === 'high') {
      conditions.push(`l.AntalSidor > 50`);
    }
  }
  
  return conditions.join(' AND ');
}

module.exports = async (req, res) => {
  // Set CORS headers - Allow multiple origins for iframe support
  const allowedOrigins = [
    'https://scantovitec.vercel.app',
    'https://playipp.se',
    'https://www.playipp.se',
    'https://app.playipp.se'
  ];
  
  const origin = req.headers.origin;
  console.log('Origin:', origin, 'NODE_ENV:', process.env.NODE_ENV);
  
  if (process.env.NODE_ENV === 'production') {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Fallback to allow all for now to debug iframe issues
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Frame-Options', 'ALLOWALL');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const pool = await getPool();
    const filters = req.query;
    
    const hasTimeFilters = filters.month || filters.year || filters.quarter || filters.week || filters.lastDays || (filters.dateFrom && filters.dateTo);
    
    // If no time filters, default to last 30 days for activity data
    let filterCondition;
    let activityFilterCondition;
    
    if (!hasTimeFilters) {
      filterCondition = "k.Kedja = 'Länsfast'";
      activityFilterCondition = "k.Kedja = 'Länsfast' AND l.LogDate >= DATEADD(day, -30, GETDATE())";
    } else {
      filterCondition = buildFilterWhereClause(filters);
      activityFilterCondition = filterCondition;
    }
    
    const queries = await Promise.all([
      pool.request().query('SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = \\'Länsfast\\''),
      pool.request().query(`
        SELECT COUNT(DISTINCT k.CrmID) as activeKunder 
        FROM Kunder k 
        INNER JOIN Logs l ON k.CrmID = l.CrmID 
        WHERE ${activityFilterCondition}
      `),
      pool.request().query(`
        SELECT COALESCE(SUM(l.AntalSidor), 0) as totalSidor 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${activityFilterCondition}
      `),
      pool.request().query(`
        SELECT COUNT(*) as totalScans 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${activityFilterCondition}
      `)
    ]);

    // Determine footer text based on active filters
    let footerText = "Senaste 30 dagarna"; // Default
    
    if (filters.lastDays) {
      const days = parseInt(filters.lastDays);
      if (days === 0) {
        footerText = "Idag";
      } else {
        footerText = `Senaste ${days} dagarna`;
      }
    } else if (filters.month && filters.year) {
      const months = ['', 'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
      footerText = `${months[parseInt(filters.month)]} ${filters.year}`;
    } else if (filters.quarter && filters.year) {
      footerText = `Q${filters.quarter} ${filters.year}`;
    } else if (filters.quarter) {
      footerText = `Q${filters.quarter}`;
    } else if (filters.year) {
      footerText = `${filters.year}`;
    } else if (filters.month) {
      const months = ['', 'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
      footerText = `${months[parseInt(filters.month)]}`;
    }

    const statistics = [
      {
        color: "light-blue",
        icon: "BuildingOfficeIcon",
        title: "Totalt antal kontor",
        value: queries[0].recordset[0].totalKunder || 0,
        footer: {
          color: "text-blue-500",
          value: "Registrerade",
          label: "i systemet"
        }
      },
      {
        color: "light-blue", 
        icon: "UserGroupIcon",
        title: "Aktiva Kontor",
        value: queries[1].recordset[0].activeKunder || 0,
        footer: {
          color: "text-green-500",
          value: footerText,
          label: ""
        }
      },
      {
        color: "light-blue",
        icon: "DocumentTextIcon", 
        title: "Totalt Skannade Sidor",
        value: `${queries[2].recordset[0].totalSidor || 0}`,
        footer: {
          color: "text-green-500",
          value: footerText,
          label: ""
        }
      },
      {
        color: "light-blue",
        icon: "ChartBarIcon",
        title: "Totalt Skannade Dokument",
        value: queries[3].recordset[0].totalScans || 0,
        footer: {
          color: "text-green-500",
          value: footerText,
          label: ""
        }
      }
    ];

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};