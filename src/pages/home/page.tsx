import { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import IntroSection from './components/IntroSection';
import CurriculumSection from './components/CurriculumSection';
import PortfolioSection from './components/PortfolioSection';
import WebsiteInquirySection from './components/WebsiteInquirySection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

export default function HomePage() {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
    
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Order Builder",
      "url": siteUrl,
      "logo": `${siteUrl}/logo.png`,
      "description": "레시피부터 웹사이트까지, 바로 창업 가능한 올인원 케이터링 클래스",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KR",
        "addressRegion": "Seoul"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Korean"
      }
    };

    // WebSite Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Order Builder",
      "url": siteUrl,
      "description": "레시피, 패키징, 가격 책정, 주문 웹사이트까지 케이터링 창업의 모든 것을 1:1로 설계합니다",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    // LocalBusiness Schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Order Builder",
      "image": `${siteUrl}/logo.png`,
      "url": siteUrl,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KR",
        "addressRegion": "Seoul"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.5665,
        "longitude": 126.9780
      },
      "priceRange": "₩₩",
      "description": "Order Builder는 레시피만 알려주지 않습니다. 대량 조리법, 패키징, 가격 책정, 주문 웹사이트 구축까지 케이터링 창업에 필요한 모든 것을 1:1로 함께 만드는 실전 창업 클래스입니다."
    };

    // Add schemas to head
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(organizationSchema);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(websiteSchema);
    document.head.appendChild(script2);

    const script3 = document.createElement('script');
    script3.type = 'application/ld+json';
    script3.text = JSON.stringify(localBusinessSchema);
    document.head.appendChild(script3);

    // Update meta tags
    document.title = 'Order Builder | 레시피부터 웹사이트까지, 바로 창업 가능한 케이터링 클래스';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Order Builder는 레시피만 알려주지 않습니다. 대량 조리법, 패키징, 가격 책정, 주문 웹사이트 구축까지 케이터링 창업에 필요한 모든 것을 1:1로 함께 만드는 실전 창업 클래스입니다.');
    }

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
      document.head.removeChild(script3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <IntroSection />
      <CurriculumSection />
      <PortfolioSection />
      <WebsiteInquirySection />
      <Footer />
    </div>
  );
}
