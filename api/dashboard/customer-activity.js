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

    context.res.status = 200;
    context.res.body = {
      type: "donut",
      height: 200,
      series: [percentage, 100 - percentage],
      label: "Aktiva Kunder",
      percentage: `${percentage}%`,
      active_count,
      total_count
    };
  } catch (error) {
    context.log.error('Error fetching customer activity:', error);
    context.res.status = 500;
    context.res.body = { error: 'Failed to fetch customer activity' };
  }
};