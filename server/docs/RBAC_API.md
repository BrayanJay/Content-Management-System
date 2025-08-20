# Role-Based Access Control (RBAC) API Documentation

## Overview
The AAF CMS now implements a comprehensive 4-level role-based access control system with automatic logging and permission checking.

## User Roles

### 1. Admin (admin)
**Full Access**
- Complete control over the entire system
- Can create, read, update, delete (CRUD) any data
- Can manage user accounts, roles, and system settings
- Can view and manage all logs
- Can delete files and perform system maintenance

### 2. Editor (editor)
**CRUD Access (Limited)**
- Can create, read, update, delete content in assigned areas
- Cannot change user roles or modify system settings
- Can upload and delete files
- Can view logs but cannot delete them
- Cannot manage user accounts

### 3. Contributor (contributor)
**Add & Edit Only**
- Can add new content and edit existing content
- Cannot delete any content
- Can upload files but cannot delete them
- No access to user management, system settings, or logs
- Cannot view other users' information

### 4. Viewer (viewer)
**View-Only Access**
- Can only view content
- No editing, deleting, or adding capabilities
- No access to system settings, user details, or logs
- Cannot upload or manipulate files

## Base URL
```
/users
```

## Authentication
All endpoints require authentication via session cookies. Use the existing `/auth/login` endpoint to authenticate.

## Endpoints

### 1. Get Current User Info
**GET** `/users/me`

Get information about the currently logged-in user including their role and permissions.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "role": "editor",
    "created_at": "2025-08-14T10:00:00.000Z",
    "updated_at": "2025-08-14T10:00:00.000Z",
    "last_login": "2025-08-14T15:30:00.000Z",
    "permissions": {
      "users": ["read"],
      "content": ["create", "read", "update", "delete"],
      "files": ["upload", "delete", "read"],
      "branches": ["create", "read", "update", "delete"],
      "products": ["create", "read", "update", "delete"],
      "profiles": ["create", "read", "update", "delete"]
    }
  },
  "executionTime": 45
}
```

### 2. Get All Users (Admin Only)
**GET** `/users`

Retrieve all users with their roles and information.

#### Authorization Required:
- Role: `admin`

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2025-08-14T10:00:00.000Z",
      "updated_at": "2025-08-14T10:00:00.000Z",
      "last_login": "2025-08-14T15:30:00.000Z"
    },
    {
      "id": 2,
      "username": "editor_user",
      "role": "editor",
      "created_at": "2025-08-14T11:00:00.000Z",
      "updated_at": "2025-08-14T11:00:00.000Z",
      "last_login": "2025-08-14T14:00:00.000Z"
    }
  ],
  "count": 2,
  "executionTime": 23
}
```

### 3. Create New User (Admin Only)
**POST** `/users`

Create a new user with specified role.

#### Authorization Required:
- Role: `admin`

#### Request Body:
```json
{
  "username": "new_user",
  "password": "secure_password",
  "role": "editor"
}
```

#### Required Fields:
- `username`: Unique username
- `password`: User password (will be hashed)
- `role`: User role (admin, editor, contributor, viewer) - defaults to viewer

#### Response:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "username": "new_user",
    "role": "editor"
  },
  "executionTime": 67
}
```

### 4. Update User Role (Admin Only)
**PUT** `/users/:id/role`

Update a user's role. Admins cannot change their own role.

#### Authorization Required:
- Role: `admin`

#### Request Body:
```json
{
  "role": "contributor"
}
```

#### Response:
```json
{
  "success": true,
  "message": "User role updated from editor to contributor",
  "data": {
    "success": true,
    "oldRole": "editor",
    "newRole": "contributor"
  },
  "executionTime": 34
}
```

### 5. Delete User (Admin Only)
**DELETE** `/users/:id`

Delete a user account. Admins cannot delete their own account.

#### Authorization Required:
- Role: `admin`

#### Response:
```json
{
  "success": true,
  "message": "User editor_user deleted successfully",
  "executionTime": 23
}
```

### 6. Get Available Roles and Permissions
**GET** `/users/roles`

Get all available roles and their permissions.

#### Authorization Required:
- Permission: `system:read` (Admin or Editor)

#### Response:
```json
{
  "success": true,
  "data": {
    "roles": {
      "ADMIN": "admin",
      "EDITOR": "editor",
      "CONTRIBUTOR": "contributor",
      "VIEWER": "viewer"
    },
    "permissions": {
      "admin": {
        "users": ["create", "read", "update", "delete"],
        "content": ["create", "read", "update", "delete"],
        "system": ["read", "update"],
        "logs": ["read", "delete"],
        "files": ["upload", "delete", "read"],
        "branches": ["create", "read", "update", "delete"],
        "products": ["create", "read", "update", "delete"],
        "profiles": ["create", "read", "update", "delete"]
      }
    }
  },
  "executionTime": 12
}
```

## Authentication Updates

### Login Response
The login endpoint now returns role information:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "editor"
  }
}
```

### Registration
Registration now accepts a role parameter (defaults to viewer):

```json
{
  "username": "new_user",
  "password": "password123",
  "role": "viewer"
}
```

## Authorization Middleware

### Available Middleware Functions:

1. **requireAuth** - Ensures user is authenticated
2. **requirePermission(resource, action)** - Checks specific permission
3. **requireRole(role)** - Requires exact role match
4. **requireAdmin** - Requires admin role
5. **requireEditor** - Requires editor or admin role
6. **requireContributor** - Requires contributor, editor, or admin role
7. **requireOwnershipOrAdmin(getUserIdFromParams)** - Requires ownership or admin

### Example Usage in Routes:

```javascript
import { requireAuth, requirePermission, requireAdmin } from '../middleware/authMiddleware.js';

// Require authentication
router.use(requireAuth);

// Require specific permission
router.post('/content', requirePermission('content', 'create'), createContent);

// Require admin role
router.get('/admin/settings', requireAdmin, getSettings);

// Require editor or higher
router.put('/content/:id', requireEditor, updateContent);
```

## Permission Matrix

| Resource | Admin | Editor | Contributor | Viewer |
|----------|-------|--------|-------------|--------|
| Users | CRUD | R | - | - |
| Content | CRUD | CRUD | CRU | R |
| System | RU | - | - | - |
| Logs | RD | R | - | - |
| Files | URD | URD | UR | R |
| Branches | CRUD | CRUD | CRU | R |
| Products | CRUD | CRUD | CRU | R |
| Profiles | CRUD | CRUD | CRU | R |

**Legend:** C=Create, R=Read, U=Update, D=Delete

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions. Required: create on content",
  "userRole": "viewer",
  "requiredPermission": "content:create"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid role specified",
  "validRoles": ["admin", "editor", "contributor", "viewer"]
}
```

## Security Features

1. **Automatic Logging**: All authorization events are logged
2. **Session Management**: Roles are stored in session for performance
3. **Permission Caching**: Permissions are calculated once per session
4. **Secure Role Changes**: Users cannot change their own roles
5. **Admin Protection**: Admins cannot delete themselves
6. **Unauthorized Access Monitoring**: Failed authorization attempts are logged

## Database Schema Updates

The system requires the following database changes to your existing `users` table:

```sql
-- Add role column with enum values and default to 'viewer'
ALTER TABLE users 
ADD COLUMN role ENUM('admin', 'editor', 'contributor', 'viewer') NOT NULL DEFAULT 'viewer';

-- Add updated_at column with auto-update on change
ALTER TABLE users 
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add last_login column to track user login times
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL;

-- Add indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Assign admin role to your first user (modify ID as needed)
UPDATE users SET role = 'admin' WHERE id = 1;
```

After updating the database, your `users` table will have:
- `id` - int, PRIMARY KEY, auto_increment
- `username` - varchar(100), NOT NULL
- `password` - varchar(100), NOT NULL  
- `created_at` - timestamp, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- `token` - varchar(255), NULL
- `role` - enum('admin','editor','contributor','viewer'), NOT NULL, DEFAULT 'viewer'
- `updated_at` - timestamp, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `last_login` - timestamp, NULL

## Creating Admin User

You can create an admin user using the provided script:

```bash
cd server
node utils/createAdmin.js
```

Or manually update an existing user to admin:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## Setup Instructions

1. **Update Database Schema**: Run the SQL commands above to add role system columns
2. **Create Admin User**: Use the script or SQL to create/assign admin role
3. **Update Existing Routes**: Add authorization middleware to protected routes  
4. **Test Permissions**: Verify all role levels work correctly
5. **Update Frontend**: Handle role-based UI rendering

## Best Practices

1. Always use the least privileged role for users
2. Regularly audit user roles and permissions
3. Monitor authorization logs for suspicious activity
4. Use specific permission checks rather than role checks when possible
5. Implement frontend role-based rendering to improve UX
6. Keep role changes logged and auditable
