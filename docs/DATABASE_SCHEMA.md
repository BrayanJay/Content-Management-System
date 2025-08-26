# AAF CMS Database Schema Documentation

## Overview

This document provides a comprehensive overview of the database structure used in the AAF (Agromart Agriculture Foundation) Content Management System. The system uses MySQL as the primary database engine.

## Database Configuration

- **Database Engine**: MySQL 2 (mysql2/promise)
- **Connection Pool**: 5 concurrent connections
- **Environment Variables Required**:
  - `DB_HOST` - Database host
  - `DB_USER` - Database username
  - `DB_PASSWORD` - Database password
  - `DB_NAME` - Database name

## Table Structure

### 1. Users Table (`users`)

Manages user authentication and authorization for the CMS.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER') NOT NULL,
  token VARCHAR(500) NULL,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Fields Description:**
- `id`: Unique identifier for each user
- `username`: Unique username for login
- `password`: Hashed password (bcrypt)
- `role`: User permission level (Role-Based Access Control)
- `token`: Session token for authentication
- `last_login`: Timestamp of last successful login
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp

### 2. Board of Directors Table (`board_of_directors`)

Stores information about board members with multilingual support.

```sql
CREATE TABLE board_of_directors (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

**Multilingual Support:**
- English (`_en`)
- Sinhala (`_si`) 
- Tamil (`_ta`)

### 3. Corporate Management Table (`corporate_management`)

Similar structure to board_of_directors for corporate management profiles.

```sql
CREATE TABLE corporate_management (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### 4. Profile Content Table (`profile_content`)

Stores general profile content information.

```sql
CREATE TABLE profile_content (
  profile_id INT PRIMARY KEY,
  content TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### 5. File Uploads Table (`file_uploads`)

Tracks all file uploads in the system.

```sql
CREATE TABLE file_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  original_filename VARCHAR(255) NOT NULL,
  saved_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by INT NOT NULL,
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### 6. Logger Table (`logger`)

System logging and audit trail.

```sql
CREATE TABLE logger (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  username VARCHAR(255) NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NULL,
  target_id VARCHAR(100) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 7. Product Description Tables

Multiple tables for different product types with multilingual content:

#### Mortgage Table (`mortgage`)
```sql
CREATE TABLE mortgage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content_en TEXT NULL,
  content_si TEXT NULL,
  content_ta TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### Fixed Deposits Table (`fixed_deposits`)
```sql
CREATE TABLE fixed_deposits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content_en TEXT NULL,
  content_si TEXT NULL,
  content_ta TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### Additional Product Tables
- `leasing` - Vehicle leasing products
- `gold_loan` - Gold loan products  
- `forex` - Foreign exchange services
- `luckewallet` - Digital wallet services

### 8. Branch Information Table (`branches`)

Stores branch location data with multilingual support and coordinates.

```sql
CREATE TABLE branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
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
  coordinates_longitude DECIMAL(10, 8) NOT NULL,
  coordinates_latitude DECIMAL(10, 8) NOT NULL,
  branch_image VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

## Indexes and Performance

### Recommended Indexes

```sql
-- User authentication
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_token ON users(token);

-- Profile searches
CREATE INDEX idx_board_name_en ON board_of_directors(name_en);
CREATE INDEX idx_corporate_name_en ON corporate_management(name_en);

-- File management
CREATE INDEX idx_uploads_user ON file_uploads(uploaded_by);
CREATE INDEX idx_uploads_timestamp ON file_uploads(upload_timestamp);

-- Branch searches
CREATE INDEX idx_branches_region ON branches(region_id);
CREATE INDEX idx_branches_name_en ON branches(branch_name_en);

-- Logging
CREATE INDEX idx_logger_user ON logger(user_id);
CREATE INDEX idx_logger_timestamp ON logger(timestamp);
CREATE INDEX idx_logger_action ON logger(action);
```

## Role-Based Access Control (RBAC)

### User Roles Hierarchy

1. **SUPER_ADMIN**: Full system access
2. **ADMIN**: Administrative access excluding user management
3. **EDITOR**: Content creation and editing
4. **VIEWER**: Read-only access

### Permission Matrix

| Feature | SUPER_ADMIN | ADMIN | EDITOR | VIEWER |
|---------|-------------|-------|--------|--------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Content Creation | ✅ | ✅ | ✅ | ❌ |
| Content Editing | ✅ | ✅ | ✅ | ❌ |
| File Upload | ✅ | ✅ | ✅ | ❌ |
| Content Viewing | ✅ | ✅ | ✅ | ✅ |
| System Logs | ✅ | ✅ | ❌ | ❌ |

## Data Relationships

```
users (1) ----< board_of_directors (uploaded_by)
users (1) ----< corporate_management (uploaded_by)  
users (1) ----< profile_content (uploaded_by)
users (1) ----< file_uploads (uploaded_by)
users (1) ----< logger (user_id)
users (1) ----< branches (uploaded_by)
users (1) ----< [all_product_tables] (uploaded_by)
```

## Multilingual Support

The system supports three languages:
- **English** (`_en`): Primary language
- **Sinhala** (`_si`): Local language
- **Tamil** (`_ta`): Local language

All content tables include fields for each language to support full localization.

## Security Features

1. **Password Hashing**: bcrypt with salt
2. **Session Management**: Token-based authentication
3. **SQL Injection Protection**: Prepared statements
4. **Audit Trail**: Comprehensive logging system
5. **Role-Based Access**: Granular permission control

## File Storage Structure

Files are organized in the following directory structure:
```
media/
├── profiles/          # Profile pictures
├── branches/          # Branch images
├── products/          # Product banners
├── landingpage/       # Homepage carousels
└── uploads/           # General uploads
```

## Backup and Maintenance

### Automated Cleanup
- Logger table: Automatic cleanup of entries older than configurable days
- File uploads: Orphaned file detection and cleanup

### Backup Recommendations
- Daily database backups
- File system backups for media directory
- Point-in-time recovery capability

## Environment Setup

### Required Environment Variables
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=aaf_cms_db
```

### Database Initialization
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE aaf_cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migration scripts (if available)
# Import schema and initial data
```

## API Integration

The database integrates with RESTful APIs for:
- Authentication (`/auth/*`)
- User management (`/users/*`)
- Profile management (`/profiles/*`)
- Branch management (`/branches/*`)
- File uploads (`/fileUpload/*`)
- Product content (`/products/*`)
- System logging (`/logger/*`)

---

**Last Updated**: August 2025  
**Version**: 2.0  
**Database Engine**: MySQL 8.0+
