// src/components/layout/Sidebar/Sidebar.tsx - WORDCONDOS
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  DollarSign,
  MessageSquare,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  CalendarDays,
  Package,
  PawPrint,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  User,
  Bell,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Início',
    icon: <Home className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: <DollarSign className="w-5 h-5" />,
    href: '/financeiro',
    badge: 3,
  },
  {
    id: 'comunicados',
    label: 'Comunicados',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/comunicados',
    badge: 2,
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: <FileText className="w-5 h-5" />,
    href: '/documentos',
  },
  {
    id: 'ocorrencias',
    label: 'Ocorrências',
    icon: <AlertCircle className="w-5 h-5" />,
    href: '/ocorrencias',
    badge: 1,
  },
  {
    id: 'agenda',
    label: 'Agenda de Contatos',
    icon: <Calendar className="w-5 h-5" />,
    href: '/agenda',
  },
  {
    id: 'reservas',
    label: 'Eventos & Reservas',
    icon: <CalendarDays className="w-5 h-5" />,
    href: '/reservas',
  },
  {
    id: 'assembleia',
    label: 'Assembleia',
    icon: <Users className="w-5 h-5" />,
    href: '/assembleia',
  },
  {
    id: 'encomendas',
    label: 'Encomendas',
    icon: <Package className="w-5 h-5" />,
    href: '/encomendas',
  },
  {
    id: 'pets',
    label: 'Pets',
    icon: <PawPrint className="w-5 h-5" />,
    href: '/pets',
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: <BarChart3 className="w-5 h-5" />,
    href: '/relatorios',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: <Settings className="w-5 h-5" />,
    href: '/configuracoes',
  },
];

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    condominio: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (href: string) => pathname === href;

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 280 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-white border-r border-neutral-200 flex flex-col shadow-lg"
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-neutral-900">
                  WORDCONDOS
                </span>
                <span className="text-xs text-neutral-500">
                  Gestão Inteligente
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <Building2 className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-2 rounded-lg
            bg-neutral-100 hover:bg-neutral-200
            text-neutral-600 hover:text-neutral-900
            transition-all duration-200
            ${isCollapsed ? 'rotate-180' : ''}
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {user.condominio}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const hovered = hoveredItem === item.id;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-lg
                    transition-all duration-200
                    group
                    ${active 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <span className={`
                    flex-shrink-0
                    ${active ? 'text-white' : 'text-neutral-600 group-hover:text-primary-600'}
                  `}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {item.badge && item.badge > 0 && !isCollapsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        inline-flex items-center justify-center
                        px-2 py-0.5 rounded-full
                        text-xs font-semibold
                        ${active 
                          ? 'bg-white text-primary-600' 
                          : 'bg-primary-100 text-primary-700'
                        }
                      `}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <AnimatePresence>
                      {hovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-full ml-2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50"
                        >
                          {item.label}
                          {item.badge && item.badge > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-500 text-xs font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 p-2">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg
            text-neutral-700 hover:bg-neutral-100
            transition-all duration-200
            group
          `}
        >
          <LogOut className="w-5 h-5 text-neutral-600 group-hover:text-error" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                key="logout"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 text-sm font-medium text-left"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
