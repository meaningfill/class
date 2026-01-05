
import React from 'react';
import { Check, X, ArrowRight, CheckCircle2 } from 'lucide-react';

const Comparison: React.FC = () => {
  const comparisons = [
    { label: "교육의 본질", general: "레시피만 배움", tableone: "레시피 + 시스템 설계" },
    { label: "수업 방식", general: "그룹 수업", tableone: "1:1 맞춤 설계" },
    { label: "교육 결과", general: "이론 중심", tableone: "실전 산출물 완성" },
    { label: "최종 산출물", general: "수료증 발급", tableone: "실제 작동하는 웹사이트" },
  ];

  const outcomes = [
    "완성된 레시피 & 원가 시트",
    "대량 주문 작업 매뉴얼",
    "인쇄 가능한 디자인 파일",
    "실제 주문받는 웹사이트"
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
            왜 사람들은 일반 요리 학원 대신 <br/>
            <span className="text-[#FF78C4]">테이블원</span>을 선택할까요?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-0 rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100">
          {/* General Class */}
          <div className="bg-slate-50 p-12 md:p-16 border-r border-slate-200 opacity-60">
            <h3 className="text-2xl font-black text-slate-400 mb-12 uppercase tracking-tighter">일반 요리 클래스</h3>
            <ul className="space-y-10">
              {comparisons.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between group">
                  <span className="text-slate-400 font-bold">{item.general}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <X size={16} className="text-slate-400" />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Table One */}
          <div className="bg-white p-12 md:p-16 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-pink-purple-gradient"></div>
            <h3 className="text-2xl font-black text-slate-900 mb-12 uppercase tracking-tighter flex items-center gap-2">
              <span className="gradient-text">Table One</span>
              <span className="text-[10px] bg-pink-50 text-[#FF78C4] px-2 py-1 rounded-md">ONLY</span>
            </h3>
            <ul className="space-y-10">
              {comparisons.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between font-black text-lg">
                  <span className="text-slate-800">{item.tableone}</span>
                  <div className="w-8 h-8 rounded-full bg-pink-purple-gradient flex items-center justify-center shadow-lg shadow-pink-200">
                    <Check size={18} className="text-white" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mt-16 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-purple-gradient rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-black mb-6">
                <CheckCircle2 size={14} className="text-[#FF78C4]" />
                <span className="uppercase tracking-widest">4 Days Magic</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                단 4일 안에 <br/>
                완성되는 시스템 산출물
              </h4>
              <p className="text-slate-400 font-bold leading-relaxed">
                테이블원은 막연한 강의를 하지 않습니다. <br/>
                과정 종료와 동시에 매출을 낼 수 있는 '무기'를 쥐여 드립니다.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 w-full lg:w-auto">
              {outcomes.map((text, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-pink-purple-gradient flex items-center justify-center shrink-0">
                    <span className="font-black text-xs text-white">0{i+1}</span>
                  </div>
                  <span className="font-black text-lg text-slate-100">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
