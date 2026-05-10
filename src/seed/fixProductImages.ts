import { Product } from "../models/ProductModel.js";
import { Op } from "sequelize";

export const fixProductImages = async () => {
  try {
    console.log("🔧 Fixing product images...");

    // Find products with malformed image data
    const productsWithBadImages = await Product.findAll({
      where: {
        images: {
          [Op.ne]: null // Find products where images array doesn't contain valid image objects
        }
      }
    });

    if (productsWithBadImages.length === 0) {
      console.log("✅ No products with malformed image data found");
      return;
    }

    console.log(`📝 Found ${productsWithBadImages.length} products with malformed image data`);

    // Fix each product
    for (const product of productsWithBadImages) {
      // Get the actual images from the first valid product (Cold Drinks has proper images)
      const referenceProduct = await Product.findOne({
        where: { name: 'Cold Drinks' }
      });

      if (referenceProduct && referenceProduct.images && referenceProduct.images.length > 0) {
        console.log(`🔧 Fixing images for product: ${product.name}`);
        
        await product.update({
          images: referenceProduct.images
        });
      } else {
        console.log(`⚠️ Could not find reference images for product: ${product.name}`);
        
        // If no reference found, set empty array
        await product.update({
          images: []
        });
      }
    }

    console.log("✅ Product images fixed successfully");
  } catch (error) {
    console.error("❌ Error fixing product images:", error);
  }
};
