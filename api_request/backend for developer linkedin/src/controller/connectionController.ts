import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/rbac";
import { Connection } from "../models/Connection";
import { getIO, socketRoomId } from "../utils/socket";

/** Raw + lowercase UUID so DB rows match regardless of casing. */
function userIdVariants(raw: unknown): string[] {
  const s = String(raw ?? "").trim();
  const n = socketRoomId(s);
  return [s, n].filter((v, i, a) => a.indexOf(v) === i);
}

function sameUserId(a: string, b: string) {
  return socketRoomId(a) === socketRoomId(b);
}

/** List pending requests where you are the recipient (for UI + refresh). */
export const getMyPendingIncoming = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await Connection.findAll({
      where: {
        status: "pending",
        recipientId: { [Op.in]: userIdVariants(req.user.id) },
      },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendConnectionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = socketRoomId(req.user.id);
    const recipientId = socketRoomId(req.body.recipientId ?? "");
    const { message } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    if (sameUserId(requesterId, recipientId)) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    // check existing request
    const existing = await Connection.findOne({
      where: {
        requesterId,
        recipientId,
        status: "pending",
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    const connection = await Connection.create({
      requesterId,
      recipientId,
      message,
      status: "pending",
    });

    // 🔥 SOCKET EMIT
    const io = getIO();

    io.to(recipientId).emit("connection:request", {
      from: requesterId,
      connectionId: connection.id,
      message,
    });

    return res.status(201).json({
      success: true,
      data: connection,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const acceptConnection = async (req: AuthRequest, res: Response) => {
  try {
    const recipientId = req.user.id;
    const connectionId = String(req.body?.connectionId ?? "").trim();

    if (!connectionId) {
      return res.status(400).json({ message: "connectionId is required" });
    }

    // One query: pending invite for this user only (avoids UUID string edge cases)
    const connection = await Connection.findOne({
      where: {
        id: connectionId,
        status: "pending",
        recipientId: { [Op.in]: userIdVariants(recipientId) },
      },
    });

    if (!connection) {
      return res.status(404).json({
        message:
          "Invitation not found, or you are not the recipient, or it is no longer pending",
      });
    }

    connection.status = "accepted";
    connection.connectedAt = new Date();

    await connection.save();

    const io = getIO();

    io.to(socketRoomId(connection.requesterId)).emit("connection:accepted", {
      by: recipientId,
      connectionId: connection.id,
    });

    return res.json({
      success: true,
      data: connection,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectConnection = async (req: AuthRequest, res: Response) => {
  try {
    const recipientId = req.user.id;
    const connectionId = String(req.body?.connectionId ?? "").trim();

    if (!connectionId) {
      return res.status(400).json({ message: "connectionId is required" });
    }

    const connection = await Connection.findOne({
      where: {
        id: connectionId,
        status: "pending",
        recipientId: { [Op.in]: userIdVariants(recipientId) },
      },
    });

    if (!connection) {
      return res.status(404).json({
        message:
          "Invitation not found, or you are not the recipient, or it is no longer pending",
      });
    }

    connection.status = "rejected";
    await connection.save();

    const io = getIO();

    io.to(socketRoomId(connection.requesterId)).emit("connection:rejected", {
      by: recipientId,
      connectionId: connection.id,
    });

    return res.json({
      success: true,
      message: "Connection rejected",
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const cancelConnection = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = req.user.id;
    const connectionId = String(req.body?.connectionId ?? "").trim();

    if (!connectionId) {
      return res.status(400).json({ message: "connectionId is required" });
    }

    const connection = await Connection.findOne({
      where: {
        id: connectionId,
        status: "pending",
        requesterId: { [Op.in]: userIdVariants(requesterId) },
      },
    });

    if (!connection) {
      return res.status(404).json({
        message:
          "Invitation not found, or you are not the requester, or it is no longer pending",
      });
    }

    connection.status = "withdrawn";
    await connection.save();

    const io = getIO();

    io.to(socketRoomId(connection.recipientId)).emit("connection:cancelled", {
      by: requesterId,
      connectionId: connection.id,
    });

    return res.json({
      success: true,
      message: "Request cancelled",
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};