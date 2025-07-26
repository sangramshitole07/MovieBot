'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, LogOut, User, Menu, X, Zap, Sparkles, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Message from './Message';
import FileUpload from './FileUpload';
import ChatSidebar from './ChatSidebar';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [testingHF, setTestingHF] = useState(false);
  const [uploadCollapsed, setUploadCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-save chat when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatToDatabase();
    }
  }, [messages]);

  useEffect(() => {
    if (!isTestMode) {
      getUserDetails();
    } else {
      // Set dummy user for test mode
      setUser({
        username: 'Test User',
        email: 'test@example.com'
      });
      // Load dummy chat history for test mode
      loadTestChatHistory();
    }
  }, []);

  const getUserDetails = async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data.data);
    } catch (error: any) {
      console.log(error.message);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const loadTestChatHistory = () => {
    // Add some dummy messages to simulate chat history
    const dummyMessages = [
      {
        id: '1',
        message: 'Welcome to test mode! This is a sample conversation.',
        isUser: false,
        timestamp: new Date(Date.now() - 60000)
      },
      {
        id: '2',
        message: 'How does the CSV analysis work?',
        isUser: true,
        timestamp: new Date(Date.now() - 30000)
      },
      {
        id: '3',
        message: 'Upload a CSV file and I\'ll help you analyze the data using AI. I can answer questions, find patterns, and provide insights based on your data.',
        isUser: false,
        timestamp: new Date()
      }
    ];
    setMessages(dummyMessages);
  };
  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      toast.success('Logout successful');
      router.push('/login');
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const generateChatTitle = (firstMessage: string): string => {
    // Generate a title from the first user message
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const saveChatToDatabase = async () => {
    if (messages.length === 0) return;
    if (isTestMode) return; // Don't save in test mode

    try {
      const chatData = {
        title: currentChatId ? undefined : generateChatTitle(messages.find(m => m.isUser)?.message || 'New Chat'),
        messages: messages.map(msg => ({
          message: msg.message,
          isUser: msg.isUser,
          timestamp: msg.timestamp
        }))
      };

      if (currentChatId) {
        // Update existing chat
        await fetch(`/api/chats/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatData.messages })
        });
      } else {
        // Create new chat
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatData)
        });
        
        if (response.ok) {
          const result = await response.json();
          setCurrentChatId(result.chat._id);
        }
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    if (isTestMode) return; // Don't load chats in test mode
    
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();
      
      if (response.ok) {
        const loadedMessages = data.chat.messages.map((msg: any) => ({
          id: Date.now().toString() + Math.random(),
          message: msg.message,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(loadedMessages);
        setCurrentChatId(chatId);
      } else {
        toast.error('Failed to load chat');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput('');
    
    // If in test mode, reload dummy history
    if (isTestMode) {
      setTimeout(() => {
        loadTestChatHistory();
      }, 100);
    }
  };

  const addMessage = (message: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUploadSuccess = (message: string) => {
    addMessage(message, false);
    // Auto-collapse after successful upload
    setTimeout(() => {
      setUploadCollapsed(true);
    }, 2000);
  };

  const testHuggingFaceAPI = async () => {
    setTestingHF(true);
    try {
      const response = await fetch('/api/test-hf');
      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Hugging Face API is working! Response time: ${result.details.responseTime}`);
        addMessage(`🧪 **Hugging Face API Test Results:**\n✅ Status: Working correctly\n⚡ Response time: ${result.details.responseTime}\n🔢 Embedding dimensions: ${result.details.embeddingDimensions}\n📝 Test text: "${result.details.testText}"\n🔍 Sample values: [${result.details.embeddingPreview.join(', ')}]`, false);
      } else {
        toast.error(`❌ Hugging Face API Error: ${result.error}`);
        addMessage(`🧪 **Hugging Face API Test Results:**\n❌ Status: Failed\n🚨 Error: ${result.error}\n📋 Details: ${result.details}`, false);
      }
    } catch (error) {
      toast.error('Failed to test Hugging Face API');
      addMessage('🧪 **Hugging Face API Test Results:**\n❌ Status: Test failed\n🚨 Error: Unable to connect to test endpoint', false);
    } finally {
      setTestingHF(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage(userMessage, true);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      const result = await response.json();

      if (response.ok) {
        addMessage(result.response, false);
      } else {
        addMessage(result.error || 'Sorry, I encountered an error processing your request.', false);
      }
    } catch (error) {
      addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden h-full`}>
        <div className="w-80 h-full p-4 flex flex-col">
          <ChatSidebar
            currentChatId={currentChatId}
            onChatSelect={loadChat}
            onNewChat={startNewChat}
            onChatUpdate={() => {}}
            isTestMode={isTestMode}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-4 h-full overflow-hidden">
        <Card className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border-gray-700 text-white shadow-lg h-full">
        <CardHeader className="pb-4 border-b border-gray-700">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-800/60"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Zap className="h-8 w-8 text-purple-400 animate-pulse" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                    Botzilla
                  </span>
                  <span className="text-xs text-gray-400 -mt-1">CSV Data Assistant</span>
                </div>
              </div>
              {isTestMode && (
                <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                  Test Mode
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Bot className="h-4 w-4 text-green-400 animate-pulse" />
                <span>Powered by AI</span>
              </div>
              <Button
                onClick={testHuggingFaceAPI}
                disabled={testingHF}
                size="sm"
                variant="outline"
                className="bg-gray-800/60 text-gray-300 border-gray-600 hover:bg-gray-700/60 hover:text-white"
              >
                {testingHF ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Testing...
                  </>
                ) : (
                  <>
                    🧪 Test HF API
                  </>
                )}
              </Button>
              {!isTestMode && (
                <Button
                  onClick={logout}
                  size="sm"
                  variant="outline"
                  className="bg-red-800/60 text-red-300 border-red-600 hover:bg-red-700/60 hover:text-white"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              )}
            </div>
          </CardTitle>
          <p className="text-sm text-gray-300">
            🚀 Upload a CSV file and let Botzilla analyze your data with AI magic!{isTestMode ? ' (Test Mode - No data will be saved)' : ''}
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden p-6">
          <FileUpload 
            onUploadSuccess={handleUploadSuccess}
            isCollapsed={uploadCollapsed}
            onToggleCollapse={() => setUploadCollapsed(!uploadCollapsed)}
          />
          
          <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-4 border border-gray-700">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-300">
                <p>Upload a CSV file and start chatting about your data!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))
            )}
            {loading && (
              <div className="flex items-center space-x-2 text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-2 pt-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your CSV data..."
              disabled={loading}
              className="flex-1 bg-gray-900/80 text-white border-gray-700 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 backdrop-blur-sm"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg backdrop-blur-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}