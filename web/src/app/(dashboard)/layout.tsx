import AppBackground from "@/components/layout/AppBackground";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBackground>
      <div className="min-h-dvh grid grid-cols-[280px_1fr]">
        <aside><Sidebar /></aside>
        <main className="p-6">{children}</main>
      </div>
    </AppBackground>
  );
}
