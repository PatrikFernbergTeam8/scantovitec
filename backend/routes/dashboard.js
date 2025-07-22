const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

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
  if (filters.week) {
    if (filters.week === 'current') {
      conditions.push(`DATEPART(week, l.LogDate) = DATEPART(week, GETDATE()) AND YEAR(l.LogDate) = YEAR(GETDATE())`);
    } else if (filters.week === 'last') {
      conditions.push(`DATEPART(week, l.LogDate) = DATEPART(week, DATEADD(week, -1, GETDATE())) AND YEAR(l.LogDate) = YEAR(GETDATE())`);
    }
  }
  if (filters.lastDays) {
    const days = parseInt(filters.lastDays);
    if (days === 0) {
      // Today only
      conditions.push(`CAST(l.LogDate AS DATE) = CAST(GETDATE() AS DATE)`);
    } else {
      conditions.push(`l.LogDate >= DATEADD(day, -${days}, GETDATE())`);
    }
  }
  if (filters.dateFrom && filters.dateTo) {
    conditions.push(`l.LogDate >= '${filters.dateFrom}' AND l.LogDate <= '${filters.dateTo}'`);
  }
  
  // Geographic filters
  if (filters.city) {
    conditions.push(`k.Ort = '${filters.city.replace(/'/g, "''")}'`);
  }
  
  // Volume filters
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

// Helper function to build customer activity filter
function buildCustomerActivityFilter(filters) {
  let baseCondition = "k.Kedja = 'Länsfast'";
  
  if (filters.customerActivity) {
    if (filters.customerActivity === 'very_active') {
      // Daily scanners (scanned in last 7 days)
      return `${baseCondition} AND EXISTS (SELECT 1 FROM Logs l WHERE l.CrmID = k.CrmID AND l.LogDate >= DATEADD(day, -7, GETDATE()))`;
    } else if (filters.customerActivity === 'active') {
      // Weekly scanners (scanned in last 30 days but not daily)
      return `${baseCondition} AND EXISTS (SELECT 1 FROM Logs l WHERE l.CrmID = k.CrmID AND l.LogDate >= DATEADD(day, -30, GETDATE()) AND l.LogDate < DATEADD(day, -7, GETDATE()))`;
    } else if (filters.customerActivity === 'inactive') {
      // No scans in last 30 days
      return `${baseCondition} AND NOT EXISTS (SELECT 1 FROM Logs l WHERE l.CrmID = k.CrmID AND l.LogDate >= DATEADD(day, -30, GETDATE()))`;
    }
  }
  
  return baseCondition;
}

// Get statistics cards data
router.get('/statistics', async (req, res) => {
  try {
    const pool = await getPool();
    const filters = req.query;
    
    // Build filter conditions for data queries
    const hasTimeFilters = filters.month || filters.year || filters.quarter || filters.week || filters.lastDays || (filters.dateFrom && filters.dateTo);
    const filterCondition = hasTimeFilters ? buildFilterWhereClause(filters) : "k.Kedja = 'Länsfast'";
    const customerActivityCondition = buildCustomerActivityFilter(filters);
    
    const queries = await Promise.all([
      // Total customers (Länsfast only) - no time filtering for total count
      pool.request().query('SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = \'Länsfast\''),
      // Active customers (customers with logs based on filters)
      pool.request().query(`
        SELECT COUNT(DISTINCT k.CrmID) as activeKunder 
        FROM Kunder k 
        INNER JOIN Logs l ON k.CrmID = l.CrmID 
        WHERE ${filterCondition}
      `),
      // Total pages scanned (filtered)
      pool.request().query(`
        SELECT COALESCE(SUM(l.AntalSidor), 0) as totalSidor 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE ${filterCondition}
      `),
      // Total scans (filtered)
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
});

// Get scanning activity chart data (pages scanned per month)
router.get('/scanning-activity', async (req, res) => {
  try {
    const pool = await getPool();
    const filters = req.query;
    
    // For chart data, we want to show trends, so use modified filter logic
    let whereCondition = "k.Kedja = 'Länsfast'";
    
    // Apply filters but maintain chart grouping logic
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
});

// Get customers by city data
router.get('/customers-by-city', async (req, res) => {
  try {
    const pool = await getPool();
    const filters = req.query;
    
    // Build WHERE condition for filtering
    let whereCondition = "k.Kedja = 'Länsfast' AND k.Ort IS NOT NULL AND k.Ort != ''";
    let logFilterCondition = "1=1"; // Base condition for log filtering
    
    // Apply time-based filters to logs
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
    
    // Apply city filter to customers if specified
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
});

// Get customer activity distribution (Active/Inactive)
router.get('/customer-activity', async (req, res) => {
  try {
    const pool = await getPool();
    const filters = req.query;
    
    // Build filter condition for activity calculation
    let activityTimeCondition = "l.LogDate >= DATEADD(day, -30, GETDATE())";
    
    // Apply time-based filters for activity calculation
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
    
    // Apply geographic filters
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
});

// Get scanning efficiency metrics
router.get('/scanning-efficiency', async (req, res) => {
  try {
    const pool = await getPool();
    const filters = req.query;
    
    // Build filter condition for efficiency calculation
    let whereCondition = "k.Kedja = 'Länsfast'";
    
    // Apply time-based filters
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
    
    // Apply geographic and volume filters
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
            WHEN DATEDIFF(minute, LAG(l.LogDate) OVER (PARTITION BY l.CrmID ORDER BY l.LogDate), l.LogDate) <= 15 
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
});

module.exports = router;