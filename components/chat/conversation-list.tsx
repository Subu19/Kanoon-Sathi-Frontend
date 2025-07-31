import { cn } from '@/lib/utils';
import { Conversation } from '@/types/chat';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string | null) => void;
}

export function ConversationList({ 
  conversations, 
  activeConversationId, 
  setActiveConversationId 
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="px-3 pb-2">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">Chats</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setActiveConversationId(conversation.id)}
            className={cn(
              "w-full p-2.5 rounded-lg text-left transition-all duration-200 text-sm group relative",
              activeConversationId === conversation.id 
                ? "bg-white/10 text-white" 
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="truncate">
              {conversation.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
