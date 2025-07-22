const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true, // Required for Azure SQL
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

const connectToDatabase = async () => {
  try {
    if (!poolPromise) {
      poolPromise = sql.connect(config);
    }
    await poolPromise;
    return poolPromise;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const getPool = () => {
  if (!poolPromise) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return poolPromise;
};

module.exports = {
  connectToDatabase,
  getPool,
  sql
};