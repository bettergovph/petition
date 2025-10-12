// SERVER-ONLY DATABASE SERVICE - DO NOT IMPORT IN CLIENT CODE
// This file should only be used in Cloudflare functions

/// <reference types="@cloudflare/workers-types" />

import type {
  Category,
  CreatePetitionInput,
  CreateSignatureInput,
  CreateUserReportInput,
  Petition,
  PetitionWithDetails,
  Signature,
  UpdateUserReportInput,
  User,
  UserReport,
} from './schemas/types'

export class DatabaseService {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  // User methods

  async getUserById(id: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return await stmt.bind(id).first<User>()
  }

  // Helper method to generate URL-friendly slug
  private generateSlug(title: string, id?: number): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

    return id ? `${baseSlug}-${id}` : baseSlug
  }

  // Helper method to get due date (60 days from now if not provided)
  private getDueDate(providedDate?: string): string {
    if (providedDate) {
      return providedDate
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 60)
    return dueDate.toISOString()
  }

  // Petition methods
  async createPetition(petitionData: CreatePetitionInput): Promise<Petition> {
    const dueDate = this.getDueDate(petitionData.due_date)

    // Generate initial slug without ID (we'll update it after getting the ID)
    const tempSlug = this.generateSlug(petitionData.title)

    const stmt = this.db.prepare(`
      INSERT INTO petitions (title, description, type, image_url, target_count, location, due_date, slug, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)

    const result = await stmt
      .bind(
        petitionData.title,
        petitionData.description,
        petitionData.type,
        petitionData.image_url || null,
        petitionData.target_count || 1000,
        petitionData.location || null,
        dueDate,
        tempSlug,
        petitionData.created_by
      )
      .first<Petition>()

    if (!result) {
      throw new Error('Failed to create petition')
    }

    // Generate final slug with ID and update
    const finalSlug = this.generateSlug(petitionData.title, result.id)
    const updateSlugStmt = this.db.prepare('UPDATE petitions SET slug = ? WHERE id = ?')
    await updateSlugStmt.bind(finalSlug, result.id).run()

    // Add categories if provided
    if (petitionData.category_ids && petitionData.category_ids.length > 0) {
      for (const categoryId of petitionData.category_ids) {
        await this.addPetitionCategory(result.id, categoryId)
      }
    }

    // Return updated petition with final slug
    return { ...result, slug: finalSlug }
  }

  async getPetitionBySlug(slug: string): Promise<PetitionWithDetails | null> {
    // Get petition with creator info - no expensive JOIN with signatures
    const stmt = this.db.prepare(`
      SELECT
        p.*,
        u.name as creator_name
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      WHERE p.slug = ?
    `)

    const petition = await stmt.bind(slug).first<
      Petition & {
        creator_name: string
      }
    >()

    if (!petition) return null

    // Get categories
    const categoriesStmt = this.db.prepare(`
      SELECT c.*
      FROM categories c
      JOIN petition_categories pc ON c.id = pc.category_id
      WHERE pc.petition_id = ?
    `)
    const categoriesResult = await categoriesStmt.bind(petition.id).all<Category>()

    // Use the cached current_count from the petitions table
    return {
      ...petition,
      creator: {
        name: petition.creator_name,
      },
      categories: categoriesResult.results || [],
    }
  }

  async getPetitionById(id: number): Promise<PetitionWithDetails | null> {
    // Get petition with creator info - no expensive JOIN with signatures
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        u.name as creator_name
      FROM petitions p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `)

    const petition = await stmt.bind(id).first<
      Petition & {
        creator_name: string
      }
    >()
    if (!petition) return null

    // Get categories
    const categoriesStmt = this.db.prepare(`
      SELECT c.*
      FROM categories c
      JOIN petition_categories pc ON c.id = pc.category_id
      WHERE pc.petition_id = ?
    `)
    const categoriesResult = await categoriesStmt.bind(id).all<Category>()

    // Use the cached current_count from the petitions table
    return {
      ...petition,
      creator: {
        name: petition.creator_name,
      },
      categories: categoriesResult.results || [],
    }
  }

  async getAllPetitions(
    limit = 50,
    offset = 0,
    type?: 'local' | 'national',
    categoryIds?: number[]
  ): Promise<PetitionWithDetails[]> {
    // Get petitions with creator info - no expensive JOIN with signatures
    // Only return published petitions (where published_at is not NULL)
    let query = `
      SELECT DISTINCT
        p.*,
        u.name as creator_name
      FROM petitions p
      JOIN users u ON p.created_by = u.id
    `

    const params: (string | number)[] = []

    // Add category filter if provided
    if (categoryIds && categoryIds.length > 0) {
      query += `
      JOIN petition_categories pc ON p.id = pc.petition_id
      `
    }

    query += ' WHERE p.published_at IS NOT NULL'

    if (type) {
      query += ' AND p.type = ?'
      params.push(type)
    }

    // Add category filter
    if (categoryIds && categoryIds.length > 0) {
      const selectedCategories = categoryIds.map(() => '?').join(',')
      query += ` AND pc.category_id IN (${selectedCategories})`
      params.push(...categoryIds)
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all<
      Petition & {
        creator_name: string
      }
    >()

    if (!result.results) return []

    // Get categories for each petition
    const petitionsWithDetails: PetitionWithDetails[] = []
    for (const petition of result.results) {
      const categoriesStmt = this.db.prepare(`
        SELECT c.*
        FROM categories c
        JOIN petition_categories pc ON c.id = pc.category_id
        WHERE pc.petition_id = ?
      `)
      const categoriesResult = await categoriesStmt.bind(petition.id).all<Category>()

      petitionsWithDetails.push({
        ...petition,
        creator: {
          name: petition.creator_name,
        },
        categories: categoriesResult.results || [],
      })
    }

    return petitionsWithDetails
  }

  async getUserPetitions(userId: string): Promise<Petition[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM petitions
      WHERE created_by = ?
      ORDER BY created_at DESC
    `)
    const result = await stmt.bind(userId).all<Petition>()
    return result.results || []
  }

  async publishPetition(id: number): Promise<Petition> {
    const stmt = this.db.prepare(`
      UPDATE petitions 
      SET published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    await stmt.bind(id).run()

    // Return the updated petition
    const selectStmt = this.db.prepare('SELECT * FROM petitions WHERE id = ?')
    const result = await selectStmt.bind(id).first<Petition>()

    if (!result) {
      throw new Error('Petition not found after publishing')
    }

    return result
  }

  async updatePetition(id: number, petitionData: Partial<CreatePetitionInput>): Promise<Petition> {
    // Build dynamic update query
    const updateFields: string[] = []
    const values: unknown[] = []

    if (petitionData.title !== undefined) {
      updateFields.push('title = ?')
      values.push(petitionData.title)
    }
    if (petitionData.description !== undefined) {
      updateFields.push('description = ?')
      values.push(petitionData.description)
    }
    if (petitionData.type !== undefined) {
      updateFields.push('type = ?')
      values.push(petitionData.type)
    }
    if (petitionData.image_url !== undefined) {
      updateFields.push('image_url = ?')
      values.push(petitionData.image_url)
    }
    if (petitionData.target_count !== undefined) {
      updateFields.push('target_count = ?')
      values.push(petitionData.target_count)
    }
    if (petitionData.location !== undefined) {
      updateFields.push('location = ?')
      values.push(petitionData.location)
    }
    if (petitionData.status !== undefined) {
      updateFields.push('status = ?')
      values.push(petitionData.status)
    }

    // Update slug if title changed
    if (petitionData.title !== undefined) {
      const newSlug = this.generateSlug(petitionData.title, id)
      updateFields.push('slug = ?')
      values.push(newSlug)
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE petitions
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
    `)

    const result = await stmt.bind(...values).first<Petition>()
    if (!result) {
      throw new Error('Failed to update petition')
    }

    // Update categories if provided
    if (petitionData.category_ids !== undefined) {
      // Remove existing categories
      const removeStmt = this.db.prepare('DELETE FROM petition_categories WHERE petition_id = ?')
      await removeStmt.bind(id).run()

      // Add new categories
      for (const categoryId of petitionData.category_ids) {
        await this.addPetitionCategory(id, categoryId)
      }
    }

    return result
  }

  // Signature methods
  async createSignature(signatureData: CreateSignatureInput): Promise<Signature> {
    const stmt = this.db.prepare(`
      INSERT INTO signatures (petition_id, user_id, comment, anonymous, ip_address)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)

    const result = await stmt
      .bind(
        signatureData.petition_id,
        signatureData.user_id,
        signatureData.comment || null,
        signatureData.anonymous || false,
        signatureData.ip_address || null
      )
      .first<Signature>()

    if (!result) {
      throw new Error('Failed to create signature')
    }

    return result
  }

  async getSignatureById(id: number): Promise<Signature | null> {
    const stmt = this.db.prepare('SELECT * FROM signatures WHERE id = ?')
    return await stmt.bind(id).first<Signature>()
  }

  async getUserSignatures(userId: string): Promise<Signature[]> {
    const stmt = this.db.prepare(
      'SELECT * FROM signatures WHERE user_id = ? ORDER BY created_at DESC'
    )
    const result = await stmt.bind(userId).all<Signature>()
    return result.results || []
  }

  async getPetitionSignatures(petitionId: number, limit = 50, offset = 0): Promise<Signature[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM signatures 
      WHERE petition_id = ? AND comment IS NOT NULL AND comment != ''
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    const result = await stmt.bind(petitionId, limit, offset).all<Signature>()
    return result.results || []
  }

  // Category methods
  async createCategory(name: string, description?: string): Promise<Category> {
    const stmt = this.db.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
      RETURNING *
    `)

    const result = await stmt.bind(name, description || null).first<Category>()
    if (!result) {
      throw new Error('Failed to create category')
    }

    return result
  }

  async getAllCategories(): Promise<Category[]> {
    const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name ASC')
    const result = await stmt.all<Category>()
    return result.results || []
  }

  async addPetitionCategory(petitionId: number, categoryId: number): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO petition_categories (petition_id, category_id)
      VALUES (?, ?)
    `)
    await stmt.bind(petitionId, categoryId).run()
  }

  async unpublishPetition(id: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE petitions SET published_at = NULL WHERE id = ?')
    await stmt.bind(id).run()
  }

  async deletePetition(id: number): Promise<void> {
    // Delete in order to respect foreign key constraints
    // 1. Delete petition categories
    const deleteCategoriesStmt = this.db.prepare(
      'DELETE FROM petition_categories WHERE petition_id = ?'
    )
    await deleteCategoriesStmt.bind(id).run()

    // 2. Delete signatures
    const deleteSignaturesStmt = this.db.prepare('DELETE FROM signatures WHERE petition_id = ?')
    await deleteSignaturesStmt.bind(id).run()

    // 3. Delete the petition itself
    const deletePetitionStmt = this.db.prepare('DELETE FROM petitions WHERE id = ?')
    await deletePetitionStmt.bind(id).run()
  }

  // User Reports methods

  async createUserReport(reportData: CreateUserReportInput): Promise<UserReport> {
    const stmt = this.db.prepare(`
      INSERT INTO user_reports (
        reporter_user_id, 
        reported_item_type, 
        reported_item_id, 
        report_reason, 
        report_description
      )
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = await stmt
      .bind(
        reportData.reporter_user_id,
        reportData.reported_item_type,
        reportData.reported_item_id,
        reportData.report_reason,
        reportData.report_description || null
      )
      .run()

    if (!result.success) {
      throw new Error('Failed to create user report')
    }

    // Return the created report
    const createdReport = await this.getUserReportById(result.meta.last_row_id as number)
    if (!createdReport) {
      throw new Error('Failed to retrieve created user report')
    }

    return createdReport
  }

  async getUserReportById(id: number): Promise<UserReport | null> {
    const stmt = this.db.prepare('SELECT * FROM user_reports WHERE id = ?')
    return await stmt.bind(id).first<UserReport>()
  }

  async getAllUserReports(
    limit: number = 50,
    offset: number = 0,
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  ): Promise<UserReport[]> {
    let query = `
      SELECT ur.*, 
             u.name as reporter_name
      FROM user_reports ur
      LEFT JOIN users u ON ur.reporter_user_id = u.id
    `

    const params: (string | number)[] = []

    if (status) {
      query += ' WHERE ur.status = ?'
      params.push(status)
    }

    query += ' ORDER BY ur.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all<UserReport>()
    return result.results || []
  }

  async updateUserReport(
    id: number,
    updateData: UpdateUserReportInput
  ): Promise<UserReport | null> {
    const setParts: string[] = []
    const params: (string | number)[] = []

    if (updateData.status !== undefined) {
      setParts.push('status = ?')
      params.push(updateData.status)
    }

    if (updateData.admin_notes !== undefined) {
      setParts.push('admin_notes = ?')
      params.push(updateData.admin_notes)
    }

    if (updateData.reviewed_by !== undefined) {
      setParts.push('reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP')
      params.push(updateData.reviewed_by)
    }

    if (setParts.length === 0) {
      throw new Error('No update data provided')
    }

    const query = `UPDATE user_reports SET ${setParts.join(', ')} WHERE id = ?`
    params.push(id)

    const stmt = this.db.prepare(query)
    await stmt.bind(...params).run()

    return await this.getUserReportById(id)
  }

  async getUserReportsByItem(
    itemType: 'petition' | 'signature',
    itemId: number
  ): Promise<UserReport[]> {
    const stmt = this.db.prepare(`
      SELECT ur.*, 
             u.name as reporter_name
      FROM user_reports ur
      LEFT JOIN users u ON ur.reporter_user_id = u.id
      WHERE ur.reported_item_type = ? AND ur.reported_item_id = ?
      ORDER BY ur.created_at DESC
    `)

    const result = await stmt.bind(itemType, itemId).all<UserReport>()
    return result.results || []
  }
}
