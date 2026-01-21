import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const KAKAO_CHAT_URL = 'http://pf.kakao.com/_qAhfxj/chat';

const problemCards = [
  {
    question: '"샌드위치 30개 주문이 들어왔는데\n어떻게 준비하죠?"',
    answer: '대량 작업 타임라인이 필요합니다',
  },
  {
    question: '"원가는 얼마고,\n가격은 어떻게 정해야 하나요?"',
    answer: '정확한 원가 계산이 필요합니다',
  },
  {
    question: '"스티커 디자인은 어디서 만들고,\n어떻게 인쇄하나요?"',
    answer: '직접 만드는 방법을 배웁니다',
  },
  {
    question: '"배달앱 말고\n내 사이트로 주문받을 수 있나요?"',
    answer: '독립 주문 채널을 만듭니다',
  },
];

const solutionDays = [
  {
    title: 'Day 1. 레시피 완성',
    desc: '시그니처 메뉴 개발 & 원가 계산 시트',
  },
  {
    title: 'Day 2. 대량 주문 작업',
    desc: '20인분 작업 타임라인 & 포장 체크리스트',
  },
  {
    title: 'Day 3. 디자인 & 패키징',
    desc: '스티커/명함 디자인 파일 (실제 인쇄 가능)',
  },
  {
    title: 'Day 4. 웹사이트 구축',
    desc: '주문 페이지 + 결제 연동 (수수료 0%)',
  },
];

const curriculumDays = [
  {
    title: '[Day 1] 레시피 클래스',
    subtitle: '무엇을 팔 것인가?',
    body: [
      '시그니처 메뉴 1종 개발 (또는 기존 메뉴 고도화)',
      '식재료 원가 계산 시트 작성',
      '메뉴 라인업 구성 (베리에이션 전략)',
      '보관 방법 & 유통기한 설정',
      '알레르기 성분 표기',
    ],
    footer: '산출물: 완성된 레시피 & 원가 계산 시트',
    mode: '수강 방식: 오프라인 출장 수업 / 온라인 1:1',
  },
  {
    title: '[Day 2] 대량 주문 작업',
    subtitle: '20인분 이상 어떻게 처리할 것인가?',
    body: [
      '대량 조리 타임라인 설계 (역산 계획)',
      '식재료 발주 수량 & 타이밍',
      '포장 준비물 체크리스트',
      '배송 vs 픽업 프로세스 정리',
      '실제 20인분 작업 시뮬레이션',
      '냉장/냉동 보관 전략',
    ],
    footer: '산출물: 대량 주문 작업 매뉴얼',
    mode: '수강 방식: 오프라인 출장 수업 / 온라인 1:1',
  },
  {
    title: '[Day 3] 디자인 & 패키징',
    subtitle: '어떻게 보이게 만들 것인가?',
    body: [
      '브랜딩 & 컬러 선정',
      '스티커 디자인 실습 (미리캔버스)',
      '포장 박스/용기 소싱처 공유',
      '명함 & 리플렛 디자인',
      '실제 인쇄 파일 제작 (AI/PDF)',
      '온라인 발주 방법',
    ],
    footer: '산출물: 인쇄 가능한 디자인 파일 일체',
    mode: '수강 방식: 온라인 줌 1:1 (전국 가능)',
  },
  {
    title: '[Day 4] 웹사이트 구축',
    subtitle: '어떻게 주문받을 것인가?',
    body: [
      'Framer 웹사이트 제작 (노코드)',
      '메뉴 소개 & 가격표 페이지',
      '주문폼 & 결제 시스템 연동 (토스페이먼츠)',
      '카톡 알림톡 자동화 설정',
      '모바일 최적화 체크',
      '도메인 연결 & 런칭',
    ],
    footer: '산출물: 실제 주문받는 웹사이트',
    mode: '수강 방식: 온라인 줌 1:1 (전국 가능)',
  },
];

const regularCourseIncludes = [
  '1:1 맞춤 설계 (총 16시간)',
  '무제한 카톡 피드백',
  '템플릿 & 체크리스트 전체 제공',
  '웹사이트 도메인 1년 무료',
];

const scheduleOptions = [
  '4일 연속 집중 완성',
  '주 1회씩 4주 분산 수강',
];

const modularCourses = [
  'Day 1. 레시피 클래스',
  'Day 2. 대량 주문 작업',
  'Day 3. 디자인 & 패키징 (온라인 전용)',
  'Day 4. 웹사이트 구축 (온라인 전용)',
];

const processSteps = [
  {
    title: 'Step 1. 무료 상담 신청',
    subtitle: '[카톡 상담] 또는 [전화 상담]',
    items: ['목표 확인', '일정 조율', '출장 여부 확인'],
  },
  {
    title: 'Step 2. 수강 신청 & 결제',
    subtitle: '정규 과정 or 단과반 선택',
    items: ['결제 후 상세 안내 발송'],
  },
  {
    title: 'Step 3. 사전 준비',
    subtitle: '수업 전 준비 사항 정리',
    items: ['일정 확정', '준비물 안내', '템플릿 & 자료 공유'],
  },
  {
    title: 'Step 4. 1:1 수업 진행',
    subtitle: '실습과 피드백',
    items: ['Day별 실습 & 피드백', '실시간 문제 해결', '산출물 완성'],
  },
  {
    title: 'Step 5. 완료 & 사후 지원',
    subtitle: '완료 후 관리',
    items: ['시스템 최종 점검', '추가 질문 카톡 (2주)'],
  },
];

export default function ClassDetailPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <Navbar />

      {/* Breadcrumb */}
      <section className="pt-28 pb-6">
        <div className="max-w-6xl mx-auto px-6 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition-colors">
            홈
          </Link>
          <span className="mx-2">/</span>
          <Link to="/classes" className="hover:text-slate-600 transition-colors">
            클래스
          </Link>
        </div>
      </section>

      {/* Problem Detail */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              이런 고민, 하고 계신가요?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {problemCards.map((item) => (
              <div
                key={item.question}
                className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.18)]"
              >
                <p className="text-lg font-semibold text-slate-800 whitespace-pre-line">
                  {item.question}
                </p>
                <p className="mt-6 text-sm font-semibold text-pink-500 flex items-center gap-2">
                  <span className="text-lg">→</span>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-slate-500">
            <p>창업 현장에서 마주하는 진짜 질문들.</p>
            <p className="font-semibold text-slate-700">
              미닝필은 이 모든 과정을 4일 안에 함께 만듭니다.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Detail */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              우리는 레시피만 알려주지 않습니다
            </h2>
            <p className="mt-4 text-slate-500">
              4일 후, 당신은 실제로 주문받을 수 있는 모든 시스템을 갖게 됩니다
            </p>
          </div>

          <p className="text-lg font-bold text-slate-800 mb-6">미닝필에서 만드는 것들:</p>
          <div className="space-y-4">
            {solutionDays.map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6">
                <div className="w-11 h-11 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">→ {item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-pink-300 bg-pink-100/70 px-8 py-6 text-center text-base text-slate-700">
            <p>모든 과정을 1:1로 진행하기 때문에</p>
            <p>4일 연속 집중 완성도 가능하고,</p>
            <p>주 1회씩 4주로 나눠서 들을 수도 있습니다.</p>
            <p className="mt-2 font-semibold text-slate-800">당신의 일정에 맞춰 조정 가능합니다.</p>
          </div>
        </div>
      </section>

      {/* Curriculum Detail */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">4일 완성 커리큘럼</h2>
            <p className="mt-4 text-slate-500">단체 주문 시스템을 완성하는 4단계</p>
            <p className="text-slate-400 text-sm">각 단계마다 실전 산출물이 나옵니다</p>
          </div>

          <div className="space-y-4">
            {curriculumDays.map((item, idx) => (
              <details
                key={item.title}
                open={idx === 0}
                className="group rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">▾</span>
                </summary>
                <div className="mt-6 text-sm text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800">세부 내용:</p>
                  {item.body.map((line) => (
                    <p key={line} className="flex items-start gap-2">
                      <span className="text-pink-400">•</span>
                      <span>{line}</span>
                    </p>
                  ))}
                  <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                    <p className="font-semibold text-slate-800">✅ {item.footer}</p>
                    <p className="mt-2">📌 {item.mode}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-slate-900 text-white px-6 py-5 text-center text-sm">
            <p className="font-semibold">정규 과정 (4일 통합)</p>
            <p className="text-slate-300">4일 연속 or 주 1회씩 4주 선택 가능</p>
          </div>
        </div>
      </section>

      {/* Pricing Section (No price) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">수강 안내</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex flex-col rounded-3xl border border-pink-300 bg-pink-50/40 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(236,72,153,0.35)]">
              <div className="flex items-center gap-2 text-pink-500 text-xs font-semibold bg-pink-100 px-3 py-1 rounded-full w-fit">
                추천
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">정규 과정 (4일 완성)</h3>
              <p className="mt-2 text-slate-500">레시피부터 웹사이트까지 ALL-IN-ONE</p>

              <div className="mt-6 space-y-6 flex-1">
                <div>
                  <p className="text-sm font-semibold text-slate-800">🎁 포함 사항:</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {regularCourseIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-pink-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">📅 일정 선택:</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {scheduleOptions.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-pink-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href={KAKAO_CHAT_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-pink-400 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-500"
              >
                정규 과정 신청하기
              </a>
            </div>

            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.16)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(15,23,42,0.25)]">
              <h3 className="text-xl font-bold text-slate-900">단과반 (모듈별 선택)</h3>
              <p className="mt-2 text-slate-500">필요한 부분만 골라 듣기</p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 flex-1">
                {modularCourses.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-pink-400">📌</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={KAKAO_CHAT_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-pink-300 hover:text-pink-500"
              >
                단과반 선택하기
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50 px-8 py-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">📍 출장 수업 안내</p>
            <ul className="mt-3 space-y-1">
              <li>• 대상: Day 1, 2 (레시피 & 대량 작업)</li>
              <li>• 조건: 지역별 출장비 별도, 사전 상담 필수</li>
              <li>
                • 문의: <a className="text-pink-500 hover:text-pink-600" href={KAKAO_CHAT_URL} target="_blank" rel="noreferrer">카톡 상담</a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">수강 신청부터 완성까지</h2>
          </div>

          <div className="space-y-6">
            {processSteps.map((step, idx) => (
              <div key={step.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)]">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{step.subtitle}</p>
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-pink-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black">지금 시작하세요</h2>
          <p className="mt-4 text-slate-300">4일이면 충분합니다.</p>
          <p className="text-slate-400 mt-2">
            레시피, 작업 매뉴얼, 디자인, 웹사이트까지
            <br />
            실제로 주문받을 수 있는 모든 시스템을 완성하세요.
          </p>

          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-pink-400 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-500"
          >
            문의하기
          </a>

          <div className="mt-8 text-xs text-slate-500">
            <p>※ 환불 정책: 첫 세션 종료 전까지 100% 환불 가능</p>
            <p>※ 문의: 카톡 문의</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
