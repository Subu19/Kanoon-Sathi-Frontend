import { useState } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled = false }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className={cn(
          "relative border rounded-2xl backdrop-blur-xl overflow-hidden", 
          disabled ? "bg-white/5 border-white/10 opacity-70" : "bg-white/5 border-white/20"
        )}>
          <div className="flex items-end">
            <button 
              className="p-3 text-white/60 hover:text-white transition-colors disabled:opacity-50" 
              disabled={disabled}
            >
              <Paperclip size={20} />
            </button>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Select a conversation..." : "Message Kanoon-Sathi"}
              className="flex-1 p-3 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none min-h-[24px] max-h-32 disabled:opacity-70"
              rows={1}
              disabled={disabled}
            />
            <div className="flex items-end gap-2 p-3">
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isLoading || disabled}
                className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-white/40 mt-2 space-y-1">
          <p>Kanoon-Sathi can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
}
