# Registration Error Fix

## Changes Made

1. **Improved Error Handling in Auth Controller**
   - Better validation error formatting
   - Specific handling for database errors
   - More detailed error messages

2. **Enhanced Error Handler Middleware**
   - Added handling for `SequelizeDatabaseError`
   - Added handling for connection errors
   - Better error messages for development

3. **Improved Database Sync**
   - Better logging during model synchronization
   - Ensures tables are created properly

## Common Registration Errors & Solutions

### Error: "Database error" or "Unable to connect to database"

**Cause:** PostgreSQL is not running or database doesn't exist

**Solution:**
1. Check if PostgreSQL service is running:
   ```powershell
   Get-Service -Name postgresql*
   ```

2. Start PostgreSQL if not running:
   ```powershell
   net start postgresql-x64-15
   ```
   (Replace 15 with your PostgreSQL version)

3. Verify database exists:
   ```powershell
   psql -U postgres -l
   ```

4. Create database if it doesn't exist:
   ```powershell
   createdb -U postgres uniapply_db
   ```

### Error: "Validation error"

**Cause:** Invalid input data

**Solution:**
- Check that all required fields are provided:
  - `email` (must be valid email)
  - `password` (minimum 6 characters)
  - `firstName` (required)
  - `lastName` (required)

### Error: "Email already registered"

**Cause:** User with that email already exists

**Solution:**
- Use a different email address
- Or login with existing account

### Error: "Table 'users' doesn't exist"

**Cause:** Database tables weren't created

**Solution:**
1. Restart the backend server - it will auto-create tables in development mode
2. Check server logs for "Database models synchronized" message
3. If still failing, manually sync:
   ```javascript
   // In backend directory, create a script:
   const { sequelize } = require('./config/database');
   sequelize.sync({ force: false }).then(() => {
     console.log('Tables created');
     process.exit(0);
   });
   ```

## Testing Registration

Use this curl command to test:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Or use Postman/Thunder Client with:
- URL: `http://localhost:5000/api/auth/register`
- Method: POST
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01"
}
```

## Next Steps

1. **Check backend terminal** for detailed error messages
2. **Verify database connection** - server should show "✅ Database connection established"
3. **Check tables exist** - server should show "✅ Database models synchronized"
4. **Try registration again** - errors should now be more descriptive

## Still Having Issues?

1. Check the backend terminal for the exact error message
2. Verify PostgreSQL is running: `Get-Service postgresql*`
3. Check `.env` file has correct database credentials
4. Ensure database `uniapply_db` exists
5. Restart the backend server

