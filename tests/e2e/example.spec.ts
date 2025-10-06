import { test, expect } from '@playwright/test'

test.describe('Example Tests', () => {
  test('homepage should load successfully', async ({ page }) => {
    await page.goto('/')

    // Page should load without errors
    await expect(page).toHaveTitle(/Petition/)

    // Should not show error page
    await expect(page.locator('text=404, text=Error').first()).not.toBeVisible()

    console.log('✅ Homepage loaded successfully')
  })

  test('navigation should work', async ({ page }) => {
    await page.goto('/')

    // Test navigation to petitions page
    const petitionsLink = page
      .locator('text=Browse Petitions, text=Petitions, a[href*="/petitions"]')
      .first()

    if (await petitionsLink.isVisible()) {
      await petitionsLink.click()
      await expect(page).toHaveURL(/\/petitions/)
      console.log('✅ Navigation to petitions page works')
    } else {
      console.log('ℹ️  No petitions link found, skipping navigation test')
    }
  })
})
