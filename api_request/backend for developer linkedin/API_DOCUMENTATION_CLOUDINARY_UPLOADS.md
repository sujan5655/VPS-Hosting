# API Documentation with Cloudinary File Uploads

## File Upload Endpoints

### POST `/api/posts` (Create Post with File Uploads)
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title` (string, required) - Post title
- `content` (string, required) - Post content
- `summary` (string, optional) - Post summary
- `tags` (string, optional) - Comma-separated tags (e.g., "javascript,nodejs,backend")
- `status` (string, optional) - Post status (draft, published, archived)
- `images` (files, optional) - Up to 10 image files
- `videos` (files, optional) - Up to 5 video files

**Example using FormData:**
```javascript
const formData = new FormData();
formData.append('title', 'My Post with Media');
formData.append('content', 'This is the content...');
formData.append('summary', 'Brief summary');
formData.append('tags', 'javascript,nodejs');
formData.append('status', 'published');

// Add images
imageFiles.forEach(file => {
  formData.append('images', file);
});

// Add videos
videoFiles.forEach(file => {
  formData.append('videos', file);
});

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Note: Don't set Content-Type header when using FormData
  },
  body: formData
});
```

### PUT `/api/posts/:id` (Update Post with File Uploads)
**Content-Type:** `multipart/form-data`

Same form fields as create post, but all fields are optional.

### POST `/api/profiles` (Create Profile with Image)
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `headline` (string, required) - Profile headline
- `summary` (string, optional) - Profile summary
- `location` (string, optional) - Location
- `industry` (string, optional) - Industry
- `experience` (string, optional) - JSON string of experience array
- `education` (string, optional) - JSON string of education array
- `skills` (string, optional) - Comma-separated skills
- `website` (string, optional) - Website URL
- `github` (string, optional) - GitHub username
- `linkedin` (string, optional) - LinkedIn username
- `twitter` (string, optional) - Twitter username
- `phone` (string, optional) - Phone number
- `openToWork` (boolean, optional) - Open to work status
- `jobPreferences` (string, optional) - JSON string of job preferences
- `profileImage` (file, optional) - Profile picture file

**Example:**
```javascript
const formData = new FormData();
formData.append('headline', 'Software Developer');
formData.append('summary', 'Experienced developer...');
formData.append('skills', 'javascript,react,nodejs');
formData.append('openToWork', 'true');

// Add profile image
if (profileImageFile) {
  formData.append('profileImage', profileImageFile);
}

const response = await fetch('/api/profiles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### PUT `/api/profiles/:id` (Update Profile with Image)
**Content-Type:** `multipart/form-data`

Same form fields as create profile, but all fields are optional.

## File Specifications

### Image Uploads
- **Supported Formats:** JPEG, PNG, WebP
- **Max File Size:** 5MB per image (posts), 2MB per image (profile)
- **Max Files:** 10 images per post, 1 image per profile
- **Auto-optimization:** Cloudinary automatically optimizes and converts to WebP

### Video Uploads
- **Supported Formats:** MP4, WebM, MOV, AVI
- **Max File Size:** 50MB per video
- **Max Files:** 5 videos per post
- **Auto-thumbnails:** Cloudinary automatically generates thumbnails

## Response Format

### Successful Upload Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "title": "My Post",
    "content": "Post content...",
    "images": [
      {
        "url": "https://res.cloudinary.com/dad9ut1f8/image/upload/v1234567/linkedin-clone/images/123456_abc123.jpg",
        "alt": "original-filename.jpg",
        "order": 0
      }
    ],
    "videos": [
      {
        "url": "https://res.cloudinary.com/dad9ut1f8/video/upload/v1234567/linkedin-clone/videos/123456_def123.mp4",
        "thumbnail": "https://res.cloudinary.com/dad9ut1f8/video/upload/v1234567/linkedin-clone/videos/123456_def123.jpg",
        "title": "original-filename.mp4",
        "duration": 120,
        "order": 0
      }
    ],
    "author": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Profile Image Response
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "uuid",
    "headline": "Software Developer",
    "profileImage": {
      "url": "https://res.cloudinary.com/dad9ut1f8/image/upload/v1234567/linkedin-clone/profile-images/123456_ghi123.jpg",
      "alt": "Profile picture"
    },
    "owner": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

## Error Handling

### File Upload Errors
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
}
```

```json
{
  "success": false,
  "message": "File size exceeds maximum limit of 5MB"
}
```

```json
{
  "success": false,
  "message": "Error uploading images"
}
```

## Frontend Implementation Examples

### React with Axios
```javascript
import axios from 'axios';

const createPostWithMedia = async (postData, imageFiles, videoFiles) => {
  const formData = new FormData();
  
  // Add text fields
  Object.keys(postData).forEach(key => {
    if (typeof postData[key] === 'object') {
      formData.append(key, JSON.stringify(postData[key]));
    } else {
      formData.append(key, postData[key]);
    }
  });
  
  // Add image files
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  // Add video files
  videoFiles.forEach(file => {
    formData.append('videos', file);
  });
  
  try {
    const response = await axios.post('/api/posts', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
```

### File Upload Progress
```javascript
const createPostWithProgress = async (postData, files, onProgress) => {
  const formData = new FormData();
  
  // Add data and files...
  
  try {
    const response = await axios.post('/api/posts', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

## Cloudinary Configuration

The backend is configured with:
- **Cloud Name:** dad9ut1f8
- **API Key:** 855445261648827
- **API Secret:** IeJQzeMLdY-O6Z9kcIcvs5n3eW0

### Folder Structure
- **Images:** `linkedin-clone/images/`
- **Videos:** `linkedin-clone/videos/`
- **Profile Images:** `linkedin-clone/profile-images/`

### Optimization Features
- **Images:** Auto-format conversion to WebP, quality optimization
- **Videos:** Automatic thumbnail generation
- **Delivery:** CDN delivery with automatic format selection

## Security Considerations

1. **File Type Validation:** Server validates file types before upload
2. **Size Limits:** Configurable size limits prevent abuse
3. **Authentication:** All upload endpoints require valid JWT tokens
4. **Authorization:** Users can only upload to their own content
5. **Cloudinary Security:** Uses signed uploads and secure URLs

## Testing File Uploads

### Using cURL
```bash
# Create post with images
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Post" \
  -F "content=This is a test post" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"

# Create profile with image
curl -X POST http://localhost:5000/api/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "headline=Software Developer" \
  -F "profileImage=@/path/to/profile.jpg"
```

### Using Postman
1. Set method to POST
2. Set URL to `http://localhost:5000/api/posts`
3. Go to Body → form-data
4. Add text fields for title, content, etc.
5. Add file fields for images/videos
6. Set Authorization header with Bearer token
