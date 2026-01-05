import { Navigation } from "./components/Navigation";
import { BreadcrumbInline } from "./components/BreadcrumbInline";
import { ProblemDetailSection } from "./components/ProblemDetailSection";
import { SolutionDetailSection } from "./components/SolutionDetailSection";
import { CurriculumDetailSection } from "./components/CurriculumDetailSection";
import { PricingDetailSection } from "./components/PricingDetailSection";
import { ProcessDetailSection } from "./components/ProcessDetailSection";
import { CTADetailSection } from "./components/CTADetailSection";
import { FooterBase } from "./components/FooterBase";

export default function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-default)' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="max-w-[1280px] mx-auto px-5 md:px-20">
          <BreadcrumbInline />
        </div>
        
        <ProblemDetailSection />
        <SolutionDetailSection />
        <CurriculumDetailSection />
        <PricingDetailSection />
        <ProcessDetailSection />
        <CTADetailSection />
      </main>
      
      <FooterBase />
    </div>
  );
}
