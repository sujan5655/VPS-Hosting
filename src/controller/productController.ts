import { Product } from "../models/ProductModel.js";
import { Op, Sequelize } from "sequelize";
import { Request,Response } from "express";
import { hasPermission } from "../utils/permission.js";
import cloudinary from "../config/cloudinary.js";
// CREATE PRODUCT
export const createProduct = async (req: any, res: any) => {
  try {
    const { name, price, description, categoryId, stock, sizes } = req.body;

    console.log("📝 Creating product:", {
      name,
      hasFiles: !!req.files,
      filesCount: req.files?.length,
    });

    console.log("RAW FILES:", req.files);

    let images: any[] = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file: any) => ({
        url: file.path || file.secure_url || file.url,
        public_id: file.filename || file.public_id,
        type: file.fieldname || "main",
      }));

      console.log("🖼️ Uploaded Images:", images);
    }

    const parsedSizes =
      typeof sizes === "string" ? JSON.parse(sizes) : sizes || [];

    const product = await Product.create({
      name,
      price,
      description,
      categoryId,
      stock,
      sizes: parsedSizes,
      images,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error,
    });
  }
};
// GET SINGLE PRODUCT
export const getProduct = async (req: any, res: any) => {
  const product = await Product.findByPk(req.params.id, {
    include: ["category"],
  });

  res.json(product);
};


export const getProducts = async (req: any, res: any) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      categoryId,
      gender,
      size,
      sort="newest",
      page=1,
      limit=10
    } = req.query;

    const where: any = {};

    // 🔍 search by name
    // if (search) {
    //   where.name = {
    //     [Op.like]: `%${search}%`,
    //   };
    // }

     // 🔍 SEARCH (name only) - case-insensitive matching using multiple conditions
    if (search) {
      const searchTerm = search.trim();
      const searchTermLower = searchTerm.toLowerCase();
      const searchTermUpper = searchTerm.toUpperCase();
      
      // Match both lowercase and uppercase versions
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${searchTermLower}%`,
          },
        },
        {
          name: {
            [Op.iLike]: `%${searchTermUpper}%`,
          },
        },
        {
          name: {
            [Op.iLike]: `%${searchTerm}%`,
          },
        },
      ];
    }
    // 💰 price filter
    if (minPrice && maxPrice) {
      where.price = {
        [Op.between]: 
        [Number(minPrice), 
          Number(maxPrice)],
      };
    }

    // 📂 category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }
    // 👕 gender filter (inside JSON attributes)
    if (gender) {
      where.attributes = {
        gender: gender,
      };
    }

    // 📏 size filter (JSON array contains check)
    if (size) {
      where.sizes = {
        [Op.contains]: [size],
      };
    }
    //Sorting
    let order:any=[]
    switch (sort) {

      case "price_asc":
        order = [["price", "ASC"]];
        break;

      case "price_desc":
        order = [["price", "DESC"]];
        break;

      case "newest":
      default:
        order = [["createdAt", "DESC"]];
    }

 // 📄 PAGINATION
    const offset =
      (Number(page) - 1) * Number(limit);

    const { rows, count } =
      await Product.findAndCountAll({
        where,
        order,
        limit: Number(limit),
        offset,
        include: ["category"],
      });

   

       res.json({
      success: true,

      data: rows,

      pagination: {
        totalItems: count,
        currentPage: Number(page),
        totalPages: Math.ceil(
          count / Number(limit)
        ),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Filter error",error });
  }
};

// UPDATE PRODUCT


export const updateProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 🔐 Owner OR admin/manager
    if (product.userId !== req.user.id) {

      const canManageAll = await hasPermission(
        req.user.id,
        "manage:products"
      );

      if (!canManageAll) {
        return res.status(403).json({
          message: "Not allowed to update this product",
        });
      }
    }

    // Handle FormData from frontend
    const updateData: any = {};
    
    // Add debug logging to see what we're receiving
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Extract regular fields from FormData with null checks
    if (req.body && req.body.name) updateData.name = req.body.name;
    if (req.body && req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body && req.body.description) updateData.description = req.body.description;
    if (req.body && req.body.stock) updateData.stock = parseInt(req.body.stock);
    if (req.body && req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body && req.body.slug) updateData.slug = req.body.slug;
    
    // Handle sizes array
    if (req.body && req.body.sizes) {
      try {
        updateData.sizes = JSON.parse(req.body.sizes);
      } catch (error) {
        console.error('Error parsing sizes:', error);
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded images:', req.files.length);
      
      // Delete old images from Cloudinary
      if (product.images && Array.isArray(product.images)) {
        for (const oldImg of product.images) {
          if (oldImg?.public_id) {
            try {
              await cloudinary.uploader.destroy(oldImg.public_id);
              console.log('Deleted old image:', oldImg.public_id);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        }
      }

      // Process new images
      const newImages = req.files.map((file: any) => ({
        url: file.path,
        public_id: file.filename,
        type: "images"
      }));

      updateData.images = newImages;
      console.log('New images to add:', newImages);
    }

    console.log('Updating product with data:', updateData);

    await product.update(updateData);

    // Return the updated product
    const updatedProduct = await Product.findByPk(req.params.id);

    res.json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      message: "Update failed",
      error,
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔐 Owner OR admin/manager
    if (product.userId !== req.user.id) {
      const canManageAll = await hasPermission(
        req.user.id,
        "manage:products"
      );

      if (!canManageAll) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to delete this product",
        });
      }
    }

    // ☁️ Delete Cloudinary images safely
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        try {
          if (img?.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary delete error:",
            cloudinaryError
          );
        }
      }
    }

    // 🗑 Delete product
    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};