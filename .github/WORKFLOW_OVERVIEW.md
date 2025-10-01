# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the petition project to ensure code quality, security, and proper deployment practices.

## Workflows Overview

### 🔍 Pull Request Checks (`pr-checks.yml`)

Comprehensive checks that run on every pull request:

- **Lint & Format Check**: ESLint and Prettier validation
- **TypeScript Type Check**: Strict type checking
- **Build Verification**: Ensures the project builds successfully
- **End-to-End Tests**: Playwright test suite execution
- **Security Audit**: npm audit and vulnerability scanning
- **Cloudflare Validation**: Wrangler configuration validation
- **Dependency Analysis**: Checks for outdated and unused dependencies

### 🚀 Deployment Workflows

#### Staging Deployment (`deploy-staging.yml`)

- Triggers on pushes to `develop` branch
- Deploys to Cloudflare Pages staging environment
- Requires manual approval for production-like testing

#### Production Deployment (`deploy-production.yml`)

- Triggers on pushes to `main` branch
- Runs full test suite before deployment
- Deploys to Cloudflare Pages production environment

### 🔒 Security Scanning (`security-scan.yml`)

- Weekly scheduled security scans
- Runs on all pushes and pull requests
- Checks for known vulnerabilities
- Generates security reports

### 📊 Code Quality (`code-quality.yml`)

- Comprehensive code analysis
- Checks for console.log statements
- Identifies TODO/FIXME comments
- Strict TypeScript checking

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Cloudflare Secrets

- `CLOUDFLARE_API_TOKEN`: API token for Cloudflare Pages deployment
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Optional Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Branch Protection Rules

It's recommended to set up branch protection rules for the `main` branch:

1. Go to Settings → Branches → Add rule
2. Select `main` branch
3. Enable the following protections:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators

### Required Status Checks

- `lint-and-format`
- `type-check`
- `build-check`
- `test-e2e`
- `security-check`

## Local Development

To run the same checks locally that run in CI:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint
npm run format:check

# Type checking
npx tsc --noEmit

# Build verification
npm run build

# Run tests
npm run test:e2e

# Security audit
npm run security:audit
npm run security:check

# Dependency analysis
npm run deps:check
npm run deps:outdated
```

## Workflow Status

All workflows include comprehensive status reporting and will fail if:

- Code doesn't pass linting/formatting checks
- TypeScript compilation fails
- Build process fails
- Tests fail
- Security vulnerabilities are detected
- Dependencies have issues

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are properly installed and TypeScript compilation passes
2. **Test Failures**: Ensure Playwright browsers are installed (`npx playwright install`)
3. **Security Issues**: Run `npm audit fix` to automatically fix vulnerabilities
4. **Deployment Issues**: Verify Cloudflare credentials and project configuration

### Getting Help

- Check the Actions tab in your GitHub repository for detailed logs
- Review the workflow files for specific configuration
- Ensure all required secrets are properly configured
