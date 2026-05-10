import { Request, Response } from "express";
import { SellerApplication } from "../models/SellerApplication.js";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { UserRole } from "../models/UserRole.js";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Submit seller application
 */
export const submitSellerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      businessName,
      businessDescription,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId
    } = req.body;

    // Validate required fields
    if (!businessName || !businessDescription || !businessEmail) {
      return res.status(400).json({
        success: false,
        message: "Business name, description, and email are required"
      });
    }

    // Check if user already has a pending or approved application
    const existingApplication = await SellerApplication.findOne({
      where: {
        userId,
        status: ['pending', 'approved']
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: existingApplication.status === 'pending' 
          ? "You already have a pending application"
          : "You are already approved as a seller"
      });
    }

    // Create new seller application
    const application = await SellerApplication.create({
      userId,
      businessName,
      businessDescription,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId
    });

    res.status(201).json({
      success: true,
      message: "Seller application submitted successfully",
      data: application
    });

  } catch (error) {
    console.error("Error submitting seller application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Get all seller applications (for admin)
 */
export const getAllSellerApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: applications } = await SellerApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      message: "Seller applications retrieved successfully",
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalApplications: count,
          pageSize: Number(limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching seller applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Get seller application by ID
 */
export const getSellerApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await SellerApplication.findByPk(id as string, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found"
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error("Error fetching seller application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Approve seller application
 */
export const approveSellerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const application = await SellerApplication.findByPk(id as string);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found"
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Application has already been processed"
      });
    }

    // Get seller role
    const sellerRole = await Role.findOne({ where: { name: 'seller' } });
    if (!sellerRole) {
      return res.status(500).json({
        success: false,
        message: "Seller role not found"
      });
    }

    // Assign seller role to user
    await UserRole.findOrCreate({
      where: { 
        userId: application.userId, 
        roleId: sellerRole.id 
      },
      defaults: {
        userId: application.userId,
        roleId: sellerRole.id
      }
    });

    // Update application status
    await application.update({
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Seller application approved successfully",
      data: application
    });

  } catch (error) {
    console.error("Error approving seller application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Reject seller application
 */
export const rejectSellerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?.id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const application = await SellerApplication.findByPk(id as string);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Seller application not found"
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Application has already been processed"
      });
    }

    // Update application status
    await application.update({
      status: 'rejected',
      rejectionReason,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Seller application rejected successfully",
      data: application
    });

  } catch (error) {
    console.error("Error rejecting seller application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * Get user's seller application status
 */
export const getMySellerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const application = await SellerApplication.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No seller application found"
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error("Error fetching seller application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
