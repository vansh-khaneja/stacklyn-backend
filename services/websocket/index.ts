import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "../../config/db";
import { verifyProjectAccess } from "../../utils/authorization.utils";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  ChatMessage,
  ReactionData,
} from "./types";

let io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData> | null = null;

// Get room name for a project
const getProjectRoom = (projectId: string) => `project:${projectId}`;

// Initialize Socket.IO server
export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://api.stacklyn.vanshkhaneja.com",
        "https://stacklyn.vanshkhaneja.com",
        "https://stacklyn.yashverma.site",
        "https://stacklyn-app.vercel.app",
        "http://192.168.1.6:3000",
      ],
      credentials: true,
    },
    path: "/socket.io",
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify Clerk token
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      if (!verifiedToken || !verifiedToken.sub) {
        return next(new Error("Invalid token"));
      }

      // Get Clerk user to find email
      const clerkUser = await clerkClient.users.getUser(verifiedToken.sub);
      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;

      if (!email) {
        return next(new Error("User email not found"));
      }

      // Find database user by email
      const dbUser = await prisma.users.findUnique({
        where: { email }
      });

      if (!dbUser) {
        return next(new Error("User not found in database"));
      }

      // Attach database user ID to socket (not Clerk ID)
      socket.data.userId = dbUser.id;
      socket.data.joinedProjects = new Set();
      
      next();
    } catch (error) {
      console.error("WebSocket auth error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.data.userId}`);

    // Join project room
    socket.on("join_project", async (projectId: string) => {
      try {
        // Verify user has access to this project
        const hasAccess = await verifyProjectAccess(socket.data.userId, projectId);
        
        if (!hasAccess) {
          socket.emit("error", { message: "Access denied to this project" });
          return;
        }

        const room = getProjectRoom(projectId);
        socket.join(room);
        socket.data.joinedProjects.add(projectId);
        socket.emit("joined_project", { projectId });
        
        console.log(`📥 User ${socket.data.userId} joined room: ${room}`);
      } catch (error) {
        console.error("Error joining project room:", error);
        socket.emit("error", { message: "Failed to join project" });
      }
    });

    // Leave project room
    socket.on("leave_project", (projectId: string) => {
      const room = getProjectRoom(projectId);
      socket.leave(room);
      socket.data.joinedProjects.delete(projectId);
      socket.emit("left_project", { projectId });
      
      console.log(`📤 User ${socket.data.userId} left room: ${room}`);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.data.userId}`);
    });
  });

  console.log("🔌 WebSocket server initialized");
  return io;
};

// Get Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error("WebSocket not initialized. Call initializeWebSocket first.");
  }
  return io;
};

// Emit new message to project room
export const emitNewMessage = (projectId: string, message: ChatMessage) => {
  if (!io) return;
  
  const room = getProjectRoom(projectId);
  io.to(room).emit("new_message", { projectId, message });
  console.log(`📨 Emitted new_message to room: ${room}`);
};

// Emit new reply to project room
export const emitNewReply = (projectId: string, parentMessageId: string, reply: ChatMessage) => {
  if (!io) return;
  
  const room = getProjectRoom(projectId);
  io.to(room).emit("new_reply", { projectId, parentMessageId, reply });
  console.log(`📨 Emitted new_reply to room: ${room}`);
};

// Emit new reaction to project room
export const emitNewReaction = (projectId: string, messageId: string, reaction: ReactionData) => {
  if (!io) return;
  
  const room = getProjectRoom(projectId);
  io.to(room).emit("new_reaction", { projectId, messageId, reaction });
  console.log(`📨 Emitted new_reaction to room: ${room}`);
};

// Emit reaction removed to project room
export const emitReactionRemoved = (
  projectId: string,
  messageId: string,
  reactionId: string,
  emoji: string,
  userId: string
) => {
  if (!io) return;
  
  const room = getProjectRoom(projectId);
  io.to(room).emit("reaction_removed", { projectId, messageId, reactionId, emoji, userId });
  console.log(`📨 Emitted reaction_removed to room: ${room}`);
};
