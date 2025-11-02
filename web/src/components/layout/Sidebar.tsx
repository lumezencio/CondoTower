"use client";
import { Home, Wallet, Megaphone, FileText, Building2, Calendar, Users, Inbox, PawPrint, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/financeiro", icon: Wallet, label: "Financeiro" },
  { href: "/comunicados", icon: Megaphone, label: "Comunicados" },
  { href: "/documentos", icon: FileText, label: "Documentos" },
  { href: "/blocos", icon: Building2, label: "Blocos & Aptos" },
  { href: "/reservas", icon: Calendar, label: "Eventos & Reservas" },
  { href: "/agenda", icon: Users, label: "Agenda de Contatos" },
  { href: "/encomendas", icon: Inbox, label: "Encomendas" },
  { href: "/pets", icon: PawPrint, label: "Pets" },
  { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="h-dvh w-[280px] bg-white/90 backdrop-blur border-r border-white/20 shadow-xl flex flex-col">
      <div className="h-16 flex items-center px-5 font-semibold tracking-wide">
        <span className="text-indigo-700">CONDOTECH</span>
      </div>
      <nav className="px-3 py-2 space-y-1 overflow-y-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm border transition-all",
                active
                  ? "bg-indigo-50 border-indigo-200 text-indigo-800 shadow"
                  : "bg-white/70 hover:bg-white border-white/60 text-slate-700"
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 text-[11px] text-slate-500/80">© Condotech</div>
    </div>
  );
}
