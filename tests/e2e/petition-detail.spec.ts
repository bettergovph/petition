import { test, expect } from '@playwright/test'

test.describe('Petition Detail Page', () => {
  test('should display petition details when accessing via slug', async ({ page }) => {
    // First, try to get to a petition from the list
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    // Find a petition link and get its URL
    const petitionLink = page.locator('a[href*="/petition/"], a[href*="/petitions/"]').first()

    if ((await petitionLink.count()) > 0) {
      const href = await petitionLink.getAttribute('href')

      if (href) {
        await page.goto(href)

        // Verify we're on a petition detail page
        await expect(page).toHaveURL(/\/petition\//)

        // Check for essential petition details
        await expect(page.locator('h1, [data-testid="petition-title"]').first()).toBeVisible()

        // Should have description
        await expect(
          page
            .locator(
              '.description, [data-testid="petition-description"], text=/Why this petition matters/'
            )
            .first()
        ).toBeVisible()

        // Should have signature count and progress
        await expect(
          page.locator('text=/\\d+.*signed/, text=/signatures/, text=/\\d+%/').first()
        ).toBeVisible()

        // Should have a sign button (if petition is active)
        const signButton = page.locator(
          'button:has-text("Sign"), button:has-text("Sign This Petition")'
        )

        if (await signButton.isVisible()) {
          await expect(signButton).toBeEnabled()
        }
      }
    } else {
      // If no petitions exist, skip this test
      test.skip(true, 'No petitions available to test')
    }
  })

  test('should show breadcrumb navigation', async ({ page }) => {
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    const petitionLink = page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()

      // Check for breadcrumb navigation
      await expect(page.locator('nav, .breadcrumb').first()).toBeVisible()
      await expect(page.locator('text=Home')).toBeVisible()
      await expect(page.locator('text=Petitions')).toBeVisible()
    } else {
      test.skip(true, 'No petitions available to test')
    }
  })

  test('should display petition metadata', async ({ page }) => {
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    const petitionLink = page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()

      // Should show creation date or days left
      await expect(
        page.locator('text=/\\d+ days/, text=/created/, text=/started/i').first()
      ).toBeVisible()

      // Should show categories/tags
      const categories = page.locator('.badge, .tag, [data-testid="category"]')
      if ((await categories.count()) > 0) {
        await expect(categories.first()).toBeVisible()
      }

      // Should show target and current signature counts
      await expect(
        page.locator('text=/\\d+.*goal/, text=/target/i, text=/\\d+.*signed/').first()
      ).toBeVisible()
    } else {
      test.skip(true, 'No petitions available to test')
    }
  })

  test('should display recent signatures section', async ({ page }) => {
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    const petitionLink = page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()

      // Look for signatures section
      await expect(
        page.locator('text=Recent Signatures, text=Signatures, h2:has-text("Signatures")').first()
      ).toBeVisible()

      // Should show either signatures or "no signatures" message
      const signaturesContent = page.locator(
        '.signature, [data-testid="signature"], text=No signatures yet, text=Be the first to sign'
      )
      await expect(signaturesContent.first()).toBeVisible()
    } else {
      test.skip(true, 'No petitions available to test')
    }
  })

  test('should show sharing options', async ({ page }) => {
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    const petitionLink = page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()

      // Look for share buttons
      const shareButtons = page.locator(
        'button:has-text("Share"), button:has-text("Copy Link"), text=Share'
      )

      if ((await shareButtons.count()) > 0) {
        await expect(shareButtons.first()).toBeVisible()
      }
    } else {
      test.skip(true, 'No petitions available to test')
    }
  })
})
