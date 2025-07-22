const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get statistics cards data
router.get('/statistics', async (req, res) => {
  try {
    const pool = await getPool();
    
    const queries = await Promise.all([
      // Total customers (Länsfast only)
      pool.request().query('SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = \'Länsfast\''),
      // Active customers (customers with logs in last 30 days, Länsfast only)
      pool.request().query(`
        SELECT COUNT(DISTINCT k.CrmID) as activeKunder 
        FROM Kunder k 
        INNER JOIN Logs l ON k.CrmID = l.CrmID 
        WHERE k.Kedja = 'Länsfast' AND l.LogDate >= DATEADD(day, -30, GETDATE())
      `),
      // Total pages scanned this month (Länsfast only)
      pool.request().query(`
        SELECT COALESCE(SUM(l.AntalSidor), 0) as totalSidor 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE k.Kedja = 'Länsfast' AND MONTH(l.LogDate) = MONTH(GETDATE()) AND YEAR(l.LogDate) = YEAR(GETDATE())
      `),
      // Total scans this month (Länsfast only)
      pool.request().query(`
        SELECT COUNT(*) as totalScans 
        FROM Logs l 
        INNER JOIN Kunder k ON l.CrmID = k.CrmID
        WHERE k.Kedja = 'Länsfast' AND MONTH(l.LogDate) = MONTH(GETDATE()) AND YEAR(l.LogDate) = YEAR(GETDATE())
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
      WHERE k.Kedja = 'Länsfast' AND YEAR(l.LogDate) = YEAR(GETDATE())
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
    
    const result = await pool.request().query(`
      SELECT TOP 15
        k.Ort as ort,
        COUNT(l.LogID) as skannadeDokument,
        COALESCE(SUM(l.AntalSidor), 0) as totalSidor,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN l.LogDate >= DATEADD(day, -30, GETDATE()) THEN l.CrmID END) > 0 
          THEN 'Aktiv' 
          ELSE 'Inaktiv' 
        END as status
      FROM Kunder k
      LEFT JOIN Logs l ON k.CrmID = l.CrmID
      WHERE k.Kedja = 'Länsfast' AND k.Ort IS NOT NULL AND k.Ort != ''
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
    
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(DISTINCT k.CrmID) 
         FROM Kunder k 
         INNER JOIN Logs l ON k.CrmID = l.CrmID 
         WHERE k.Kedja = 'Länsfast' AND l.LogDate >= DATEADD(day, -30, GETDATE())) as active_count,
        (SELECT COUNT(*) FROM Kunder WHERE Kedja = 'Länsfast') as total_count
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
        WHERE k.Kedja = 'Länsfast' 
          AND MONTH(l.LogDate) = MONTH(GETDATE()) 
          AND YEAR(l.LogDate) = YEAR(GETDATE())
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