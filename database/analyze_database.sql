-- =====================================================
-- Database Information and Statistics Query
-- Use this to analyze your AAF CMS database
-- =====================================================

-- Database Overview
SELECT 
    'AAF CMS Database Overview' as 'System Information',
    VERSION() as 'MySQL Version',
    DATABASE() as 'Current Database',
    NOW() as 'Generated At';

-- Table Statistics
SELECT 
    TABLE_NAME as 'Table Name',
    TABLE_ROWS as 'Row Count',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size (MB)',
    TABLE_COLLATION as 'Collation',
    ENGINE as 'Engine'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- Column Information for Core Tables
SELECT 
    TABLE_NAME as 'Table',
    COLUMN_NAME as 'Column',
    DATA_TYPE as 'Type',
    IS_NULLABLE as 'Nullable',
    COLUMN_KEY as 'Key',
    COLUMN_DEFAULT as 'Default',
    EXTRA as 'Extra'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('users', 'logger', 'file_uploads', 'branches')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Foreign Key Relationships
SELECT 
    TABLE_NAME as 'Child Table',
    COLUMN_NAME as 'Foreign Key',
    REFERENCED_TABLE_NAME as 'Parent Table',
    REFERENCED_COLUMN_NAME as 'Referenced Column'
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- Index Information
SELECT 
    TABLE_NAME as 'Table',
    INDEX_NAME as 'Index',
    COLUMN_NAME as 'Column',
    NON_UNIQUE as 'Non-Unique',
    INDEX_TYPE as 'Type'
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Multilingual Tables Analysis
SELECT 
    TABLE_NAME as 'Table',
    COUNT(*) as 'Language Columns'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND (COLUMN_NAME LIKE '%_en' OR COLUMN_NAME LIKE '%_si' OR COLUMN_NAME LIKE '%_ta')
GROUP BY TABLE_NAME
ORDER BY COUNT(*) DESC;

-- User Roles Distribution (if data exists)
SELECT 
    role as 'User Role',
    COUNT(*) as 'Count',
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)), 2) as 'Percentage'
FROM users 
GROUP BY role
ORDER BY COUNT(*) DESC;

-- Recent Activity Summary (if data exists)
SELECT 
    action as 'Action Type',
    COUNT(*) as 'Count',
    MAX(timestamp) as 'Latest Occurrence'
FROM logger 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY action
ORDER BY COUNT(*) DESC
LIMIT 10;

-- File Upload Statistics (if data exists)
SELECT 
    mime_type as 'File Type',
    COUNT(*) as 'Files',
    ROUND(SUM(file_size) / 1024 / 1024, 2) as 'Total Size (MB)',
    ROUND(AVG(file_size) / 1024, 2) as 'Avg Size (KB)'
FROM file_uploads 
GROUP BY mime_type
ORDER BY COUNT(*) DESC;

-- Regional Branch Distribution (if data exists)
SELECT 
    region_id as 'Region',
    region_name_en as 'Region Name',
    COUNT(*) as 'Branch Count'
FROM branches 
GROUP BY region_id, region_name_en
ORDER BY COUNT(*) DESC;

-- Database Health Check
SELECT 
    'Tables Created' as 'Check',
    COUNT(*) as 'Result',
    CASE 
        WHEN COUNT(*) >= 13 THEN '✅ Complete'
        ELSE '❌ Incomplete'
    END as 'Status'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()

UNION ALL

SELECT 
    'Foreign Keys',
    COUNT(*),
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ Complete'
        ELSE '❌ Missing Keys'
    END
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL

UNION ALL

SELECT 
    'Indexes',
    COUNT(*),
    CASE 
        WHEN COUNT(*) >= 15 THEN '✅ Well Indexed'
        ELSE '⚠️ Needs More Indexes'
    END
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
AND INDEX_NAME != 'PRIMARY';

-- Show creation completion message
SELECT '🎉 AAF CMS Database Analysis Complete!' as 'Status';
