'use client';

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gauge, Wrench, FileCheck2, Megaphone, Wallet, FileText,
  BookOpenText, Contact, CalendarDays, MessageSquareText,
  Users, Package, ListChecks, BarChart3, Dog, Gift, LogOut,
  Sun, Moon, Monitor, Palette, Building2, ChevronDown, TrendingDown, TrendingUp,
  FileInput, Receipt, UserCircle, Truck
 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import ThemeSettingsModal from "@/components/ui/ThemeSettingsModal";

function cx(...a: (string | false | undefined)[]) { return a.filter(Boolean).join(" "); }

type SubItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Item = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubItem[];
};

const ITEMS: Item[] = [
  { key: "inicio",      label: "Início",              href: "/dashboard",              icon: Home },
  { key: "resumo",      label: "Resumo de Gestão",    href: "/dashboard/resumo",       icon: Gauge },
  { key: "chamados",    label: "Chamados",             href: "/chamados",               icon: Wrench },
  { key: "prestacao",   label: "Prestação de Contas", href: "/aprovacoes",             icon: FileCheck2 },
  { key: "comunicados", label: "Comunicados",          href: "/dashboard/comunicados",  icon: Megaphone },
  {
    key: "financas",
    label: "Finanças",
    href: "/financas/contas-pagar",
    icon: Wallet,
    subItems: [
      { key: "contas-pagar",    label: "Contas a Pagar",    href: "/financas/contas-pagar",    icon: TrendingDown },
      { key: "contas-receber",  label: "Contas a Receber",  href: "/financas/contas-receber",  icon: TrendingUp },
      { key: "notas-entrada",   label: "Notas de Entrada",  href: "/financas/notas-entrada",   icon: FileInput },
      { key: "impostos-retidos",label: "Impostos Retidos",  href: "/financas/impostos-retidos",icon: Receipt },
      { key: "gerar-boletos",   label: "Gerar Boletos",     href: "/financas/gerar-boletos",   icon: FileText },
    ]
  },
  {
    key: "cadastros",
    label: "Cadastros",
    href: "/cadastros/unidades",
    icon: Users,
    subItems: [
      { key: "cad-unidades",    label: "Unidades",       href: "/cadastros/unidades",      icon: Building2 },
      { key: "cad-moradores",   label: "Proprietários e Moradores", href: "/cadastros/moradores", icon: UserCircle },
      { key: "cad-pets",        label: "Pets",           href: "/dashboard/pets",          icon: Dog },
      { key: "cad-fornecedores",label: "Fornecedores",   href: "/cadastros/fornecedores",  icon: Truck },
    ]
  },
  { key: "contatos",    label: "Agenda de Contatos",  href: "/contatos",               icon: Contact },
  { key: "eventos",     label: "Eventos & Reservas",  href: "/dashboard/eventos",      icon: CalendarDays },
  { key: "recados",     label: "Recados",              href: "/recados",                icon: MessageSquareText },
  { key: "assembleia",  label: "Assembleia Virtual",   href: "/assembleia",             icon: Users },
  { key: "documentos",  label: "Documentos",           href: "/dashboard/documentos",   icon: FileText },
  { key: "ocorrencias", label: "Livro de Ocorrências", href: "/dashboard/ocorrencias",  icon: BookOpenText },
  { key: "encomendas",  label: "Encomendas",           href: "/dashboard/encomendas",   icon: Package },
  { key: "enquetes",    label: "Enquetes",              href: "/enquetes",               icon: ListChecks },
  { key: "sorteio",     label: "Sorteio",               href: "/sorteio",                icon: Gift },
  { key: "relatorios",  label: "Relatórios",            href: "/dashboard/relatorios",   icon: BarChart3 },
];

const ICON_COLORS: Record<string, string> = {
  inicio:             "text-sky-400",
  resumo:             "text-emerald-400",
  chamados:           "text-orange-400",
  prestacao:          "text-amber-400",
  comunicados:        "text-indigo-400",
  financas:           "text-teal-400",
  "contas-pagar":     "text-red-400",
  "contas-receber":   "text-green-400",
  "notas-entrada":    "text-violet-400",
  "impostos-retidos": "text-amber-400",
  "gerar-boletos":    "text-teal-400",
  cadastros:          "text-indigo-400",
  "cad-unidades":     "text-indigo-400",
  "cad-moradores":    "text-sky-400",
  "cad-pets":         "text-yellow-400",
  "cad-fornecedores":"text-teal-400",
  contatos:           "text-lime-400",
  eventos:            "text-cyan-400",
  recados:            "text-violet-400",
  assembleia:         "text-orange-400",
  documentos:         "text-blue-400",
  ocorrencias:        "text-fuchsia-400",
  encomendas:         "text-sky-400",
  enquetes:           "text-purple-400",
  sorteio:            "text-rose-400",
  relatorios:         "text-pink-400",
  sair:               "text-red-400",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { themeMode, isDark } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // Auto-expandir menu se estiver em uma sub-rota
    const expanded: string[] = [];
    ITEMS.forEach(item => {
      if (item.subItems?.some(sub => pathname?.startsWith(sub.href))) {
        expanded.push(item.key);
      }
    });
    return expanded;
  });

  // Icone do tema atual
  const ThemeIcon = themeMode === 'system' ? Monitor : (isDark ? Moon : Sun);

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

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
            alt="CondoTower"
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
            const hasSubItems = it.subItems && it.subItems.length > 0;
            const isExpanded = expandedMenus.includes(it.key);
            const isSubActive = it.subItems?.some(sub => pathname?.startsWith(sub.href));
            const active = pathname === it.href || (!hasSubItems && pathname?.startsWith(it.href + "/"));

            if (hasSubItems) {
              return (
                <div key={it.key}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(it.key)}
                    className={cx(
                      "group mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2 text-[0.93rem] font-medium transition-colors",
                      isSubActive
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
                    <span className="truncate flex-1 text-left">{it.label}</span>
                    <ChevronDown
                      className={cx(
                        "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {it.subItems!.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = pathname?.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.key}
                            href={sub.href}
                            className={cx(
                              "group mx-2 flex items-center gap-3 rounded-lg px-3 py-1.5 text-[0.85rem] font-medium transition-colors",
                              subActive
                                ? "bg-white/10 text-white ring-1 ring-white/10"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <SubIcon
                              className={cx(
                                "h-[16px] w-[16px] shrink-0 transition-transform duration-300 group-hover:scale-110",
                                ICON_COLORS[sub.key] || "text-sky-400"
                              )}
                            />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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

        {/* Rodape */}
        <div className="relative mt-auto">
          <div className="pointer-events-none absolute -top-3 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Botao de Tema */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="mx-2 mt-4 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2 text-[0.93rem] font-medium text-slate-300/90 transition hover:bg-white/5 hover:text-white hover:ring-1 hover:ring-white/10"
            title="Configuracoes de aparencia"
          >
            <Palette className="h-[18px] w-[18px] text-purple-400" />
            <span>Aparencia</span>
            <ThemeIcon className="ml-auto h-4 w-4 text-slate-400" />
          </button>

          {/* Botao Sair */}
          <button
            type="button"
            onClick={async () => {
              try { await fetch("/api/auth/logout", { method: "POST" }); }
              finally { window.location.href = "/login"; }
            }}
            className="mx-2 mb-3 mt-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2 text-[0.93rem] font-semibold text-slate-200/90 transition hover:bg-white/5 hover:text-white hover:ring-1 hover:ring-white/10"
          >
            <LogOut className={cx("h-[18px] w-[18px]", ICON_COLORS.sair)} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Modal de Tema — renderizado via portal fora do isolate context */}
      {typeof document !== "undefined" && createPortal(
        <ThemeSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />,
        document.body
      )}
    </aside>
  );
}



