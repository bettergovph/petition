import { Page, expect } from '@playwright/test'

export class PetitionTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the first available petition
   * Returns true if successful, false if no petitions exist
   */
  async navigateToFirstPetition(): Promise<boolean> {
    await this.page.goto('/petitions')
    await this.page.waitForLoadState('networkidle')

    const petitionLink = this.page.locator('a[href*="/petition/"]').first()

    if ((await petitionLink.count()) > 0) {
      await petitionLink.click()
      await this.page.waitForLoadState('networkidle')
      return true
    }

    return false
  }

  /**
   * Create a test petition with specified parameters
   */
  async createTestPetition(options: {
    type: 'local' | 'national'
    title: string
    description: string
    location?: string
    targetCount?: number
    categories?: string[]
  }) {
    await this.page.goto('/create')

    // Select petition type
    const typeCard = this.page
      .locator(`text=${options.type === 'local' ? 'Local Petition' : 'National Petition'}`)
      .locator('..')
      .locator('..')
    await typeCard.click()

    // Fill location if local
    if (options.type === 'local' && options.location) {
      await this.page.locator('input[id="location"]').fill(options.location)
    }

    // Fill title
    await this.page.locator('input[id="title"]').fill(options.title)

    // Fill description
    const descriptionArea = this.page
      .locator('.w-md-editor textarea, textarea[placeholder*="Describe"]')
      .first()
    await descriptionArea.fill(options.description)

    // Set target count
    if (options.targetCount) {
      await this.page.locator('input[id="targetCount"]').clear()
      await this.page.locator('input[id="targetCount"]').fill(options.targetCount.toString())
    }

    // Add categories
    if (options.categories) {
      const categorySelect = this.page.locator('select')
      for (const category of options.categories) {
        await categorySelect.selectOption(category)
      }
    }

    // Submit
    const submitButton = this.page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for redirect
    await this.page.waitForURL(/\/(petitions?|petition\/)/)
  }

  /**
   * Fill and submit the sign petition form
   */
  async signPetition(options: {
    firstName: string
    lastName: string
    email: string
    comment?: string
    anonymous?: boolean
  }) {
    // Open sign modal
    const signButton = this.page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )
    await signButton.click()

    // Fill form
    await this.page
      .locator('input[name="firstName"], label:has-text("First Name") + input')
      .first()
      .fill(options.firstName)
    await this.page
      .locator('input[name="lastName"], label:has-text("Last Name") + input')
      .first()
      .fill(options.lastName)
    await this.page.locator('input[type="email"]').first().fill(options.email)

    if (options.comment) {
      const commentField = this.page
        .locator('textarea[name="comment"], label:has-text("Comment") + textarea')
        .first()
      await commentField.fill(options.comment)
    }

    if (options.anonymous) {
      const anonymousCheckbox = this.page.locator(
        'input[type="checkbox"][name="anonymous"], input[id="anonymous"]'
      )
      await anonymousCheckbox.check()
    }

    // Submit
    const submitButton = this.page
      .locator('button[type="submit"], button:has-text("Sign Petition")')
      .last()
    await submitButton.click()

    // Wait for success
    await expect(
      this.page.locator('text=Thank you, text=successfully, text=signed').first()
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Wait for petition data to load
   */
  async waitForPetitionLoad() {
    await this.page.waitForLoadState('networkidle')

    // Wait for either petition content or error state
    await Promise.race([
      this.page.waitForSelector('h1, [data-testid="petition-title"]'),
      this.page.waitForSelector('text=not found, text=error', { timeout: 5000 }).catch(() => null),
    ])
  }

  /**
   * Check if sign button is available and clickable
   */
  async isSignable(): Promise<boolean> {
    const signButton = this.page.locator(
      'button:has-text("Sign"), button:has-text("Sign This Petition")'
    )
    return (await signButton.isVisible()) && (await signButton.isEnabled())
  }

  /**
   * Get petition statistics from the page
   */
  async getPetitionStats() {
    const signedText = await this.page.locator('text=/\\d+.*signed/').first().textContent()
    const targetText = await this.page
      .locator('text=/\\d+.*goal/, text=/\\d+.*target/')
      .first()
      .textContent()

    const signedMatch = signedText?.match(/(\d+)/)
    const targetMatch = targetText?.match(/(\d+)/)

    return {
      signed: signedMatch ? parseInt(signedMatch[1]) : 0,
      target: targetMatch ? parseInt(targetMatch[1]) : 0,
    }
  }

  /**
   * Generate unique test data to avoid conflicts
   */
  static generateTestData() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    return {
      email: `test.user.${timestamp}.${random}@example.com`,
      firstName: `TestUser${random}`,
      lastName: `${timestamp}`,
      title: `Test Petition ${timestamp}`,
      description: `This is a test petition created at ${new Date().toISOString()}. This petition is for testing purposes only and should not be considered a real petition.`,
    }
  }
}
