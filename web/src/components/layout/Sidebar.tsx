"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";

type Item = { key: string; label: string; href: string; icon: keyof typeof Icons };

/** Itens conforme o print */
const MENU: Item[] = [
  { key: "home",         label: "Início",                href: "/dashboard",               icon: "Home" },
  { key: "resumo",       label: "Resumo de Gestão",      href: "/dashboard/overview",      icon: "Gauge" },
  { key: "chamados",     label: "Chamados",              href: "/dashboard/chamados",      icon: "LifeBuoy" },
  { key: "prestacao",    label: "Prestação de Contas",   href: "/dashboard/prestacao",     icon: "FileCheck2" },
  { key: "comunicados",  label: "Comunicados",           href: "/dashboard/comunicados",   icon: "Megaphone" },
  { key: "financas",     label: "Finanças",              href: "/dashboard/financas",      icon: "Wallet" },
  { key: "documentos",   label: "Documentos",            href: "/dashboard/documentos",    icon: "FileText" },
  { key: "ocorrencias",  label: "Livro de Ocorrências",  href: "/dashboard/ocorrencias",   icon: "NotebookPen" },
  { key: "contatos",     label: "Agenda de Contatos",    href: "/dashboard/contatos",      icon: "Contact" },
  { key: "eventos",      label: "Eventos & Reservas",    href: "/dashboard/eventos",       icon: "CalendarDays" },
  { key: "recados",      label: "Recados",               href: "/dashboard/recados",       icon: "MessageSquareText" },
  { key: "aprovacoes",   label: "Aprovações",            href: "/dashboard/aprovacoes",    icon: "CircleCheck" },
  { key: "assembleia",   label: "Assembleia Virtual",    href: "/dashboard/assembleia",    icon: "Users" },
  { key: "encomendas",   label: "Encomendas",            href: "/dashboard/encomendas",    icon: "Package" },
  { key: "enquetes",     label: "Enquetes",              href: "/dashboard/enquetes",      icon: "ListChecks" },
  { key: "relatorios",   label: "Relatórios",            href: "/dashboard/relatorios",    icon: "BarChart3" },
  { key: "pets",         label: "Pets",                  href: "/dashboard/pets",          icon: "Dog" },
  { key: "sorteio",      label: "Sorteio",               href: "/dashboard/sorteio",       icon: "Gift" },
  { key: "ia",           label: "IA",                    href: "/dashboard/ia",            icon: "Brain" },
];

function Icon({ name, className }: { name: Item["icon"]; className?: string }) {
  const Comp = (Icons as any)[name] ?? (Icons as any)["Users"]; // fallback seguro
  return <Comp className={className} />;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/login");
  }

  return (
    <aside className="w-64 shrink-0 border-r bg-white/70 backdrop-blur">
      <div className="px-4 py-3 text-sm font-medium text-slate-500">Menu</div>
      <nav className="px-2 pb-2">
        {MENU.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t p-2">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          title="Sair"
        >
          <Icons.LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
