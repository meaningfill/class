import { ChevronRight } from "lucide-react";

export function BreadcrumbInline() {
  return (
    <div className="flex items-center gap-2 py-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors">
        홈
      </a>
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
      <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors">
        클래스
      </a>
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
      <span className="text-[var(--text-body)]">
        4일 완성 과정
      </span>
    </div>
  );
}