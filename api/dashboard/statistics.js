const { getPool } = require('../../backend/config/database');

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
    
    const hasTimeFilters = filters.month || filters.year || filters.quarter || filters.week || filters.lastDays || (filters.dateFrom && filters.dateTo);
    const filterCondition = hasTimeFilters ? buildFilterWhereClause(filters) : "k.Kedja = 'Länsfast'";
    
    const queries = await Promise.all([
      pool.request().query('SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = \\'Länsfast\\''),
      pool.request().query(`
        SELECT COUNT(DISTINCT k.CrmID) as activeKunder 
        FROM Kunder k 
        INNER JOIN Logs l ON k.CrmID = l.CrmID 
        WHERE ${filterCondition}
      `),
      pool.request().query(`
        SELECT COALESCE(SUM(l.AntalSidor), 0) as totalSidor 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${filterCondition}
      `),
      pool.request().query(`
        SELECT COUNT(*) as totalScans 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${filterCondition}
      `)
    ]);

    const statistics = [
      {
        color: "gray",
        icon: "BuildingOfficeIcon",
        title: "Totalt Kunder",
        value: queries[0].recordset[0].totalKunder || 0,
        footer: {
          color: "text-blue-500",
          value: "Registrerade",
          label: "i systemet"
        }
      },
      {
        color: "gray", 
        icon: "UserGroupIcon",
        title: "Aktiva Kunder",
        value: queries[1].recordset[0].activeKunder || 0,
        footer: {
          color: "text-green-500",
          value: "Senaste 30 dagarna",
          label: ""
        }
      },
      {
        color: "gray",
        icon: "DocumentTextIcon", 
        title: "Sidor Scannde",
        value: `${queries[2].recordset[0].totalSidor || 0}`,
        footer: {
          color: "text-green-500",
          value: "Denna månad",
          label: ""
        }
      },
      {
        color: "gray",
        icon: "ChartBarIcon",
        title: "Antal Scanningar",
        value: queries[3].recordset[0].totalScans || 0,
        footer: {
          color: "text-green-500",
          value: "Denna månad",
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