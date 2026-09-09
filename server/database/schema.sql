-- FreeDomain Platform Database Schema (MySQL)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domain_requests (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR(36) PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  tld VARCHAR(10) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36),
  registrar_provider VARCHAR(50) DEFAULT 'resellerclub',
  registrar_order_id VARCHAR(100),
  registrar_domain_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dns_records (
  id VARCHAR(36) PRIMARY KEY,
  domain_id VARCHAR(36) NOT NULL,
  record_type VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  value VARCHAR(500) NOT NULL,
  ttl INT DEFAULT 3600,
  priority INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nameservers (
  id VARCHAR(36) PRIMARY KEY,
  domain_id VARCHAR(36) NOT NULL UNIQUE,
  mode VARCHAR(20) DEFAULT 'default',
  ns1 VARCHAR(255) DEFAULT 'ns1.freedomain.org',
  ns2 VARCHAR(255) DEFAULT 'ns2.freedomain.org',
  ns3 VARCHAR(255) DEFAULT NULL,
  ns4 VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_budget (
  id INT PRIMARY KEY DEFAULT 1,
  total_grant_pool_inr DECIMAL(12,2) DEFAULT 100000.00,
  total_spent_inr DECIMAL(12,2) DEFAULT 0.00,
  active_subsidies_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
