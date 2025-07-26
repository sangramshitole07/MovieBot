'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2, Calendar, Zap, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: any[];
}

interface ChatSidebarProps {
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatUpdate: (chatId: string) => void;
  isTestMode?: boolean;
}

export default function ChatSidebar({ 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  onChatUpdate,
  isTestMode = false
}: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTestMode) {
      fetchChats();
    } else {
      // Load dummy chats for test mode
      loadTestChats();
    }
  }, []);

  const loadTestChats = () => {
    const testChats = [
      {
        _id: 'test-1',
        title: 'Movie Analysis Discussion',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        messages: [
          { message: 'What are the top rated movies?', isUser: true },
          { message: 'Based on the data, here are the top rated movies...', isUser: false }
        ]
      },
      {
        _id: 'test-2',
        title: 'Genre Distribution Query',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        messages: [
          { message: 'Show me the genre distribution', isUser: true },
          { message: 'Here\'s the breakdown of genres in your dataset...', isUser: false }
        ]
      },
      {
        _id: 'test-3',
        title: 'Revenue Analysis',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        messages: [
          { message: 'Which movies made the most money?', isUser: true },
          { message: 'Looking at the revenue data, these movies performed best...', isUser: false }
        ]
      }
    ];
    setChats(testChats);
    setLoading(false);
  };
  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      
      if (response.ok) {
        setChats(data.chats);
      } else {
        toast.error('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isTestMode) {
      // Just remove from local state in test mode
      setChats(chats.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted (test mode)');
      if (currentChatId === chatId) {
        onNewChat();
      }
      return;
    }
    
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setChats(chats.filter(chat => chat._id !== chatId));
        toast.success('Chat deleted');
        
        // If we deleted the current chat, start a new one
        if (currentChatId === chatId) {
          onNewChat();
        }
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupChatsByDate = (chats: ChatHistoryItem[]) => {
    const groups: { [key: string]: ChatHistoryItem[] } = {};
    
    chats.forEach(chat => {
      const dateKey = formatDate(chat.updatedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    
    return groups;
  };

  const chatGroups = groupChatsByDate(chats);

  return (
    <Card className="h-full bg-white/5 backdrop-blur-md border-gray-700 text-white shadow-lg flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-700">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <Sparkles className="h-2 w-2 text-yellow-400 absolute -top-0.5 -right-0.5 animate-ping" />
            </div>
            <span className="text-lg font-semibold">
              Botzilla History{isTestMode ? ' (Test)' : ''}
            </span>
          </div>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 animate-pulse" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(chatGroups).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 h-full min-h-[200px]">
              <div className="relative mb-4">
                <Zap className="h-12 w-12 opacity-50 text-purple-400" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce opacity-70" />
              </div>
              <p className="text-sm">
                🤖 No conversations with Botzilla yet{isTestMode ? ' (Test Mode)' : ''}
              </p>
              <p className="text-xs">Upload a CSV and start chatting!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(chatGroups).map(([date, dateChats]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>{date}</span>
                  </div>
                  <div className="space-y-1">
                    {dateChats.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => onChatSelect(chat._id)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800/60 ${
                          currentChatId === chat._id 
                            ? 'bg-blue-900/40 border border-blue-700/50' 
                            : 'bg-gray-800/30 border border-gray-700/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {chat.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {chat.messages.length} messages
                          </p>
                        </div>
                        <Button
                          onClick={(e) => deleteChat(chat._id, e)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}