const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-app/destinations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'avif']
  },
});

const userProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-app/UserProfiles',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const guideIdProofStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-app/IDProofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
});

// Profile image storage
const guideProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travel-app/GuideProfiles',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});
module.exports = { cloudinary, storage, guideIdProofStorage, guideProfileStorage, userProfileStorage };
