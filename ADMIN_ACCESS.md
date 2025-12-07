# 🔐 How to Access Admin Panel

## Quick Access Guide

### Method 1: Create Admin User (Recommended)

Use the provided script to create an admin user:

```bash
# Navigate to backend directory
cd backend

# Create admin with default credentials
npm run create-admin

# Or with custom email and password
node scripts/create-admin.js admin@example.com mypassword123 Admin User admin

# Create super_admin instead
node scripts/create-admin.js superadmin@example.com mypassword123 Super Admin User super_admin
```

**Default Admin Credentials:**
- Email: `admin@university.edu`
- Password: `admin123`
- Role: `admin`

### Method 2: Update Existing User to Admin

If you already have a user account, you can update it to admin role:

#### Option A: Using Database (PostgreSQL)

```sql
-- Connect to your database
-- Update user role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Or make them super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

#### Option B: Using API (if you have another admin)

```bash
# Update user role via API (requires admin authentication)
PUT /api/users/:userId
Headers: Authorization: Bearer <admin-token>
Body: {
  "role": "admin"
}
```

## Accessing Admin Panel

1. **Login** with your admin credentials at: `http://localhost:3000/login`

2. **Navigate to Admin Panel:**
   - Direct URL: `http://localhost:3000/admin`
   - Or click "Admin Dashboard" in sidebar (if you see admin nav items)

3. **Admin Routes Available:**
   - `/admin` - Dashboard
   - `/admin/applications` - Review Applications
   - `/admin/applications/:id/review` - Review Specific Application
   - `/admin/students` - Manage Students
   - `/admin/payments` - View Payments
   - `/admin/refunds` - Manage Refunds
   - `/admin/tickets` - Support Tickets
   - `/admin/faqs` - Manage FAQs
   - `/admin/document-config` - Document Configuration

## Admin Features

### Application Verification
- View all applications
- Review application details
- Change application status to `verified` (required before payment)
- Raise issues on applications
- Approve/reject applications

### Student Management
- View all students
- Activate/deactivate student accounts
- Change student roles

### Payment Management
- View all payments
- Process refunds
- View payment history

## Role Types

- **`student`** - Default role, can create applications, upload documents, make payments
- **`admin`** - Can manage applications, students, payments, tickets, FAQs
- **`super_admin`** - Same as admin, but cannot be deleted

## Security Notes

⚠️ **Important:**
- Change default admin password immediately after first login
- Keep admin credentials secure
- Only grant admin access to trusted users
- Use `super_admin` role sparingly

## Troubleshooting

### "Access Denied" or Redirected to Student Dashboard
- Check that your user role is `admin` or `super_admin` in database
- Logout and login again to refresh token
- Clear browser cache and cookies

### Can't See Admin Navigation
- Verify user role in database: `SELECT email, role FROM users WHERE email = 'your-email';`
- Check browser console for errors
- Ensure you're logged in with admin account

### Admin Panel Not Loading
- Check backend server is running on port 5000
- Verify database connection
- Check browser console for API errors

## Quick Test

1. Create admin: `npm run create-admin`
2. Login at: `http://localhost:3000/login`
3. Navigate to: `http://localhost:3000/admin`
4. You should see the admin dashboard! 🎉


