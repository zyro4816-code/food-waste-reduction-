// server/config/db.js
// Dual-mode database layer: Supports MySQL 8.0+ and SQLite 3 with identical Promise API
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let dbDriver = 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

// Determine driver preference
const preferredDriver = (process.env.DB_CLIENT || '').toLowerCase();

if (preferredDriver === 'mysql') {
  try {
    const mysql = require('mysql2/promise');
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'saveplate_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      timezone: 'Z'
    });
    dbDriver = 'mysql';
    console.log('[Database] Configured for MySQL server.');
  } catch (err) {
    console.warn('[Database] MySQL pool creation failed, falling back to SQLite:', err.message);
    dbDriver = 'sqlite';
  }
}

// Fallback or explicit SQLite mode
if (dbDriver === 'sqlite' || !mysqlPool) {
  // Use SQLITE_PATH env var if set (for cloud deployments with persistent storage)
  // Otherwise default to the local database/ directory
  const dbPath = process.env.SQLITE_PATH
    || path.join(__dirname, '../../database/saveplate.sqlite');
  const { initSqliteDatabase } = require('./sqlite-init');
  sqliteDb = initSqliteDatabase(dbPath);
  dbDriver = 'sqlite';
  console.log(`[Database] SQLite engine active at ${dbPath}`);
}

function normalizeSqlForSqlite(sql) {
  return sql
    .replace(/NOW\(\)/gi, "datetime('now')")
    .replace(/INTERVAL (\d+) DAY/gi, "'+$1 day'")
    .replace(/INTERVAL (\d+) HOUR/gi, "'+$1 hours'")
    .replace(/TINYINT\(1\)/gi, "INTEGER");
}

/**
 * Executes a SELECT / READ query and returns an array of row objects
 */
async function query(sql, params = []) {
  if (dbDriver === 'mysql' && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[Database MySQL Query Error]', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    try {
      const normalizedSql = normalizeSqlForSqlite(sql);
      const stmt = sqliteDb.prepare(normalizedSql);
      if (normalizedSql.trim().toUpperCase().startsWith('SELECT') || normalizedSql.trim().toUpperCase().startsWith('PRAGMA')) {
        return stmt.all(...params);
      } else {
        const info = stmt.run(...params);
        return info;
      }
    } catch (err) {
      console.error('[Database SQLite Query Error]', err.message, 'SQL:', sql);
      throw err;
    }
  }
}

/**
 * Executes an INSERT, UPDATE, or DELETE query and returns execution metadata
 */
async function execute(sql, params = []) {
  if (dbDriver === 'mysql' && mysqlPool) {
    try {
      const [result] = await mysqlPool.execute(sql, params);
      return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (err) {
      console.error('[Database MySQL Execute Error]', err.message, 'SQL:', sql);
      throw err;
    }
  } else {
    try {
      const normalizedSql = normalizeSqlForSqlite(sql);
      const stmt = sqliteDb.prepare(normalizedSql);
      const info = stmt.run(...params);
      return {
        insertId: info.lastInsertRowid,
        affectedRows: info.changes
      };
    } catch (err) {
      console.error('[Database SQLite Execute Error]', err.message, 'SQL:', sql);
      throw err;
    }
  }
}

/**
 * Execute operations within an atomic database transaction
 */
async function transaction(fn) {
  if (dbDriver === 'mysql' && mysqlPool) {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    try {
      const txExecutor = {
        query: async (sql, params = []) => {
          const [rows] = await conn.query(sql, params);
          return rows;
        },
        execute: async (sql, params = []) => {
          const [result] = await conn.execute(sql, params);
          return { insertId: result.insertId, affectedRows: result.affectedRows };
        }
      };
      const result = await fn(txExecutor);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else {
    // SQLite manual transaction supporting async callbacks
    sqliteDb.exec('BEGIN IMMEDIATE');
    try {
      const txExecutor = {
        query: async (sql, params = []) => {
          const normalizedSql = normalizeSqlForSqlite(sql);
          const stmt = sqliteDb.prepare(normalizedSql);
          return stmt.all(...params);
        },
        execute: async (sql, params = []) => {
          const normalizedSql = normalizeSqlForSqlite(sql);
          const stmt = sqliteDb.prepare(normalizedSql);
          const info = stmt.run(...params);
          return { insertId: info.lastInsertRowid, affectedRows: info.changes };
        }
      };
      const result = await fn(txExecutor);
      sqliteDb.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        sqliteDb.exec('ROLLBACK');
      } catch (rollbackErr) {
        // ignore if already rolled back
      }
      throw err;
    }
  }
}

function getDriver() {
  return dbDriver;
}

module.exports = {
  query,
  execute,
  transaction,
  getDriver
};
