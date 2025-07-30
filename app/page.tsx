"use client";

import { useState } from 'react';
import { ChatSidebar, ChatArea, ChatInput } from '@/components/chat';
import { Message, Conversation } from '@/types/chat';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'sample',
      title: 'Markdown Example',
      messages: [
        {
          id: '1',
          content: 'Can you show me how the Nepali Constitution is structured?',
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: '2',
          content: `# Constitution of Nepal Structure

## Preamble
The foundation of the constitution that outlines the vision, goals, and principles.

## Parts and Articles
The constitution is divided into several parts, each containing related articles:

### Part 1: Preliminary
- **Article 1:** Name of the Constitution
- **Article 2:** Territory
- **Article 3:** Nation

### Part 3: Fundamental Rights
Rights include:
* Right to freedom
* Right to equality
* Right against exploitation
* Right to privacy

## Code Example
\`\`\`python
def analyze_constitution(text):
    parts = text.split("PART")
    for part in parts:
        print(f"Found {len(part.split('Article'))-1} articles")
    return parts
\`\`\`

> The Constitution of Nepal is considered one of the most progressive constitutions in South Asia.

Visit the [Nepal Law Commission](https://www.lawcommission.gov.np/) for more details.

---

Does this help explain the structure?`,
          isUser: false,
          timestamp: new Date(),
        }
      ],
      lastMessage: new Date(),
    }
  ]);
  const [activeConversationId, setActiveConversationId] = useState('sample');
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `New Chat`,
      messages: [],
      lastMessage: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? { ...conv, messages: [...conv.messages, userMessage], lastMessage: new Date() }
        : conv
    ));

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:7777/autonomousAIFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:"1234567890"
        },
        body: JSON.stringify({
          data: {
            text: message
          }
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.result[0].text || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date(),
      };

      // Add AI response
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, aiMessage], lastMessage: new Date() }
          : conv
      ));

      // Update conversation title if it's the first message
      if (activeConversation?.messages.length === 1) {
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, title: message.slice(0, 30) + (message.length > 30 ? '...' : '') }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error connecting to the AI. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
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
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        createNewConversation={createNewConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-white">Kanoon-Sathi</h1>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Messages Area */}
        <ChatArea 
          messages={activeConversation?.messages || []}
          isLoading={isLoading}
        />

        {/* Input Area */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}