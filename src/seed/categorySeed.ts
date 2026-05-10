import { Category } from "../models/CategoryModel.js";

export const seedCategories = async () => {
  try {
    console.log("🌱 Seeding initial categories...");

    // Create root categories
    const electronics = await Category.findOrCreate({
      where: { name: "Electronics", parentId: null },
      defaults: { name: "Electronics", parentId: null }
    });

    const clothing = await Category.findOrCreate({
      where: { name: "Clothing", parentId: null },
      defaults: { name: "Clothing", parentId: null }
    });

    // Create child categories
    const mobile = await Category.findOrCreate({
      where: { name: "Mobile", parentId: electronics[0].id },
      defaults: { name: "Mobile", parentId: electronics[0].id }
    });

    const laptop = await Category.findOrCreate({
      where: { name: "Laptop", parentId: electronics[0].id },
      defaults: { name: "Laptop", parentId: electronics[0].id }
    });

    const shirts = await Category.findOrCreate({
      where: { name: "Shirts", parentId: clothing[0].id },
      defaults: { name: "Shirts", parentId: clothing[0].id }
    });

    // Create sub-categories (demonstrating same names under different parents)
    const accessories = await Category.findOrCreate({
      where: { name: "Accessories", parentId: mobile[0].id },
      defaults: { name: "Accessories", parentId: mobile[0].id }
    });

    const laptopAccessories = await Category.findOrCreate({
      where: { name: "Accessories", parentId: laptop[0].id },
      defaults: { name: "Accessories", parentId: laptop[0].id }
    });

    console.log("✅ Categories seeded successfully!");
    console.log(`📊 Created ${await Category.count()} categories`);

  } catch (error) {
    console.error("❌ Category seeding failed:", error);
    throw error;
  }
};
