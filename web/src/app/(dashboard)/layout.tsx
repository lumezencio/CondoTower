import AppBackground from "@/components/layout/AppBackground";
import * as SidebarModule from "@/components/layout/Sidebar";
const Sidebar = (SidebarModule as any).default ?? (SidebarModule as any).Sidebar ?? (SidebarModule as any);


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

