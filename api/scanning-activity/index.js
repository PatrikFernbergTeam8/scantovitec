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
    
    context.log('🔍 DEBUG: Scanning activity filters received:', JSON.stringify(filters, null, 2));
    
    // Base condition for Länsfast only
    let whereCondition = "k.Kedja = 'Länsfast'";
    
    // Always show rolling 12-month period from today, ignore year filters for consistency
    whereCondition += ` AND l.LogDate >= DATEADD(month, -11, DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0))`;
    
    context.log('📅 DEBUG: Using rolling 12-month period - ignoring year/month filters for consistency');
    
    // Apply other filters
    if (filters.city) {
      whereCondition += ` AND k.Ort = '${filters.city.replace(/'/g, "''")}'`;
      context.log('🏙️ DEBUG: Applied city filter:', filters.city);
    }
    
    if (filters.volumeLevel) {
      if (filters.volumeLevel === 'low') {
        whereCondition += ` AND l.AntalSidor BETWEEN 1 AND 10`;
      } else if (filters.volumeLevel === 'medium') {
        whereCondition += ` AND l.AntalSidor BETWEEN 11 AND 50`;
      } else if (filters.volumeLevel === 'high') {
        whereCondition += ` AND l.AntalSidor > 50`;
      }
      context.log('📊 DEBUG: Applied volume filter:', filters.volumeLevel);
    }
    
    context.log('🔍 DEBUG: Final whereCondition:', whereCondition);
    
    // First, test date calculation
    const debugDateQuery = `
      SELECT 
        GETDATE() as currentDate,
        DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0) as currentMonthStart,
        DATEADD(month, -11, DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)) as startDate
    `;
    
    const dateTest = await pool.request().query(debugDateQuery);
    context.log('📅 DEBUG: Date calculation results:', dateTest.recordset[0]);

    // Generate all 12 months for the rolling period and left join with actual data
    const sqlQuery = `
      WITH MonthSeries AS (
        SELECT 
          DATEADD(month, n - 11, DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)) AS MonthStart
        FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11)) AS Numbers(n)
      ),
      MonthLabels AS (
        SELECT 
          MonthStart,
          CASE MONTH(MonthStart)
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
          END + ' ' + RIGHT(CAST(YEAR(MonthStart) AS VARCHAR), 2) as monthLabel,
          YEAR(MonthStart) as year,
          MONTH(MonthStart) as monthNum
        FROM MonthSeries
      ),
      ActualData AS (
        SELECT 
          YEAR(l.LogDate) as year,
          MONTH(l.LogDate) as monthNum,
          COUNT(*) as totalDocuments
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${whereCondition}
        GROUP BY YEAR(l.LogDate), MONTH(l.LogDate)
      )
      SELECT 
        ml.monthLabel as month,
        ml.year,
        ml.monthNum,
        ml.MonthStart,
        COALESCE(ad.totalDocuments, 0) as totalDocuments
      FROM MonthLabels ml
      LEFT JOIN ActualData ad ON ml.year = ad.year AND ml.monthNum = ad.monthNum
      ORDER BY ml.year, ml.monthNum
    `;
    
    context.log('🔍 DEBUG: Full SQL Query:', sqlQuery);
    
    const result = await pool.request().query(sqlQuery);
    
    context.log('📊 DEBUG: Raw SQL results with dates:', JSON.stringify(result.recordset, null, 2));

    const data = result.recordset.map(row => row.totalDocuments);
    const categories = result.recordset.map(row => row.month);
    
    context.log('📊 DEBUG: Final response data:', { data, categories });
    context.log('📊 DEBUG: Data array length:', data.length);
    context.log('📊 DEBUG: Categories array length:', categories.length);
    context.log('📊 DEBUG: Data values:', data);
    context.log('📊 DEBUG: Category values:', categories);

    const responseData = {
      type: "bar",
      height: 200,
      series: [{
        name: "Dokument",
        data: data
      }],
      categories: categories
    };

    context.log('📊 DEBUG: Complete response object:', JSON.stringify(responseData, null, 2));

    context.res.status = 200;
    context.res.body = responseData;
  } catch (error) {
    context.log.error('Error fetching scanning activity:', error);
    context.log.error('DB Config:', {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });
    context.res.status = 500;
    context.res.body = { 
      error: 'Failed to fetch scanning activity',
      details: error.message,
      code: error.code
    };
  }
};