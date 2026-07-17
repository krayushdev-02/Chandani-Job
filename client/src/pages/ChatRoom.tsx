import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { 
  Send, MessageSquare, User, Loader2, ArrowLeft 
} from 'lucide-react';

interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string; email: string; role: string }>;
  lastMessage?: { text: string; sender: string; createdAt: string };
  updatedAt: string;
}

interface Message {
  _id: string;
  chat: string;
  sender: { _id: string; name: string } | string;
  text: string;
  createdAt: string;
}

const ChatRoom: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Threads & messages
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Typing & online statuses
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineStatusMap, setOnlineStatusMap] = useState<Record<string, 'online' | 'offline'>>({});

  // Socket client reference
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Load chat threads list
  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await api.get('/chats');
      setChats(res.data.chats);
      if (res.data.chats.length > 0) {
        setSelectedChat(res.data.chats[0]);
      }
    } catch (error) {
      toast.error('Failed to load chat conversations.');
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Initialize Socket.io Connection
  useEffect(() => {
    if (!user) return;
    
    // Connect to backend server
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register_user', user.id);
    });

    // Handle incoming messages
    socket.on('chat_message', (msg: Message) => {
      if (selectedChat && msg.chat === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
      
      // Reload chats list to update preview summaries
      loadChats();
    });

    // Handle typing notices
    socket.on('user_typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (selectedChat && data.chatId === selectedChat._id && data.userId !== user.id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Handle user status modifications
    socket.on('user_status', (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineStatusMap((prev) => ({ ...prev, [data.userId]: data.status }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedChat]);

  // Load messages when selecting a chat
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setOtherUserTyping(false);
      try {
        const res = await api.get(`/chats/${selectedChat._id}/messages`);
        setMessages(res.data.messages);
        
        // Join room inside socket
        if (socketRef.current) {
          socketRef.current.emit('join_chat', selectedChat._id);
        }
      } catch (error) {
        toast.error('Could not load chat messages history.');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    const textToSend = inputText;
    setInputText('');
    
    // Notify typing status stopped
    if (socketRef.current) {
      socketRef.current.emit('typing', { chatId: selectedChat._id, userId: user?.id, isTyping: false });
      setIsTyping(false);
    }

    try {
      await api.post(`/chats/${selectedChat._id}/messages`, { text: textToSend });
    } catch (error) {
      toast.error('Failed to dispatch message.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socketRef.current && selectedChat) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current.emit('typing', { chatId: selectedChat._id, userId: user?.id, isTyping: true });
      }

      // Debounce typing indicator closure
      const timeoutId = setTimeout(() => {
        if (socketRef.current && selectedChat) {
          socketRef.current.emit('typing', { chatId: selectedChat._id, userId: user?.id, isTyping: false });
          setIsTyping(false);
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  };

  const getRecipient = (chat: Chat) => {
    return chat.participants.find((p) => p._id !== user?.id);
  };

  const recipient = selectedChat ? getRecipient(selectedChat) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[80vh] flex gap-6">
      
      {/* Side Threads list (4 columns on lg) */}
      <div className={`glass rounded-3xl border-white/5 p-4 flex flex-col w-full lg:w-80 shrink-0 ${
        selectedChat ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="pb-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Conversations</h3>
          <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
          {loadingChats ? (
            <div className="text-center py-10 text-gray-400 text-xs">Accessing threads...</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">No active chats. Start applying to open recruiter channels.</div>
          ) : (
            chats.map((chat) => {
              const r = getRecipient(chat);
              const isOnline = r ? onlineStatusMap[r._id] === 'online' : false;

              return (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${
                    selectedChat?._id === chat._id ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-full bg-indigo-600/10 flex items-center justify-center border border-white/5">
                    <User className="h-4 w-4 text-indigo-400" />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white block truncate">{r?.name}</span>
                      <span className="text-[10px] text-gray-500">{chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{chat.lastMessage ? chat.lastMessage.text : 'Opened chat session'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Box Workspace (8 columns on lg) */}
      <div className={`glass rounded-3xl border-white/5 flex-1 flex flex-col h-full overflow-hidden ${
        !selectedChat ? 'hidden lg:flex justify-center items-center text-gray-400' : 'flex'
      }`}>
        {selectedChat && recipient ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-gray-400 mr-1"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-indigo-600/10 flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-normal">{recipient.name}</h4>
                  <span className="text-[10px] text-indigo-400 font-semibold">{recipient.role}</span>
                </div>
              </div>
            </div>

            {/* Messages history log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
              ) : (
                messages.map((msg) => {
                  const isMe = typeof msg.sender === 'string' ? msg.sender === user?.id : msg.sender._id === user?.id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/15' : 'glass border-white/5 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                        <span className="block text-[9px] text-right mt-1.5 opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Other User Typing animation notice */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="glass border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex gap-2 items-center bg-white/5">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                className="bg-transparent border-none outline-none text-xs px-4 py-3 w-full text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-8 space-y-2">
            <MessageSquare className="h-12 w-12 text-indigo-500/25 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-400">Open conversation thread</h4>
            <p className="text-xs text-gray-500">Select any thread from the sidebar list to retrieve messages.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatRoom;
