import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Discover all images for a product from the public/images folder
 * Supports patterns like: 1(1).jpeg, 1(2).jpeg, 11-blue(1).jpeg, etc.
 */
export async function discoverProductImages(productId) {
  const imagesDir = path.join(__dirname, "..", "..", "public", "images");

  try {
    const files = await fs.readdir(imagesDir);

    // Find all images matching the product pattern
    const patterns = [
      new RegExp(`^${productId}\\(\\d+\\)\\.(jpeg|jpg|png)$`, "i"), // 1(1).jpeg, 1(2).jpeg
      new RegExp(`^${productId}-([a-z]+)\\(\\d+\\)\\.(jpeg|jpg|png)$`, "i"), // 11-blue(1).jpeg
    ];

    const matchingFiles = files.filter((file) => {
      return patterns.some((pattern) => pattern.test(file));
    });

    // Extract color variants
    const colorVariants = {};
    const baseImages = [];

    matchingFiles.forEach((file) => {
      const colorMatch = file.match(
        new RegExp(`^${productId}-([a-z]+)\\(\\d+\\)\\.`, "i"),
      );
      if (colorMatch) {
        const color = colorMatch[1];
        if (!colorVariants[color]) {
          colorVariants[color] = [];
        }
        colorVariants[color].push({
          filename: file,
          url: `images/${file}`,
          color: color,
        });
      } else {
        baseImages.push({
          filename: file,
          url: `images/${file}`,
          color: null,
        });
      }
    });

    // Sort images by number in parentheses
    const sortByNumber = (a, b) => {
      const numA = parseInt(a.filename.match(/\((\d+)\)/)?.[1] || "0");
      const numB = parseInt(b.filename.match(/\((\d+)\)/)?.[1] || "0");
      return numA - numB;
    };

    baseImages.sort(sortByNumber);
    Object.keys(colorVariants).forEach((color) => {
      colorVariants[color].sort(sortByNumber);
    });

    return {
      base: baseImages,
      colors: colorVariants,
      all: [...baseImages, ...Object.values(colorVariants).flat()],
    };
  } catch (error) {
    console.error("Error discovering images:", error);
    return {
      base: [],
      colors: {},
      all: [],
    };
  }
}
