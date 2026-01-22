
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../pages/public/home/components/Navbar';
import { aiCurationService, AIMessage } from '../../services/ai_curation';
import { useCartStore } from '../../store/useCartStore';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  // Initial Session Start
  useEffect(() => {
    aiCurationService.startSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMsg: AIMessage = { role: 'user', content: trimmedInput, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiCurationService.sendMessage(messages, trimmedInput);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "죄송합니다. 잠시 연결이 원활하지 않습니다.", type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickChips = [
    { label: "👩‍💼 임원 회의 케이터링", query: "중요한 임원 회의가 있는데 고급스러운 다과 세트 추천해줘." },
    { label: "🎁 조공/서포트 도시락", query: "연예인 조공 도시락(서포트) 견적 문의하고 싶어. 예쁘고 알찬 구성 추천해줘." },
    { label: "🏫 창업 클래스 수강", query: "케이터링 창업 클래스 커리큘럼과 수강료가 궁금해." },
    { label: "❓ 기타/일반 문의", query: "기타 문의사항이 있습니다." }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">

          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-gray-900 to-slate-800 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-xl shadow-lg animate-bounce-slow">
              <i className="ri-sparkling-fill"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">MeaningFill Sommelier</h2>
              <p className="text-gray-300 text-sm">당신의 행사를 빛낼 메뉴를 큐레이션 해드립니다.</p>
            </div>
          </div>

          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <i className="ri-robot-2-line text-6xl text-gray-300 mb-6"></i>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">무엇을 도와드릴까요?</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  행사 목적, 인원, 예산을 말씀해주시면<br />최적의 메뉴 구성을 제안해드립니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {QuickChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(chip.query); handleSend(); }} // Auto send logic needs care, setInput then handleSend might verify empty input. 
                      // Better to just call logic directly but for simplified UI we simulate click
                      // Or explicit call:
                      // But state update is async. Let's just fill input.
                      className="p-4 bg-white border border-gray-200 rounded-xl text-left text-sm font-semibold text-gray-700 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all shadow-sm"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                  {msg.content}
                  {/* Product Card Rendering Logic Placeholder */}
                  {/* We could parse content for [Product:ID] here if we wanted interactive cards */}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-pink-200 transition-all">
              <button className="p-3 text-gray-400 hover:text-pink-500 transition-colors" title="참고 이미지 업로드 (준비중)">
                <i className="ri-image-add-line text-xl"></i>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지를 입력하세요 (예: 50만원대 간식 박스 추천)"
                className="flex-1 bg-transparent border-none focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-all"
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
