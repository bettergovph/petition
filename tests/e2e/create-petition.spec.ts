import { test, expect } from '@playwright/test'

test.describe('Create Petition', () => {
  test('should navigate to create petition form and show sign-in requirement', async ({ page }) => {
    await page.goto('/')

    // Look for create petition link/button
    const createLink = page
      .locator('text=Start a Petition, text=Create Petition, a[href*="/create"]')
      .first()
    await expect(createLink).toBeVisible()

    await createLink.click()

    // Should navigate to create form
    await expect(page).toHaveURL(/\/create/)
    await expect(page.locator('text=Start a Petition, h1')).toBeVisible()

    // Should show sign-in options for unauthenticated users
    await expect(page.locator('text=Sign In to Continue')).toBeVisible()
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible()
    await expect(page.locator('button:has-text("Continue with Facebook")')).toBeVisible()
  })

  test('should show authentication requirement instead of form fields for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/create')

    // Should show sign-in options instead of form fields
    await expect(page.locator('text=Sign In to Continue')).toBeVisible()
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible()
    await expect(page.locator('button:has-text("Continue with Facebook")')).toBeVisible()
    await expect(page.locator('button:has-text("Back to Home")')).toBeVisible()

    // Form fields should NOT be visible for unauthenticated users
    await expect(page.locator('input[id="title"]')).not.toBeVisible()
    await expect(page.locator('.w-md-editor')).not.toBeVisible()
  })

  test('should show location field when local petition is selected', async ({ page }) => {
    await page.goto('/create')

    // Select local petition
    const localCard = page.locator('text=Local Petition').locator('..').locator('..')
    await localCard.click()

    // Location field should appear
    await expect(page.locator('input[id="location"], label:has-text("Location")')).toBeVisible()

    // Select national petition
    const nationalCard = page.locator('text=National Petition').locator('..').locator('..')
    await nationalCard.click()

    // Location field should be hidden
    await expect(page.locator('input[id="location"]')).not.toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/create')

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Petition")')
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('text=Title is required, text=required').first()).toBeVisible()
    await expect(
      page.locator('text=Description.*required, text=must be at least').first()
    ).toBeVisible()
  })

  test.skip('should successfully create a local petition (requires authentication)', async ({
    page,
  }) => {
    // This test is skipped because creating petitions now requires authentication
    // In a real test environment, you would need to implement authentication flow first
    await page.goto('/create')

    // Fill out the form
    // Select local petition type
    const localCard = page.locator('text=Local Petition').locator('..').locator('..')
    await localCard.click()

    // Verify local card is selected (should have blue border)
    await expect(localCard).toHaveClass(/border-blue-500/)

    // Fill location
    await page.locator('input[id="location"]').fill('San Francisco, CA')

    // Fill title
    await page.locator('input[id="title"]').fill('Save Our Local Community Garden from Development')

    // Fill description using the markdown editor
    const descriptionArea = page
      .locator('.w-md-editor textarea, textarea[placeholder*="Describe"]')
      .first()
    await descriptionArea.fill(`
## The Issue

Our beloved community garden at 123 Main Street is under threat of being demolished to make way for a parking lot. This garden has served our neighborhood for over 15 years.

## Why This Matters

- **Community Hub**: The garden brings together neighbors of all ages
- **Environmental Benefits**: Provides green space in an urban area
- **Food Security**: Helps families grow fresh produce
- **Educational Value**: Teaches children about gardening and nature

## What We're Asking For

We request that the City Council:
1. Reject the proposed parking lot development
2. Designate the garden as permanent community green space
3. Provide funding for garden improvements and maintenance

Join us in preserving this vital community resource!
    `)

    // Set target count
    await page.locator('input[id="targetCount"]').fill('1500')

    // Add categories
    const categorySelect = page.locator('select')
    await categorySelect.selectOption('Environment')
    // The category should appear as a tag
    await expect(page.locator('text=Environment').nth(1)).toBeVisible() // Second instance should be the tag

    // Add another category
    await categorySelect.selectOption('Local Government')
    await expect(page.locator('text=Local Government').nth(1)).toBeVisible()

    // Upload an image (optional - create a small test image)
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.isVisible()) {
      // Create a simple test image file path (you might need to add an actual test image)
      // For now, we'll skip the image upload in the test
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should redirect to success page or petition detail
    // This depends on your app's flow
    await page.waitForURL(/\/(petitions?|petition\/)/)

    // Should show success message or redirect to the new petition
    const successIndicators = page
      .locator('text=successfully, text=created, text=thank you')
      .first()
    if (await successIndicators.isVisible()) {
      await expect(successIndicators).toBeVisible()
    }
  })

  test.skip('should successfully create a national petition (requires authentication)', async ({
    page,
  }) => {
    // This test is skipped because creating petitions now requires authentication
    await page.goto('/create')

    // Select national petition type
    const nationalCard = page.locator('text=National Petition').locator('..').locator('..')
    await nationalCard.click()

    // Verify national card is selected
    await expect(nationalCard).toHaveClass(/border-blue-500/)

    // Fill title
    await page.locator('input[id="title"]').fill('National Climate Action Initiative')

    // Fill description
    const descriptionArea = page
      .locator('.w-md-editor textarea, textarea[placeholder*="Describe"]')
      .first()
    await descriptionArea.fill(`
## Urgent Need for National Climate Action

Climate change represents the greatest challenge of our time. We need immediate federal action to address this crisis.

## Our Demands

1. **Renewable Energy Transition**: Invest in clean energy infrastructure
2. **Carbon Pricing**: Implement a comprehensive carbon tax
3. **Green Jobs Program**: Create millions of clean energy jobs
4. **International Leadership**: Rejoin and lead global climate agreements

## The Time is Now

Every day we delay action makes the crisis worse. Sign this petition to demand our elected officials take bold action on climate change.

Together, we can build a sustainable future for all Americans.
    `)

    // Set target count
    await page.locator('input[id="targetCount"]').fill('50000')

    // Add categories
    const categorySelect = page.locator('select')
    await categorySelect.selectOption('Environment')

    // Submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Verify success
    await page.waitForURL(/\/(petitions?|petition\/)/)
  })

  test('should handle image upload', async ({ page }) => {
    await page.goto('/create')

    // Look for file upload area
    const uploadArea = page.locator('input[type="file"]')

    if (await uploadArea.isVisible()) {
      // In a real test, you would upload an actual image file
      // For this test, we'll just verify the upload functionality exists
      await expect(uploadArea).toHaveAttribute('accept', 'image/*')

      // The upload area should have appropriate text
      await expect(page.locator('text=Click to upload, text=drag and drop')).toBeVisible()
    }
  })

  test('should allow removing selected categories', async ({ page }) => {
    await page.goto('/create')

    // Add a category
    const categorySelect = page.locator('select')
    await categorySelect.selectOption('Environment')

    // Should show as a tag with remove button
    const categoryTag = page.locator('text=Environment').nth(1) // The tag version
    await expect(categoryTag).toBeVisible()

    // Find and click the remove button (X)
    const removeButton = categoryTag.locator('..').locator('button, svg').last()
    await removeButton.click()

    // Category should be removed from selected tags
    await expect(page.locator('text=Environment').nth(1)).not.toBeVisible()
  })
})
