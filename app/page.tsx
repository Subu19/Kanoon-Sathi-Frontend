"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChatSidebar, ChatArea, ChatInput } from '@/components/chat';
import { Message, Conversation, AuthenticatedChat, AuthenticatedMessage } from '@/types/chat';
import { useAuth } from '@/contexts/auth-context';
import { chatApiService } from '@/lib/chat-api';
import Image from 'next/image';

// Helper function to extract a title from the message content
const extractTitleFromMessage = (content: string): string => {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length === 0) return 'New Chat';
  
  const withoutHeaders = firstLine.replace(/^#+\s+/, '');
  return withoutHeaders.length > 30 
    ? withoutHeaders.substring(0, 30) + '...'
    : withoutHeaders;
};

// Helper function to truncate message for preview
const truncateMessage = (content: string): string => {
  const plainText = content
    .replace(/#+\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{3}[\s\S]*`{3}/g, '[Code Block]')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
    
  return plainText.length > 60
    ? plainText.substring(0, 60) + '...'
    : plainText;
};

// Convert authenticated chat to conversation format
const convertAuthChatToConversation = (chat: AuthenticatedChat): Conversation => {
  const messages: Message[] = (chat.messages || []).map((msg) => ({
    id: msg.id,
    content: msg.content,
    isUser: msg.sender === 'user',
    timestamp: new Date(msg.created_at),
  }));

  return {
    id: chat.id,
    title: chat.title || extractTitleFromMessage(chat.lastMessage?.content || 'New Chat'),
    messages,
    lastMessage: chat.lastMessage ? new Date(chat.lastMessage.created_at) : new Date(chat.updated_at),
    lastMessageText: chat.lastMessage ? truncateMessage(chat.lastMessage.content) : '',
  };
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const { user, isAuthenticated, token, isLoading: authLoading } = useAuth();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const loadConversations = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      if (isAuthenticated && token) {
        // Load authenticated user's chats
        const response = await chatApiService.getChats(token);
        const convs = response.data.map(convertAuthChatToConversation);
        setConversations(convs);
        
        if (convs.length > 0 && !activeConversationId) {
          setActiveConversationId(convs[0].id);
        }
      } else {
        // Load guest conversations
        const guestConvs = await chatApiService.getGuestConversationList();
        const convs = guestConvs.map((item) => ({
          id: item.chatroomId,
          title: extractTitleFromMessage(item.lastMessage.content),
          messages: [],
          lastMessage: new Date(),
          lastMessageText: truncateMessage(item.lastMessage.content)
        }));
        
        setConversations(convs);
        
        if (convs.length > 0 && !activeConversationId) {
          setActiveConversationId(convs[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, token, activeConversationId]);

  const loadChatHistory = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated && token) {
        // Load authenticated chat with messages
        const response = await chatApiService.getChat(token, conversationId);
        const conv = convertAuthChatToConversation(response.data);
        
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? conv : c
        ));
      } else {
        // Load guest chat history
        const history = await chatApiService.getGuestChatHistory(conversationId);
        const messages: Message[] = history.map((msg, index) => ({
          id: `hist-${index}`,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date()
        }));

        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, messages }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Load conversations when auth state changes or on mount
  useEffect(() => {
    if (!authLoading) {
      loadConversations();
    }
  }, [authLoading, loadConversations]);

  // Fetch chat history when activeConversationId changes
  useEffect(() => {
    if (activeConversationId && !isInitialLoading) {
      loadChatHistory(activeConversationId);
    }
  }, [activeConversationId, isInitialLoading, loadChatHistory]);

  const createNewConversation = async () => {
    if (isAuthenticated && token) {
      // Create authenticated chat
      try {
        const response = await chatApiService.createChat(token);
        const newConv = convertAuthChatToConversation(response.data);
        
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    } else {
      // Create temporary conversation for guests
      const tempId = `temp-${Date.now()}`;
      const newConversation: Conversation = {
        id: tempId,
        title: 'New Chat',
        messages: [],
        lastMessage: new Date(),
      };
      setConversations([newConversation, ...conversations]);
      setActiveConversationId(tempId);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const timestamp = new Date();
    const messageId = Date.now().toString();
    
    // Create a new conversation if none is active
    let currentConversationId = activeConversationId;
    if (!currentConversationId) {
      if (isAuthenticated && token) {
        try {
          const response = await chatApiService.createChat(token, extractTitleFromMessage(message));
          const newConv = convertAuthChatToConversation(response.data);
          setConversations(prev => [newConv, ...prev]);
          currentConversationId = newConv.id;
          setActiveConversationId(newConv.id);
        } catch (error) {
          console.error('Error creating chat:', error);
          return;
        }
      } else {
        const tempId = `temp-${Date.now()}`;
        const newConversation: Conversation = {
          id: tempId,
          title: extractTitleFromMessage(message),
          messages: [],
          lastMessage: timestamp,
        };
        setConversations(prev => [newConversation, ...prev]);
        currentConversationId = tempId;
        setActiveConversationId(tempId);
      }
    }

    const userMessage: Message = {
      id: messageId,
      content: message,
      isUser: true,
      timestamp,
    };

    // Add user message to UI immediately
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage], 
            lastMessage: timestamp,
            lastMessageText: message
          }
        : conv
    ));

    setIsLoading(true);

    try {

      // Get AI response
      const aiResponse = await chatApiService.sendToAI(
        message, 
        currentConversationId, 
        isAuthenticated ? user?.id : undefined
      );
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      // Add AI response to the conversation
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiMessage], 
              lastMessage: new Date(),
              lastMessageText: truncateMessage(aiResponse)
            }
          : conv
      ));
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, there was an error connecting to the AI. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId || ''}
        setActiveConversationId={setActiveConversationId}
        createNewConversation={createNewConversation}
        isLoading={isInitialLoading}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Image height={32} width={32} src="/avatar.png" alt="Bot Avatar" className="rounded-full" />
            <h1 className="font-medium text-white">Kanoon-Sathi</h1>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          {isAuthenticated && (
            <div className="text-sm text-white/60">
              Signed in as {user?.username}
            </div>
          )}
        </div>

        {/* Messages Area */}
        {isInitialLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-white/60">Loading conversations...</p>
            </div>
          </div>
        ) : (
          <ChatArea 
            messages={activeConversation?.messages || []}
            isLoading={isLoading}
          />
        )}

        {/* Input Area */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={isInitialLoading}
        />
      </div>
    </div>
  );
}