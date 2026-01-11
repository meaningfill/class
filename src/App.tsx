import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";

const KAKAO_CHAT_URL = import.meta.env.VITE_KAKAO_CHANNEL_URL || "http://pf.kakao.com/_qAhfxj/chat";

// Base path injected at build time.
declare const __BASE_PATH__: string;

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={typeof __BASE_PATH__ !== "undefined" ? __BASE_PATH__ : "/"}>
        <AppRoutes />
        <a
          href={KAKAO_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:scale-105"
        >
          <span className="text-lg" aria-hidden="true">💬</span>
          카카오톡 상담
        </a>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;


