import { test, expect } from '@playwright/test'
import { PetitionTestHelpers } from './test-helpers'

test.describe('Full Petition Workflow', () => {
  test('should complete full petition lifecycle: create, browse, view, sign', async ({ page }) => {
    const helpers = new PetitionTestHelpers(page)
    const testData = PetitionTestHelpers.generateTestData()

    // Step 1: Create a petition
    await helpers.createTestPetition({
      type: 'local',
      title: testData.title,
      description: `${testData.description}\n\n## Why This Matters\n\nThis is a comprehensive test of the petition system including:\n- Petition creation\n- Petition browsing\n- Petition signing\n- Various signing options`,
      location: 'Test City, TS',
      targetCount: 100,
      categories: ['Environment'],
    })

    // Step 2: Verify we can browse petitions
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    // Our new petition should be in the list
    await expect(page.locator(`text=${testData.title}`)).toBeVisible()

    // Step 3: Navigate to the petition detail page
    await page.locator(`text=${testData.title}`).click()

    // Step 4: Verify petition details are displayed
    await expect(page.locator(`h1:has-text("${testData.title}")`)).toBeVisible()
    await expect(page.locator('text=Test City, TS')).toBeVisible()
    await expect(page.locator('text=Environment')).toBeVisible()

    // Step 5: Sign the petition with name
    if (await helpers.isSignable()) {
      await helpers.signPetition({
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email,
        comment: 'I support this test petition!',
      })

      // Verify signature counter increased
      const stats = await helpers.getPetitionStats()
      expect(stats.signed).toBeGreaterThan(0)
    }

    // Step 6: Try to sign again (should show duplicate error)
    if (await helpers.isSignable()) {
      // Open sign modal
      const signButton = page.locator(
        'button:has-text("Sign"), button:has-text("Sign This Petition")'
      )
      await signButton.click()

      // Fill with same email
      await page
        .locator('input[name="firstName"], label:has-text("First Name") + input')
        .first()
        .fill(testData.firstName)
      await page
        .locator('input[name="lastName"], label:has-text("Last Name") + input')
        .first()
        .fill(testData.lastName)
      await page.locator('input[type="email"]').first().fill(testData.email)

      const submitButton = page
        .locator('button[type="submit"], button:has-text("Sign Petition")')
        .last()
      await submitButton.click()

      // Should show duplicate error
      await expect(page.locator('text=already signed, text=duplicate').first()).toBeVisible()
    }

    console.log(`Successfully completed full workflow test with petition: ${testData.title}`)
  })

  test('should handle anonymous signatures correctly', async ({ page }) => {
    const helpers = new PetitionTestHelpers(page)

    // Navigate to any available petition
    const hasPublishedPetition = await helpers.navigateToFirstPetition()

    if (!hasPublishedPetition) {
      // Create a petition first
      const testData = PetitionTestHelpers.generateTestData()
      await helpers.createTestPetition({
        type: 'national',
        title: `Anonymous Test ${testData.title}`,
        description: 'This petition is for testing anonymous signatures.',
        targetCount: 50,
        categories: ['Social Justice'],
      })
    }

    // Sign anonymously
    if (await helpers.isSignable()) {
      const testData = PetitionTestHelpers.generateTestData()

      await helpers.signPetition({
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email,
        comment: 'I prefer to remain anonymous but strongly support this cause.',
        anonymous: true,
      })

      // Refresh to see the signature in the list
      await page.reload()
      await helpers.waitForPetitionLoad()

      // The signature should appear as "Anonymous" in the signatures list
      await expect(page.locator('text=Anonymous')).toBeVisible()
      await expect(page.locator('text=I prefer to remain anonymous')).toBeVisible()
    }
  })

  test('should demonstrate all petition signing variations', async ({ page }) => {
    const helpers = new PetitionTestHelpers(page)
    const testData = PetitionTestHelpers.generateTestData()

    // Create a petition for testing
    await helpers.createTestPetition({
      type: 'local',
      title: `Multi-Sign Test ${testData.title}`,
      description: 'This petition tests multiple signature variations.',
      location: 'Multi City, MC',
      targetCount: 500,
      categories: ['Education', 'Local Government'],
    })

    const variations = [
      {
        name: 'Standard signature',
        options: {
          firstName: 'Standard',
          lastName: 'User',
          email: `standard.${testData.email}`,
        },
      },
      {
        name: 'Signature with comment',
        options: {
          firstName: 'Commenter',
          lastName: 'User',
          email: `comment.${testData.email}`,
          comment: 'This is very important for our community.',
        },
      },
      {
        name: 'Anonymous signature',
        options: {
          firstName: 'Anonymous',
          lastName: 'Person',
          email: `anon.${testData.email}`,
          anonymous: true,
        },
      },
      {
        name: 'Anonymous with comment',
        options: {
          firstName: 'Secret',
          lastName: 'Supporter',
          email: `secret.${testData.email}`,
          comment: 'I support this but wish to remain anonymous.',
          anonymous: true,
        },
      },
    ]

    let signatureCount = 0

    for (const variation of variations) {
      console.log(`Testing: ${variation.name}`)

      if (await helpers.isSignable()) {
        await helpers.signPetition(variation.options)
        signatureCount++

        // Refresh to see updated count
        await page.reload()
        await helpers.waitForPetitionLoad()

        // Verify count increased
        const stats = await helpers.getPetitionStats()
        expect(stats.signed).toBe(signatureCount)
      }
    }

    console.log(`Successfully tested ${signatureCount} signature variations`)
  })
})
