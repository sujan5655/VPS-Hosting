# API Documentation with Media Support

## Post Endpoints with Media Support

### POST `/api/posts` (Create Post with Media)
```json
{
  "title": "My First Post",
  "content": "This is the content of my post...",
  "summary": "A brief summary of the post",
  "tags": ["javascript", "nodejs", "backend"],
  "status": "published",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Description of image 1",
      "caption": "Optional caption for image 1",
      "order": 0
    },
    {
      "url": "https://example.com/image2.jpg",
      "alt": "Description of image 2",
      "caption": "Optional caption for image 2",
      "order": 1
    }
  ],
  "videos": [
    {
      "url": "https://example.com/video1.mp4",
      "thumbnail": "https://example.com/video1-thumb.jpg",
      "title": "Video 1 Title",
      "duration": 120,
      "caption": "Optional video caption",
      "order": 0
    }
  ]
}
```

### PUT `/api/posts/:id` (Update Post with Media)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "summary": "Updated summary",
  "tags": ["javascript", "updated"],
  "status": "published",
  "images": [
    {
      "url": "https://example.com/updated-image.jpg",
      "alt": "Updated image description",
      "caption": "Updated caption",
      "order": 0
    }
  ],
  "videos": [
    {
      "url": "https://example.com/updated-video.mp4",
      "thumbnail": "https://example.com/updated-video-thumb.jpg",
      "title": "Updated Video Title",
      "duration": 180,
      "caption": "Updated video caption",
      "order": 0
    }
  ]
}
```

## Profile Endpoints with Image Support

### POST `/api/profiles` (Create Profile with Image)
```json
{
  "headline": "Software Developer",
  "summary": "Experienced developer with 5+ years...",
  "location": "San Francisco, CA",
  "industry": "Technology",
  "profileImage": {
    "url": "https://example.com/profile-image.jpg",
    "alt": "John Doe's profile picture"
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "2020-01-01",
      "endDate": "2023-01-01",
      "description": "Led development of..."
    }
  ],
  "education": [
    {
      "school": "University of Tech",
      "degree": "Bachelor's",
      "field": "Computer Science",
      "startDate": "2016-01-01",
      "endDate": "2020-01-01"
    }
  ],
  "skills": ["JavaScript", "Node.js", "React", "MongoDB"],
  "website": "https://johndoe.com",
  "github": "johndoe",
  "linkedin": "johndoe",
  "twitter": "johndoe",
  "phone": "+1234567890",
  "openToWork": true,
  "jobPreferences": {
    "jobTypes": ["full-time", "contract"],
    "locations": ["San Francisco", "Remote"],
    "industries": ["Technology", "Finance"],
    "remote": true
  }
}
```

### PUT `/api/profiles/:id` (Update Profile with Image)
```json
{
  "headline": "Updated Headline",
  "summary": "Updated summary...",
  "profileImage": {
    "url": "https://example.com/updated-profile-image.jpg",
    "alt": "Updated profile picture description"
  },
  "skills": ["JavaScript", "Node.js", "React", "MongoDB", "Python"]
}
```

## Media Upload Guidelines

### Image Specifications
- **Format**: JPEG, PNG, WebP
- **Size**: Recommended max 5MB per image
- **Dimensions**: Variable, but optimized for web
- **Alt Text**: Required for accessibility
- **Order**: Used for display sequence

### Video Specifications
- **Format**: MP4, WebM
- **Size**: Recommended max 50MB per video
- **Thumbnail**: Required JPEG thumbnail image
- **Duration**: Optional, in seconds
- **Title**: Required for video identification

### Profile Image Specifications
- **Format**: JPEG, PNG, WebP
- **Size**: Recommended max 2MB
- **Dimensions**: Square format recommended (e.g., 400x400px)
- **Alt Text**: Required for accessibility

## File Upload Implementation Notes

### For Frontend Implementation:
1. **Upload files to cloud storage** (AWS S3, Cloudinary, etc.)
2. **Get URLs** from the storage service
3. **Include URLs in the API request** as shown above
4. **Handle upload progress** for better UX
5. **Validate file types and sizes** before upload

### Example Upload Flow:
```javascript
// 1. Upload file to cloud storage
const uploadResult = await uploadToCloudStorage(file);

// 2. Get the URL
const imageUrl = uploadResult.url;

// 3. Include in API request
const postData = {
  title: "My Post",
  content: "Content here...",
  images: [
    {
      url: imageUrl,
      alt: "Description",
      caption: "Optional caption",
      order: 0
    }
  ]
};

// 4. Send to API
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(postData)
});
```

## Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Post or Profile object with media included
    "id": "uuid",
    "title": "Post Title",
    "content": "Post content",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "alt": "Description",
        "caption": "Caption",
        "order": 0
      }
    ],
    "videos": [
      {
        "url": "https://example.com/video.mp4",
        "thumbnail": "https://example.com/thumb.jpg",
        "title": "Video Title",
        "duration": 120,
        "caption": "Video caption",
        "order": 0
      }
    ],
    // ... other fields
  }
}
```

## Error Handling

### Media-related Errors:
```json
{
  "success": false,
  "message": "Invalid image format. Supported formats: JPEG, PNG, WebP"
}
```

```json
{
  "success": false,
  "message": "Image size exceeds maximum limit of 5MB"
}
```

```json
{
  "success": false,
  "message": "Video thumbnail is required"
}
```

## Security Considerations

1. **Validate file types** on both client and server
2. **Scan uploaded files** for malware
3. **Use CDN** for media delivery
4. **Implement rate limiting** for upload endpoints
5. **Store files securely** with proper access controls
6. **Consider file expiration** for temporary uploads
