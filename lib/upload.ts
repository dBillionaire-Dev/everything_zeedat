import { createClient } from './supabase/client'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export type UploadBucket = 'custom-order-references' | 'product-images'

export class UploadError extends Error {}

async function uploadImage(bucket: UploadBucket, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Please upload a JPG, PNG, WEBP, or HEIC image.')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadError('Image must be smaller than 5MB.')
  }

  const supabase = createClient()

  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw new UploadError(uploadError.message)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

/**
 * Uploads a reference image for a custom order request directly from the
 * browser to Supabase Storage, and returns its public URL.
 */
export async function uploadReferenceImage(file: File): Promise<string> {
  return uploadImage('custom-order-references', file)
}

/**
 * Uploads a product photo (admin CMS only — RLS requires an admin session)
 * directly from the browser to Supabase Storage, and returns its public URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  return uploadImage('product-images', file)
}

/**
 * Deletes a previously uploaded product image given its public URL.
 * Admin-only under RLS.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const supabase = createClient()
  const fileName = publicUrl.split('/').pop()
  if (!fileName) return

  const { error } = await supabase.storage.from('product-images').remove([fileName])
  if (error) {
    // Non-fatal — the DB record is what matters most; log and move on.
    console.error('[upload] Failed to delete product image:', error.message)
  }
}
