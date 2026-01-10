import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../services/supabase';

interface ContactItem {
  icon: string;
  text: string;
  gradient: string;
}

const defaultContactInfo: ContactItem[] = [
  { icon: 'ri-mail-line', text: 'contact@catering.com', gradient: 'from-pink-400 to-purple-400' },
  { icon: 'ri-phone-line', text: '010-1234-5678', gradient: 'from-purple-400 to-pink-500' },
  { icon: 'ri-map-pin-line', text: '서울시 강남구', gradient: 'from-pink-500 to-purple-500' }
];

export default function Footer() {
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState<ContactItem[]>(defaultContactInfo);

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
    { label: '소개', id: 'intro', icon: 'ri-information-line' },
    { label: '커리큘럼', path: '/classes', icon: 'ri-book-open-line' },
    { label: '포트폴리오', id: 'portfolio', icon: 'ri-gallery-line' }
  ];

  const handleQuickLink = (link: { id?: string; path?: string }) => {
    if (link.path) {
      navigate(link.path);
      return;
    }

    if (link.id) {
      scrollToSection(link.id);
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
              {contactInfo.map((contact, index) => (
                <li key={index} className="group flex items-start gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${contact.gradient} rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}
                  >
                    <i className={`${contact.icon} text-white`}></i>
                  </div>
                  <span className="text-sm text-gray-600 pt-2 group-hover:text-gray-800 transition-colors">
                    {contact.text}
                  </span>
                </li>
              ))}
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
            <p className="text-gray-500 text-sm">© 2024 Order Builder. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer">
                이용약관
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer">
                개인정보처리방침
              </a>
              <a
                href="/admin/login"
                className="text-gray-500 hover:text-pink-500 text-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                <i className="ri-admin-line text-xs"></i>
                관리자
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
