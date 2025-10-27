import { Plus, User, Loader2, LogIn, Settings } from 'lucide-react';
import Link from 'next/link';
import { ConversationList } from './conversation-list';
import { Conversation } from '@/types/chat';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { user, isAuthenticated, logout } = useAuth();

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
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all duration-200">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
                <span className="truncate">{user.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <Settings size={16} />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-400">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className=" flex flex-col space-y-2">
            <Link href="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-white/20 hover:border-white/40"
              >
                <LogIn size={16} className="mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                size="sm" 
                className="w-full"
              >
                <User size={16} className="mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
