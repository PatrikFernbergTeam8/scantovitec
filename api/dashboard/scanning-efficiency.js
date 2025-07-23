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
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers.referer || '';
  
  // Check if request is from Android WebView
  const isWebView = userAgent.includes('Version/4.0') && userAgent.includes('Chrome/');
  const isPlayippWebView = userAgent.includes('PLWebViewDefault') || userAgent.includes('Version/4.0');
  
  if (process.env.NODE_ENV === 'production') {
    if (allowedOrigins.includes(origin)) {
      // Standard CORS for web browsers
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', true);
    } else if (isPlayippWebView || !origin) {
      // Handle WebView requests that may not send proper origin headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', false);
    } else {
      // Fallback to main domain
      res.setHeader('Access-Control-Allow-Origin', 'https://scantovitec.vercel.app');
      res.setHeader('Access-Control-Allow-Credentials', true);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', false);
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
    
    let whereCondition = "k.Kedja = 'Länsfast'";
    
    if (filters.month && filters.year) {
      whereCondition += ` AND MONTH(l.LogDate) = ${parseInt(filters.month)} AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    } else if (filters.quarter && filters.year) {
      const quarter = parseInt(filters.quarter);
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      whereCondition += ` AND MONTH(l.LogDate) BETWEEN ${startMonth} AND ${endMonth} AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    } else if (filters.lastDays) {
      const days = parseInt(filters.lastDays);
      if (days === 0) {
        whereCondition += ` AND CAST(l.LogDate AS DATE) = CAST(GETDATE() AS DATE)`;
      } else {
        whereCondition += ` AND l.LogDate >= DATEADD(day, -${days}, GETDATE())`;
      }
    } else {
      whereCondition += ` AND MONTH(l.LogDate) = MONTH(GETDATE()) AND YEAR(l.LogDate) = YEAR(GETDATE())`;
    }
    
    if (filters.city) {
      whereCondition += ` AND k.Ort = '${filters.city.replace(/'/g, "''")}'`;
    }
    
    if (filters.volumeLevel) {
      if (filters.volumeLevel === 'low') {
        whereCondition += ` AND l.AntalSidor BETWEEN 1 AND 10`;
      } else if (filters.volumeLevel === 'medium') {
        whereCondition += ` AND l.AntalSidor BETWEEN 11 AND 50`;
      } else if (filters.volumeLevel === 'high') {
        whereCondition += ` AND l.AntalSidor > 50`;
      }
    }
    
    const result = await pool.request().query(`
      WITH BatchAnalysis AS (
        SELECT 
          l.CrmID,
          l.LogDate,
          l.AntalSidor,
          LAG(l.LogDate) OVER (PARTITION BY l.CrmID ORDER BY l.LogDate) as PrevLogDate,
          CASE 
            WHEN DATEDIFF(minute, LAG(l.LogDate) OVER (PARTITION BY l.CrmID ORDER BY l.LogDate), l.LogDate) <= 5 
            THEN 1 
            ELSE 0 
          END as IsBatch
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${whereCondition}
      ),
      EfficiencyCalc AS (
        SELECT 
          COUNT(*) as total_scans,
          SUM(IsBatch) as batch_scans,
          COALESCE(SUM(AntalSidor), 0) as total_pages,
          CASE 
            WHEN COUNT(*) > 0 THEN (SUM(IsBatch) * 100.0 / COUNT(*))
            ELSE 0 
          END as batch_efficiency
        FROM BatchAnalysis
      )
      SELECT 
        total_scans,
        batch_scans,
        total_pages,
        ROUND(batch_efficiency, 0) as efficiency_score
      FROM EfficiencyCalc
    `);

    const efficiency = Math.min(100, Math.max(0, Math.round(result.recordset[0].efficiency_score || 0)));
    const batchScans = result.recordset[0].batch_scans || 0;
    const totalScans = result.recordset[0].total_scans || 1;
    const singleScans = totalScans - batchScans;

    res.json({
      type: "donut",
      height: 200,
      series: [efficiency, 100 - efficiency],
      label: "Effektivitet",
      percentage: `${efficiency}%`,
      batchScans,
      singleScans,
      totalScans
    });
  } catch (error) {
    console.error('Error fetching scanning efficiency:', error);
    res.status(500).json({ error: 'Failed to fetch scanning efficiency' });
  }
};