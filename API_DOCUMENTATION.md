# Kanoon Sathi Backend API Documentation

## Overview

The Kanoon Sathi backend provides both REST API endpoints for user management and chat functionality, as well as GenKit Flow endpoints for AI-powered legal assistance.

## Base URLs

- **REST API**: `http://localhost:3001`
- **GenKit Flow API**: `http://localhost:7777`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## REST API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 characters, required)",
  "password": "string (min 6 characters, required)",
  "email": "string (optional, valid email format)"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string|null",
      "created_at": "datetime",
      "last_login": "datetime|null",
      "is_active": true
    },
    "token": "jwt-token"
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `409`: Username or email already exists
- `500`: Internal server error

---

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string|null",
      "created_at": "datetime",
      "last_login": "datetime",
      "is_active": true
    },
    "token": "jwt-token"
  }
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Internal server error

---

#### GET /api/auth/me
Get current user profile. **Requires authentication.**

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string|null",
    "created_at": "datetime",
    "last_login": "datetime",
    "is_active": true
  }
}
```

---

#### PUT /api/auth/profile
Update user profile. **Requires authentication.**

**Request Body:**
```json
{
  "username": "string (3-50 characters, optional)",
  "email": "string (valid email format, optional)"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string|null",
    "created_at": "datetime",
    "last_login": "datetime",
    "is_active": true
  }
}
```

---

#### DELETE /api/auth/account
Delete user account (soft delete). **Requires authentication.**

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

### Chat Endpoints

#### GET /api/chats
Get all chats for the authenticated user. **Requires authentication.**

**Query Parameters:**
- `limit` (number, optional): Maximum number of chats to return (default: 50)
- `offset` (number, optional): Number of chats to skip (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "string|null",
      "created_at": "datetime",
      "updated_at": "datetime",
      "messageCount": 5,
      "lastMessage": {
        "id": "uuid",
        "chat_id": "uuid",
        "sender": "user|model|system",
        "content": "string",
        "created_at": "datetime"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 10
  }
}
```

---

#### POST /api/chats
Create a new chat. **Requires authentication.**

**Request Body:**
```json
{
  "title": "string (optional, max 255 characters)"
}
```

**Response (201):**
```json
{
  "message": "Chat created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

#### GET /api/chats/:chatId
Get a specific chat with all messages. **Requires authentication.**

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime",
    "messages": [
      {
        "id": "uuid",
        "chat_id": "uuid",
        "sender": "user|model|system",
        "content": "string",
        "created_at": "datetime"
      }
    ]
  }
}
```

---

#### PUT /api/chats/:chatId
Update chat title. **Requires authentication.**

**Request Body:**
```json
{
  "title": "string (required, max 255 characters)"
}
```

**Response (200):**
```json
{
  "message": "Chat title updated successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

#### DELETE /api/chats/:chatId
Delete a chat and all its messages. **Requires authentication.**

**Response (200):**
```json
{
  "message": "Chat deleted successfully"
}
```

---

#### GET /api/chats/:chatId/messages
Get messages for a specific chat with pagination. **Requires authentication.**

**Query Parameters:**
- `limit` (number, optional): Maximum number of messages to return (default: 50)
- `offset` (number, optional): Number of messages to skip (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender": "user|model|system",
      "content": "string",
      "created_at": "datetime"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 25
  }
}
```

---

#### POST /api/chats/:chatId/messages
Add a new message to a chat. **Requires authentication.**

**Request Body:**
```json
{
  "content": "string (required, max 10000 characters)",
  "sender": "user|model|system (default: user)"
}
```

**Response (201):**
```json
{
  "message": "Message added successfully",
  "data": {
    "id": "uuid",
    "chat_id": "uuid",
    "sender": "user",
    "content": "string",
    "created_at": "datetime"
  }
}
```

## GenKit Flow Endpoints

### POST /autonomousAIFlow
Send a legal query to the AI assistant.

**Request Body:**
```json
{
  "data": {
    "text": "string (required) - The legal question",
    "chatroomId": "string (required) - Unique chat session ID",
    "userId": "string (optional) - User ID for authenticated users"
  }
}
```

**Response (200):**
```json
{
  "result": "string - AI response with legal information and citations"
}
```

### GET /getChatHistory
Get chat history for a specific chatroom.

**Request Body:**
```json
{
  "data": {
    "chatroomId": "string (required)"
  }
}
```

**Response (200):**
```json
{
  "result": [
    {
      "role": "user|model|system",
      "content": "string"
    }
  ]
}
```

### GET /getConversationList
Get list of all conversation chatroomIds (for non-authenticated users).

**Response (200):**
```json
{
  "result": [
    {
      "chatroomId": "string",
      "lastMessage": {
        "role": "user|model|system",
        "content": "string"
      }
    }
  ]
}
```

## Health Check

#### GET /health
Check server status.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-08-29T12:00:00.000Z"
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

## Example Usage

### Frontend Integration

```javascript
// Register user
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'secure123',
    email: 'john@example.com'
  })
});

const { data } = await response.json();
const token = data.token;

// Use token for authenticated requests
const chatsResponse = await fetch('/api/chats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Send AI query
const aiResponse = await fetch('http://localhost:7777/autonomousAIFlow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      text: "What are the fundamental rights in Nepal's constitution?",
      chatroomId: "unique-chat-id",
      userId: data.user.id // Optional for authenticated users
    }
  })
});
```

## Environment Variables

Required environment variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=kanoon_sathi

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# JWT Configuration (optional, has default)
JWT_SECRET=your-super-secret-jwt-key

# CORS Configuration (optional)
FRONTEND_URL=http://localhost:3000

# Server Configuration (optional)
PORT=3001
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: User accounts and authentication
- `chats`: Chat/conversation records
- `messages`: Individual messages within chats
- `documents`: Constitution and legal document storage with embeddings
- `criminal_code`: Criminal code document pages
- `civil_code`: Civil code document pages
- `criminal_procedure`: Criminal procedure document pages
- `clauses`: Constitutional clauses and articles

All tables use UUIDs for primary keys and include proper indexing for performance.
