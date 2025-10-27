import {
  AuthenticatedChat,
  AuthenticatedChatsResponse,
  AuthenticatedChatResponse,
  AuthenticatedMessage,
  AuthenticatedMessagesResponse,
} from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const GENKIT_BASE_URL = process.env.NEXT_PUBLIC_GENKIT_BASE_URL || 'http://localhost:7777';

class ChatApiService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Authenticated chat operations (REST API)
  async getChats(token: string, limit = 50, offset = 0): Promise<AuthenticatedChatsResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/chats?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  }

  async createChat(token: string, title?: string): Promise<AuthenticatedChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(title ? { title } : {}),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  }

  async getChat(token: string, chatId: string): Promise<AuthenticatedChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    return response.json();
  }

  async updateChatTitle(token: string, chatId: string, title: string): Promise<AuthenticatedChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to update chat title');
    }

    return response.json();
  }

  async deleteChat(token: string, chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  }

  async getChatMessages(
    token: string,
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<AuthenticatedMessagesResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }

  async addMessage(
    token: string,
    chatId: string,
    content: string,
    sender: 'user' | 'model' | 'system' = 'user'
  ): Promise<{ data: AuthenticatedMessage }> {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ content, sender }),
    });

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  }

  // AI assistant operations (GenKit Flow API)
  async sendToAI(text: string, chatroomId: string, userId?: string): Promise<string> {
    const requestBody = {
      data: {
        text,
        chatroomId,
        ...(userId && { userId }),
      },
    };

    const response = await fetch(`${GENKIT_BASE_URL}/autonomousAIFlow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.result;
  }

  // Guest chat operations (GenKit Flow API)
  async getGuestChatHistory(chatroomId: string): Promise<{ role: string; content: string }[]> {
    const response = await fetch(`${GENKIT_BASE_URL}/getChatHistory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { chatroomId },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    const data = await response.json();
    return data.result;
  }

  async getGuestConversationList(): Promise<{
    chatroomId: string;
    lastMessage: { role: string; content: string };
  }[]> {
    const response = await fetch(`${GENKIT_BASE_URL}/getConversationList`);

    if (!response.ok) {
      throw new Error('Failed to fetch conversation list');
    }

    const data = await response.json();
    return data.result;
  }
}

export const chatApiService = new ChatApiService();
