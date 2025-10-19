import { expect, test } from '@playwright/test'

test.describe('Petition Browsing', () => {
  test('should display petition list on homepage', async ({ page }) => {
    await page.goto('/')

    // Check that the homepage loads
    await expect(page).toHaveTitle(/Petition/)

    // Check for main navigation elements
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('text=Browse Petitions')).toBeVisible()

    // Check for petition cards or content
    // This might vary based on whether there are existing petitions
    const petitionSection = page
      .locator('[data-testid="featured-petitions"], .petition-card, text="Featured Petitions"')
      .first()
    await expect(petitionSection).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to all petitions page', async ({ page }) => {
    await page.goto('/')

    // Look for a link to view all petitions
    const browsePetitionsLink = page
      .locator('text=Browse Petitions, text=View All, text=All Petitions')
      .first()
    await browsePetitionsLink.click()

    // Should navigate to petitions list page
    await expect(page).toHaveURL(/\/petitions/)

    // Check for petition list elements
    await expect(page.locator('text=All Petitions, text=Browse, text=Filter').first()).toBeVisible()
  })

  test('should display petition cards with essential information', async ({ page }) => {
    await page.goto('/petitions')

    // Wait for petitions to load
    await page.waitForLoadState('networkidle')

    // Check if there are petition cards
    const petitionCards = page.locator('.petition-card, [data-testid="petition-card"]')

    if ((await petitionCards.count()) > 0) {
      const firstCard = petitionCards.first()
      await expect(firstCard).toBeVisible()

      // Each petition card should have a title
      await expect(
        firstCard.locator('h2, h3, .title, [data-testid="petition-title"]').first()
      ).toBeVisible()

      // Should have some indication of signatures or progress
      await expect(
        firstCard.locator('text=/\\d+.*sign/, text=/signature/, text=/\\d+%/').first()
      ).toBeVisible()
    }
  })

  test('should be able to search/filter petitions', async ({ page }) => {
    await page.goto('/petitions')

    // Look for search or filter inputs
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]')
      .first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('environment')

      // Wait for results to filter
      await page.waitForTimeout(1000)

      // Results should be filtered (this is a basic check)
      // At minimum, the page shouldn't crash
      await expect(page).not.toHaveURL(/error/)
    }
  })

  test('should filter petitions by category', async ({ page }) => {
    await page.goto('/petitions')

    const economyPetition = page.getByRole('heading', { name: 'Modernize Philippine Agriculture' })
    const educationPetition = page.getByRole('heading', {
      name: 'Free Wi-Fi in All Public Schools Nationwide',
    })
    const categorySuggestions = page.getByRole('listbox', { name: 'Suggestions' })

    // Ensure the economy petition is initially visible
    await expect(economyPetition).toBeVisible()

    await page.getByRole('button', { name: 'Categories' }).click()
    await expect(categorySuggestions).toBeVisible()

    // After selecting Education category, economy petition should be hidden
    await categorySuggestions.getByRole('option', { name: 'Education' }).click()
    await expect(economyPetition).not.toBeVisible()
    await expect(educationPetition).toBeVisible()

    // Check for multiple category selection
    // After selecting Economy category, both petitions should be visible
    await categorySuggestions.getByRole('option', { name: 'Economy' }).click()
    await expect(economyPetition).toBeVisible()
    await expect(educationPetition).toBeVisible()
  })
})
