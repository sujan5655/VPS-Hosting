import { Category } from "../models/CategoryModel.js";
import { sequelize } from "../config/database.js";

export const cleanupDuplicateCategories = async () => {
  try {
    console.log("🧹 Cleaning up exact duplicate categories...");

    // Find all categories
    const allCategories = await Category.findAll({
      order: [['createdAt', 'ASC']]
    });

    // Group by exact combination of name and parentId
    const categoryGroups: { [key: string]: Category[] } = {};
    
    allCategories.forEach(category => {
      const key = `${category.name}_${category.parentId || 'null'}`;
      if (!categoryGroups[key]) {
        categoryGroups[key] = [];
      }
      categoryGroups[key].push(category);
    });

    // Find and remove only exact duplicates (same name AND same parentId)
    let duplicatesRemoved = 0;
    
    for (const [key, categories] of Object.entries(categoryGroups)) {
      if (categories.length > 1) {
        console.log(`Found exact duplicates for: ${key}`);
        // Keep the first category, delete the rest
        const [keep, ...toDelete] = categories;
        
        for (const duplicate of toDelete) {
          console.log(`  Deleting exact duplicate: ${duplicate.name} (${duplicate.id})`);
          await duplicate.destroy();
          duplicatesRemoved++;
        }
      }
    }

    console.log(`✅ Cleanup completed. Removed ${duplicatesRemoved} exact duplicate categories.`);
    console.log(`📝 Note: Categories with same name under different parents are allowed (e.g., Electronics under Mobile and Laptop)`);

  } catch (error) {
    console.error("❌ Category cleanup failed:", error);
    throw error;
  }
};
