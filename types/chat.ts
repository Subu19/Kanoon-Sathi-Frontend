export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage?: Date;
  lastMessageText?: string;
}

export interface ApiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ConversationListResponse {
  result: {
    chatroomId: string;
    lastMessage: {
      role: "user" | "model" | "system";
      content: string;
    };
  }[];
}

export interface ChatHistoryResponse {
  result: ApiMessage[];
}

// New authenticated chat types based on API documentation
export interface AuthenticatedMessage {
  id: string;
  chat_id: string;
  sender: 'user' | 'model' | 'system';
  content: string;
  created_at: string;
}

export interface AuthenticatedChat {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messageCount?: number;
  lastMessage?: AuthenticatedMessage;
  messages?: AuthenticatedMessage[];
}

export interface AuthenticatedChatsResponse {
  data: AuthenticatedChat[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface AuthenticatedChatResponse {
  data: AuthenticatedChat;
}

export interface AuthenticatedMessagesResponse {
  data: AuthenticatedMessage[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}
