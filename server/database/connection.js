/**
 * ============================================================================
 * NutriVision AI — TiDB Cloud Serverless Database Connection Pool
 * Powered by mysql2/promise with SSL + Automatic Schema Migration
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
    const useSSL = process.env.TIDB_SSL === 'true';
    console.log(`🔌 Connecting to TiDB Cloud Serverless at ${DB_HOST}:${DB_PORT} (user: ${DB_USER}, SSL: ${useSSL})...`);

    const poolConfig = {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    };

    // TiDB Cloud Serverless requires SSL/TLS
    if (useSSL) {
      poolConfig.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      };
    }

    // 1. Create Connection Pool (TiDB Cloud DB already exists — no CREATE DATABASE needed)
    pool = mysql.createPool(poolConfig);
    console.log(`✅ TiDB Cloud connection pool established for database '${DB_NAME}'.`);

    // 2. Apply Schema DDL (CREATE TABLE IF NOT EXISTS — safe to run multiple times)
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✅ TiDB Cloud schema tables applied successfully.');
    }

    // Mark as initialized BEFORE seeding to allow internal queries without deadlock
    isInitialized = true;

    // 3. Seed initial clinical data
    await seedDatabase(dbHelper);

  } catch (err) {
    console.error('❌ Failed to initialize TiDB Cloud connection:', err.message);
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
