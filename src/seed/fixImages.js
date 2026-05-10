const { Product } = "./models/ProductModel.js";

async function fixImages() {
  try {
    console.log("🔧 Fixing product images...");

    // Find products with malformed image data
    const badProducts = await Product.findAll({
      where: {
        images: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    console.log(`Found ${badProducts.length} products with bad image data`);

    // Find a reference product with good images
    const referenceProduct = await Product.findOne({
      where: { name: 'Cold Drinks' }
    });

    if (!referenceProduct || !referenceProduct.images || referenceProduct.images.length === 0) {
      console.log("❌ No reference product found with valid images");
      return;
    }

    console.log("📝 Using reference images:", referenceProduct.images);

    // Update all bad products
    let updated = 0;
    for (const badProduct of badProducts) {
      await badProduct.update({
        images: referenceProduct.images
      });
      updated++;
    }

    console.log(`✅ Updated ${updated} products with proper image data`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixImages();
