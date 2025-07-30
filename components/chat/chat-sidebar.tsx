import { Plus, User } from 'lucide-react';
import { ConversationList } from './conversation-list';
import { Conversation } from '@/types/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  createNewConversation: () => void;
}

export function ChatSidebar({ 
  conversations, 
  activeConversationId, 
  setActiveConversationId,
  createNewConversation 
}: ChatSidebarProps) {
  return (
    <div className="w-[260px] bg-[#171717] border-r border-white/10 flex flex-col">
      {/* Top Section */}
      <div className="p-3 space-y-2">
        {/* New Chat Button */}
        <button
          onClick={createNewConversation}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      {/* Chats Section */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
      />

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          Subu Acharya
        </button>
      </div>
    </div>
  );
}
