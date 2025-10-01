# Architecture Documentation

This document provides detailed technical information about the Petitions by BetterGov.ph platform architecture, database design, and development workflows.

## 🏗️ System Architecture

### Frontend Architecture

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks and context for local state
- **Routing**: React Router for client-side navigation
- **Forms**: Custom form handling with validation
- **Editor**: @uiw/react-md-editor for rich text content

### Backend Architecture

- **Runtime**: Cloudflare Workers/Pages Functions
- **Database**: Cloudflare D1 (SQLite-based)
- **Caching**: Cloudflare KV for performance optimization
- **Authentication**: Auth.js (NextAuth) integration
- **File Storage**: Base64 encoding for images (small files)
- **API Design**: RESTful endpoints with TypeScript

### Infrastructure

- **Hosting**: Cloudflare Pages
- **CDN**: Cloudflare global network
- **Database**: Cloudflare D1 with automatic backups
- **Caching**: Multi-layer caching (KV, browser, CDN)
- **Security**: HTTPS, CORS, input validation

## 📊 Database Schema

### Core Tables

#### Users

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- Auth.js compatible TEXT ID
  name TEXT,                     -- Auth.js user name field
  email TEXT UNIQUE NOT NULL,    -- Auth.js email field
  emailVerified TEXT,            -- Auth.js email verification
  image TEXT,                    -- Auth.js user image field
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Petitions

```sql
CREATE TABLE petitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK(type IN ('local', 'national')) NOT NULL,
  image_url TEXT,
  target_count INTEGER NOT NULL DEFAULT 1000,
  current_count INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'completed', 'closed')) DEFAULT 'active',
  location TEXT,                 -- for local petitions
  due_date DATETIME NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at DATETIME,         -- NULL if unpublished
  private BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,      -- References users(id)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Signatures

```sql
CREATE TABLE signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  petition_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,        -- References users(id)
  comment TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(petition_id, user_id)  -- Prevent duplicate signatures
);
```

#### Categories

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Petition Categories (Junction Table)

```sql
CREATE TABLE petition_categories (
  petition_id INTEGER,
  category_id INTEGER,
  PRIMARY KEY (petition_id, category_id),
  FOREIGN KEY (petition_id) REFERENCES petitions(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_created_at ON petitions(created_at);
CREATE INDEX idx_petitions_slug ON petitions(slug);
CREATE INDEX idx_petitions_published_at ON petitions(published_at);
CREATE INDEX idx_petitions_private ON petitions(private);
CREATE INDEX idx_petitions_created_by ON petitions(created_by);
CREATE INDEX idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX idx_signatures_user_id ON signatures(user_id);
CREATE INDEX idx_signatures_created_at ON signatures(created_at);
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ and npm
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account (free tier works)

### Detailed Setup

#### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login  # Optional for local development
```

#### 2. Database Setup

```bash
# Create local D1 database
npm run db:create

# Run migrations and seed data
npm run db:setup

# Verify setup
wrangler d1 execute petition-db --local --command "SELECT COUNT(*) FROM petitions"
```

#### 3. Environment Configuration

Create a `.dev.vars` file for local development:

```env
# Add any environment variables here
# DATABASE_URL is handled by Wrangler automatically
```

Update `wrangler.toml` with your database ID if needed:

```toml
[[d1_databases]]
binding = "DB"
database_name = "petition-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

### Database Management

#### Local D1 Operations

```bash
# Execute SQL commands locally
wrangler d1 execute petition-db --local --command "SELECT * FROM petitions LIMIT 5"

# Execute SQL file locally
wrangler d1 execute petition-db --local --file=./custom-query.sql

# Start D1 console (interactive)
wrangler d1 execute petition-db --local

# View local D1 data location
ls -la .wrangler/state/d1/
```

#### Database Maintenance

```bash
# Check table structure
wrangler d1 execute petition-db --local --command "PRAGMA table_info(petitions)"

# Count records in each table
wrangler d1 execute petition-db --local --command "
SELECT
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT
  'petitions', COUNT(*) FROM petitions
UNION ALL
SELECT
  'signatures', COUNT(*) FROM signatures
UNION ALL
SELECT
  'categories', COUNT(*) FROM categories"

# Reset database (drops all data)
wrangler d1 execute petition-db --local --command "
DROP TABLE IF EXISTS petition_categories;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS petitions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;"
```

#### Backup and Restore

```bash
# Backup local database
cp .wrangler/state/d1/*.sqlite3 backup/

# Export data to SQL
wrangler d1 export petition-db --local --output backup.sql

# Reset local database completely
rm -rf .wrangler/state/d1/
npm run db:setup
```

## 🚀 Deployment

### Production Deployment to Cloudflare Pages

#### 1. Create Production Database

```bash
wrangler d1 create petition-db-prod
```

#### 2. Update Configuration

Update `wrangler.toml` with production database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "petition-db-prod"
database_id = "your-production-database-id"
```

#### 3. Run Production Migrations

```bash
wrangler d1 execute petition-db-prod --file=./db/migrations/consolidated_setup.sql
```

#### 4. Deploy Application

```bash
npm run build
wrangler pages deploy dist
```

### Environment-Specific Configuration

- **Local**: Uses `.wrangler/state/d1/` SQLite files
- **Production**: Uses Cloudflare D1 service
- **Staging**: Can use separate D1 database for testing

## 🧪 Testing

### End-to-End Testing with Playwright

#### Test Coverage

- ✅ Petition browsing and listing
- ✅ Petition detail pages with meta tags
- ✅ Petition creation (all form features)
- ✅ Petition signing (named, anonymous, with comments)
- ✅ Full user workflows
- ✅ Responsive design testing
- ✅ Performance testing

#### Running Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all tests
npm run test:e2e

# Run with browser UI
npm run test:e2e:ui

# Run specific test file
npx playwright test petitions.spec.ts

# Run tests in headed mode
npm run test:e2e:headed

# Debug tests
npx playwright test --debug
```

#### Test Configuration

See `playwright.config.ts` for detailed test configuration including:

- Browser settings (Chromium, Firefox, WebKit)
- Viewport configurations
- Test timeouts
- Base URL configuration
- Screenshot and video settings

## 📁 Project Structure

```
petition/
├── src/
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components (Button, Card, etc.)
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   ├── shared/             # Shared components (PetitionCard)
│   │   ├── PetitionDetail.tsx  # Individual petition page
│   │   ├── CreatePetition.tsx  # Petition creation form
│   │   ├── EditPetition.tsx    # Petition editing form
│   │   ├── ReviewPetition.tsx  # Petition review before publishing
│   │   ├── SignPetitionModal.tsx # Petition signing modal
│   │   └── UserProfile.tsx     # User profile and dashboard
│   ├── contexts/               # React contexts
│   │   ├── ModalContext.tsx    # Modal management
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.tsx         # Authentication hook
│   │   └── useUserSignatures.tsx # User signatures management
│   ├── services/               # API and external services
│   │   └── api.ts              # API client with caching
│   ├── types/                  # TypeScript type definitions
│   │   └── api.ts              # API response types
│   ├── db/                     # Database related files
│   │   ├── migrations/         # Database migration files
│   │   ├── seeds/              # Database seed data
│   │   ├── schemas/            # Database schema definitions
│   │   └── service.ts          # Database service layer
│   └── utils/                  # Utility functions
├── functions/                   # Cloudflare Pages Functions
│   ├── api/                    # API route handlers
│   │   ├── petitions/          # Petition-related endpoints
│   │   ├── petition/           # Individual petition endpoints
│   │   ├── signatures/         # Signature endpoints
│   │   ├── categories/         # Category endpoints
│   │   └── users/              # User endpoints
│   ├── auth/                   # Authentication endpoints
│   └── _shared/                # Shared utilities for functions
├── tests/                      # Test files
│   ├── e2e/                    # Playwright E2E tests
│   └── README.md               # Testing documentation
├── public/                     # Static assets
│   ├── logos/                  # Logo files
│   └── locales/                # Internationalization files
├── wrangler.toml               # Cloudflare configuration
├── playwright.config.ts        # Playwright test configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vite.config.ts              # Vite build configuration
└── tsconfig.json               # TypeScript configuration
```

## 🎨 Key Components

### CreatePetition Component

**Features:**

- Card-based petition type selection (Local vs National)
- Rich markdown editor for descriptions
- Base64 image upload with preview
- Category selection with tag display
- Form validation and error handling
- Location input for local petitions
- Target signature count setting

**Technical Details:**

- Uses `@uiw/react-md-editor` for markdown editing
- Implements custom image upload with base64 encoding
- Form state management with React hooks
- Real-time validation feedback

### PetitionDetail Component

**Features:**

- SEO-optimized meta tags with Open Graph support
- Progress tracking with visual progress bars
- Recent signatures list with pagination
- Social sharing functionality
- Sign petition modal integration
- Responsive design for all devices

**Technical Details:**

- React Suspense for loading states
- Dynamic meta tag generation for SEO
- Cache-busting for real-time updates
- Optimistic UI updates for signatures

### SignPetitionModal Component

**Features:**

- Form validation with real-time feedback
- Anonymous signing option
- Comment support with character counting
- Duplicate signature prevention
- Success/error state handling

**Technical Details:**

- Modal state management with context
- Form validation with custom hooks
- API integration with error handling

## 🔧 Performance Optimizations

### Caching Strategy

#### Cloudflare KV Caching

- **Petition Lists**: Cached for 5 minutes
- **Individual Petitions**: Cached for 2 minutes
- **User Signatures**: Cached for 1 minute
- **Categories**: Cached for 1 hour

#### Cache Invalidation

- Automatic invalidation on data changes
- Pattern-based cache clearing
- Manual cache refresh options

#### Client-Side Caching

- Cookie-based user signature caching
- Browser cache optimization
- Service worker for offline support (future)

### Database Optimizations

- Strategic indexing for common queries
- Efficient JOIN operations
- Pagination for large datasets
- Connection pooling

## 🔒 Security Considerations

### Input Validation

- Server-side validation for all inputs
- SQL injection prevention
- XSS protection with content sanitization
- CSRF protection

### Authentication & Authorization

- Secure session management
- Role-based access control
- Rate limiting for API endpoints
- IP-based restrictions for sensitive operations

### Data Privacy

- Anonymous signature options
- GDPR compliance considerations
- Data retention policies
- Secure data transmission (HTTPS)

## 🐛 Troubleshooting

### Common Development Issues

#### Database Issues

**Database not found:**

```bash
# Recreate local database
wrangler d1 create petition-db --local
npm run db:setup
```

**Migration errors:**

```bash
# Reset and re-run migrations
rm -rf .wrangler/state/d1/
npm run db:setup
```

#### Build Issues

**Wrangler not found:**

```bash
# Install globally
npm install -g wrangler
# Or use npx
npx wrangler login
```

**Build errors:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Test Issues

**Tests failing:**

```bash
# Install Playwright browsers
npx playwright install
# Ensure dev server is running
npm run dev  # In separate terminal
```

### Performance Issues

**Slow database queries:**

- Check indexes are properly created
- Analyze query execution plans
- Consider query optimization

**Slow page loads:**

- Check caching configuration
- Optimize image sizes
- Review bundle size

## 📈 Monitoring & Analytics

### Performance Monitoring

- Cloudflare Analytics for traffic insights
- Core Web Vitals tracking
- Database query performance
- API response times

### Error Tracking

- Console error logging
- API error monitoring
- User feedback collection
- Performance bottleneck identification

## 🔮 Future Enhancements

### Planned Features

- **Multi-language Support**: Full i18n implementation
- **Advanced Analytics**: Detailed petition performance metrics
- **Email Notifications**: Automated updates for petition creators
- **Mobile App**: React Native mobile application
- **API v2**: GraphQL API for better performance
- **Advanced Moderation**: AI-powered content moderation

### Technical Improvements

- **Service Worker**: Offline support and caching
- **WebSockets**: Real-time signature updates
- **CDN Optimization**: Image optimization and delivery
- **Database Sharding**: Horizontal scaling for large datasets
- **Microservices**: Service-oriented architecture

---

This architecture documentation is maintained alongside the codebase. For questions or clarifications, please refer to the [GitHub Discussions](https://github.com/bettergovph/petition/discussions).
