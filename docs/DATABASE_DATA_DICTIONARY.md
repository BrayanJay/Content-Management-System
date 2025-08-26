# Database Data Dictionary

## Table Definitions and Field Specifications

### Core System Tables

#### `users` - User Authentication and Authorization
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique user identifier |
| username | VARCHAR(255) | NO | UNI | - | Unique login username |
| password | VARCHAR(255) | NO | - | - | bcrypt hashed password |
| role | ENUM | NO | - | 'VIEWER' | User permission level |
| token | VARCHAR(500) | YES | - | NULL | Session authentication token |
| last_login | TIMESTAMP | YES | - | NULL | Last successful login time |
| created_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Last modification timestamp |

**Role Values:**
- `SUPER_ADMIN`: Full system access including user management
- `ADMIN`: Administrative access excluding user management  
- `EDITOR`: Content creation and editing permissions
- `VIEWER`: Read-only access to system

**Indexes:**
- `idx_users_username` (username)
- `idx_users_token` (token)
- `idx_users_role` (role)

---

#### `logger` - System Audit Trail
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique log entry identifier |
| user_id | INT | YES | MUL | NULL | Reference to users.id |
| username | VARCHAR(255) | YES | - | NULL | Username at time of action |
| action | VARCHAR(255) | NO | - | - | Type of action performed |
| target_type | VARCHAR(100) | YES | - | NULL | Type of entity affected |
| target_id | VARCHAR(100) | YES | - | NULL | ID of entity affected |
| ip_address | VARCHAR(45) | YES | - | NULL | Client IP address (IPv4/IPv6) |
| user_agent | TEXT | YES | - | NULL | Client browser/application info |
| timestamp | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | When action occurred |
| details | JSON | YES | - | NULL | Additional action metadata |

**Common Actions:**
- `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `UPLOAD`, `DOWNLOAD`

**Indexes:**
- `idx_logger_user` (user_id)
- `idx_logger_timestamp` (timestamp)
- `idx_logger_action` (action)
- `idx_logger_target` (target_type, target_id)

---

#### `file_uploads` - File Management Tracking
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique file identifier |
| original_filename | VARCHAR(255) | NO | - | - | Original filename from client |
| saved_filename | VARCHAR(255) | NO | - | - | System-generated filename |
| file_path | VARCHAR(500) | NO | - | - | Full server path to file |
| file_size | INT | NO | - | - | File size in bytes |
| mime_type | VARCHAR(100) | NO | - | - | MIME type (e.g., image/jpeg) |
| uploaded_by | INT | NO | MUL | - | Reference to users.id |
| upload_timestamp | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Upload completion time |

**Supported MIME Types:**
- Images: `image/jpeg`, `image/png`, `image/webp`
- Documents: `application/pdf`, `text/plain`

**Indexes:**
- `idx_uploads_user` (uploaded_by)
- `idx_uploads_timestamp` (upload_timestamp)
- `idx_uploads_mime` (mime_type)

---

### Content Management Tables

#### `board_of_directors` - Board Member Profiles
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique board member identifier |
| profile_picture | VARCHAR(500) | YES | - | NULL | Path to profile image |
| name_en | VARCHAR(255) | NO | - | - | Full name in English |
| name_si | VARCHAR(255) | NO | - | - | Full name in Sinhala |
| name_ta | VARCHAR(255) | NO | - | - | Full name in Tamil |
| designation_en | VARCHAR(255) | NO | - | - | Job title in English |
| designation_si | VARCHAR(255) | NO | - | - | Job title in Sinhala |
| designation_ta | VARCHAR(255) | NO | - | - | Job title in Tamil |
| description_en | TEXT | YES | - | NULL | Biography in English |
| description_si | TEXT | YES | - | NULL | Biography in Sinhala |
| description_ta | TEXT | YES | - | NULL | Biography in Tamil |
| updated_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Last modification time |
| uploaded_by | INT | NO | MUL | - | Reference to users.id |

**Indexes:**
- `idx_board_name_en` (name_en)
- `idx_board_designation_en` (designation_en)
- `idx_board_updated` (updated_at)

---

#### `corporate_management` - Corporate Team Profiles
*Identical structure to `board_of_directors` table*

**Purpose**: Separate management of corporate leadership vs board members

---

#### `profile_content` - General Profile Content
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| profile_id | INT | NO | PRI | - | Profile section identifier |
| content | TEXT | YES | - | NULL | HTML/text content |
| updated_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Last modification time |
| uploaded_by | INT | NO | MUL | - | Reference to users.id |

**Profile Types:**
- `1`: About Us section
- `2`: Company History
- `3`: Mission & Vision

---

### Location Management

#### `branches` - Branch Location Data
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique branch identifier |
| region_id | VARCHAR(50) | NO | - | - | Regional classification code |
| branch_name_en | VARCHAR(255) | NO | - | - | Branch name in English |
| branch_name_si | VARCHAR(255) | NO | - | - | Branch name in Sinhala |
| branch_name_ta | VARCHAR(255) | NO | - | - | Branch name in Tamil |
| branch_address_en | TEXT | NO | - | - | Address in English |
| branch_address_si | TEXT | NO | - | - | Address in Sinhala |
| branch_address_ta | TEXT | NO | - | - | Address in Tamil |
| region_name_en | VARCHAR(255) | NO | - | - | Region name in English |
| region_name_si | VARCHAR(255) | NO | - | - | Region name in Sinhala |
| region_name_ta | VARCHAR(255) | NO | - | - | Region name in Tamil |
| contact_number | VARCHAR(20) | NO | - | - | Primary contact phone |
| email | VARCHAR(255) | NO | - | - | Branch email address |
| coordinates_longitude | DECIMAL(11,8) | NO | - | - | Geographic longitude |
| coordinates_latitude | DECIMAL(10,8) | NO | - | - | Geographic latitude |
| branch_image | VARCHAR(500) | YES | - | NULL | Path to branch image |
| created_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Branch creation time |
| updated_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Last modification time |
| uploaded_by | INT | NO | MUL | - | Reference to users.id |

**Region Codes:**
- `HEAD_OFFICE`: Head Office
- `WESTERN_REGION`: Western Region
- `SOUTHERN_REGION`: Southern Region
- `EASTERN_REGION`: Eastern Region
- `NORTHERN_REGION`: Northern Region
- `CENTRAL_REGION`: Central Region
- `NORTH-WESTERN_REGION`: North-Western Region
- `UVA_REGION`: Uva Region
- `SABARAGAMUWA_REGION`: Sabaragamuwa Region

**Indexes:**
- `idx_branches_region` (region_id)
- `idx_branches_name_en` (branch_name_en)
- `idx_branches_email` (email)
- `idx_branches_coordinates` (coordinates_latitude, coordinates_longitude)

---

### Product Content Tables

All product tables follow the same multilingual structure:

#### Standard Product Table Structure
| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT | NO | PRI | auto_increment | Unique product content identifier |
| content_en | TEXT | YES | - | NULL | Product content in English |
| content_si | TEXT | YES | - | NULL | Product content in Sinhala |
| content_ta | TEXT | YES | - | NULL | Product content in Tamil |
| updated_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Last modification time |
| uploaded_by | INT | NO | MUL | - | Reference to users.id |

**Product Tables:**
1. `mortgage` - Home mortgage products
2. `fixed_deposits` - Fixed deposit investment products
3. `leasing` - Vehicle leasing services
4. `gold_loan` - Gold-backed loan products
5. `forex` - Foreign exchange services
6. `luckewallet` - Digital wallet services

---

## Data Relationships

### Foreign Key Constraints
```sql
-- User relationships
logger.user_id → users.id (ON DELETE SET NULL)
file_uploads.uploaded_by → users.id (ON DELETE CASCADE)
board_of_directors.uploaded_by → users.id (ON DELETE CASCADE)
corporate_management.uploaded_by → users.id (ON DELETE CASCADE)
profile_content.uploaded_by → users.id (ON DELETE CASCADE)
branches.uploaded_by → users.id (ON DELETE CASCADE)
[all_product_tables].uploaded_by → users.id (ON DELETE CASCADE)
```

### Cascade Behavior
- **SET NULL**: Logger entries preserve historical data even if user is deleted
- **CASCADE**: Content and uploads are removed when user is deleted

---

## Character Set and Collation

**Database Level:**
```sql
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
```

**Purpose:**
- Full Unicode support for multilingual content
- Proper sorting for Sinhala and Tamil characters
- Emoji and special character support

---

## Storage Estimates

| Table | Estimated Size | Growth Rate |
|-------|---------------|-------------|
| users | ~1KB per user | Low |
| logger | ~2KB per entry | High (daily) |
| file_uploads | ~500B per file | Medium |
| board_of_directors | ~5KB per profile | Very Low |
| corporate_management | ~5KB per profile | Very Low |
| branches | ~3KB per branch | Low |
| product_tables | ~2KB per update | Low |

**Total Database Size (1 year)**: Estimated 50-100MB with normal usage

---

## Performance Considerations

### Query Optimization
- All foreign keys are indexed
- Search fields (names, emails) are indexed
- Timestamp fields indexed for date-based queries

### Maintenance
- Regular `ANALYZE TABLE` for query optimization
- Logger table cleanup for old entries
- File upload orphan detection and cleanup

### Backup Strategy
- Daily full database backup
- Transaction log backup every 15 minutes
- File system backup for media directory
