# E2E Tests for Petition Application

This directory contains end-to-end tests using Playwright for the petition application.

## Test Structure

- **`example.spec.ts`** - Simple example tests to verify basic functionality
- **`petitions.spec.ts`** - Tests for browsing and listing petitions
- **`petition-detail.spec.ts`** - Tests for viewing individual petition details
- **`create-petition.spec.ts`** - Tests for creating new petitions
- **`sign-petition.spec.ts`** - Tests for signing petitions with various options
- **`full-workflow.spec.ts`** - Complete workflow tests demonstrating full user journeys
- **`test-helpers.ts`** - Utility functions for common test operations

## Running Tests

### Prerequisites

Make sure your development server is running:

```bash
npm run dev
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode

```bash
npm run test:e2e:headed
```

### Run Specific Test File

```bash
npx playwright test example.spec.ts
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

### Petition Browsing

- ✅ Homepage petition display
- ✅ Navigation to petition list
- ✅ Petition card information
- ✅ Search/filter functionality

### Petition Details

- ✅ Petition detail page display
- ✅ Breadcrumb navigation
- ✅ Petition metadata (dates, categories, counts)
- ✅ Recent signatures section
- ✅ Sharing options

### Petition Creation

- ✅ Form navigation and display
- ✅ Petition type selection (Local/National cards)
- ✅ Location field for local petitions
- ✅ Form validation
- ✅ Image upload functionality
- ✅ Category selection with tags
- ✅ Markdown description editor
- ✅ Successful petition creation

### Petition Signing

- ✅ Sign modal opening
- ✅ Form validation
- ✅ Standard signature (with name)
- ✅ Anonymous signature
- ✅ Signature with comment
- ✅ Anonymous signature with comment
- ✅ Email format validation
- ✅ Duplicate signature handling
- ✅ Character count for comments
- ✅ Cancel functionality

### Full Workflows

- ✅ Complete petition lifecycle (create → browse → view → sign)
- ✅ Multiple signature variations on same petition
- ✅ Anonymous signature verification

## Test Data Management

The tests use dynamically generated test data to avoid conflicts:

```typescript
const testData = PetitionTestHelpers.generateTestData()
// Generates unique emails, names, and titles with timestamps
```

## Browser Support

Tests run on:

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Chrome Mobile
- ✅ Safari Mobile

## Test Helpers

The `test-helpers.ts` file provides utilities for:

- **`navigateToFirstPetition()`** - Navigate to first available petition
- **`createTestPetition(options)`** - Create petition with specified parameters
- **`signPetition(options)`** - Fill and submit sign petition form
- **`isSignable()`** - Check if petition can be signed
- **`getPetitionStats()`** - Extract signature counts from page
- **`generateTestData()`** - Create unique test data

## Debugging Tests

### View Test Results

```bash
npx playwright show-report
```

### Debug Specific Test

```bash
npx playwright test --debug example.spec.ts
```

### Record Test Actions

```bash
npx playwright codegen localhost:5173
```

### Screenshots and Videos

Test screenshots are automatically captured on failure. Videos are recorded for failing tests when running in CI.

## CI/CD Integration

Tests are configured to:

- Run with retries on CI (2 retries)
- Use single worker on CI for stability
- Generate HTML reports
- Capture traces on retry

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout or check if dev server is running
2. **No petitions found**: Tests will skip if no petitions exist to test
3. **Modal not opening**: Check for button selectors and page load states
4. **Form validation errors**: Ensure form fields are correctly identified

### Test Environment

Make sure your test environment has:

- ✅ Database with test data or ability to create petitions
- ✅ All API endpoints functioning
- ✅ Development server running on localhost:5173
- ✅ No authentication barriers for test operations

## Best Practices

1. **Use data attributes** like `data-testid` for stable selectors
2. **Wait for network idle** before interacting with dynamic content
3. **Generate unique test data** to avoid conflicts
4. **Clean up test data** if tests modify persistent state
5. **Test both positive and negative scenarios**
6. **Use helper functions** for common operations

## Adding New Tests

When adding new tests:

1. Follow the existing naming convention
2. Use the test helpers for common operations
3. Add appropriate data-testid attributes to components
4. Test both success and error scenarios
5. Ensure tests can run independently
6. Update this README with new test coverage
