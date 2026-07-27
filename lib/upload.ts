import { createClient } from './supabase/client'

const BUCKET = 'custom-order-references'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export class UploadError extends Error {}

/**
 * Uploads a reference image for a custom order request directly from the
 * browser to Supabase Storage, and returns its public URL.
 */
export async function uploadReferenceImage(file: File): Promise<string> {
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
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw new UploadError(uploadError.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}
