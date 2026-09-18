/**
 * ============================================================================
 * NutriVision AI — MySQL Database Connection Pool
 * Powered by mysql2/promise with Automatic DB & Schema Migration
 * ============================================================================
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const { seedDatabase } = require('./seed');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'nutrivision_ai';

let pool = null;
let isInitialized = false;
let initPromise = null;

const dbHelper = {
  get pool() {
    return pool;
  },

  async query(sql, params = []) {
    await ensureInitialized();
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async get(sql, params = []) {
    await ensureInitialized();
    const [rows] = await pool.query(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async run(sql, params = []) {
    await ensureInitialized();
    const [result] = await pool.query(sql, params);
    return {
      changes: result.affectedRows,
      insertId: result.insertId,
      raw: result
    };
  },

  async rawQuery(sql) {
    await ensureInitialized();
    return await pool.query(sql);
  }
};

/**
 * Singleton Initialization Runner
 */
function ensureInitialized() {
  if (isInitialized && pool) {
    return Promise.resolve();
  }
  if (!initPromise) {
    initPromise = doInitialize();
  }
  return initPromise;
}

async function doInitialize() {
  try {
    console.log(`🔌 Connecting to MySQL server at ${DB_HOST}:${DB_PORT} (user: ${DB_USER})...`);

    // 1. Initial Connection to ensure DB exists
    const initConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await initConn.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci;
    `);
    console.log(`✅ MySQL database '${DB_NAME}' verified/created.`);
    await initConn.end();

    // 2. Create Connection Pool
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });

    // 3. Apply Schema DDL
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✅ MySQL Schema tables applied successfully.');
    }

    // Mark as initialized BEFORE seeding to allow internal queries without deadlock
    isInitialized = true;

    // 4. Seed initial clinical data
    await seedDatabase(dbHelper);

  } catch (err) {
    console.error('❌ Failed to initialize MySQL connection:', err.message);
    initPromise = null;
    isInitialized = false;
    throw err;
  }
}

// Auto-trigger initialization on module import
ensureInitialized().catch(err => {
  console.warn('⚠️ MySQL initial connect warning. Server will retry on first query:', err.message);
});

module.exports = dbHelper;
