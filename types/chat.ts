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
