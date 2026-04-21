# 🔐 AgriTech Backend - Enhanced Features Documentation

## New Features Added

### 1. ✅ User Authentication (JWT-based)
### 2. ✅ Advanced Analytics
### 3. ✅ Role-Based Access Control
### 4. ✅ Rate Limiting
### 5. ✅ User Management (Admin)

---

## 🔐 Authentication System

### Features
- JWT token-based authentication
- Access tokens (1 hour expiry)
- Refresh tokens (30 days expiry)
- Password hashing (BCrypt)
- Role-based access (farmer, expert, admin)

### New Endpoints

#### POST `/api/auth/register`
Register a new user

**Request:**
```json
{
  "email": "farmer@example.com",
  "username": "farmer123",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phone": "+234-800-000-0000",
  "location": "Lagos, Nigeria",
  "farmSize": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "farmer@example.com",
    "username": "farmer123",
    "fullName": "John Doe",
    "role": "farmer",
    ...
  },
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### POST `/api/auth/login`
Login existing user

**Request:**
```json
{
  "email": "farmer@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register

#### POST `/api/auth/refresh`
Refresh access token

**Headers:** `Authorization: Bearer <refresh_token>`

**Response:**
```json
{
  "success": true,
  "accessToken": "new_access_token_here"
}
```

#### GET `/api/auth/me`
Get current user profile

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "farmer@example.com",
    "username": "farmer123",
    "fullName": "John Doe",
    "phone": "+234-800-000-0000",
    "location": "Lagos, Nigeria",
    "farmSize": 2.5,
    "role": "farmer",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2024-03-10T12:00:00",
    "lastLogin": "2024-03-13T08:30:00"
  }
}
```

#### PUT `/api/auth/change-password`
Change user password

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

#### PUT `/api/auth/update-profile`
Update user profile

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "fullName": "John Updated Doe",
  "phone": "+234-800-000-1111",
  "location": "Abuja, Nigeria",
  "farmSize": 3.5
}
```

---

## 📊 Advanced Analytics System

### Features
- Dashboard overview with key metrics
- Disease trends over time
- Disease distribution analysis
- Confidence score analysis
- Location-based heatmaps
- Treatment effectiveness tracking
- Exportable reports

### Analytics Endpoints

#### GET `/api/analytics/dashboard`
Get comprehensive dashboard metrics

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "totalPredictions": 150,
    "byCrop": {
      "cassava": 80,
      "tomato": 70
    },
    "recentWeek": 25,
    "diseaseStatus": {
      "diseased": 90,
      "healthy": 60
    },
    "topDiseases": [
      {
        "disease": "CMD",
        "crop": "cassava",
        "count": 35
      },
      ...
    ],
    "averageConfidence": 87.5
  }
}
```

#### GET `/api/analytics/trends?days=30&crop=cassava`
Get disease trends over time

**Query Params:**
- `days` - Number of days (default: 30)
- `crop` - Filter by crop (optional)

**Response:**
```json
{
  "success": true,
  "trends": {
    "period": {
      "start": "2024-02-13T00:00:00",
      "end": "2024-03-13T00:00:00",
      "days": 30
    },
    "dailyCounts": [
      {
        "date": "2024-03-01",
        "count": 5
      },
      ...
    ],
    "diseaseBreakdown": {
      "2024-03-01": {
        "CMD": 3,
        "Healthy": 2
      },
      ...
    }
  }
}
```

#### GET `/api/analytics/disease-distribution?crop=cassava`
Get disease distribution statistics

**Response:**
```json
{
  "success": true,
  "distribution": {
    "cassava": [
      {
        "disease": "CMD",
        "count": 35,
        "avgConfidence": 92.3,
        "percentage": 43.75
      },
      {
        "disease": "Healthy",
        "count": 25,
        "avgConfidence": 95.1,
        "percentage": 31.25
      },
      ...
    ],
    "tomato": [...]
  }
}
```

#### GET `/api/analytics/confidence-analysis`
Analyze prediction confidence scores

**Response:**
```json
{
  "success": true,
  "confidenceAnalysis": {
    "distribution": {
      "low": {
        "range": "0-50%",
        "count": 5
      },
      "medium": {
        "range": "50-70%",
        "count": 15
      },
      "high": {
        "range": "70-90%",
        "count": 80
      },
      "very_high": {
        "range": "90-100%",
        "count": 50
      }
    },
    "averageByCrop": {
      "cassava": 88.5,
      "tomato": 91.2
    }
  }
}
```

#### GET `/api/analytics/location-heatmap`
Get disease hotspots by GPS location

**Response:**
```json
{
  "success": true,
  "heatmap": {
    "totalPoints": 45,
    "locations": [
      {
        "latitude": 6.5244,
        "longitude": 3.3792,
        "disease": "CMD",
        "crop": "cassava",
        "locationName": "Farm Field A",
        "timestamp": "2024-03-13T10:30:00"
      },
      ...
    ]
  }
}
```

#### GET `/api/analytics/treatment-effectiveness`
Analyze treatment application rates

**Response:**
```json
{
  "success": true,
  "treatmentStats": {
    "overall": {
      "total": 150,
      "treated": 85,
      "treatmentRate": 56.67
    },
    "byDisease": [
      {
        "disease": "CMD",
        "total": 35,
        "treated": 28,
        "treatmentRate": 80.0
      },
      ...
    ]
  }
}
```

#### GET `/api/analytics/export-report`
Export comprehensive analytics report

**Response:** Complete JSON report with all analytics

---

## 👥 User Management (Admin Only)

### Features
- List all users
- View user details
- Activate/deactivate accounts
- Change user roles
- Delete users
- User statistics

### Admin Endpoints

#### GET `/api/users?page=1&per_page=20&role=farmer&active=true`
Get all users (paginated)

**Headers:** `Authorization: Bearer <admin_access_token>`

**Query Params:**
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 20)
- `role` - Filter by role (optional)
- `active` - Filter by active status (optional)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET `/api/users/:id`
Get specific user details

**Headers:** `Authorization: Bearer <admin_access_token>`

**Response:**
```json
{
  "success": true,
  "user": {...},
  "statistics": {
    "totalPredictions": 45
  }
}
```

#### PUT `/api/users/:id/activate`
Activate user account

#### PUT `/api/users/:id/deactivate`
Deactivate user account

#### PUT `/api/users/:id/role`
Update user role

**Request:**
```json
{
  "role": "expert"  // farmer, expert, admin
}
```

#### DELETE `/api/users/:id`
Delete user account (cannot delete admins or yourself)

#### GET `/api/users/stats`
Get user statistics

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total": 150,
    "active": 140,
    "inactive": 10,
    "byRole": {
      "farmers": 130,
      "experts": 15,
      "admins": 5
    },
    "newLast30Days": 25
  }
}
```

---

## 🛡️ Rate Limiting

### Default Limits
- General API: 200 requests per day, 50 per hour
- Registration: 5 per hour
- Login: 10 per hour

### Rate Limit Response
When limit exceeded:
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```
Status Code: 429 (Too Many Requests)

---

## 🔑 User Roles

### Farmer (Default)
- Create predictions
- View own history
- Access own analytics
- Update own profile

### Expert
- All Farmer permissions
- (Future: Provide consultation)
- (Future: Access extended analytics)

### Admin
- All permissions
- User management
- View all users
- Change user roles
- Deactivate users
- Delete users

---

## 🔒 Enhanced Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120),
    phone VARCHAR(20),
    location VARCHAR(100),
    farm_size FLOAT,
    role VARCHAR(20) DEFAULT 'farmer',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    last_login DATETIME
);
```

### Enhanced Prediction History Table
```sql
CREATE TABLE prediction_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    crop VARCHAR(50) NOT NULL,
    disease VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    image_filename VARCHAR(255),
    timestamp DATETIME,
    all_predictions TEXT,
    treatment_applied BOOLEAN DEFAULT FALSE,
    notes TEXT,
    latitude FLOAT,
    longitude FLOAT,
    location_name VARCHAR(100),
    field_name VARCHAR(100),
    field_size FLOAT
);
```

---

## 📖 Usage Examples

### Complete Authentication Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'farmer@example.com',
    username: 'farmer123',
    password: 'securePassword123',
    fullName: 'John Doe',
    location: 'Lagos, Nigeria'
  })
});
const { accessToken, refreshToken } = await registerResponse.json();

// 2. Make authenticated request
const dashboardResponse = await fetch('http://localhost:5000/api/analytics/dashboard', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Refresh token when expired
const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${refreshToken}`
  }
});
const { accessToken: newToken } = await refreshResponse.json();
```

### Prediction with User Context

```javascript
// Make prediction as authenticated user
const formData = new FormData();
formData.append('image', imageFile);
formData.append('crop', 'cassava');

const response = await fetch('http://localhost:5000/api/predict', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

// Prediction is automatically linked to user account
```

### Admin Actions

```javascript
// Get all users (admin only)
const usersResponse = await fetch('http://localhost:5000/api/users?page=1&role=farmer', {
  headers: {
    'Authorization': `Bearer ${adminAccessToken}`
  }
});

// Deactivate user
await fetch('http://localhost:5000/api/users/5/deactivate', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminAccessToken}`
  }
});
```

---

## 🚀 Migration from Old System

### For Existing Users

1. **Predictions without user_id** are still supported (nullable field)
2. **Anonymous predictions** can be made without authentication
3. **Authenticated predictions** are linked to user accounts
4. **Existing data** remains accessible

### Gradual Adoption

The system supports both:
- **Unauthenticated mode** - Works like before
- **Authenticated mode** - New enhanced features

---

## 🔧 Configuration

### Environment Variables (Updated)

```env
# Existing
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///agritech.db
PORT=5000

# New - JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
```

---

## ✨ Summary of Enhancements

### What's New:
1. ✅ **8 Authentication endpoints** - Complete user management
2. ✅ **8 Analytics endpoints** - Advanced insights
3. ✅ **7 User management endpoints** - Admin controls
4. ✅ **Rate limiting** - API protection
5. ✅ **JWT tokens** - Secure authentication
6. ✅ **Role-based access** - farmer, expert, admin
7. ✅ **Enhanced database** - User profiles, location data
8. ✅ **Backwards compatible** - Existing functionality preserved

### Total Endpoints: 35+
- **Authentication:** 6
- **Predictions:** 2
- **Treatments:** 3
- **History:** 7
- **Analytics:** 8
- **User Management:** 7
- **Health:** 2

---

**Backend is now production-ready with enterprise features! 🎉**
