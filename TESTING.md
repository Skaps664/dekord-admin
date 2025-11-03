# Admin Panel - Testing Instructions

## 🧪 How to Test the Login System

The admin panel currently uses **fake authentication** for testing purposes. Here's how to access it:

### Step 1: Login
1. Navigate to `http://localhost:3001/login`
2. **Email**: Enter any valid email format (e.g., `admin@dekord.online`, `test@test.com`)
3. **Password**: Enter any password (e.g., `test123`, `password`)
4. Click **Continue**

### Step 2: Two-Factor Authentication (2FA)
1. You'll be redirected to the 2FA screen
2. **Enter any 6-digit code** (e.g., `123456`, `000000`, `999999`)
3. The code will auto-focus to the next input as you type
4. Click **Verify & Login**

### ✅ Success!
You'll be redirected to the admin dashboard and can access all admin features.

## 🚪 Logout
Click the red **Logout** button in the top-right corner of the dashboard to log out.

## 🔐 Current Authentication Status
- **Fake authentication** using localStorage
- **No real validation** - any credentials work
- **Ready for Supabase integration** when needed

## 🎯 Test Credentials (Any work!)
- Email: `admin@dekord.online` | Password: `admin123`
- Email: `test@test.com` | Password: `password`
- Email: `anything@example.com` | Password: `anything`

2FA Code: Any 6 digits (e.g., `123456`)

---

**Note**: In production, this will be replaced with:
- Real Supabase authentication
- Secure JWT tokens in httpOnly cookies
- TOTP-based 2FA with Google Authenticator/Authy
