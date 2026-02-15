# Google Authentication

This document describes how Google OAuth authentication works in this application.

## Overview

The application supports Google Sign-In where the frontend handles the OAuth flow and sends the ID token to the backend for verification. The backend verifies the token, creates or links user accounts, and returns JWT tokens for session management.

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant Backend
    participant MongoDB

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Google: Initiate OAuth flow
    Google->>User: Show consent screen
    User->>Google: Grant permission
    Google->>Frontend: Return ID token
    Frontend->>Backend: POST /v1/auth/google { idToken }

    Backend->>Google: Verify ID token
    Google->>Backend: Return user payload (email, name, picture, sub)

    alt User exists by Google ID
        Backend->>MongoDB: Find user by googleId
        MongoDB->>Backend: Return existing user
        Backend->>Backend: Update profile picture
    else User exists by email (account linking)
        Backend->>MongoDB: Find user by email
        MongoDB->>Backend: Return existing user
        Backend->>Backend: Link Google ID to account
        Backend->>Backend: Update profile picture
    else New user (auto-registration)
        Backend->>Backend: Fetch profile picture as binary
        Backend->>MongoDB: Create new user
        MongoDB->>Backend: Return new user
    end

    Backend->>Backend: Generate JWT tokens
    Backend->>Frontend: Return { user, tokens }
    Frontend->>User: Authentication successful
```

## Authentication Flow Steps

### 1. Frontend Initiates Google Sign-In

The frontend application uses Google Sign-In SDK to authenticate the user:

```javascript
// Frontend example (React with @react-oauth/google)
const handleGoogleLogin = async (credentialResponse) => {
  const response = await fetch('/v1/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: credentialResponse.credential })
  });
  const data = await response.json();
  // Store tokens and user data
};
```

### 2. Backend Token Verification

The backend receives the ID token and verifies it with Google:

```
POST /v1/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. User Resolution

The backend follows this logic to find or create the user:

```
+------------------+
|  Verify Token    |
+--------+---------+
         |
         v
+------------------+
| Find by Google ID|
+--------+---------+
         |
    Found?
    /    \
  Yes     No
   |       |
   v       v
+------+ +------------------+
|Update| | Find by Email    |
|Photo | +--------+---------+
+------+          |
                Found?
                /    \
              Yes     No
               |       |
               v       v
         +--------+ +--------+
         |  Link  | | Create |
         | Google | |  New   |
         |   ID   | |  User  |
         +--------+ +--------+
```

### 4. Profile Picture Storage

When a user authenticates with Google, their profile picture is:
1. Fetched from Google's URL
2. Converted to binary (Buffer)
3. Stored directly in MongoDB

### 5. Token Generation

After successful authentication, the backend generates:
- **Access Token**: Short-lived JWT for API authentication
- **Refresh Token**: Long-lived token for obtaining new access tokens

## API Reference

### Endpoint

```
POST /v1/auth/google
```

### Request Body

| Field   | Type   | Required | Description                          |
|---------|--------|----------|--------------------------------------|
| idToken | string | Yes      | Google ID token from frontend OAuth  |

### Success Response (200 OK)

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "admin",
    "isEmailVerified": true
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2024-01-15T10:30:00.000Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2024-02-14T10:00:00.000Z"
    }
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "code": 401,
  "message": "Invalid Google token"
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add authorized JavaScript origins (e.g., `http://localhost:3000`)
7. Copy the **Client ID**

## User Model Fields

The following fields are added to support Google authentication:

| Field    | Type   | Description                              |
|----------|--------|------------------------------------------|
| googleId | String | Unique Google user ID (sub claim)        |
| picture  | Buffer | Profile picture stored as binary data    |

## Security Considerations

1. **Token Verification**: All Google tokens are verified using Google's official library
2. **Email Verification**: Users authenticated via Google are marked as email-verified
3. **Account Linking**: Existing accounts are linked by email match, preventing duplicate accounts
4. **Password Optional**: Users created via Google don't require a password
