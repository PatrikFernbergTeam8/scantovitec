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
  // Set CORS headers - Allow multiple origins for iframe support
  const allowedOrigins = [
    'https://scantovitec.vercel.app',
    'https://playipp.se',
    'https://www.playipp.se',
    'https://app.playipp.se'
  ];
  
  const origin = req.headers.origin;
  console.log('Origin:', origin, 'NODE_ENV:', process.env.NODE_ENV);
  
  // Temporarily allow all origins for iframe debugging
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.setHeader('Access-Control-Allow-Credentials', false);
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
    
    let whereCondition = "k.Kedja = 'Länsfast'";
    
    if (filters.year) {
      whereCondition += ` AND YEAR(l.LogDate) = ${parseInt(filters.year)}`;
    } else {
      whereCondition += ` AND YEAR(l.LogDate) = YEAR(GETDATE())`;
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
      SELECT 
        CASE MONTH(l.LogDate)
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Feb'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Apr'
          WHEN 5 THEN 'Maj'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Aug'
          WHEN 9 THEN 'Sep'
          WHEN 10 THEN 'Okt'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dec'
        END as month,
        YEAR(l.LogDate) as year,
        COUNT(*) as totalDocuments
      FROM Logs l 
      INNER JOIN Kunder k ON l.CrmID = k.CrmID
      WHERE ${whereCondition}
      GROUP BY MONTH(l.LogDate), YEAR(l.LogDate)
      ORDER BY YEAR(l.LogDate), MONTH(l.LogDate)
    `);

    const data = result.recordset.map(row => row.totalDocuments);
    const categories = result.recordset.map(row => {
      const yearShort = row.year.toString().slice(-2);
      return `${row.month} ${yearShort}`;
    });

    res.json({
      type: "bar",
      height: 200,
      series: [{
        name: "Dokument",
        data: data
      }],
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching scanning activity:', error);
    res.status(500).json({ error: 'Failed to fetch scanning activity' });
  }
};