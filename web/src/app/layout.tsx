import "./globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "Sistema de gestão condominial",
  description: "Condotech — plataforma integrada de gestão condominial.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
