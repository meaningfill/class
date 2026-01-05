
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from './geminiService';
import Navbar from './pages/home/components/Navbar';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
};

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await geminiService.sendMessage(trimmedInput);
    setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="px-4 sm:px-6">
          <div className="max-w-5xl mx-auto min-h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">
            <i className="fa-solid fa-calculator"></i>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">FOODLOGIC AI Consultant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Business System Online</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
          <i className="fa-brands fa-slack text-pink-400"></i>
          <span className="text-[10px] font-black text-white uppercase">Premium Member Only</span>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl text-amber-500 mb-8 border border-amber-100">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-4">원가 설계, 이제 과학입니다.</h3>
            <p className="text-gray-500 max-w-sm mb-10 text-sm font-medium leading-relaxed">
              FOODLOGIC의 4대 원칙으로 당신의 레시피를 <br/>
              지속 가능한 비즈니스 모델로 분석해 드립니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {[
                "샌드위치 100인분 실질 원가 계산",
                "인건비를 줄이는 주방 동선 설계",
                "패키징 비용의 적정 비중은?",
                "슬랙 멤버십 전용 자료 안내"
              ].map((text, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(text)}
                  className="p-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm text-left flex items-center gap-3"
                >
                  <i className="fa-solid fa-arrow-right text-amber-500"></i>
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
              </div>
              <div className={`p-5 rounded-3xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} leading-relaxed`}>
                  {msg.text}
                </div>
                <p className={`text-[9px] mt-3 font-bold opacity-50 text-right`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-8 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 font-medium text-gray-800 text-sm"
            placeholder="비즈니스 모델에 대해 질문하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 transition-all shadow-md active:scale-95"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
        <p className="mt-3 text-[10px] text-gray-400 text-center font-medium">
          <i className="fa-solid fa-shield-halved mr-1"></i>
          분석 데이터는 암호화되어 보호되며, FOODLOGIC 전문가가 함께 모니터링합니다.
        </p>
      </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
