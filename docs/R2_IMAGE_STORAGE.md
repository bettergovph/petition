# R2 Image Storage Implementation

This document explains the R2 bucket integration for storing petition images instead of using base64 encoding.

## Overview

The system now uses **Cloudflare R2** for efficient image storage with the following benefits:
- **Better Performance**: No more large base64 strings in database
- **Scalable Storage**: Unlimited image storage capacity
- **CDN Integration**: Fast global image delivery
- **Cost Effective**: Pay only for what you use

## Architecture

### Components

1. **R2 Bucket**: `petition-images` - Stores uploaded images
2. **Upload API**: `/api/upload/image` - Handles file uploads to R2
3. **Image Service**: `imageApi.ts` - Frontend service for uploads
4. **ImageUpload Component**: Reusable upload UI component
5. **Database**: Stores R2 URLs in `image_url` field

### Flow

```
User selects image → ImageUpload component → /api/upload/image → R2 bucket → URL saved to database
```

## Setup Instructions

### 1. Create R2 Buckets

In your Cloudflare dashboard:

```bash
# Create production bucket
wrangler r2 bucket create petition-images

# Create preview bucket for development
wrangler r2 bucket create petition-images-preview
```

### 2. Configure Custom Domain (Recommended)

1. Go to Cloudflare Dashboard → R2 → petition-images
2. Click "Settings" → "Public Access"
3. Add custom domain: `images.petition.ph`
4. Update the URL in `/functions/api/upload/image.ts`:

```typescript
// Replace this line:
const publicUrl = `https://images.petition.ph/${filename}`

// With your actual R2 domain
```

### 3. Set Bucket IDs (if needed)

If you need to specify bucket IDs in wrangler.toml:

```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "petition-images"
preview_bucket_name = "petition-images-preview"
# Add these if needed:
# bucket_id = "your-production-bucket-id"
# preview_bucket_id = "your-preview-bucket-id"
```

### 4. Deploy Changes

```bash
# Deploy the updated functions
wrangler deploy

# Verify R2 binding is working
wrangler tail
```

## API Endpoints

### POST /api/petitions (with image)

Creates a petition with optional image upload.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with petition data and optional `image` field

**Response:**
```json
{
  "id": 123,
  "title": "Sample Petition",
  "image_url": "https://images.petition.ph/petitions/123/image.jpg",
  ...
}
```

### PUT /api/petitions/[id] (with image)

Updates a petition with optional image upload.

**Validation:**
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Organized file structure: `petitions/{id}/image.{ext}`

## Frontend Usage

### Server-Side Upload Integration

Images are now uploaded server-side as part of petition creation/editing:

```tsx
// Create petition with image
const formData = new FormData()
formData.append('title', 'My Petition')
formData.append('description', 'Petition description')
formData.append('image', imageFile) // File object

const response = await fetch('/api/petitions', {
  method: 'POST',
  body: formData
})

// Update petition with new image
const updateFormData = new FormData()
updateFormData.append('title', 'Updated Title')
updateFormData.append('image', newImageFile)

const updateResponse = await fetch(`/api/petitions/${petitionId}`, {
  method: 'PUT',
  body: updateFormData
})
```

## Database Schema

The `petitions` table `image_url` field now stores R2 URLs:

```sql
-- Before (base64)
image_url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."

-- After (R2 URL)
image_url: "https://images.petition.ph/petitions/123/image.jpg"
```

## File Organization Structure

Images are stored with the following organized structure:
```
petitions/{petition_id}/image.{extension}
```

Example: `petitions/123/image.jpg`

This ensures:
- **Organization**: Each petition has its own folder
- **Simplicity**: One image per petition with consistent naming
- **Easy Management**: Clear folder structure for maintenance
- **Overwrite Behavior**: New uploads replace existing images automatically

## Security & Performance

### Security Features
- **File Type Validation**: Only allows image files
- **Size Limits**: Maximum 5MB per image
- **Sanitized Filenames**: Prevents path traversal attacks
- **CORS Protection**: Proper CORS headers

### Performance Optimizations
- **CDN Caching**: 1-year cache headers for images
- **Optimized Metadata**: Stores original filename and upload info
- **Efficient Upload**: Direct browser-to-R2 upload
- **Progressive Loading**: Preview while uploading

## Monitoring & Troubleshooting

### Logs
The upload endpoint logs all operations:
```
✅ Image uploaded successfully: petition-1640995200000-abc123.jpg
❌ Image upload failed: File too large
```

### Common Issues

1. **"Bucket not found"**
   - Verify bucket exists: `wrangler r2 bucket list`
   - Check wrangler.toml configuration

2. **"Custom domain not working"**
   - Ensure domain is properly configured in Cloudflare
   - Update URL in upload endpoint

3. **"Upload fails with CORS error"**
   - Check CORS headers in upload endpoint
   - Verify request origin is allowed

### Debugging Commands

```bash
# List buckets
wrangler r2 bucket list

# List objects in bucket
wrangler r2 object list petition-images

# View bucket info
wrangler r2 bucket info petition-images

# Test upload endpoint
curl -X POST -F "image=@test.jpg" http://localhost:8787/api/upload/image
```

## Migration from Base64

If you have existing petitions with base64 images, you can migrate them:

1. Create a migration script to extract base64 images
2. Upload them to R2 using the upload API
3. Update database records with new R2 URLs
4. Clean up old base64 data

Example migration script structure:
```typescript
// 1. Get petitions with base64 images
// 2. For each petition:
//    - Decode base64 to file
//    - Upload to R2 via API
//    - Update petition.image_url with R2 URL
//    - Remove base64 data
```

## Cost Estimation

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015/GB/month
- **Class A Operations** (uploads): $4.50/million
- **Class B Operations** (downloads): $0.36/million
- **Data Transfer**: Free egress

For a petition platform:
- 1000 images (avg 500KB each) = 500MB = ~$0.008/month storage
- 1000 uploads = ~$0.0045
- 10,000 views = ~$0.0036

**Total estimated cost**: <$0.02/month for moderate usage

## Future Enhancements

### Potential Improvements
1. **Image Optimization**: Automatic resizing and format conversion
2. **Multiple Sizes**: Generate thumbnails and different resolutions
3. **Image Processing**: Watermarks, compression, filters
4. **Backup Strategy**: Cross-region replication
5. **Analytics**: Track image views and performance

### Advanced Features
- **Direct Upload**: Browser-to-R2 with presigned URLs
- **Image Variants**: Cloudflare Images integration
- **Lazy Loading**: Progressive image loading
- **WebP Conversion**: Automatic format optimization

---

For questions or issues, refer to the main project documentation or Cloudflare R2 documentation.
