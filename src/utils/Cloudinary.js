import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs' //file system module

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null
    }
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
    
    setTimeout(() => {
       fs.unlinkSync(localFilePath)
      console.log(`File ${localFilePath} deleted after upload.`);
    }, 4000);

    return response
  } catch (error) {
    console.log('Error occured While uploading on Cloudinary ',err)
  }
}

export { uploadOnCloudinary }
