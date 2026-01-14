import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../services/supabase';

interface ContactItem {
  icon: string;
  text: string;
  gradient: string;
}

const defaultContactInfo: ContactItem[] = [
  { icon: 'ri-mail-line', text: 'master@startupagency.co.kr', gradient: 'from-pink-400 to-purple-400' },
  { icon: 'ri-phone-line', text: '010-1234-5678', gradient: 'from-purple-400 to-pink-500' },
  { icon: 'ri-map-pin-line', text: '서울시 강남구', gradient: 'from-pink-500 to-purple-500' }
];

export default function Footer() {
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState<ContactItem[]>(defaultContactInfo);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('contact_email, contact_phone, contact_address')
          .eq('id', 1)
          .maybeSingle();

        if (error || !data || !isMounted) {
          return;
        }

        setContactInfo([
          { icon: 'ri-mail-line', text: data.contact_email || defaultContactInfo[0].text, gradient: 'from-pink-400 to-purple-400' },
          { icon: 'ri-phone-line', text: data.contact_phone || defaultContactInfo[1].text, gradient: 'from-purple-400 to-pink-500' },
          { icon: 'ri-map-pin-line', text: data.contact_address || defaultContactInfo[2].text, gradient: 'from-pink-500 to-purple-500' }
        ]);
      } catch (error) {
        console.error('Failed to load contact info:', error);
      }
    };

    loadContactInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { label: '클래스소개', path: '/classes', icon: 'ri-information-line' },
    { label: '웹사이트제작문의', id: 'website-inquiry', icon: 'ri-computer-line' },
    { label: '케이터링주문', path: '/order', icon: 'ri-shopping-cart-line' }
  ];

  const handleQuickLink = (link: { id?: string; path?: string }) => {
    if (link.path) {
      if (link.path === '/classes') {
        // Force scroll to top is handled by router usually, but let's be safe
        window.scrollTo(0, 0);
      }
      navigate(link.path);
      return;
    }

    if (link.id) {
      // Check if we are on home page, if not, navigate home then scroll
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollTo: link.id } });
      } else {
        scrollToSection(link.id);
      }
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-white via-pink-50 to-purple-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-20 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-20 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
                Order Builder
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                주문을 시작하는 구조를 만듭니다.<br />
                실전 창업까지 함께합니다.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full"></div>
              빠른 링크
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleQuickLink(link)}
                    className="group flex items-center gap-3 text-gray-600 hover:text-pink-500 transition-colors cursor-pointer"
                  >
                    <i className={`${link.icon} text-pink-500 group-hover:scale-110 transition-transform`}></i>
                    <span className="text-sm">{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
              연락처
            </h4>
            <ul className="space-y-4">
              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                  <i className="ri-mail-line text-white"></i>
                </div>
                <span className="text-sm text-gray-600 pt-2 group-hover:text-gray-800 transition-colors">
                  master@startupagency.co.kr
                </span>
              </li>
              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                  <i className="ri-phone-line text-white"></i>
                </div>
                <span className="text-sm text-gray-600 pt-2 group-hover:text-gray-800 transition-colors">
                  010-3496-2029
                </span>
              </li>
              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                  <i className="ri-map-pin-line text-white"></i>
                </div>
                <div className="text-sm text-gray-600 pt-2 group-hover:text-gray-800 transition-colors flex flex-col">
                  <span>서울시 서대문구 충정로 63</span>
                  <span className="text-xs text-gray-500 mt-1">상호명: 미닝필 | 대표자: 김재혁</span>
                  <span className="text-xs text-gray-500">사업자번호: 202-02-77642</span>
                  <span className="text-xs text-gray-500">통신판매업: 2025-서울서대문-0827</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
              뉴스레터
            </h4>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              최신 소식과 특별 혜택을<br />
              이메일로 받아보세요.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="이메일 주소"
                className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-300 transition-colors text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg hover:scale-110 transition-transform cursor-pointer">
                <i className="ri-send-plane-fill text-white text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 Order Builder. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveModal('terms')}
                className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer"
              >
                이용약관
              </button>
              <button
                onClick={() => setActiveModal('privacy')}
                className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer"
              >
                개인정보처리방침
              </button>
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                <i className="ri-admin-line text-xs"></i>
                관리자
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-xl font-bold text-gray-800">
                {activeModal === 'terms' ? '이용약관' : '개인정보처리방침'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-8 prose prose-sm max-w-none text-gray-600">
              {activeModal === 'terms' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제1조 (목적)</h4>
                    <p className="text-gray-600">이 약관은 Order Builder(이하 "회사")가 운영하는 사이트에서 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 사이버몰과 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제2조 (정의)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>"사이트"란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</li>
                      <li>"이용자"란 사이트에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 비회원을 말합니다.</li>
                      <li>본 사이트는 별도의 회원가입 없이 서비스를 이용하는 비회원제 서비스입니다.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제3조 (서비스의 제공 및 변경)</h4>
                    <p className="text-gray-600 mb-2">회사는 다음과 같은 업무를 수행합니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
                      <li>구매계약이 체결된 재화 또는 용역의 배송 및 제공</li>
                      <li>기타 회사가 정하는 업무</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제4조 (주문 및 개인정보 제공)</h4>
                    <p className="text-gray-600 mb-2">이용자는 다음의 방법에 의하여 구매를 신청하며, 회사는 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>재화 등의 검색 및 선택</li>
                      <li>받는 사람의 성명, 주소, 전화번호, 전자우편주소(또는 이동전화번호) 등의 입력</li>
                      <li>약관내용, 청약철회권이 제한되는 서비스 등의 비용부담과 관련한 내용에 대한 확인</li>
                      <li>구매신청 및 이에 관한 확인 또는 회사의 확인에 대한 동의</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제5조 (계약의 성립)</h4>
                    <p className="text-gray-600">회사는 이용자의 구매신청에 대하여 신청 내용에 허위, 기재누락, 오기가 있는 경우를 제외하고는 승낙합니다. 회사의 승낙이 수신확인통지형태로 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">제6조 (대금지급방법)</h4>
                    <p className="text-gray-600">사이트에서 구매한 재화 또는 용역에 대한 대금지급방법은 폰뱅킹, 인터넷뱅킹 등의 계좌이체, 신용카드 결제 등 회사에서 정하는 결제 수단을 통하여 할 수 있습니다.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                    <p className="text-sm font-semibold text-gray-700">회사는 회원가입 없이 비회원으로 서비스를 이용하는 사이트를 운영합니다. 서비스 이용(주문, 문의 등)을 위해 필요한 최소한의 개인정보만을 수집합니다.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1. 개인정보의 수집 및 이용 목적</h4>
                    <p className="text-gray-600 mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li><span className="font-semibold">서비스 제공 및 계약 이행</span>: 주문 접수, 대금 결제, 상품 배송, 용역 제공, 주문 내역 조회</li>
                      <li><span className="font-semibold">고객 응대</span>: 문의사항 처리, 공지사항 전달, 상담</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2. 수집하는 개인정보의 항목</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>필수항목: 성명, 휴대전화번호, 이메일</li>
                      <li>선택항목(배송/방문 시): 주소, 행사 일정, 요청사항</li>
                      <li>결제 시(PG사): 카드사명, 카드번호 등 결제 승인 정보</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">3. 개인정보의 처리 및 보유 기간</h4>
                    <p className="text-gray-600 mb-2">원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-2 text-sm">
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          <span className="font-bold block">계약 또는 청약철회 등에 관한 기록</span>
                          보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br />
                          보존 기간 : 5년
                        </li>
                        <li>
                          <span className="font-bold block">대금결제 및 재화 등의 공급에 관한 기록</span>
                          보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br />
                          보존 기간 : 5년
                        </li>
                        <li>
                          <span className="font-bold block">소비자의 불만 또는 분쟁처리에 관한 기록</span>
                          보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br />
                          보존 기간 : 3년
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4. 개인정보의 파기절차 및 방법</h4>
                    <p className="text-gray-600">전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하며, 종이 문서는 분쇄기로 분쇄하거나 소각하여 파기합니다.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5. 이용자의 권리</h4>
                    <p className="text-gray-600">이용자는 개인정보 수집·이용에 거부할 권리가 있으나, 필수 정보 수집 거부 시 상품 구매 및 상담 등 서비스 이용이 제한될 수 있습니다. 본인의 개인정보에 대해 열람, 정정, 삭제를 요구할 수 있으며 이 경우 회사 고객센터로 연락 주시면 조치하겠습니다.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
