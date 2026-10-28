-- =============================================================================
-- SAVEPLATE DATABASE SCHEMA (MySQL 8.0+ Relational DDL)
-- Project: Food Waste Reduction and Food Management System
-- Brand: SAVEPLATE ("Save Food. Share Hope. Build a Better Tomorrow.")
-- =============================================================================

CREATE DATABASE IF NOT EXISTS saveplate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saveplate_db;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'donor', 'recipient', 'ngo', 'volunteer') NOT NULL DEFAULT 'recipient',
  status ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NULL,
  avatar_url VARCHAR(500) NULL,
  organization_name VARCHAR(200) NULL,
  account_type VARCHAR(50) DEFAULT 'individual',
  address VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  postal_code VARCHAR(20) NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  org_name VARCHAR(200) NOT NULL,
  org_type ENUM('ngo', 'restaurant', 'supermarket', 'food_bank', 'community_kitchen', 'event_organizer', 'other') NOT NULL DEFAULT 'ngo',
  registration_number VARCHAR(100) NULL,
  tax_id VARCHAR(100) NULL,
  website VARCHAR(255) NULL,
  contact_person VARCHAR(150) NULL,
  contact_email VARCHAR(191) NULL,
  contact_phone VARCHAR(50) NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_status ENUM('pending', 'verified', 'rejected', 'unsubmitted') NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP NULL,
  verification_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_organizations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_org_verified (is_verified),
  INDEX idx_org_type (org_type)
) ENGINE=InnoDB;

-- 4. FOOD CATEGORIES
CREATE TABLE IF NOT EXISTS food_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  icon VARCHAR(50) DEFAULT 'Utensils',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cat_active (is_active)
) ENGINE=InnoDB;

-- 5. FOOD LISTINGS
CREATE TABLE IF NOT EXISTS food_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  initial_quantity DECIMAL(10,2) NOT NULL,
  remaining_quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  estimated_servings INT NOT NULL DEFAULT 0,
  prep_time TIMESTAMP NULL,
  expiry_time TIMESTAMP NULL,
  pickup_deadline TIMESTAMP NOT NULL,
  storage_instructions VARCHAR(255) NOT NULL DEFAULT 'Keep refrigerated',
  allergens TEXT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NULL,
  contact_phone VARCHAR(50) NOT NULL,
  primary_image_url VARCHAR(500) NULL,
  status ENUM('available', 'partially_claimed', 'fully_claimed', 'closed', 'expired', 'paused', 'rejected') NOT NULL DEFAULT 'available',
  moderation_status ENUM('approved', 'pending_review', 'rejected') NOT NULL DEFAULT 'approved',
  moderation_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listings_donor FOREIGN KEY (donor_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES food_categories (id),
  INDEX idx_listings_status (status),
  INDEX idx_listings_moderation (moderation_status),
  INDEX idx_listings_city (city),
  INDEX idx_listings_deadline (pickup_deadline)
) ENGINE=InnoDB;

-- 6. FOOD IMAGES
CREATE TABLE IF NOT EXISTS food_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  caption VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_food_images_listing FOREIGN KEY (listing_id) REFERENCES food_listings (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. FOOD REQUESTS
CREATE TABLE IF NOT EXISTS food_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  recipient_id INT NOT NULL,
  requested_quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'ready_for_pickup', 'collected', 'completed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
  recipient_notes TEXT NULL,
  donor_notes TEXT NULL,
  pickup_time TIMESTAMP NULL,
  verification_code VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_listing FOREIGN KEY (listing_id) REFERENCES food_listings (id) ON DELETE CASCADE,
  CONSTRAINT fk_requests_recipient FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_requests_status (status)
) ENGINE=InnoDB;

-- 8. DONATIONS
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  request_id INT NOT NULL,
  donor_id INT NOT NULL,
  recipient_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  servings_rescued INT NOT NULL DEFAULT 0,
  kg_rescued DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('in_progress', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMP NULL,
  rating INT NULL,
  feedback_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_listing FOREIGN KEY (listing_id) REFERENCES food_listings (id),
  CONSTRAINT fk_donations_request FOREIGN KEY (request_id) REFERENCES food_requests (id),
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users (id),
  CONSTRAINT fk_donations_recipient FOREIGN KEY (recipient_id) REFERENCES users (id),
  INDEX idx_donations_status (status)
) ENGINE=InnoDB;

-- 9. DONATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS donation_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  changed_by_user_id INT NOT NULL,
  previous_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES food_requests (id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id)
) ENGINE=InnoDB;

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('request_received', 'request_status_update', 'pickup_ready', 'donation_completed', 'listing_expiring', 'admin_alert', 'system') NOT NULL DEFAULT 'system',
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 11. NGO VERIFICATIONS
CREATE TABLE IF NOT EXISTS ngo_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  submitted_documents TEXT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by_admin_id INT NULL,
  admin_notes TEXT NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verifications_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT fk_verifications_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  admin_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_status (status)
) ENGINE=InnoDB;

-- 13. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  rating INT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  comments TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  assigned_to_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_admin FOREIGN KEY (assigned_to_admin_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  badge VARCHAR(50) DEFAULT 'ANNOUNCEMENT',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 16. ARTICLES (Food Waste Education)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content MEDIUMTEXT NOT NULL,
  author_name VARCHAR(100) DEFAULT 'SavePlate Sustainability Team',
  image_url VARCHAR(500) NULL,
  read_time VARCHAR(50) DEFAULT '4 min read',
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 17. FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users (id),
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;

-- 19. PLATFORM SETTINGS
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

