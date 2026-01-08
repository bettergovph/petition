/**
 * Safely gets a string value from FormData
 * @param formData - The FormData object to extract from
 * @param fieldName - The name of the field to extract
 * @returns The trimmed string value, or undefined if field doesn't exist or is empty
 */
export function getStringField(formData: FormData, fieldName: string): string | undefined {
  const value = formData.get(fieldName)

  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Safely parses an integer from FormData
 * @param formData - The FormData object to extract from
 * @param fieldName - The name of the field to parse
 * @returns The parsed integer, or undefined if parsing fails or value is invalid
 */
export function getIntegerField(formData: FormData, fieldName: string): number | undefined {
  const value = getStringField(formData, fieldName)

  if (value === undefined) {
    return undefined
  }

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    return undefined
  }

  return parsed
}

/**
 * Safely parses a JSON array from FormData
 * @param formData - The FormData object to extract from
 * @param fieldName - The name of the field to parse as JSON array
 * @returns The parsed array, or undefined if parsing fails or result is not an array
 * @template T - The expected type of array elements
 */
export function getJsonArrayField<T = unknown>(
  formData: FormData,
  fieldName: string
): T[] | undefined {
  const value = getStringField(formData, fieldName)

  if (value === undefined) {
    return undefined
  }

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      console.warn(`Field "${fieldName}" is not an array:`, parsed)
      return undefined
    }

    return parsed as T[]
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Failed to parse JSON for field "${fieldName}":`, error.message)
    }
    return undefined
  }
}

/**
 * Gets a File from FormData
 * @param formData - The FormData object to extract from
 * @param fieldName - The name of the file field
 * @returns The File object, or undefined if field doesn't exist, is not a File, or is empty
 */
export function getFileField(formData: FormData, fieldName: string): File | undefined {
  const value = formData.get(fieldName)

  if (value === null || value === undefined) {
    return undefined
  }

  if (!(value instanceof File)) {
    return undefined
  }

  if (value.size === 0) {
    return undefined
  }

  return value
}
