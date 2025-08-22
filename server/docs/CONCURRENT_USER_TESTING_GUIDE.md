# Multi-User Concurrent Testing Guide

## System Status
✅ **Backend Server**: Running on http://localhost:3000  
✅ **Frontend Server**: Running on http://localhost:5176  
✅ **Enhanced Session Management**: Configured for concurrent users  
✅ **User Monitoring System**: Available at `/sessions/active` endpoint  

## Test Users Created

### 1. Admin User
- **Username**: `admin_user`
- **Password**: `admin123`
- **Role**: `admin`
- **Permissions**: Full system access, user management, force logout capabilities

### 2. Content Manager
- **Username**: `content_manager`
- **Password**: `content123`
- **Role**: `content_manager`
- **Permissions**: Content editing, file uploads, branch content management

### 3. Branch Manager
- **Username**: `branch_manager`
- **Password**: `branch123`
- **Role**: `branch_manager`
- **Permissions**: Branch management, regional operations, limited admin functions

### 4. Viewer User
- **Username**: `viewer_user`
- **Password**: `viewer123`
- **Role**: `viewer`
- **Permissions**: Read-only access, view reports and data

### 5. Test User 1
- **Username**: `test_user1`
- **Password**: `test123`
- **Role**: `content_manager`
- **Permissions**: Content editing and management

### 6. Test User 2
- **Username**: `test_user2`
- **Password**: `test123`
- **Role**: `branch_manager`
- **Permissions**: Branch operations and management

## Concurrent Testing Steps

### Phase 1: Basic Concurrent Login Testing
1. **Open 3 Different Browsers/Incognito Windows**:
   - Chrome (regular)
   - Chrome (incognito)
   - Firefox/Edge

2. **Login with Different Users**:
   - Browser 1: `admin_user` / `admin123`
   - Browser 2: `content_manager` / `content123`
   - Browser 3: `branch_manager` / `branch123`

3. **Verify Each User's Dashboard**:
   - Check role-specific navigation
   - Verify permissions are correctly applied
   - Test branch network access

### Phase 2: Session Monitoring
1. **Admin User Actions**:
   - Navigate to the user monitoring component (if integrated)
   - Check active users endpoint: `GET /api/sessions/active`
   - View real-time user activity

2. **Test Session Endpoints**:
   ```bash
   # Get active users (admin only)
   curl -X GET http://localhost:3000/api/sessions/active -b "connect.sid=YOUR_SESSION_ID"
   
   # Get current session info
   curl -X GET http://localhost:3000/api/sessions/session -b "connect.sid=YOUR_SESSION_ID"
   ```

### Phase 3: Concurrent Operations Testing
1. **Branch Management**: 
   - Have multiple users access branch network simultaneously
   - Test branch editing from different sessions
   - Verify no data conflicts occur

2. **File Operations**:
   - Multiple users uploading files concurrently
   - Test file access permissions across roles

3. **Content Management**:
   - Simultaneous content editing
   - Role-based content restrictions

### Phase 4: Session Management Testing
1. **Session Isolation**:
   - Verify user A cannot access user B's data
   - Test role-based route protection
   - Check session token uniqueness

2. **Force Logout Testing**:
   - Admin user forces logout of another user
   - Verify the logged-out user is redirected to login
   - Test session cleanup

3. **Auto-Refresh Testing**:
   - Monitor active users in real-time
   - Test 10-second auto-refresh functionality
   - Verify session activity tracking

## Testing API Endpoints

### Session Monitoring Endpoints
- `GET /api/sessions/active` - View all active users (admin only)
- `GET /api/sessions/session` - Get current user session info
- `POST /api/sessions/force-logout/:userId` - Force logout a user (admin only)

### Branch Management Endpoints
- `GET /api/branches/stats/regions` - Branch statistics by region
- `GET /api/branches/:lang` - Branch listings with language support
- `POST /api/branches` - Create new branch (authorized roles only)

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify session token

## Expected Behaviors

### ✅ Success Indicators
- [ ] All 3 users can login simultaneously
- [ ] Each user sees role-appropriate dashboard
- [ ] Session isolation is maintained
- [ ] Real-time user monitoring works
- [ ] No session conflicts or data leaks
- [ ] Force logout functionality works
- [ ] Auto-refresh updates user status

### ❌ Issues to Watch For
- Session conflicts between users
- Database connection pool exhaustion
- Memory leaks from concurrent sessions
- Route protection bypass
- Data corruption from concurrent edits

## Performance Monitoring

### Database Connections
- Monitor connection pool usage
- Check for connection leaks
- Verify proper connection cleanup

### Memory Usage
- Monitor server memory consumption
- Check for session memory leaks
- Verify garbage collection efficiency

### Response Times
- Measure API response times under load
- Check frontend rendering performance
- Monitor network request efficiency

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Frontend auto-selected port 5176
2. **Database Connections**: Check pool configuration if timeouts occur
3. **Session Conflicts**: Verify session storage and cookie settings
4. **Role Access**: Check middleware authentication logic

### Debug Commands
```bash
# Check server logs
cd d:\AAF_Web\Source_Code\aaf_cms\server
npm start

# Check database connections
node -e "import('./lib/db.js').then(async (db) => { console.log('DB connection test'); })"

# Monitor active processes
netstat -an | findstr :3000
```

## Next Steps
1. Run the concurrent user tests outlined above
2. Monitor system performance under multi-user load
3. Test edge cases (rapid login/logout, session timeouts)
4. Validate data integrity across concurrent operations
5. Consider load testing with additional users if needed

## Security Considerations
- Each session has unique tokens
- Role-based access control is enforced
- Sessions expire after 3 hours of inactivity
- Force logout capability for admin oversight
- CORS protection for cross-origin requests

Your AAF CMS system is now enhanced for concurrent multi-user testing with comprehensive monitoring capabilities!
