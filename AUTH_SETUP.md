# Authentication Setup Guide

This project uses Auth.js with Google and Facebook authentication, integrated with Cloudflare D1 database.

## Prerequisites

1. Google OAuth App
2. Facebook OAuth App
3. Cloudflare Workers environment

## Database Setup

The authentication tables are already created via the migration:

```bash
npm run db:setup  # This includes auth tables from 002_auth_tables.sql
```

## Environment Variables Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - `http://localhost:8787/auth/callback/google` (for development)
   - `https://your-domain.com/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add "Facebook Login" product
4. Set valid OAuth redirect URIs:
   - `http://localhost:8787/auth/callback/facebook` (for development)
   - `https://your-domain.com/auth/callback/facebook` (for production)
5. Copy the App ID and App Secret

### 3. Cloudflare Workers Setup

#### Using Wrangler CLI (Recommended for secrets):

```bash
# Set secrets (these are encrypted and not visible in dashboard)
wrangler secret put AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put FACEBOOK_CLIENT_SECRET

# Set public variables
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put FACEBOOK_CLIENT_ID
```

#### Using Cloudflare Dashboard:

1. Go to your Cloudflare Workers dashboard
2. Select your worker
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `AUTH_SECRET`: A random 32+ character string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `FACEBOOK_CLIENT_ID`: Your Facebook App ID
   - `FACEBOOK_CLIENT_SECRET`: Your Facebook App Secret

### 4. Generate AUTH_SECRET

Generate a secure random string for AUTH_SECRET:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Development

For local development, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Then fill in your OAuth credentials in `.env.local`.

## Deployment

1. Ensure all environment variables are set in Cloudflare Workers
2. Deploy the worker:
   ```bash
   npm run deploy
   ```
3. Update OAuth redirect URIs to point to your production domain

## Testing Authentication

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Visit `http://localhost:8787`
3. Click "Sign In" in the navbar
4. Try signing in with Google or Facebook
5. After successful authentication, you should see your profile in the navbar

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure your OAuth apps have the correct redirect URIs configured
2. **"Invalid client"**: Check your Client ID and Client Secret are correct
3. **"Authentication error"**: Check your AUTH_SECRET is set and is at least 32 characters
4. **Database errors**: Make sure you've run the auth migration: `npm run db:setup`

### Debug Mode

Enable debug logging by adding this to your worker:

```typescript
// In functions/auth/config.ts
export function createAuthConfig(env: Env): AuthConfig {
  return {
    debug: true, // Add this line
    // ... rest of config
  }
}
```

## Integration with Petition Signing

The authentication is integrated with the petition signing flow:

1. **Anonymous users**: See a "Sign In to Sign" button in the petition modal
2. **Authenticated users**: Can immediately sign petitions using their authenticated identity
3. **User profiles**: Show in the navbar with sign-out functionality

## Database Schema

The Auth.js integration adds these tables to your D1 database:

- `accounts`: OAuth provider account information
- `sessions`: User sessions
- `verification_tokens`: Email verification tokens
- Updates to existing `users` table: Adds `name`, `image`, and `emailVerified` fields

## Security Considerations

1. Always use HTTPS in production
2. Keep your OAuth secrets secure (use Wrangler secrets, not environment variables)
3. Regularly rotate your AUTH_SECRET
4. Configure OAuth apps with specific redirect URIs (don't use wildcards)
5. Consider implementing rate limiting for authentication endpoints
