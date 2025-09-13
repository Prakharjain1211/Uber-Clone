# Uber Clone Backend API Documentation

## User Registration Endpoint

### POST `/users/register`

Creates a new user account in the system.

#### Description
This endpoint allows new users to register by providing their personal information and credentials. The system validates the input data, checks for existing users, hashes the password, and returns an authentication token upon successful registration.

#### Request Body

The request body must be sent as JSON with the following structure:

```json
{
  "fullname": {
    "firstname": "string",
    "lastname": "string"
  },
  "email": "string",
  "password": "string"
}
```

#### Field Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `fullname.firstname` | String | Yes | Minimum 3 characters |
| `fullname.lastname` | String | No | Minimum 3 characters (if provided) |
| `email` | String | Yes | Valid email format, must be unique |
| `password` | String | Yes | Minimum 6 characters |

#### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Response

##### Success Response (201 Created)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

##### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - User Already Exists**
```json
{
  "message": "User already exist"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 201 | User successfully created |
| 400 | Bad request (validation errors or user already exists) |
| 500 | Internal server error |

#### Authentication

- **Required**: No (this is a registration endpoint)
- **Token**: Returns JWT token upon successful registration
- **Token Expiry**: 24 hours

#### Notes

- The password is automatically hashed using bcrypt before storage
- The password field is excluded from user queries by default (`select: false`)
- Email addresses must be unique across the system
- The returned JWT token should be stored securely on the client side
- The `socketId` field is used for real-time communication features

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

#### Example JavaScript Fetch Request

```javascript
const response = await fetch('http://localhost:3000/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullname: {
      firstname: 'John',
      lastname: 'Doe'
    },
    email: 'john.doe@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
console.log(data);
```

## User Login Endpoint

### POST `/users/login`

Authenticates an existing user and returns a JWT token along with the user details.

#### Description
This endpoint validates user credentials. On success, it generates a JWT token, sets it as a cookie named `token`, and returns the token and user payload in the response body.

#### Request Body

The request body must be sent as JSON with the following structure:

```json
{
  "email": "string",
  "password": "string"
}
```

#### Field Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `email` | String | Yes | Valid email format |
| `password` | String | Yes | Minimum 6 characters |

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Response

##### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

On success, a cookie named `token` is also set on the response.

##### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "message": "Invalid email or password"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Login successful |
| 400 | Bad request (validation errors) |
| 401 | Unauthorized (invalid email or password) |
| 500 | Internal server error |

#### Authentication

- **Required**: No (this is a login endpoint)
- **Token**: Returns JWT token on success and sets a `token` cookie
- **Token Expiry**: 24 hours

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

#### Example JavaScript Fetch Request

```javascript
const response = await fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // receive set-cookie
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
console.log(data);
```

## User Profile Endpoint

### GET `/users/profile`

Retrieves the authenticated user's profile information.

#### Description
This endpoint returns the current authenticated user's profile details. It requires a valid JWT token either in the Authorization header or as a cookie.

#### Authentication
- **Required**: Yes
- **Token Location**: Cookie (`token`) or Authorization header (`Bearer <token>`)
- **Token Validation**: JWT verification and blacklist check

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | No* | Bearer token (if not using cookie) |
| `Cookie` | String | No* | `token=<jwt_token>` (if not using header) |

*Either Authorization header or Cookie must be provided

#### Example Request Headers

**Using Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Using Cookie:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

##### Success Response (200 OK)

```json
{
  "_id": "64a1b2c3d4e5f6789abcdef0",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "socketId": null
}
```

##### Error Responses

**401 Unauthorized - No Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Invalid/Expired Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Blacklisted Token**
```json
{
  "message": "Unauthorized"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Profile retrieved successfully |
| 401 | Unauthorized (missing, invalid, or blacklisted token) |
| 500 | Internal server error |

#### Example cURL Request

```bash
# Using Authorization header
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookie
curl -X GET http://localhost:3000/users/profile \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example JavaScript Fetch Request

```javascript
// Using Authorization header
const response = await fetch('http://localhost:3000/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

// Using cookie (if token was set during login)
const response = await fetch('http://localhost:3000/users/profile', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
console.log(data);
```

## User Logout Endpoint

### GET `/users/logout`

Logs out the authenticated user by invalidating their token.

#### Description
This endpoint logs out the current user by clearing the authentication cookie and adding the token to a blacklist to prevent further use. The token becomes invalid immediately after logout.

#### Authentication
- **Required**: Yes
- **Token Location**: Cookie (`token`) or Authorization header (`Bearer <token>`)
- **Token Validation**: JWT verification and blacklist check

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | No* | Bearer token (if not using cookie) |
| `Cookie` | String | No* | `token=<jwt_token>` (if not using header) |

*Either Authorization header or Cookie must be provided

#### Response

##### Success Response (200 OK)

```json
{
  "message": "Logged out"
}
```

##### Error Responses

**401 Unauthorized - No Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Invalid/Expired Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Blacklisted Token**
```json
{
  "message": "Unauthorized"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Logout successful |
| 401 | Unauthorized (missing, invalid, or blacklisted token) |
| 500 | Internal server error |

#### Notes

- The token is immediately added to a blacklist and cannot be used again
- The `token` cookie is cleared from the client
- After logout, the user must log in again to access protected endpoints

#### Example cURL Request

```bash
# Using Authorization header
curl -X GET http://localhost:3000/users/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookie
curl -X GET http://localhost:3000/users/logout \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example JavaScript Fetch Request

```javascript
// Using Authorization header
const response = await fetch('http://localhost:3000/users/logout', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

// Using cookie (if token was set during login)
const response = await fetch('http://localhost:3000/users/logout', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
console.log(data);
```

---

# Captain Endpoints

## Captain Registration Endpoint

### POST `/captains/register`

Creates a new captain account in the system.

#### Description
This endpoint allows new captains to register by providing their personal information, credentials, and vehicle details. The system validates the input data, checks for existing captains, hashes the password, and returns an authentication token upon successful registration.

#### Request Body

The request body must be sent as JSON with the following structure:

```json
{
  "fullname": {
    "firstname": "string",
    "lastname": "string"
  },
  "email": "string",
  "password": "string",
  "vehicle": {
    "color": "string",
    "plate": "string",
    "capacity": "number",
    "vehicleType": "string"
  }
}
```

#### Field Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `fullname.firstname` | String | Yes | Minimum 3 characters |
| `fullname.lastname` | String | No | Minimum 3 characters (if provided) |
| `email` | String | Yes | Valid email format, must be unique |
| `password` | String | Yes | Minimum 6 characters |
| `vehicle.color` | String | Yes | Minimum 3 characters |
| `vehicle.plate` | String | Yes | Minimum 3 characters |
| `vehicle.capacity` | Number | Yes | Minimum 1 |
| `vehicle.vehicleType` | String | Yes | Must be one of: 'car', 'motorcycle', 'auto' |

#### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "vehicle": {
    "color": "Blue",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

#### Response

##### Success Response (201 Created)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "captain": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "location": {
      "ltd": null,
      "lng": null
    }
  }
}
```

##### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Color must be at least 3 characters long",
      "path": "vehicle.color",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Plate must be at least 3 characters long",
      "path": "vehicle.plate",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Capacity must be at least 1",
      "path": "vehicle.capacity",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Invalid vehicle type",
      "path": "vehicle.vehicleType",
      "location": "body"
    }
  ]
}
```

**400 Bad Request - Captain Already Exists**
```json
{
  "message": "Captain already exist"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 201 | Captain successfully created |
| 400 | Bad request (validation errors or captain already exists) |
| 500 | Internal server error |

#### Authentication

- **Required**: No (this is a registration endpoint)
- **Token**: Returns JWT token upon successful registration
- **Token Expiry**: 24 hours

#### Notes

- The password is automatically hashed using bcrypt before storage
- The password field is excluded from captain queries by default (`select: false`)
- Email addresses must be unique across the system
- Captains start with "inactive" status by default
- Vehicle type must be one of: 'car', 'motorcycle', 'auto'

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

#### Example JavaScript Fetch Request

```javascript
const response = await fetch('http://localhost:3000/captains/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullname: {
      firstname: 'John',
      lastname: 'Doe'
    },
    email: 'john.doe@example.com',
    password: 'securepassword123',
    vehicle: {
      color: 'Blue',
      plate: 'ABC123',
      capacity: 4,
      vehicleType: 'car'
    }
  })
});

const data = await response.json();
console.log(data);
```

## Captain Login Endpoint

### POST `/captains/login`

Authenticates an existing captain and returns a JWT token along with the captain details.

#### Description
This endpoint validates captain credentials. On success, it generates a JWT token, sets it as a cookie named `token`, and returns the token and captain payload in the response body.

#### Request Body

The request body must be sent as JSON with the following structure:

```json
{
  "email": "string",
  "password": "string"
}
```

#### Field Requirements

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `email` | String | Yes | Valid email format |
| `password` | String | Yes | Minimum 6 characters |

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Response

##### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "captain": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "location": {
      "ltd": null,
      "lng": null
    }
  }
}
```

On success, a cookie named `token` is also set on the response.

##### Error Responses

**400 Bad Request - Validation Errors**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Invalid Credentials**
```json
{
  "message": "Invalid email or password"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Login successful |
| 400 | Bad request (validation errors) |
| 401 | Unauthorized (invalid email or password) |
| 500 | Internal server error |

#### Authentication

- **Required**: No (this is a login endpoint)
- **Token**: Returns JWT token on success and sets a `token` cookie
- **Token Expiry**: 24 hours

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/captains/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

#### Example JavaScript Fetch Request

```javascript
const response = await fetch('http://localhost:3000/captains/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // receive set-cookie
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
console.log(data);
```

## Captain Profile Endpoint

### GET `/captains/profile`

Retrieves the authenticated captain's profile information.

#### Description
This endpoint returns the current authenticated captain's profile details. It requires a valid JWT token either in the Authorization header or as a cookie.

#### Authentication
- **Required**: Yes
- **Token Location**: Cookie (`token`) or Authorization header (`Bearer <token>`)
- **Token Validation**: JWT verification and blacklist check

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | No* | Bearer token (if not using cookie) |
| `Cookie` | String | No* | `token=<jwt_token>` (if not using header) |

*Either Authorization header or Cookie must be provided

#### Example Request Headers

**Using Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Using Cookie:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

##### Success Response (200 OK)

```json
{
  "captain": {
    "_id": "64a1b2c3d4e5f6789abcdef0",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "location": {
      "ltd": null,
      "lng": null
    }
  }
}
```

##### Error Responses

**401 Unauthorized - No Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Invalid/Expired Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Blacklisted Token**
```json
{
  "message": "Unauthorized"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Profile retrieved successfully |
| 401 | Unauthorized (missing, invalid, or blacklisted token) |
| 500 | Internal server error |

#### Example cURL Request

```bash
# Using Authorization header
curl -X GET http://localhost:3000/captains/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookie
curl -X GET http://localhost:3000/captains/profile \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example JavaScript Fetch Request

```javascript
// Using Authorization header
const response = await fetch('http://localhost:3000/captains/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

// Using cookie (if token was set during login)
const response = await fetch('http://localhost:3000/captains/profile', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
console.log(data);
```

## Captain Logout Endpoint

### GET `/captains/logout`

Logs out the authenticated captain by invalidating their token.

#### Description
This endpoint logs out the current captain by clearing the authentication cookie and adding the token to a blacklist to prevent further use. The token becomes invalid immediately after logout.

#### Authentication
- **Required**: Yes
- **Token Location**: Cookie (`token`) or Authorization header (`Bearer <token>`)
- **Token Validation**: JWT verification and blacklist check

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | String | No* | Bearer token (if not using cookie) |
| `Cookie` | String | No* | `token=<jwt_token>` (if not using header) |

*Either Authorization header or Cookie must be provided

#### Response

##### Success Response (200 OK)

```json
{
  "message": "Logout successfully"
}
```

##### Error Responses

**401 Unauthorized - No Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Invalid/Expired Token**
```json
{
  "message": "Unauthorized"
}
```

**401 Unauthorized - Blacklisted Token**
```json
{
  "message": "Unauthorized"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Logout successful |
| 401 | Unauthorized (missing, invalid, or blacklisted token) |
| 500 | Internal server error |

#### Notes

- The token is immediately added to a blacklist and cannot be used again
- The `token` cookie is cleared from the client
- After logout, the captain must log in again to access protected endpoints

#### Example cURL Request

```bash
# Using Authorization header
curl -X GET http://localhost:3000/captains/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookie
curl -X GET http://localhost:3000/captains/logout \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example JavaScript Fetch Request

```javascript
// Using Authorization header
const response = await fetch('http://localhost:3000/captains/logout', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

// Using cookie (if token was set during login)
const response = await fetch('http://localhost:3000/captains/logout', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
console.log(data);
```
