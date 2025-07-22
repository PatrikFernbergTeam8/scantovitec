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
    
    const result = await pool.request().query(`
      SELECT TOP 15
        k.Ort as ort,
        COUNT(CASE WHEN ${logFilterCondition} THEN l.LogID END) as skannadeDokument,
        COALESCE(SUM(CASE WHEN ${logFilterCondition} THEN l.AntalSidor ELSE 0 END), 0) as totalSidor,
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

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching customers by city:', error);
    res.status(500).json({ error: 'Failed to fetch customers by city' });
  }
};