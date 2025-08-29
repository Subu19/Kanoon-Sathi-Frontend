"use client";

import { useState, useEffect } from 'react';
import { ChatSidebar, ChatArea, ChatInput } from '@/components/chat';
import { Message, Conversation } from '@/types/chat';
import Image from 'next/image';

// Helper function to extract a title from the message content
const extractTitleFromMessage = (content: string): string => {
  // Try to get the first line or first 30 characters for a title
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length === 0) return 'New Chat';
  
  // Remove markdown headers if present
  const withoutHeaders = firstLine.replace(/^#+\s+/, '');
  
  // Truncate if too long
  return withoutHeaders.length > 30 
    ? withoutHeaders.substring(0, 30) + '...'
    : withoutHeaders;
};

// Helper function to truncate message for preview
const truncateMessage = (content: string): string => {
  // Remove markdown and truncate
  const plainText = content
    .replace(/#+\s+/g, '') // Remove headers
    .replace(/\*\*/g, '')  // Remove bold
    .replace(/\*/g, '')    // Remove italic
    .replace(/`{3}[\s\S]*`{3}/g, '[Code Block]') // Replace code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code ticks but keep content
    .trim();
    
  return plainText.length > 60
    ? plainText.substring(0, 60) + '...'
    : plainText;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Fetch conversation list on component mount
  useEffect(() => {
    fetchConversationList();
    // We want this to run only once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch chat history when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      fetchChatHistory(activeConversationId);
    }
  }, [activeConversationId]);

  // Fetch all conversations
  const fetchConversationList = async () => {
    try {
      const response = await fetch('http://localhost:7777/getConversationList', {
        method: 'POST',  // Changed to GET as per API documentation
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '1234567890'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      
      // Transform API response to our Conversation type
      const conversationList = data.result.map((item: any) => ({
        id: item.chatroomId,
        title: extractTitleFromMessage(item.lastMessage.content),
        messages: [],
        lastMessage: new Date(), // We don't have timestamp in the response, use current date
        lastMessageText: truncateMessage(item.lastMessage.content)
      }));

      setConversations(conversationList);
      
      // Set the first conversation as active if we have conversations and none is active
      if (conversationList.length > 0 && !activeConversationId) {
        setActiveConversationId(conversationList[0].id);
      }

      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error fetching conversation list:', error);
      setIsInitialLoading(false);
    }
  };

  // Fetch chat history for a specific conversation
  const fetchChatHistory = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:7777/getChatHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '1234567890'
        },
        body: JSON.stringify({
          data:{
          chatroomId: conversationId
        }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      
      // Transform API messages to our Message type
      const messages: Message[] = data.result.map((apiMsg: any, index: number) => ({
        id: `hist-${index}`,
        content: apiMsg.content,
        isUser: apiMsg.role === 'user',
        timestamp: new Date() // We don't have timestamp from API, use current date
      }));

      // Update the conversation with fetched messages
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages }
          : conv
      ));
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    // We'll create a conversation on the server when the first message is sent
    // For now, just create a local temporary conversation
    const tempId = `temp-${Date.now()}`;
    const newConversation: Conversation = {
      id: tempId,
      title: `New Chat`,
      messages: [],
      lastMessage: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(tempId);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const timestamp = new Date();
    const messageId = Date.now().toString();
    
    // Create a new conversation if none is active
    let currentConversationId = activeConversationId;
    if (!currentConversationId) {
      const tempId = `temp-${Date.now()}`;
      const newConversation: Conversation = {
        id: tempId,
        title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [],
        lastMessage: timestamp,
      };
      setConversations(prev => [newConversation, ...prev]);
      currentConversationId = tempId;
      setActiveConversationId(tempId);
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
      const response = await fetch('http://localhost:7777/autonomousAIFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '1234567890'
        },
        body: JSON.stringify({
          data:{
            chatroomId: currentConversationId,
            text: message
        }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        // The API returns markdown content directly in the result field
        content: data.result || 'Sorry, I couldn\'t process your request.',
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
              lastMessageText: aiMessage.content.substring(0, 50) + (aiMessage.content.length > 50 ? '...' : '')
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
          disabled={isInitialLoading || !activeConversationId}
        />
      </div>
    </div>
  );
}