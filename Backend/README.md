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
