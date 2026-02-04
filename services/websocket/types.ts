// WebSocket event types for chat

export interface ChatMessage {
  id: string;
  content: string;
  created_at: Date | null;
  updated_at: Date | null;
  parent_message_id: string | null;
  user: {
    id: string;
    name: string | null;
    image_url: string | null;
    role: string | null;
  } | null;
  replies_count?: number;
}

export interface ReactionData {
  id: string;
  message_id: string;
  emoji: string;
  user: {
    id: string;
    name: string | null;
    image_url: string | null;
  };
}

// Server to Client events
export interface ServerToClientEvents {
  new_message: (data: { projectId: string; message: ChatMessage }) => void;
  new_reply: (data: { projectId: string; parentMessageId: string; reply: ChatMessage }) => void;
  new_reaction: (data: { projectId: string; messageId: string; reaction: ReactionData }) => void;
  reaction_removed: (data: { projectId: string; messageId: string; reactionId: string; emoji: string; userId: string }) => void;
  error: (data: { message: string }) => void;
  joined_project: (data: { projectId: string }) => void;
  left_project: (data: { projectId: string }) => void;
}

// Client to Server events
export interface ClientToServerEvents {
  join_project: (projectId: string) => void;
  leave_project: (projectId: string) => void;
}

// Socket data (attached to socket instance)
export interface SocketData {
  userId: string;
  joinedProjects: Set<string>;
}
