import { Server } from "socket.io";
import http from "http";

let io: Server;

/** Same string must be used for join + io.to() — UUID casing was breaking delivery. */
export function socketRoomId(raw: unknown) {
  return String(raw ?? "").trim().toLowerCase();
}

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId: unknown) => {
      const room = socketRoomId(userId);
      if (!room) return;
      socket.join(room);
      console.log(`User joined room "${room}"`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};