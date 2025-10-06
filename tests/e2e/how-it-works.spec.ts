import { test, expect } from '@playwright/test'

test.describe('How It Works Page', () => {
  test('should display how it works page content', async ({ page }) => {
    await page.goto('/how-it-works')

    // Check main heading
    await expect(page.locator('h1:has-text("How Petitions Work")')).toBeVisible()

    // Check hero section
    await expect(page.locator('text=Learn how to create, promote, and use petitions')).toBeVisible()

    // Check 4 steps section
    await expect(page.locator('text=4 Simple Steps to Create Change')).toBeVisible()
    await expect(page.locator('text=Create Your Petition')).toBeVisible()
    await expect(page.locator('text=Share & Promote')).toBeVisible()
    await expect(page.locator('text=Gather Support')).toBeVisible()
    await expect(page.locator('text=Make an Impact')).toBeVisible()

    // Check petition types section
    await expect(page.locator('text=Types of Petitions')).toBeVisible()
    await expect(page.locator('text=Local Petitions')).toBeVisible()
    await expect(page.locator('text=National Petitions')).toBeVisible()

    // Check features section
    await expect(page.locator('text=Platform Features')).toBeVisible()
    await expect(page.locator('text=National & Local Campaigns')).toBeVisible()
    await expect(page.locator('text=Verified & Secure')).toBeVisible()

    // Check tips section
    await expect(page.locator('text=Tips for Success')).toBeVisible()

    // Check CTA buttons
    await expect(
      page.locator('button:has-text("Create Your Petition"), a:has-text("Create Your Petition")')
    ).toBeVisible()
    await expect(
      page.locator(
        'button:has-text("Explore Existing Petitions"), a:has-text("Explore Existing Petitions")'
      )
    ).toBeVisible()
  })

  test('should navigate to create petition from CTA button', async ({ page }) => {
    await page.goto('/how-it-works')

    // Click the main CTA button
    const createButton = page.locator('a:has-text("Create Your Petition")').first()
    await createButton.click()

    // Should navigate to create page
    await expect(page).toHaveURL(/\/create/)
  })

  test('should navigate to petitions list from explore button', async ({ page }) => {
    await page.goto('/how-it-works')

    // Click the explore button
    const exploreButton = page.locator('a:has-text("Explore Existing Petitions")').first()
    await exploreButton.click()

    // Should navigate to petitions page
    await expect(page).toHaveURL(/\/petitions/)
  })

  test('should be accessible from navbar', async ({ page }) => {
    await page.goto('/')

    // Find and click "How it Works" in navigation
    const howItWorksLink = page.locator('text=How it Works').first()
    await expect(howItWorksLink).toBeVisible()
    await howItWorksLink.click()

    // Should navigate to how-it-works page
    await expect(page).toHaveURL(/\/how-it-works/)
    await expect(page.locator('h1:has-text("How Petitions Work")')).toBeVisible()
  })

  test('should have responsive design elements', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/how-it-works')

    // Page should still be functional
    await expect(page.locator('h1:has-text("How Petitions Work")')).toBeVisible()
    await expect(page.locator('text=4 Simple Steps')).toBeVisible()

    // Test on desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()

    // Page should display properly on desktop
    await expect(page.locator('h1:has-text("How Petitions Work")')).toBeVisible()
    await expect(page.locator('text=4 Simple Steps to Create Change')).toBeVisible()
  })
})
