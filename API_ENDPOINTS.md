# API Endpoints Reference

## Base URL
- **Development**: `http://localhost:5000/api`
- **Note**: Use `http://` not `https://` in development

## Quick Access

### API Information
- **GET** `/api` - List all available endpoints

### Health Check
- **GET** `/api/health` - Check if server is running

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "dateOfBirth": "2000-01-01"
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Get Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

### Change Password
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`

## Application Endpoints

### List Applications
- **GET** `/api/applications`
- **Query params:** `?page=1&limit=20&status=pending`

### Get Application
- **GET** `/api/applications/:id`

### Create Application
- **POST** `/api/applications`
- **Body:**
  ```json
  {
    "universityId": "uuid",
    "program": "M.Tech Computer Science",
    "intake": "Fall 2024"
  }
  ```

### Update Application
- **PUT** `/api/applications/:id`

### Submit Application
- **POST** `/api/applications/:id/submit`

## University Endpoints

### List Universities
- **GET** `/api/universities`
- **Query params:** `?page=1&limit=50&search=keyword`

### Get University
- **GET** `/api/universities/:id`

## Document Endpoints

### List Documents
- **GET** `/api/documents`

### Upload Document
- **POST** `/api/documents`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: File to upload
  - `applicationId`: (optional) UUID
  - `documentTypeId`: UUID

## Payment Endpoints

### List Payments
- **GET** `/api/payments`

### Create Payment
- **POST** `/api/payments`
- **Body:**
  ```json
  {
    "applicationId": "uuid",
    "amount": 1000.00,
    "paymentMethod": "credit_card"
  }
  ```

## Ticket Endpoints

### List Tickets
- **GET** `/api/tickets`

### Create Ticket
- **POST** `/api/tickets`
- **Body:**
  ```json
  {
    "subject": "Need help",
    "description": "I have a question",
    "category": "general",
    "priority": "medium"
  }
  ```

## FAQ Endpoints

### List FAQs
- **GET** `/api/faqs`
- **Query params:** `?category=general`

## Testing Endpoints

### Using Browser
1. Open browser
2. Go to: `http://localhost:5000/api`
3. You should see a JSON response with all available endpoints

### Using curl
```bash
# Get API info
curl http://localhost:5000/api

# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### Using Postman/Thunder Client
1. Create new request
2. Set method (GET, POST, etc.)
3. Enter URL: `http://localhost:5000/api/...`
4. Add headers if needed (Authorization for protected routes)
5. Add body for POST/PUT requests

## Common Issues

### "Route not found"
- Check the URL - it should be `http://localhost:5000/api/...` (not just `/api`)
- Use `http://` not `https://` in development
- Check the endpoint exists in the list above

### "Connection refused"
- Make sure backend server is running
- Check if server is on port 5000
- Verify: `npm run dev` in backend directory

### "Unauthorized"
- You need to login first to get a token
- Add header: `Authorization: Bearer <your-token>`

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (need authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

