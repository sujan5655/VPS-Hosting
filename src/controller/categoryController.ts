import { Category } from "../models/CategoryModel.js";

// CREATE CATEGORY
export const createCategory = async (req: any, res: any) => {
  try {
    const { name, parentId } = req.body;

    // Validate parent category exists if parentId is provided
    if (parentId && parentId !== "" && parentId !== null) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    // Check for exact duplicate (same name AND same parentId)
    const existing = await Category.findOne({ 
      where: { 
        name, 
        parentId: parentId || null 
      } 
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists under this parent",
      });
    }

    const category = await Category.create({
      name,
      parentId: parentId || null,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// GET ALL CATEGORIES (TREE STRUCTURE)
export const getCategories = async (req: any, res: any) => {
  try {
    const categories = await Category.findAll();

    const list = categories.map((c: any) => c.toJSON());

    const buildTree = (parentId: string | null = null): any => {
      return list
        .filter((item) => item.parentId === parentId)
        .map((item: any): any => ({
          ...item,
          children: buildTree(item.id), // 🔥 recursion happens here
        }));
    };

    const tree = buildTree(null);

    return res.status(200).json(tree);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    });
  }
};
// GET SINGLE CATEGORY
export const getCategory = async (req: any, res: any) => {
  const category = await Category.findByPk(req.params.id, {
    include: ["children"],
  });

  res.json(category);
};

// DELETE CATEGORY
export const deleteCategory = async (req: any, res: any) => {
  await Category.destroy({
    where: { id: req.params.id },
  });

  res.json({ message: "Deleted successfully" });
};
