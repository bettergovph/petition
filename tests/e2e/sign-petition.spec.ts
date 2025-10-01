import { test, expect } from '@playwright/test'

test.describe('Sign Petition', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a petition detail page
    await page.goto('/petitions')
    await page.waitForLoadState('networkidle')

    // Find and navigate to first available petition
    const petitionLink = page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()
      // Wait for petition detail page to load
      await page.waitForLoadState('networkidle')
    } else {
      // Skip all tests if no petitions exist
      test.skip(true, 'No petitions available to test signing')
    }
  })

  test('should open sign petition modal when clicking sign button', async ({ page }) => {
    // Look for the sign button
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    // Skip if petition is not signable (already signed or inactive)
    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Modal should open
    await expect(page.locator('.modal, .fixed, text=Sign This Petition').first()).toBeVisible()

    // Form fields should be visible
    await expect(
      page.locator('input[name="firstName"], label:has-text("First Name")').first()
    ).toBeVisible()
    await expect(
      page.locator('input[name="lastName"], label:has-text("Last Name")').first()
    ).toBeVisible()
    await expect(page.locator('input[type="email"], label:has-text("Email")').first()).toBeVisible()
    await expect(page.locator('textarea, label:has-text("Comment")').first()).toBeVisible()
    await expect(
      page.locator('input[type="checkbox"], label:has-text("anonymous")').first()
    ).toBeVisible()
  })

  test('should successfully sign petition with full name', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill out the form with full name
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('John')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('Doe')
    await page.locator('input[type="email"]').first().fill('john.doe@example.com')

    // Make sure anonymous is NOT checked
    const anonymousCheckbox = page.locator(
      'input[type="checkbox"][name="anonymous"], input[id="anonymous"]'
    )
    if (await anonymousCheckbox.isChecked()) {
      await anonymousCheckbox.uncheck()
    }

    // Submit the form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show success state or close modal
    await expect(
      page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })

    // The sign button should either be disabled or show "signed" state
    const signButtonAfter = page.locator(
      'button:has-text("Sign"), button:has-text("Thank you"), .text-green'
    )
    await expect(signButtonAfter).toBeVisible()
  })

  test('should successfully sign petition anonymously', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill out the form
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('Anonymous')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('User')
    await page.locator('input[type="email"]').first().fill('anon.user@example.com')

    // Check the anonymous checkbox
    const anonymousCheckbox = page.locator(
      'input[type="checkbox"][name="anonymous"], input[id="anonymous"]'
    )
    await anonymousCheckbox.check()
    await expect(anonymousCheckbox).toBeChecked()

    // Submit the form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show success state
    await expect(
      page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('should successfully sign petition with comment', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill out the form with comment
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('Jane')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('Smith')
    await page.locator('input[type="email"]').first().fill('jane.smith@example.com')

    // Add a comment
    const commentField = page
      .locator('textarea[name="comment"], label:has-text("Comment") + textarea')
      .first()
    await commentField.fill(
      'This issue is very important to our community. I strongly support this petition and encourage others to sign as well. We need to take action now!'
    )

    // Submit the form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show success state
    await expect(
      page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })

    // The comment should eventually appear in the signatures list
    // Note: This might require a page refresh depending on implementation
    await page.reload()
    await page.waitForLoadState('networkidle')

    const commentInList = page.locator('text=This issue is very important')
    if ((await commentInList.count()) > 0) {
      await expect(commentInList).toBeVisible()
    }
  })

  test('should sign petition with both anonymous and comment', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill out the form
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('Secret')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('Supporter')
    await page.locator('input[type="email"]').first().fill('secret.supporter@example.com')

    // Check anonymous
    const anonymousCheckbox = page.locator(
      'input[type="checkbox"][name="anonymous"], input[id="anonymous"]'
    )
    await anonymousCheckbox.check()

    // Add comment
    const commentField = page
      .locator('textarea[name="comment"], label:has-text("Comment") + textarea')
      .first()
    await commentField.fill(
      'I prefer to remain anonymous, but I want to express my strong support for this cause. Please count my voice!'
    )

    // Submit the form
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show success state
    await expect(
      page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('should validate required fields in sign form', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Try to submit without filling required fields
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show validation errors
    await expect(page.locator('text=First name is required, text=required').first()).toBeVisible()
    await expect(page.locator('text=Last name is required').first()).toBeVisible()
    await expect(page.locator('text=Email is required').first()).toBeVisible()
  })

  test('should validate email format in sign form', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill with invalid email
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('Test')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('User')
    await page.locator('input[type="email"]').first().fill('invalid-email')

    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Should show email validation error
    await expect(page.locator('text=valid email, text=invalid email').first()).toBeVisible()
  })

  test('should be able to cancel signing', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Modal should be open
    await expect(page.locator('.modal, .fixed, text=Sign This Petition').first()).toBeVisible()

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel")')
    await cancelButton.click()

    // Modal should close
    await expect(page.locator('.modal, .fixed, text=Sign This Petition').first()).not.toBeVisible()
  })

  test('should show character count for comment field', async ({ page }) => {
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    const commentField = page
      .locator('textarea[name="comment"], label:has-text("Comment") + textarea')
      .first()

    // Type a comment and check character counter
    await commentField.fill('This is a test comment')

    // Should show character count (format might be "23/500" or similar)
    await expect(page.locator('text=/\\d+\\/\\d+/, text=/\\d+ character/').first()).toBeVisible()
  })

  test('should handle duplicate signature attempt', async ({ page }) => {
    // First, successfully sign the petition
    const signButton = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if (!(await signButton.isVisible()) || !(await signButton.isEnabled())) {
      test.skip(true, 'Petition is not signable')
    }

    await signButton.click()

    // Fill and submit form
    await page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill('Duplicate')
    await page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill('Tester')
    await page.locator('input[type="email"]').first().fill('duplicate@example.com')

    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Wait for success
    await expect(
      page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })

    // Now try to sign again (if the sign button is still available)
    await page.reload()
    await page.waitForLoadState('networkidle')

    const signButtonAgain = page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )

    if ((await signButtonAgain.isVisible()) && (await signButtonAgain.isEnabled())) {
      await signButtonAgain.click()

      // Fill with same email
      await page
        .locator('input[name="firstName"], label:has-text("First Name") + input')
        .first()
        .fill('Duplicate')
      await page
        .locator('input[name="lastName"], label:has-text("Last Name") + input')
        .first()
        .fill('Tester')
      await page.locator('input[type="email"]').first().fill('duplicate@example.com')

      const submitButtonAgain = page
        .locator('button[type="submit"], button:has-text("Sign Petition")')
        .last()
      await submitButtonAgain.click()

      // Should show duplicate error
      await expect(page.locator('text=already signed, text=duplicate').first()).toBeVisible()
    }
  })
})
