import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Task } from '../types';
import { Send, Bot, User, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onConfirmTask: (taskId: string) => void; // Simulate context action from chat
  isThinking: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onConfirmTask, isThinking }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render BACKSTAGE blocks
  const renderContent = (content: string) => {
    // Regex to find [BACKSTAGE]...[/BACKSTAGE]
    const parts = content.split(/(\[BACKSTAGE\][\s\S]*?\[\/BACKSTAGE\])/g);

    return parts.map((part, idx) => {
      if (part.startsWith('[BACKSTAGE]')) {
        const inner = part.replace('[BACKSTAGE]', '').replace('[/BACKSTAGE]', '').trim();
        return (
          <div key={idx} className="my-3 p-3 bg-slate-100 border-l-4 border-slate-500 rounded-r-md text-sm font-mono text-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase">
              <FileText className="w-3 h-3" />
              Система / Отчет Агента
            </div>
            <div className="whitespace-pre-wrap">{inner}</div>
            <div className="mt-3 flex gap-2">
                <button 
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-50 font-medium transition-colors"
                  onClick={() => alert("Имитация подтверждения задачи или просмотра деталей через Чат.")}
                >
                    Просмотреть детали
                </button>
            </div>
          </div>
        );
      }
      // Regular text
      return <span key={idx} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
        {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {/* System Boot Message */}
        <div className="flex justify-center">
            <span className="text-xs text-gray-400 font-mono">Система v4.1 • Защищенный канал • Аудит активен</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100' : 'bg-gray-800'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              
              <div className={`p-4 rounded-lg text-sm shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {renderContent(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
             <div className="max-w-[80%] flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg rounded-tl-none flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors" title="Загрузить контекст">
                <FileText className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Опишите проблему, назначьте задачу или запросите анализ..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-[50px] min-h-[50px] max-h-[150px] scrollbar-hide text-sm"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
        <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Авторизованные действия логируются в Аудит. Вызовы инструментов отключены.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;