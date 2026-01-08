export default function Comparison() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold tracking-[0.35em] text-slate-300">WHY ORDER BUILDER</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            왜 사람들은 일반 요리 학원 대신
            <br />
            <span className="text-pink-500">테이블원</span>을 선택할까요?
          </h2>
        </div>

        <div className="relative rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-10 sm:p-12 bg-slate-50/60">
              <p className="text-sm font-semibold text-slate-400 mb-8">일반 요리 클래스</p>
              <ul className="space-y-6 text-slate-400 text-sm font-semibold">
                {[
                  '레시피만 배움',
                  '그룹 수업',
                  '이론 중심',
                  '수료증 발급',
                ].map((item) => (
                  <li key={item} className="flex items-center justify-between gap-4">
                    <span>{item}</span>
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-300 inline-flex items-center justify-center">
                      ×
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-10 sm:p-12 bg-white">
              <div className="flex items-center gap-2 mb-8">
                <p className="text-sm font-black text-slate-900">ORDER BUILDER</p>
                <span className="px-2 py-1 text-[10px] font-bold text-pink-600 bg-pink-50 rounded-full">
                  ONLY
                </span>
              </div>
              <ul className="space-y-6 text-slate-900 text-sm font-semibold">
                {[
                  '레시피 + 시스템 설계',
                  '1:1 맞춤 설계',
                  '실전 산출물 완성',
                  '실제 작동하는 웹사이트',
                ].map((item) => (
                  <li key={item} className="flex items-center justify-between gap-4">
                    <span>{item}</span>
                    <span className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 inline-flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(236,72,153,0.7)]">
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-10 sm:p-12 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.7)]">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-200">
                4 Days Magic
              </span>
              <h3 className="mt-5 text-2xl sm:text-3xl font-black leading-tight">
                단 4일 안에
                <br />
                완성되는 시스템 산출물
              </h3>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                테이블원은 막연한 강의가 아닙니다. 실제로 운영 가능한 결과물을
                <br />
                즉시 활용할 수 있게 설계합니다.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                '완성된 레시피 & 원가 시트',
                '대량 주문 작업 매뉴얼',
                '인쇄 가능한 디자인 파일',
                '실제 주문받는 웹사이트',
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-5"
                >
                  <span className="text-xs font-bold text-slate-200">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-sm font-semibold text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
