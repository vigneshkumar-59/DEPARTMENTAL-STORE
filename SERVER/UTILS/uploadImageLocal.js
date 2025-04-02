// import fs from 'fs';
// import path from 'path';

// // Directory where you want to save uploaded images
// const uploadDir = path.join(__dirname, 'uploads');

// // Check if 'uploads' directory exists, if not, create it
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // The uploadImageLocal function that saves the image to local storage
// const uploadImageLocal = async (image) => {
//   try {
//     // The image is passed as a file with a buffer
//     const buffer = image?.buffer;

//     if (!buffer) {
//       throw new Error('No image buffer found');
//     }

//     // Create a unique filename for the image (you can use timestamp or UUID)
//     const fileName = `image_${Date.now()}.jpg`; // Change the extension if needed (e.g., .png)
//     const filePath = path.join(uploadDir, fileName);

//     // Write the image buffer to the file system
//     fs.writeFileSync(filePath, buffer);

//     // Return the file path (which you can store in your database)
//     return filePath; 
//   } catch (error) {
//     console.error('Error uploading image locally:', error);
//     throw new Error('Image upload failed');
//   }
// };

// export default uploadImageLocal;


import fs from 'fs';
import path from 'path';
import multer from 'multer';
import express from 'express';

// Fix __dirname for ES Modules
const __dirname = new URL('.', import.meta.url).pathname;

// Define the path to the 'uploads' directory inside the 'server' folder
const uploadDir = path.join(__dirname, 'uploads');  // Ensures 'uploads' is in the server folder

// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

app.post('/upload/image', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(uploadDir, `${Date.now()}_${req.file.originalname}`);
  fs.writeFileSync(filePath, req.file.buffer);

  return res.json({
    message: 'Image uploaded successfully',
    data: { url: filePath },
  });
});

export default app;




