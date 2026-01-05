import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import IntroSection from './components/IntroSection';
import Comparison from './components/Comparison';
import CurriculumSection from './components/CurriculumSection';
import PortfolioSection from './components/PortfolioSection';
import CateringOrderSection from './components/CateringOrderSection';
import ScheduleSection from './components/ScheduleSection';
import WebsiteInquirySection from './components/WebsiteInquirySection';
import Footer from './components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FCF8FF]">
      <Navbar />
      <main>
        <HeroSection />
        <Comparison />
        <IntroSection />
        <CurriculumSection />
        <PortfolioSection />
        <CateringOrderSection />
        <ScheduleSection />
        <WebsiteInquirySection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
