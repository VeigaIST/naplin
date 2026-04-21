import Script from "next/script";
import { THEME_COOKIE } from "@/lib/theme-constants";

const inline = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);var v=m?decodeURIComponent(m[1]):'system';var d=v==='dark'||(v==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeScript() {
  return (
    <Script id="naplin-theme-init" strategy="beforeInteractive">
      {inline}
    </Script>
  );
}
