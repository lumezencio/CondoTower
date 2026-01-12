import AppBackground from "@/components/layout/AppBackground";
import LicenseStatusBar from "@/components/layout/LicenseStatusBar";
import * as SidebarModule from "@/components/layout/Sidebar";
const Sidebar = (SidebarModule as any).default ?? (SidebarModule as any).Sidebar ?? (SidebarModule as any);


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBackground>
      <div className="min-h-dvh flex flex-col">
        {/* Barra de Status de Licença (topo) */}
        <LicenseStatusBar userEmail="admin@condotech.com" />

        {/* Layout principal */}
        <div className="flex-1 grid grid-cols-[280px_1fr]">
          <aside><Sidebar /></aside>
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AppBackground>
  );
}

