import { Response } from "express";
import { AuthRequest, hasPermission } from "../middleware/rbac";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { validate as isUUID } from "uuid";

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Permission check
    if (!hasPermission(user, "create:post")) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const { title, content, tags, status } = req.body;

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const files = req.files as Express.Multer.File[];

const images = files?.length
  ? files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      alt: String(title),
      order: index,
    }))
  : [];

    const post = await Post.create({
      title,
      content,
      tags: tags || [],
      status: status || "draft",
      images,
      userId: user.id,
    });

    const author = await User.findByPk(user.id, {
      attributes: ["id", "name", "email"],
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        ...post.toJSON(),
        author: {
          id:user.id,
          name:user.name,
          email:user.email
        },
      },
    });

  } catch (error) {
    console.error("Create Post Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || !isUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id"
      });
    }

    const post = await Post.findByPk(id as string);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ADMIN override
    if (hasPermission(user, "manage:post")) {
      await post.update(req.body);
      return res.json({ success: true, data: post });
    }

    // OWNERSHIP check
    if (
      hasPermission(user, "update:own-post") &&
      post.userId === user.id
    ) {
      await post.update(req.body);
      return res.json({ success: true, data: post });
    }

    return res.status(403).json({
      success: false,
      message: "You are not allowed to update this post"
    });
return res.status(200).json({response:post,message:"Post updated successfully"})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const posts = await Post.findAll({
      where: { isActive: true },
      include: [{ model: User, as: "author" }],
    });

    return res.json({
      success: true,
      data: posts,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};



export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const post = await Post.findByPk(id as string);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 👑 ADMIN override (delete everything)
    if (hasPermission(user, "delete:post") || hasPermission(user, "manage:post")) {
      await post.destroy();
      return res.json({
        success: true,
        message: "Post deleted successfully (admin)",
      });
    }

    // 👤 OWNERSHIP delete
    if (
      hasPermission(user, "delete:own-post") &&
      post.userId === user.id
    ) {
      await post.destroy();
      return res.json({
        success: true,
        message: "Post deleted successfully",
      });
    }

    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this post",
    });

  } catch (error) {
    console.error("Delete Post Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};