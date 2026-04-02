import "./globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "Sistema de gestao condominial",
  description: "CondoTower - plataforma integrada de gestao condominial.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Script para evitar flash de tema errado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('condotower-theme');
                  var theme = mode;
                  if (!mode || mode === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
