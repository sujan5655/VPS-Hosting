import { io } from "socket.io-client";

type ConnectionRequestPayload = {
  from: string;
  connectionId: string;
  message?: string;
};

type ConnectionAcceptedPayload = {
  by: string;
  connectionId: string;
};

const socket = io("http://localhost:5000");

// replace with real user UUID from DB (must match JWT user id for rooms)
const userId = "5b960154-186a-4ade-be04-bb2b4c8aec12";

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join", userId.trim().toLowerCase());
});

socket.on("connection:request", (data: ConnectionRequestPayload) => {
  console.log("🔔 New connection request:", data);
});

socket.on("connection:accepted", (data: ConnectionAcceptedPayload) => {
  console.log("✅ Connection accepted:", data);
});
