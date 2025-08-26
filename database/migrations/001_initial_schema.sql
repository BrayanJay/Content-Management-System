-- =====================================================
-- AAF CMS Database Schema - Complete Migration Script
-- Version: 2.0
-- Date: August 2025
-- Description: Creates all tables for AAF CMS system
-- =====================================================

-- Set charset and collation for proper multilingual support
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. USERS TABLE - Core authentication and authorization
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    token VARCHAR(500) NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_username (username),
    INDEX idx_users_token (token),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. LOGGER TABLE - System audit trail
-- =====================================================

CREATE TABLE IF NOT EXISTS logger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(255) NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100) NULL,
    target_id VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSON NULL,
    
    INDEX idx_logger_user (user_id),
    INDEX idx_logger_timestamp (timestamp),
    INDEX idx_logger_action (action),
    INDEX idx_logger_target (target_type, target_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. FILE UPLOADS TABLE - File management tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    saved_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INT NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uploads_user (uploaded_by),
    INDEX idx_uploads_timestamp (upload_timestamp),
    INDEX idx_uploads_mime (mime_type),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PROFILE CONTENT TABLE - General profile content
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_content (
    profile_id INT PRIMARY KEY,
    content TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_profile_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. BOARD OF DIRECTORS TABLE - Board member profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS board_of_directors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_picture VARCHAR(500) NULL,
    name_en VARCHAR(255) NOT NULL,
    name_si VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    designation_en VARCHAR(255) NOT NULL,
    designation_si VARCHAR(255) NOT NULL,
    designation_ta VARCHAR(255) NOT NULL,
    description_en TEXT NULL,
    description_si TEXT NULL,
    description_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_board_name_en (name_en),
    INDEX idx_board_designation_en (designation_en),
    INDEX idx_board_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. CORPORATE MANAGEMENT TABLE - Corporate team profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS corporate_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_picture VARCHAR(500) NULL,
    name_en VARCHAR(255) NOT NULL,
    name_si VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    designation_en VARCHAR(255) NOT NULL,
    designation_si VARCHAR(255) NOT NULL,
    designation_ta VARCHAR(255) NOT NULL,
    description_en TEXT NULL,
    description_si TEXT NULL,
    description_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_corporate_name_en (name_en),
    INDEX idx_corporate_designation_en (designation_en),
    INDEX idx_corporate_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. BRANCHES TABLE - Branch location data
-- =====================================================

CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL,
    branch_name_en VARCHAR(255) NOT NULL,
    branch_name_si VARCHAR(255) NOT NULL,
    branch_name_ta VARCHAR(255) NOT NULL,
    branch_address_en TEXT NOT NULL,
    branch_address_si TEXT NOT NULL,
    branch_address_ta TEXT NOT NULL,
    region_name_en VARCHAR(255) NOT NULL,
    region_name_si VARCHAR(255) NOT NULL,
    region_name_ta VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    coordinates_longitude DECIMAL(11, 8) NOT NULL,
    coordinates_latitude DECIMAL(10, 8) NOT NULL,
    branch_image VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_branches_region (region_id),
    INDEX idx_branches_name_en (branch_name_en),
    INDEX idx_branches_email (email),
    INDEX idx_branches_coordinates (coordinates_latitude, coordinates_longitude),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. PRODUCT TABLES - Multilingual product content
-- =====================================================

-- Mortgage products
CREATE TABLE IF NOT EXISTS mortgage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_mortgage_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fixed Deposits products
CREATE TABLE IF NOT EXISTS fixed_deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_fixed_deposits_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leasing products
CREATE TABLE IF NOT EXISTS leasing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_leasing_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gold Loan products
CREATE TABLE IF NOT EXISTS gold_loan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_gold_loan_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forex services
CREATE TABLE IF NOT EXISTS forex (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_forex_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LuckeWallet digital services
CREATE TABLE IF NOT EXISTS luckewallet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_en TEXT NULL,
    content_si TEXT NULL,
    content_ta TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by INT NOT NULL,
    
    INDEX idx_luckewallet_updated (updated_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. INITIAL DATA SETUP
-- =====================================================

-- Insert default super admin user (password: admin123)
-- Note: Change this password immediately after setup!
INSERT IGNORE INTO users (username, password, role, created_at) VALUES 
('admin', '$2b$10$rQQQQQQQQQQQQQQQQQQQQOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'SUPER_ADMIN', NOW());

-- Insert initial profile content entries
INSERT IGNORE INTO profile_content (profile_id, content, uploaded_by) VALUES 
(1, 'Welcome to AAF CMS Profile Section', 1);

-- Insert sample product content (you can modify these)
INSERT IGNORE INTO mortgage (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'Mortgage services content in English', 'සිංහල ගෘහණය සේවා', 'தமிழ் வீட்டுக் கடன் சேவைகள்', 1);

INSERT IGNORE INTO fixed_deposits (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'Fixed Deposits services content in English', 'සිංහල ස්ථාවර තැන්පතු සේවා', 'தமிழ் நிலையான வைப்பு சேவைகள்', 1);

INSERT IGNORE INTO leasing (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'Leasing services content in English', 'සිංහල බදු සේවා', 'தமிழ் குத்தகை சேவைகள்', 1);

INSERT IGNORE INTO gold_loan (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'Gold Loan services content in English', 'සිංහල රන් ණය සේවා', 'தமிழ் தங்கக் கடன் சேவைகள்', 1);

INSERT IGNORE INTO forex (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'Forex services content in English', 'සිංහල විදේශ විනිමය සේවා', 'தமிழ் அந்நிய செலாவணி சேவைகள்', 1);

INSERT IGNORE INTO luckewallet (id, content_en, content_si, content_ta, uploaded_by) VALUES 
(1, 'LuckeWallet services content in English', 'සිංහල ලකී වොලට් සේවා', 'தமிழ் லக்கி வாலட் சேவைகள்', 1);

-- =====================================================
-- 10. DATABASE STATISTICS AND COMPLETION
-- =====================================================

-- Show table information
SELECT 
    TABLE_NAME as 'Table Name',
    TABLE_ROWS as 'Estimated Rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Show completion message
SELECT 'AAF CMS Database Schema Migration Completed Successfully!' as 'Status';
SELECT 'Default admin user created with username: admin' as 'Notice';
SELECT 'IMPORTANT: Change the default admin password immediately!' as 'Security Warning';
