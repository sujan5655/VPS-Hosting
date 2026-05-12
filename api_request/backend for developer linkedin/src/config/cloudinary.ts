import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  timeout: 120000, // 120 seconds timeout
  secure: true,
});
export default cloudinary;
