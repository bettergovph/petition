# Cloudflare Wrangler & D1 Setup Guide

This guide will help you set up Cloudflare Wrangler and D1 database for the petition application.

## Prerequisites

- Node.js installed
- A Cloudflare account
- Wrangler CLI installed globally (`npm install -g wrangler`)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npm run db:create
```

This will output a database ID. If the database already exists, you can list existing databases:

```bash
npx wrangler d1 list
```

Copy the database ID and update the `wrangler.toml` file:

```toml
[[d1_databases]]
binding = "DB"
database_name = "petition-db"
database_id = "4fd4c724-020d-4eed-b3e7-959c8f38a786"  # Replace with your actual ID
```

### 4. Create Tables

```bash
npm run db:migrate
```

### 5. Seed Database with Initial Data

```bash
npm run db:seed
```

### 6. Start Development

Start the development server with integrated Cloudflare Pages functions:

```bash
npm run dev
```

This will start both the React frontend and the API functions on `http://localhost:5173`. The Vite Cloudflare plugin automatically handles API routing.

## Database Schema

### Users Table

- `id` (INTEGER PRIMARY KEY)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `email` (TEXT UNIQUE)
- `anonymous` (BOOLEAN)
- `created_at`, `updated_at` (DATETIME)

### Petitions Table

- `id` (INTEGER PRIMARY KEY)
- `title` (TEXT)
- `description` (TEXT)
- `type` ('local' | 'national')
- `image_url` (TEXT)
- `target_count`, `current_count` (INTEGER)
- `status` ('active' | 'completed' | 'closed')
- `location` (TEXT, for local petitions)
- `created_by` (INTEGER, foreign key to users.id)
- `created_at`, `updated_at` (DATETIME)

### Signatures Table

- `id` (INTEGER PRIMARY KEY)
- `petition_id` (INTEGER, foreign key)
- `user_id` (INTEGER, foreign key)
- `comment` (TEXT)
- `anonymous` (BOOLEAN)
- `ip_address` (TEXT)
- `created_at` (DATETIME)

### Categories Table

- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE)
- `description` (TEXT)
- `created_at` (DATETIME)

### Petition Categories (Junction Table)

- `petition_id` (INTEGER, foreign key)
- `category_id` (INTEGER, foreign key)

## API Endpoints

- `GET /api/users/:id` - Get user by ID
- `POST /api/petitions` - Create petition
- `GET /api/petitions` - Get all petitions (supports ?type=local|national)
- `GET /api/petitions/:id` - Get petition by ID
- `GET /api/petitions/:id/signatures` - Get petition signatures
- `POST /api/signatures` - Create signature
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

## Deployment

### Deploy to Cloudflare Pages

Build the project:

```bash
npm run build
```

Deploy using Wrangler:

```bash
npx wrangler pages deploy dist
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

## Database Operations

### Query Database Directly

```bash
npx wrangler d1 execute petition-db --command="SELECT * FROM users;"
```

### Run Custom SQL File

```bash
npx wrangler d1 execute petition-db --file=./path/to/your/file.sql
```

## Troubleshooting

1. **Database not found**: Make sure you've created the database and updated the `database_id` in `wrangler.toml`

2. **Permission errors**: Make sure you're logged in with `npx wrangler login`

3. **API calls failing**: Check that the worker is running and the API_BASE_URL is correct

4. **CORS issues**: The worker includes CORS headers, but you may need to adjust them for your domain

## Features Implemented

- ✅ User registration and management
- ✅ Petition creation with local/national types
- ✅ Petition categorization system
- ✅ Signature collection with comments
- ✅ Database triggers for automatic signature counting
- ✅ Comprehensive form validation
- ✅ Loading states and error handling
- ✅ Responsive petition form UI

## Next Steps

- Implement user authentication
- Add petition detail pages
- Create signature collection UI
- Add petition search and filtering
- Implement petition image uploads
- Add email notifications
- Create admin dashboard
