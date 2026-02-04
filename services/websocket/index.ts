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
  OnlineUser,
  NotificationData,
} from "./types";
import { notificationService, Notification } from "../../modules/notifications/notification.service";

let io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData> | null = null;

// Track online users per project: projectId -> Map<userId, OnlineUser>
const projectOnlineUsers = new Map<string, Map<string, OnlineUser>>();

// Track all online users globally (site-wide): userId -> OnlineUser
const globalOnlineUsers = new Map<string, OnlineUser>();

// Track socket IDs by user ID for direct messaging
const userSockets = new Map<string, Set<string>>();

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

      // Attach database user info to socket
      socket.data.userId = dbUser.id;
      socket.data.userName = dbUser.name;
      socket.data.userImageUrl = dbUser.image_url;
      socket.data.joinedProjects = new Set();
      
      next();
    } catch (error) {
      console.error("WebSocket auth error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", async (socket) => {
    console.log(`🔌 User connected: ${socket.data.userId}`);

    // Track this socket for the user
    if (!userSockets.has(socket.data.userId)) {
      userSockets.set(socket.data.userId, new Set());
    }
    userSockets.get(socket.data.userId)!.add(socket.id);

    // Create user info for global tracking
    const globalUserInfo: OnlineUser = {
      id: socket.data.userId,
      name: socket.data.userName,
      image_url: socket.data.userImageUrl,
    };

    // Send current global online users to the connecting user
    socket.emit("global_online_users", { 
      users: Array.from(globalOnlineUsers.values()) 
    });

    // Add user to global online users (if not already there from another tab)
    if (!globalOnlineUsers.has(socket.data.userId)) {
      globalOnlineUsers.set(socket.data.userId, globalUserInfo);
      // Broadcast to all other users that this user came online
      socket.broadcast.emit("user_online", { user: globalUserInfo });
    }

    // Send pending notifications from Redis
    try {
      const pendingNotifications = await notificationService.getNotifications(socket.data.userId);
      if (pendingNotifications.length > 0) {
        socket.emit("pending_notifications", { notifications: pendingNotifications as NotificationData[] });
        console.log(`📬 Sent ${pendingNotifications.length} pending notifications to ${socket.data.userId}`);
      }
    } catch (error) {
      console.error("Failed to fetch pending notifications:", error);
    }

    console.log(`👥 Global online users: ${globalOnlineUsers.size}`);

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

        // Create user info object
        const userInfo: OnlineUser = {
          id: socket.data.userId,
          name: socket.data.userName,
          image_url: socket.data.userImageUrl,
        };

        // Initialize project's online users map if needed
        if (!projectOnlineUsers.has(projectId)) {
          projectOnlineUsers.set(projectId, new Map());
        }

        // Get current online users BEFORE adding this user
        const currentOnlineUsers = Array.from(projectOnlineUsers.get(projectId)!.values());

        // Add this user to project's online users
        projectOnlineUsers.get(projectId)!.set(socket.data.userId, userInfo);

        // Send current online users list to the joining user
        socket.emit("project_online_users", { 
          projectId, 
          users: currentOnlineUsers 
        });

        // Broadcast to others in the room that this user joined
        socket.to(room).emit("user_joined_project", { 
          projectId, 
          user: userInfo 
        });

        socket.emit("joined_project", { projectId });
        
        console.log(`📥 User ${socket.data.userId} joined room: ${room} (${projectOnlineUsers.get(projectId)!.size} online)`);
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

      // Remove user from project's online users
      if (projectOnlineUsers.has(projectId)) {
        projectOnlineUsers.get(projectId)!.delete(socket.data.userId);
        
        // Clean up empty projects
        if (projectOnlineUsers.get(projectId)!.size === 0) {
          projectOnlineUsers.delete(projectId);
        }
      }

      // Broadcast to others that user left
      socket.to(room).emit("user_left_project", { 
        projectId, 
        userId: socket.data.userId 
      });

      socket.emit("left_project", { projectId });
      
      console.log(`📤 User ${socket.data.userId} left room: ${room}`);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      // Remove this socket from user's socket set
      const socketSet = userSockets.get(socket.data.userId);
      if (socketSet) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          userSockets.delete(socket.data.userId);
        }
      }

      // Remove user from all projects they were in
      socket.data.joinedProjects.forEach((projectId) => {
        const room = getProjectRoom(projectId);
        
        // Remove from online tracking
        if (projectOnlineUsers.has(projectId)) {
          projectOnlineUsers.get(projectId)!.delete(socket.data.userId);
          
          // Clean up empty projects
          if (projectOnlineUsers.get(projectId)!.size === 0) {
            projectOnlineUsers.delete(projectId);
          }
        }

        // Broadcast to project room that user went offline
        io?.to(room).emit("user_left_project", { 
          projectId, 
          userId: socket.data.userId 
        });
      });

      // Check if user has any other active connections (multiple tabs)
      const remainingSockets = userSockets.get(socket.data.userId);

      // If no other connections, remove from global online users
      if (!remainingSockets || remainingSockets.size === 0) {
        globalOnlineUsers.delete(socket.data.userId);
        // Broadcast to everyone that this user went offline
        socket.broadcast.emit("user_offline", { userId: socket.data.userId });
        console.log(`👋 User ${socket.data.userId} is now offline (${globalOnlineUsers.size} online)`);
      }

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

// Send notification to a specific user via WebSocket (for real-time alert)
export const emitNotificationToUser = (userId: string, notification: NotificationData) => {
  if (!io) return;
  
  const socketIds = userSockets.get(userId);
  if (socketIds && socketIds.size > 0) {
    // User is online, send to all their sockets (tabs)
    socketIds.forEach((socketId) => {
      io?.to(socketId).emit("notification", notification);
    });
    console.log(`🔔 Sent notification to user ${userId} (${socketIds.size} sockets)`);
    return true;
  }
  
  // User is offline, notification is already in Redis
  console.log(`📭 User ${userId} is offline, notification stored in Redis`);
  return false;
};

// Check if a user is currently online
export const isUserOnline = (userId: string): boolean => {
  return globalOnlineUsers.has(userId);
};

// Get all online user IDs
export const getOnlineUserIds = (): string[] => {
  return Array.from(globalOnlineUsers.keys());
};
