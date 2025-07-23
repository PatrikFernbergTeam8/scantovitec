const sql = require('mssql');

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
    // Database configuration
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

    context.log('DB Config test:', {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    // Test database connection
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT 1 as test');
    
    await pool.close();

    context.res.status = 200;
    context.res.body = {
      success: true,
      message: 'Database connection successful!',
      data: result.recordset,
      config: {
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD
      }
    };
  } catch (error) {
    context.log.error('Database connection error:', error);
    context.res.status = 500;
    context.res.body = {
      error: 'Database connection failed',
      details: error.message,
      code: error.code,
      config: {
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD
      }
    };
  }
};