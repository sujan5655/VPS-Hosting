import { Response } from "express";
import { AuthRequest, hasPermission } from "../middleware/rbac";
import { Profile } from "../models/Profile";
import { Op } from "sequelize";
import { User } from "../models/User";
export const createProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existing = await Profile.findOne({
      where: { userId: user.id },
    });

    if (existing) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    // 🔥 IMAGE FROM MULTER (Cloudinary)
    const file = req.file as Express.Multer.File | undefined;

    const profileImage = file
      ? {
          url: file.path,
          alt: req.body.name || "profile image",
        }
      : null;

    const profile = await Profile.create({
      ...req.body,
      profileImage,
      userId: user.id,
    });

    return res.status(201).json({
      success: true,
      data: profile,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const profile = await Profile.findOne({
      where: { userId: user.id },
      include: ["owner"],
    });

    return res.json({
      success: true,
      data: profile,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { userId } = req.params;

    const profile = await Profile.findOne({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 🔥 FILE from multer (Cloudinary)
    const file = req.file as Express.Multer.File | undefined;

    const profileImage = file
      ? {
          url: file.path,
          alt: req.body.name || "profile image",
        }
      : profile.profileImage;

    const updateData = {
      ...req.body,
      profileImage,
    };

    // 👑 ADMIN
    if (hasPermission(user, "manage:profile") || hasPermission(user, "update:profile")) {
      await profile.update(updateData);

      return res.json({
        success: true,
        data: profile,
      });
    }

    // 👤 OWN PROFILE
    if (
      hasPermission(user, "update:own-profile") &&
      user.id === userId
    ) {
      await profile.update(updateData);

      return res.json({
        success: true,
        data: profile,
      });
    }

    return res.status(403).json({ message: "Not allowed" });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { userId } = req.params;

    const profile = await Profile.findOne({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 👑 Admin OR Owner check
    const isAdmin = hasPermission(user, "manage:profile");
    const isOwner = user.id === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Not allowed to delete this profile",
      });
    }

    await profile.destroy();

    return res.json({
      success: true,
      message: "Profile deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};




export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const like = `%${query}%`;
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: like } },
          { email: { [Op.iLike]: like } },
        ],
      },
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Profile,
          as: "profile",
        },
      ],
    });

    return res.json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};