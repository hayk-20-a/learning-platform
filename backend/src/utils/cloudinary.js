const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage config for VIDEO uploads
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "learnhub/videos", // folder in your Cloudinary account
    resource_type: "video", // tell Cloudinary this is a video
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});

// Storage config for IMAGE uploads (thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "learnhub/thumbnails",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1280, height: 720, crop: "fill" }], // auto-resize
  },
});

// Export multer upload instances
const uploadVideo = multer({ storage: videoStorage });
const uploadImage = multer({ storage: imageStorage });

module.exports = { cloudinary, uploadVideo, uploadImage };
