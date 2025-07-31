import { Plus, User, Loader2 } from 'lucide-react';
import { ConversationList } from './conversation-list';
import { Conversation } from '@/types/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string | null) => void;
  createNewConversation: () => void;
  isLoading?: boolean;
}

export function ChatSidebar({ 
  conversations, 
  activeConversationId, 
  setActiveConversationId,
  createNewConversation,
  isLoading = false
}: ChatSidebarProps) {
  return (
    <div className="w-[260px] bg-[#171717] border-r border-white/10 flex flex-col">
      {/* Top Section */}
      <div className="p-3 space-y-2">
        {/* New Chat Button */}
        <button
          onClick={createNewConversation}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      {/* Chats Section */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-white/40" />
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
        />
      )}

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
