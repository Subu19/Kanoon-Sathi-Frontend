import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-4",
      message.isUser ? "justify-end" : "justify-start"
    )}>
      {!message.isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Image height={32} width={32} src="/avatar.png" alt="Bot Avatar" className="rounded-full" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl backdrop-blur-sm",
        message.isUser 
          ? "bg-white/10 border border-white/20 text-white text-sm ml-auto p-4" 
          : "border-t border-l p-4"
      )}>
        {message.isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="markdown prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
                p: ({ node, ...props }) => <p {...props} className="my-2" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-2" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-2" />,
                li: ({ node, ...props }) => <li {...props} className="my-1" />,
                h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold my-3" />,
                h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold my-3" />,
                h3: ({ node, ...props }) => <h3 {...props} className="text-md font-bold my-2" />,
                pre: ({ node, ...props }) => <pre {...props} className="bg-transparent p-0 my-2" />,
                code: ({ node, ...props }) => <code {...props} className="bg-white/10 rounded px-1 py-0.5 font-mono text-sm" />,
                blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-white/30 pl-3 my-3 italic" />,
                hr: ({ node, ...props }) => <hr {...props} className="border-white/20 my-4" />
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {message.isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
}

export function LoadingMessage() {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Image height={32} width={32} src="/avatar.png" alt="Bot Avatar" className="rounded-full" />
      </div>
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
