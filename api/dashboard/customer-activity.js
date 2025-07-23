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

module.exports = async (req, res) => {
  // Set CORS headers with iframe support
  const allowedOrigins = [
    'https://scantovitec.vercel.app',
    'https://playipp.se',
    'https://www.playipp.se',
    'https://app.playipp.se'
  ];
  
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production' && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', true);
  } else if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', false);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://scantovitec.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const pool = await getPool();
    const filters = req.query;
    
    let activityTimeCondition = "l.LogDate >= DATEADD(day, -30, GETDATE())";
    
    if (filters.lastDays) {
      const days = parseInt(filters.lastDays);
      if (days === 0) {
        activityTimeCondition = `CAST(l.LogDate AS DATE) = CAST(GETDATE() AS DATE)`;
      } else {
        activityTimeCondition = `l.LogDate >= DATEADD(day, -${days}, GETDATE())`;
      }
    } else if (filters.month && filters.year) {
      activityTimeCondition = `MONTH(l.LogDate) = ${parseInt(filters.month)} AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    } else if (filters.quarter && filters.year) {
      const quarter = parseInt(filters.quarter);
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      activityTimeCondition = `MONTH(l.LogDate) BETWEEN ${startMonth} AND ${endMonth} AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    }
    
    let customerFilterCondition = "k.Kedja = 'Länsfast'";
    if (filters.city) {
      customerFilterCondition += ` AND k.Ort = '${filters.city.replace(/'/g, "''")}'`;
    }
    
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(DISTINCT k.CrmID) 
         FROM Kunder k 
         INNER JOIN Logs l ON k.CrmID = l.CrmID 
         WHERE ${customerFilterCondition} AND ${activityTimeCondition}) as active_count,
        (SELECT COUNT(*) FROM Kunder k WHERE ${customerFilterCondition}) as total_count
    `);

    const { active_count, total_count } = result.recordset[0];
    const percentage = total_count > 0 ? Math.round((active_count / total_count) * 100) : 0;

    res.json({
      type: "donut",
      height: 200,
      series: [percentage, 100 - percentage],
      label: "Aktiva Kunder",
      percentage: `${percentage}%`,
      active_count,
      total_count
    });
  } catch (error) {
    console.error('Error fetching customer activity:', error);
    res.status(500).json({ error: 'Failed to fetch customer activity' });
  }
};