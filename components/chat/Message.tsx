'use client';

import { Card } from '@/components/ui/card';
import { User, Zap, Sparkles } from 'lucide-react';

interface MessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export default function Message({ message, isUser, timestamp }: MessageProps) {
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-sm ${
        isUser ? 'bg-blue-600/80 border-blue-500/50' : 'bg-gray-700/80 border-gray-600/50'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <div className="relative">
            <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
            <Sparkles className="h-2 w-2 text-yellow-400 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
        )}
      </div>
      
      <Card className={`max-w-[80%] border backdrop-blur-md ${
        isUser 
          ? 'bg-blue-900/40 border-blue-700/50 text-white shadow-lg' 
          : 'bg-gray-800/60 border-gray-700/50 text-gray-100 shadow-lg'
      }`}>
        <div className="p-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-inherit">{message}</p>
          {timestamp && (
            <p className="text-xs text-gray-400/80 mt-2">
              {timestamp.toLocaleTimeString()}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}