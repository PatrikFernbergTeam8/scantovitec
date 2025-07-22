const { getPool } = require('../../backend/config/database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
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
        COALESCE(SUM(l.AntalSidor), 0) as totalPages
      FROM Logs l 
      INNER JOIN Kunder k ON l.CrmID = k.CrmID
      WHERE ${whereCondition}
      GROUP BY MONTH(l.LogDate)
      ORDER BY MONTH(l.LogDate)
    `);

    const data = result.recordset.map(row => row.totalPages);
    const categories = result.recordset.map(row => row.month);

    res.json({
      type: "bar",
      height: 200,
      series: [{
        name: "Sidor",
        data: data
      }],
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching scanning activity:', error);
    res.status(500).json({ error: 'Failed to fetch scanning activity' });
  }
};