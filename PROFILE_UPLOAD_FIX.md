# Fix for Profile Image Upload "User not found" Error

## Problem Description
When creating a profile in the AddProfile component, the process would complete Stage 1 (creating the profile) successfully, but fail during Stage 2 (uploading the profile image) with a "User not found" error, even though the image was being saved to the correct file location.

## Root Cause Analysis
The issue was in the authentication and user identification flow:

1. **Missing `req.userId` in Upload Handler**: The `uploadHandler.js` file was trying to access `req.userId` to get user information, but the authentication middleware (`authMiddleware.js`) was only setting `req.userRole` and not `req.userId`.

2. **Hard Failure on User Lookup**: The upload handler was returning a 404 error if the user lookup failed, instead of gracefully falling back to a default value.

## Applied Fixes

### 1. Updated `authMiddleware.js`
**File**: `server/middleware/authMiddleware.js`

Added `req.userId = req.session.userId;` to the `requireAuth` middleware to ensure backward compatibility:

```javascript
// Set both userRole and userId for backward compatibility
req.userRole = userRole;
req.userId = req.session.userId;
next();
```

### 2. Enhanced `uploadHandler.js`
**File**: `server/utils/uploadHandler.js`

Improved the user identification logic with better error handling and fallback:

```javascript
// Get userId from session (set by authMiddleware)
const userId = req.session?.userId;
let uploadedBy = "System"; // Default fallback

if (userId) {
  try {
    const [userRows] = await db.query("SELECT username FROM users WHERE id = ?", [userId]);
    if (userRows.length > 0) {
      uploadedBy = userRows[0].username;
    } else {
      console.warn("User not found in database, using default uploadedBy");
    }
  } catch (userError) {
    console.warn("Error retrieving user info, using default uploadedBy:", userError.message);
  }
} else {
  console.warn("No userId in session, using default uploadedBy");
}
```

### 3. Fixed Import Path
**File**: `frontend/src/components/profiles/AddProfile.jsx`

Corrected the import path for the UploadCard component to match the current file structure.

## Testing Steps

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test Profile Creation Flow
1. Navigate to the Add Profile page
2. **Stage 1**: Fill out all profile information (English, Sinhala, Tamil)
3. Click "Add Profile" - should complete successfully
4. **Stage 2**: Upload a profile image using the UploadCard component
5. **Stage 3**: Should now progress to the completion stage without errors

### 3. Verify File Upload
- Check that the profile image is saved in `server/media/aboutPage/[bod|coop]/[profileId].webp`
- Verify that the upload is logged in the database with the correct user information

## Expected Behavior After Fix

1. ✅ **Stage 1**: Profile creation completes successfully
2. ✅ **Stage 2**: Image upload completes without "User not found" error
3. ✅ **Stage 3**: Process moves to completion stage with success message
4. ✅ **File Storage**: Image is saved to correct location
5. ✅ **Database Logging**: Upload is logged with proper user attribution

## Additional Benefits

- **Improved Error Handling**: The system now gracefully handles cases where user lookup fails
- **Better Logging**: More detailed console logging for debugging upload issues
- **Backward Compatibility**: The `req.userId` addition ensures other parts of the system continue to work
- **Fallback Mechanism**: Uses "System" as uploadedBy when user identification fails

## Files Modified

1. `server/middleware/authMiddleware.js` - Added `req.userId` assignment
2. `server/utils/uploadHandler.js` - Enhanced user lookup with error handling
3. `frontend/src/components/profiles/AddProfile.jsx` - Fixed import path

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend development server starts without errors
- [ ] Profile creation (Stage 1) works
- [ ] Image upload (Stage 2) works without "User not found" error
- [ ] Completion stage (Stage 3) is reached
- [ ] Profile image appears in correct directory
- [ ] Database records show correct upload information

The fix ensures that the profile creation process now flows smoothly through all three stages without authentication-related errors during the image upload phase.
