import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../../../components/common/SEO';
import HeroSection from './components/HeroSection';
import Comparison from './components/Comparison';
import IntroSection from './components/IntroSection';
import PortfolioSection from './components/PortfolioSection';
import BlogPreviewSection from './components/BlogPreviewSection';
import WebsiteInquirySection from './components/WebsiteInquirySection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

export default function HomePage() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://meaningfill.co.kr';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '미닝필',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: '레시피부터 웹사이트까지, 바로 창업 가능한 케이터링 클래스',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressRegion: 'Seoul',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  };

  // WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '미닝필',
    url: siteUrl,
    description:
      '레시피, 패키징, 가격 책정, 주문 웹사이트까지 케이터링 창업의 모든 것을 1:1로 설계합니다',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '미닝필',
    image: `${siteUrl}/logo.png`,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressRegion: 'Seoul',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.5665,
      longitude: 126.978,
    },
    priceRange: '₩₩',
    description:
      '미닝필은 레시피만 알려주지 않습니다. 대량 조리법, 패키징, 가격 책정, 주문 웹사이트 구축까지 케이터링 창업에 필요한 모든 것을 1:1로 함께 만드는 실전 창업 클래스입니다.',
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="레시피부터 웹사이트까지, 바로 창업 가능한 케이터링 클래스"
        description="미닝필은 레시피만 알려주지 않습니다. 대량 조리법, 패키징, 가격 책정, 주문 웹사이트 구축까지 케이터링 창업에 필요한 모든 것을 1:1로 함께 만드는 실전 창업 클래스입니다."
        keywords="케이터링, 도시락창업, 단체주문, 대량조리, 쿠킹클래스, 미닝필, 창업교육"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      <Navbar />
      <HeroSection />
      <Comparison />
      <IntroSection />
      <PortfolioSection />
      <BlogPreviewSection />
      <WebsiteInquirySection />
      <Footer />
    </div>
  );
}

