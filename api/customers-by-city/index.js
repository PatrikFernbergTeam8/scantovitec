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

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

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
    const pool = await getPool();
    const filters = req.query;
    
    let whereCondition = "k.Kedja = 'Länsfast' AND k.Ort IS NOT NULL AND k.Ort != ''";
    let logFilterCondition = "1=1";
    
    if (filters.month) {
      logFilterCondition += ` AND MONTH(l.LogDate) = ${parseInt(filters.month)}`;
    }
    if (filters.year) {
      logFilterCondition += ` AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    }
    if (filters.quarter) {
      const quarter = parseInt(filters.quarter);
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      logFilterCondition += ` AND MONTH(l.LogDate) BETWEEN ${startMonth} AND ${endMonth}`;
    }
    if (filters.lastDays) {
      const days = parseInt(filters.lastDays);
      if (days === 0) {
        logFilterCondition += ` AND CAST(l.LogDate AS DATE) = CAST(GETDATE() AS DATE)`;
      } else {
        logFilterCondition += ` AND l.LogDate >= DATEADD(day, -${days}, GETDATE())`;
      }
    }
    if (filters.volumeLevel) {
      if (filters.volumeLevel === 'low') {
        logFilterCondition += ` AND l.AntalSidor BETWEEN 1 AND 10`;
      } else if (filters.volumeLevel === 'medium') {
        logFilterCondition += ` AND l.AntalSidor BETWEEN 11 AND 50`;
      } else if (filters.volumeLevel === 'high') {
        logFilterCondition += ` AND l.AntalSidor > 50`;
      }
    }
    
    if (filters.city) {
      whereCondition += ` AND k.Ort = '${filters.city.replace(/'/g, "''")}'`;
    }
    
    // Check if any filters are applied (excluding default conditions)
    const hasFilters = filters.month || filters.year || filters.quarter || 
                      filters.lastDays !== undefined || filters.volumeLevel || filters.city;
    
    // Use TOP 15 only if filters are applied, otherwise show all with last 30 days filter
    const topClause = hasFilters ? 'TOP 15' : '';
    
    // When no filters are applied, always use last 30 days for activity data
    const finalLogFilterCondition = hasFilters ? logFilterCondition : "l.LogDate >= DATEADD(day, -30, GETDATE())";
    
    const result = await pool.request().query(`
      SELECT ${topClause}
        k.Ort as ort,
        COUNT(CASE WHEN ${finalLogFilterCondition} THEN l.LogID END) as skannadeDokument,
        COALESCE(SUM(CASE WHEN ${finalLogFilterCondition} THEN l.AntalSidor ELSE 0 END), 0) as totalSidor,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN l.LogDate >= DATEADD(day, -30, GETDATE()) THEN l.CrmID END) > 0 
          THEN 'Aktiv' 
          ELSE 'Inaktiv' 
        END as status
      FROM Kunder k
      LEFT JOIN Logs l ON k.CrmID = l.CrmID
      WHERE ${whereCondition}
      GROUP BY k.Ort
      ORDER BY skannadeDokument DESC
    `);

    // Determine title text based on active filters
    let titleText = hasFilters ? "Mest Aktiva Kontor Senaste 30 Dagarna" : "Alla kontor - Senaste 30 dagarna"; // Default
    
    if (filters.lastDays) {
      const days = parseInt(filters.lastDays);
      if (days === 0) {
        titleText = "Mest Aktiva Kontor Idag";
      } else {
        titleText = `Mest Aktiva Kontor Senaste ${days} Dagarna`;
      }
    } else if (filters.month && filters.year) {
      const months = ['', 'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
      titleText = `Mest Aktiva Kontor ${months[parseInt(filters.month)]} ${filters.year}`;
    } else if (filters.quarter && filters.year) {
      titleText = `Mest Aktiva Kontor Q${filters.quarter} ${filters.year}`;
    } else if (filters.quarter) {
      titleText = `Mest Aktiva Kontor Q${filters.quarter}`;
    } else if (filters.year) {
      titleText = `Mest Aktiva Kontor ${filters.year}`;
    } else if (filters.month) {
      const months = ['', 'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
      titleText = `Mest Aktiva Kontor ${months[parseInt(filters.month)]}`;
    }

    context.res.status = 200;
    context.res.body = {
      title: titleText,
      data: result.recordset
    };
  } catch (error) {
    context.log.error('Error fetching customers by city:', error);
    context.log.error('DB Config:', {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });
    context.res.status = 500;
    context.res.body = { 
      error: 'Failed to fetch customers by city',
      details: error.message,
      code: error.code
    };
  }
};