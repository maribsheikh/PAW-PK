import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 }
};

export async function processImage(file, productId) {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  const productDir = path.join(uploadDir, `product_${productId}`);
  
  // Create product directory if it doesn't exist
  await fs.mkdir(productDir, { recursive: true });
  
  const baseName = path.parse(file.originalname).name;
  const ext = path.parse(file.originalname).ext;
  const processedImages = [];
  
  for (const [sizeLabel, dimensions] of Object.entries(sizes)) {
    const outputPath = path.join(productDir, `${baseName}_${sizeLabel}${ext}`);
    
    await sharp(file.buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    // Return relative path from uploads directory
    const relativePath = `product_${productId}/${baseName}_${sizeLabel}${ext}`;
    processedImages.push({
      sizeLabel,
      url: relativePath
    });
  }
  
  return processedImages;
}

export async function deleteProductImages(productId) {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
  const productDir = path.join(uploadDir, `product_${productId}`);
  
  try {
    await fs.rm(productDir, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, which is fine
    console.log(`Could not delete directory ${productDir}:`, error.message);
  }
}

