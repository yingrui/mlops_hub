# Authentication Setup

This document describes the authentication implementation for the MLOps Hub application.

## Overview

The application implements authentication using Keycloak as the identity provider. Anonymous users can access the home page, but all other pages require authentication through Keycloak.

## Architecture

- **Frontend**: React application with Keycloak JavaScript adapter
- **Backend**: Spring Boot application with Spring Security and OAuth2 JWT
- **Identity Provider**: Keycloak server

## Frontend Authentication

### Components

1. **AuthContext** (`frontend/src/contexts/AuthContext.tsx`)
   - Provides authentication state and methods
   - Manages Keycloak initialization and token handling
   - Exposes user information and authentication status

2. **ProtectedRoute** (`frontend/src/components/Auth/ProtectedRoute.tsx`)
   - Guards routes that require authentication
   - Shows loading state during authentication check
   - Redirects to login if user is not authenticated

3. **Layout** (`frontend/src/components/Layout/Layout.tsx`)
   - Updated to show user information and login/logout functionality
   - Displays user avatar and profile menu for authenticated users
   - Shows "Sign In" button for anonymous users

### Configuration

The frontend configuration is managed in `frontend/src/config/index.ts`:

```typescript
export const config = {
  keycloak: {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8081',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'mlops-hub',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'mlops-frontend',
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  },
};
```

### Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
REACT_APP_KEYCLOAK_URL=http://localhost:8081
REACT_APP_KEYCLOAK_REALM=mlops-hub
REACT_APP_KEYCLOAK_CLIENT_ID=mlops-frontend
REACT_APP_API_BASE_URL=http://localhost:8080
```

## Backend Authentication

### Configuration

The backend is configured with Spring Security and OAuth2 JWT:

- **SecurityConfig**: Configures JWT token validation and CORS
- **KeycloakConfig**: Provides Keycloak connection details
- **SecurityFilterChain**: Defines which endpoints require authentication

### Protected Endpoints

All API endpoints under `/api/**` require authentication, except:
- `/api/health/**` - Health check endpoints
- `/actuator/**` - Spring Boot actuator endpoints
- `/login/**` - OAuth2 login endpoints
- `/oauth2/**` - OAuth2 callback endpoints
- `/error` - Error handling endpoints

## Keycloak Configuration

### Realm Settings

- **Realm**: `mlops-hub`
- **Display Name**: MLOps Hub
- **SSL Required**: External
- **Registration Allowed**: Yes
- **Login with Email Allowed**: Yes

### Clients

1. **mlops-backend** (Backend Service)
   - Client Type: Confidential
   - Authentication: Client Secret
   - Redirect URIs: `http://localhost:8080/login/oauth2/code/keycloak`
   - Web Origins: `http://localhost:3000`, `http://localhost:8080`

2. **mlops-frontend** (Frontend Application)
   - Client Type: Public
   - Authentication: None (Public Client)
   - Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`

### Roles

- **admin**: Administrator role with full access
- **user**: Regular user role
- **ml-engineer**: Machine Learning Engineer role
- **data-scientist**: Data Scientist role

## Usage

### For Anonymous Users

1. Visit the home page (`/`) - accessible without authentication
2. Click "Sign In" button to authenticate
3. Redirected to Keycloak login page
4. After successful login, redirected back to the application

### For Authenticated Users

1. Access any page in the application
2. User information displayed in the top navigation
3. Profile menu available with user details and logout option
4. All protected routes accessible

### Development Setup

1. Start Keycloak server on port 8081
2. Import the realm configuration from `backend/keycloak-realm.json`
3. Start the backend server on port 8080
4. Start the frontend development server on port 3000
5. Create test users in Keycloak admin console

## Security Features

- JWT token-based authentication
- Automatic token refresh
- CORS configuration for cross-origin requests
- Role-based access control
- Secure logout with Keycloak session termination
- PKCE (Proof Key for Code Exchange) for enhanced security

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Keycloak client has correct web origins configured
2. **Token Expiration**: Tokens are automatically refreshed, but check Keycloak session timeout settings
3. **Redirect Issues**: Verify redirect URIs match exactly in Keycloak client configuration
4. **Environment Variables**: Ensure all required environment variables are set correctly

### Debug Mode

Enable debug logging in the backend by setting:

```yaml
logging:
  level:
    org.springframework.security: DEBUG
```

This will provide detailed information about authentication and authorization decisions.
