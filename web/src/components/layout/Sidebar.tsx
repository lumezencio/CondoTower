'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gauge, LifeBuoy, FileCheck2, Megaphone, Wallet, FileText,
  BookOpenText, Contact, CalendarDays, MessageSquareText,
  CircleCheck, Users, Package, ListChecks, BarChart3, Dog, Gift, Brain, LogOut
 } from "lucide-react";

function cx(...a: (string | false | undefined)[]) { return a.filter(Boolean).join(" "); }

type Item = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: Item[] = [
  { key: "inicio",       label: "Início",                 href: "/dashboard",                 icon: Home },
  { key: "resumo",       label: "Resumo de Gestão",       href: "/dashboard/resumo",          icon: Gauge },
  { key: "chamados",     label: "Chamados",               href: "/dashboard/chamados",        icon: LifeBuoy },
  { key: "prestacao",    label: "Prestação de Contas",    href: "/dashboard/prestacao",       icon: FileCheck2 },
  { key: "comunicados",  label: "Comunicados",            href: "/dashboard/comunicados",     icon: Megaphone },
  { key: "financas",     label: "Finanças",               href: "/dashboard/financas",        icon: Wallet },
  { key: "documentos",   label: "Documentos",             href: "/dashboard/documentos",      icon: FileText },
  { key: "ocorrencias",  label: "Livro de Ocorrências",   href: "/dashboard/ocorrencias",     icon: BookOpenText },
  { key: "contatos",     label: "Agenda de Contatos",     href: "/dashboard/contatos",        icon: Contact },
  { key: "eventos",      label: "Eventos & Reservas",     href: "/dashboard/eventos",         icon: CalendarDays },
  { key: "recados",      label: "Recados",                href: "/dashboard/recados",         icon: MessageSquareText },
  { key: "aprova",       label: "Aprovações",             href: "/dashboard/aprovacoes",      icon: CircleCheck },
  { key: "assembleia",   label: "Assembleia Virtual",     href: "/dashboard/assembleia",      icon: Users },
  { key: "encomendas",   label: "Encomendas",             href: "/dashboard/encomendas",      icon: Package },
  { key: "enquetes",     label: "Enquetes",               href: "/dashboard/enquetes",        icon: ListChecks },
  { key: "relatorios",   label: "Relatórios",             href: "/dashboard/relatorios",      icon: BarChart3 },
  { key: "pets",         label: "Pets",                   href: "/dashboard/pets",            icon: Dog },
  { key: "sorteio",      label: "Sorteio",                href: "/dashboard/sorteio",         icon: Gift },
  { key: "ia",           label: "IA",                     href: "/dashboard/ia",              icon: Brain },
  { key: "cad-unidades", label: "Cadastros · Unidades", href: "/cadastros/unidades", icon: Home }

];

const ICON_COLORS: Record<string, string> = {
  inicio: "text-sky-400",
  resumo: "text-emerald-400",
  chamados: "text-rose-400",
  prestacao: "text-amber-400",
  comunicados: "text-indigo-400",
  financas: "text-teal-400",
  documentos: "text-blue-400",
  ocorrencias: "text-fuchsia-400",
  contatos: "text-lime-400",
  eventos: "text-cyan-400",
  recados: "text-violet-400",
  aprova: "text-emerald-400",
  assembleia: "text-orange-400",
  encomendas: "text-sky-400",
  enquetes: "text-purple-400",
  relatorios: "text-pink-400",
  pets: "text-yellow-400",
  sorteio: "text-rose-400",
  ia: "text-cyan-400",
  sair: "text-red-400",
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative isolate h-dvh w-[280px] overflow-hidden">
      {/* vidro + degradê do painel */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/55 to-slate-900/35 backdrop-blur-xl ring-1 ring-white/10" />
      {/* “linha” direita suavizada (blur) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-white/10 to-transparent blur-2xl" />
      
      <div className="relative z-10 flex h-full flex-col">
        {/* Cabeçalho com favicon e título */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Image
            src="/icon.svg"
            alt="Condotech"
            width={26}
            height={26}
            className="drop-shadow-[0_0_14px_rgba(99,102,241,0.55)]"
          />
          <div className="text-sm font-semibold tracking-wide text-slate-200">Menu</div>
        </div>

        {/* Itens */}
        <nav className="flex-1 overflow-y-auto px-1 pb-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href || pathname?.startsWith(it.href + "/");
            return (
              <Link
                key={it.key}
                href={it.href}
                className={cx(
                  "group mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-[0.93rem] font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-slate-300/90 hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10"
                )}
              >
                <Icon
                  className={cx(
                    "h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110",
                    ICON_COLORS[it.key] || "text-sky-400"
                  )}
                />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé — Sair */}
        <div className="relative mt-auto">
          <div className="pointer-events-none absolute -top-3 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <button
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST" }); }
              finally { window.location.href = "/login"; }
            }}
            className="mx-2 mb-3 mt-4 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2 text-[0.93rem] font-semibold text-slate-200/90 transition hover:bg-white/5 hover:text-white hover:ring-1 hover:ring-white/10"
          >
            <LogOut className={cx("h-[18px] w-[18px]", ICON_COLORS.sair)} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

