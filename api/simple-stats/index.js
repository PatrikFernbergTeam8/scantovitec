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

module.exports = async function (context, req) {
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
    const pool = await sql.connect(config);
    
    // Simple query to test basic functionality
    const result = await pool.request().query("SELECT COUNT(*) as totalKunder FROM Kunder WHERE Kedja = 'Länsfast'");
    
    await pool.close();

    const statistics = [
      {
        color: "light-blue",
        icon: "BuildingOfficeIcon",
        title: "Totalt antal kontor",
        value: result.recordset[0].totalKunder || 0,
        footer: {
          color: "text-blue-500",
          value: "Registrerade",
          label: "i systemet"
        }
      }
    ];

    context.res.status = 200;
    context.res.body = statistics;
  } catch (error) {
    context.log.error('Simple stats error:', error);
    context.res.status = 500;
    context.res.body = { 
      error: 'Simple stats failed',
      message: error.message,
      code: error.code,
      stack: error.stack
    };
  }
};