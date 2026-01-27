
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-T39P50VFLC';

// Log the page view with their URL
export const pageview = (url: string) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

// Log specific events happening.
export const event = ({ action, category, label, value }: { action: string, category: string, label?: string, value?: number }) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } else {
        console.log(`[GA4 Dev] Event: ${action}`, { category, label, value });
    }
};

// Add to window type
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}
