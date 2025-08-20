# Logger API Documentation

## Overview
The Logger API provides comprehensive logging functionality for monitoring errors, activities, user logins, and system events. All logs are stored in the `logger` table with detailed information including timestamps, user context, and request details.

## Base URL
```
/logs
```

## Endpoints

### 1. Get Logs
**GET** `/logs`

Retrieve logs with optional filtering and pagination.

#### Query Parameters:
- `level` (optional): Filter by log level (`INFO`, `WARN`, `ERROR`, `DEBUG`, `SECURITY`)
- `category` (optional): Filter by category (e.g., `HTTP_REQUEST`, `AUTHENTICATION`, `DATABASE`)
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter logs from this date (YYYY-MM-DD HH:MM:SS)
- `endDate` (optional): Filter logs until this date (YYYY-MM-DD HH:MM:SS)
- `limit` (optional): Number of records to return (default: 100)
- `offset` (optional): Number of records to skip (default: 0)
- `orderBy` (optional): Column to order by (default: timestamp)
- `orderDirection` (optional): ASC or DESC (default: DESC)

#### Example Request:
```bash
GET /logs?level=ERROR&startDate=2025-01-01&limit=50
```

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "timestamp": "2025-08-14T10:30:00.000Z",
      "level": "ERROR",
      "category": "DATABASE",
      "action": "DB_SELECT_ERROR",
      "user_id": 5,
      "username": "john_doe",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "request_method": "POST",
      "endpoint": "/api/users",
      "status_code": 500,
      "message": "Database connection failed",
      "details": {
        "table": "users",
        "error": "Connection timeout"
      },
      "execution_time_ms": 5000,
      "session_id": "sess_123abc"
    }
  ],
  "count": 1,
  "executionTime": 45
}
```

### 2. Get Log Statistics
**GET** `/logs/stats`

Get aggregated statistics about logs.

#### Query Parameters:
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics
- `groupBy` (optional): Group by field (`level`, `category`, `user_id`) (default: level)

#### Example Request:
```bash
GET /logs/stats?groupBy=category&startDate=2025-08-01
```

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "category": "HTTP_REQUEST",
      "count": 1250
    },
    {
      "category": "AUTHENTICATION",
      "count": 89
    },
    {
      "category": "DATABASE",
      "count": 45
    }
  ],
  "executionTime": 23
}
```

### 3. Create Log Entry
**POST** `/logs`

Manually create a log entry (for testing or special cases).

#### Request Body:
```json
{
  "level": "INFO",
  "category": "CUSTOM",
  "action": "MANUAL_LOG",
  "message": "This is a manual log entry",
  "details": {
    "custom_field": "custom_value"
  },
  "userId": 5,
  "username": "john_doe"
}
```

#### Required Fields:
- `level`: Log level (INFO, WARN, ERROR, DEBUG, SECURITY)
- `category`: Log category
- `action`: Action description
- `message`: Log message

#### Example Response:
```json
{
  "success": true,
  "message": "Log entry created successfully",
  "executionTime": 12
}
```

### 4. Cleanup Old Logs
**POST** `/logs/cleanup`

Delete old log entries to manage database size.

#### Request Body:
```json
{
  "daysToKeep": 30
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Successfully cleaned up 1250 old log entries",
  "data": {
    "deletedRows": 1250
  },
  "executionTime": 1500
}
```

## Log Levels

### INFO
- Successful operations
- Normal system behavior
- User actions

### WARN
- Unusual but handled situations
- Performance issues
- Deprecated feature usage

### ERROR
- Application errors
- Database failures
- Failed operations

### DEBUG
- Detailed debugging information
- Development-specific logs

### SECURITY
- Authentication events
- Authorization failures
- Security-related activities

## Log Categories

### HTTP_REQUEST
- All HTTP requests to the server
- Request/response details
- Performance metrics

### AUTHENTICATION
- Login attempts (success/failure)
- Logout events
- Session management

### AUTHORIZATION
- Permission checks
- Access control events

### DATABASE
- Database operations
- Query performance
- Connection issues

### FILE_OPERATION
- File uploads/downloads
- File deletions
- Storage operations

### SYSTEM
- Server startup/shutdown
- Configuration changes
- System maintenance

### APPLICATION_ERROR
- Unhandled exceptions
- Runtime errors
- Critical failures

### SECURITY
- Unauthorized access attempts
- Suspicious activities
- Security violations

## Automatic Logging

The system automatically logs:

1. **All HTTP Requests**: Method, URL, status code, execution time
2. **Authentication Events**: Login/logout/failures with user details
3. **Database Operations**: Success/failure of database queries
4. **File Operations**: Upload/delete operations with file details
5. **Errors**: All unhandled errors with stack traces
6. **System Events**: Server startup, configuration changes

## Usage Examples

### Get Recent Errors
```bash
GET /logs?level=ERROR&limit=20
```

### Get Login Activity for Specific User
```bash
GET /logs?category=AUTHENTICATION&userId=5&startDate=2025-08-01
```

### Get System Performance Overview
```bash
GET /logs/stats?groupBy=level&startDate=2025-08-01
```

### Monitor File Upload Activity
```bash
GET /logs?category=FILE_OPERATION&action=FILE_UPLOAD_SUCCESS
```

## Security Considerations

- Log access should be restricted to administrators
- Sensitive data (passwords, tokens) is never logged
- IP addresses and user agents are logged for security monitoring
- Session IDs help correlate related activities

## Performance Notes

- Logs are indexed on timestamp, level, category, user_id, and endpoint
- Consider regular cleanup of old logs to maintain performance
- Use pagination (limit/offset) for large result sets
- Statistics queries are optimized with proper indexing
