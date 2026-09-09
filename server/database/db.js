import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

let dbType = "sqlite";
let mysqlPool = null;
let sqliteDb = null;

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "freedomain_db";

export async function initDb() {
  if (process.env.DB_HOST && process.env.DB_USER) {
    try {
      console.log(`[Database] Attempting connection to MySQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
      // Test creating database if not exists
      const rootConn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await rootConn.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool
      await mysqlPool.query("SELECT 1;");
      dbType = "mysql";
      console.log("[Database] Connected successfully to MySQL!");
      await runMigrations();
      await seedDefaults();
      return;
    } catch (err) {
      console.warn(`[Database] MySQL unavailable (${err.message}). Falling back to local embedded SQLite storage.`);
    }
  }

  // SQLite fallback
  dbType = "sqlite";
  const dbFile = path.resolve("./database/freedomain.sqlite");
  const dbDir = path.dirname(dbFile);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new sqlite3.Database(dbFile);
  console.log(`[Database] Using embedded SQLite database at ${dbFile}`);
  await runMigrations();
  await seedDefaults();
}

export async function query(sql, params = []) {
  if (dbType === "mysql") {
    // MySQL handles ? placeholders natively
    const [results] = await mysqlPool.query(sql, params);
    return results;
  } else {
    // SQLite adapter
    return new Promise((resolve, reject) => {
      // Normalize any MySQL-specific backticks to double quotes or remove them
      const normalizedSql = sql.replace(/`([^`]+)`/g, '"$1"');
      const trimmed = normalizedSql.trim().toUpperCase();

      if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA") || trimmed.startsWith("SHOW")) {
        sqliteDb.all(normalizedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(normalizedSql, params, function (err) {
          if (err) return reject(err);
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        });
      }
    });
  }
}

async function runMigrations() {
  console.log("[Database] Running schema migrations...");
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS domain_requests (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      domain_name VARCHAR(255) NOT NULL,
      tld VARCHAR(10) NOT NULL,
      purpose_category VARCHAR(50) NOT NULL,
      project_title VARCHAR(150) NOT NULL,
      project_description TEXT NOT NULL,
      github_or_portfolio_url VARCHAR(255) NOT NULL,
      retail_cost_inr DECIMAL(10,2) DEFAULT 899.00,
      subsidized_amount_inr DECIMAL(10,2) DEFAULT 899.00,
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS domains (
      id VARCHAR(36) PRIMARY KEY,
      domain_name VARCHAR(255) NOT NULL UNIQUE,
      tld VARCHAR(10) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      request_id VARCHAR(36),
      registrar_provider VARCHAR(50) DEFAULT 'resellerclub',
      registrar_order_id VARCHAR(100),
      registrar_domain_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATETIME NOT NULL,
      auto_renew INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS dns_records (
      id VARCHAR(36) PRIMARY KEY,
      domain_id VARCHAR(36) NOT NULL,
      record_type VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      value VARCHAR(500) NOT NULL,
      ttl INT DEFAULT 3600,
      priority INT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS nameservers (
      id VARCHAR(36) PRIMARY KEY,
      domain_id VARCHAR(36) NOT NULL UNIQUE,
      mode VARCHAR(20) DEFAULT 'default',
      ns1 VARCHAR(255) DEFAULT 'ns1.freedomain.org',
      ns2 VARCHAR(255) DEFAULT 'ns2.freedomain.org',
      ns3 VARCHAR(255) DEFAULT NULL,
      ns4 VARCHAR(255) DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS platform_budget (
      id INT PRIMARY KEY DEFAULT 1,
      total_grant_pool_inr DECIMAL(12,2) DEFAULT 100000.00,
      total_spent_inr DECIMAL(12,2) DEFAULT 0.00,
      active_subsidies_count INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const tableSql of tables) {
    await query(tableSql);
  }
  console.log("[Database] Schema migrations applied successfully.");
}

async function seedDefaults() {
  // Check budget table
  const budget = await query("SELECT * FROM platform_budget WHERE id = 1");
  if (!budget || budget.length === 0) {
    await query(
      "INSERT INTO platform_budget (id, total_grant_pool_inr, total_spent_inr, active_subsidies_count) VALUES (1, 100000.00, 0.00, 0)"
    );
  }

  // Check admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@freedomain.org";
  const existingAdmin = await query("SELECT * FROM users WHERE email = ?", [adminEmail]);
  if (!existingAdmin || existingAdmin.length === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);
    const adminId = crypto.randomUUID();

    await query(
      "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')",
      [adminId, "FreeDomain Administrator", adminEmail, hash]
    );
    console.log(`[Database] Seeded default admin account: ${adminEmail}`);
  }
}

export function getDbType() {
  return dbType;
}
