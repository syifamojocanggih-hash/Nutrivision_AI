-- ============================================================================
-- NutriVision AI — TiDB Cloud Serverless Database Schema
-- Standard Clinical Telehealth & Nutrition Monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  role VARCHAR(32) DEFAULT 'patient',
  age INT DEFAULT 45,
  gender VARCHAR(16) DEFAULT 'male',
  clinical_condition VARCHAR(64) DEFAULT 'post-surgery',
  recovery_phase VARCHAR(64) DEFAULT 'phase2',
  weight_kg DOUBLE DEFAULT 65.0,
  height_cm DOUBLE DEFAULT 168.0,
  bmi DOUBLE DEFAULT 23.0,
  activity_level VARCHAR(32) DEFAULT 'light',
  restrictions TEXT,
  allergies TEXT,
  daily_calories INT DEFAULT 1850,
  target_protein DOUBLE DEFAULT 98.0,
  target_carbs DOUBLE DEFAULT 220.0,
  target_fat DOUBLE DEFAULT 55.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  meal_type VARCHAR(32) DEFAULT 'lunch',
  title VARCHAR(255) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_calories INT DEFAULT 0,
  total_protein DOUBLE DEFAULT 0,
  total_carbs DOUBLE DEFAULT 0,
  total_fat DOUBLE DEFAULT 0,
  image_url VARCHAR(500),
  confidence INT DEFAULT 92,
  clinical_advice TEXT,
  segments_json LONGTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meals_user_time (user_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS foods (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  portion_grams INT DEFAULT 100,
  calories DOUBLE DEFAULT 0,
  protein DOUBLE DEFAULT 0,
  carbs DOUBLE DEFAULT 0,
  fat DOUBLE DEFAULT 0,
  fiber DOUBLE DEFAULT 0,
  albumin DOUBLE DEFAULT 0,
  iron DOUBLE DEFAULT 0,
  vitamin_c DOUBLE DEFAULT 0,
  zinc DOUBLE DEFAULT 0,
  price_est INT DEFAULT 0,
  symptom_tags TEXT,
  clinical_note TEXT,
  image_url VARCHAR(500),
  INDEX idx_foods_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_badge VARCHAR(128) DEFAULT 'Pasca-Bedah',
  category VARCHAR(64) DEFAULT 'sharing',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  food_recipe_json LONGTEXT,
  likes_count INT DEFAULT 0,
  comments_json LONGTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS caregiver_shares (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  caregiver_name VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'family',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_caregiver_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  action VARCHAR(128) NOT NULL,
  details TEXT,
  ip_address VARCHAR(64),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(64) DEFAULT 'bell',
  badge_color VARCHAR(32) DEFAULT 'teal',
  data_json LONGTEXT,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read),
  INDEX idx_notif_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
