const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;
let cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

const getCacheKey = (filters) => {
  return JSON.stringify(filters || {});
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  // Clean up old cache entries
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
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

module.exports = async function (context, req) {
  // Set CORS headers
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = '';
    return;
  }

  try {
    const filters = req.query;
    const cacheKey = getCacheKey(filters);
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      context.res.status = 200;
      context.res.body = cachedResult;
      return;
    }
    
    const pool = await getPool();
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
      pool.request().query('SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = \'Länsfast\''),
      pool.request().query(`
        SELECT 
          COUNT(DISTINCT k.CrmID) as activeKunder,
          COALESCE(SUM(l.AntalSidor), 0) as totalSidor,
          COUNT(*) as totalScans
        FROM Kunder k 
        INNER JOIN Logs l ON k.CrmID = l.CrmID 
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
        value: `${queries[1].recordset[0].totalSidor || 0}`,
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
        value: queries[1].recordset[0].totalScans || 0,
        footer: {
          color: "text-green-500",
          value: footerText,
          label: ""
        }
      }
    ];

    // Cache the result
    setCachedData(cacheKey, statistics);
    
    context.res.status = 200;
    context.res.body = statistics;
  } catch (error) {
    context.log.error('Error fetching statistics:', error);
    context.log.error('DB Config:', {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });
    context.res.status = 500;
    context.res.body = { 
      error: 'Failed to fetch statistics',
      details: error.message,
      code: error.code
    };
  }
};