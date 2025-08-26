# Database Setup Guide

## Quick Setup

### 1. Prerequisites
- MySQL 8.0 or higher
- Node.js 16+ 
- Git

### 2. Clone and Setup
```bash
git clone https://github.com/BrayanJay/aaf_cms-v2.git
cd aaf_cms-v2
```

### 3. Database Installation

#### Option A: Automatic Setup (Recommended)
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE aaf_cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migration
mysql -u root -p aaf_cms_db < database/migrations/001_initial_schema.sql
```

#### Option B: Manual Setup
1. Open MySQL client
2. Create database: `CREATE DATABASE aaf_cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
3. Use database: `USE aaf_cms_db;`
4. Copy and paste the content from `database/migrations/001_initial_schema.sql`

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=aaf_cms_db
```

### 5. Start Application
```bash
# Install dependencies
npm install

# Start server
npm start
```

### 6. Default Login
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ IMPORTANT**: Change this password immediately after first login!

## Database Documentation

- 📋 **Schema Details**: [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
- 🗺️ **Entity Diagram**: [DATABASE_ERD.md](./docs/DATABASE_ERD.md)
- 🔧 **Migration Scripts**: [database/migrations/](./database/migrations/)

## Features

✅ **Multilingual Support** (English, Sinhala, Tamil)  
✅ **Role-Based Access Control** (RBAC)  
✅ **File Upload Management**  
✅ **Branch Location Management**  
✅ **Product Content Management**  
✅ **Audit Logging**  
✅ **Profile Management**
