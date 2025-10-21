import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from './AuthContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      text: "Xin chào! 🍿 Tôi là CGV-Bot. Tôi có thể giúp gì cho bạn hôm nay?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { token, isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isTyping) return;

    if (!isAuthenticated) {
        setMessages(prev => [...prev, {
            id: `bot-error-${Date.now()}`,
            text: "Vui lòng đăng nhập để tôi có thể hỗ trợ bạn tốt hơn nhé! 🔒",
            sender: 'bot',
            timestamp: new Date()
        }]);
        return;
    }

    const userInputText = inputValue.trim();
    const userMessage: Message = { id: `user-${Date.now()}`, text: userInputText, sender: 'user', timestamp: new Date() };

    // TẠO LỊCH SỬ TIN NHẮN MỚI ĐỂ GỬI ĐI
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); // Cập nhật UI ngay lập tức
    setInputValue('');
    setIsTyping(true);

    try {
        const response = await fetch('http://localhost:5001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // GỬI TOÀN BỘ LỊCH SỬ, BAO GỒM CẢ TIN NHẮN MỚI CỦA USER
            body: JSON.stringify({ 
              message: userInputText,
              history: newMessages // Gửi thêm toàn bộ lịch sử
            })
        });

        if (!response.ok) {
            throw new Error('Phản hồi từ server không tốt.');
        }

        const data = await response.json();
        const botResponse: Message = { id: `bot-${Date.now()}`, text: data.reply, sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Lỗi khi gọi API chat:", error);
        const errorResponse: Message = { id: `bot-error-${Date.now()}`, text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau. 🛠️", sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
          aria-label="Mở hội thoại"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          <div className="bg-red-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2"><MessageCircle className="w-5 h-5 text-red-600" /></div>
              <div><h3 className="font-semibold">Hỗ trợ CGV</h3><p className="text-xs text-red-100">Đang hoạt động</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-red-700 rounded-full p-1 transition-colors" aria-label="Đóng hội thoại"><X className="w-5 h-5" /></button>
          </div>

          <ScrollArea className="flex-1 min-h-0 p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg py-2 px-3 ${ message.sender === 'user' ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border border-gray-200' }`}>
                    {message.sender === 'bot' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    <p className={`text-xs mt-1 text-right ${ message.sender === 'user' ? 'text-red-100' : 'text-gray-500' }`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && ( <div className="flex justify-start"><div className="bg-white text-gray-900 border border-gray-200 rounded-lg p-3"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div></div></div> )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập tin nhắn của bạn..." disabled={isTyping} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
              <Button type="submit" disabled={isTyping || inputValue.trim() === ''} className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" size="icon"><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

