'use client';

/**
 * ThemeSettingsModal - Modal de Configuracoes de Tema
 * Projeto: CondoTower
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: {
  id: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
  colors: { bg: string; surface: string; accent: string };
}[] = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Ideal para ambientes iluminados',
    icon: Sun,
    colors: { bg: 'bg-slate-100', surface: 'bg-white', accent: 'bg-indigo-500' },
  },
  {
    id: 'dark',
    label: 'Escuro',
    description: 'Confortavel para os olhos',
    icon: Moon,
    colors: { bg: 'bg-slate-900', surface: 'bg-slate-800', accent: 'bg-indigo-400' },
  },
  {
    id: 'system',
    label: 'Automatico',
    description: 'Segue as configuracoes do sistema',
    icon: Monitor,
    colors: { bg: 'bg-gradient-to-r from-slate-100 to-slate-900', surface: 'bg-gradient-to-r from-white to-slate-800', accent: 'bg-indigo-500' },
  },
];

export default function ThemeSettingsModal({ isOpen, onClose }: ThemeSettingsModalProps) {
  const { themeMode, setThemeMode, isDark } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative overflow-hidden rounded-2xl shadow-2xl bg-surface border border-theme"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Aparencia</h2>
                    <p className="text-sm text-muted">Escolha seu tema preferido</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-secondary transition-colors text-muted hover:text-primary"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = themeMode === option.id;

                    return (
                      <motion.button
                        type="button"
                        key={option.id}
                        onClick={() => setThemeMode(option.id)}
                        title={`Selecionar tema ${option.label}`}
                        className={`
                          relative w-full p-4 rounded-xl text-left transition-all duration-200
                          bg-surface-secondary
                          ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:bg-surface-hover'}
                        `}
                        style={{
                          // @ts-ignore
                          '--tw-ring-offset-color': 'var(--background)',
                        }}
                        whileHover={{ scale: isSelected ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Preview */}
                          <div className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 ${option.colors.bg} border border-white/10`}>
                            <div className="h-full p-1.5 flex flex-col gap-1">
                              <div className={`h-2 rounded-sm ${option.colors.surface}`} />
                              <div className="flex-1 flex gap-1">
                                <div className={`w-4 rounded-sm ${option.colors.surface}`} />
                                <div className="flex-1 flex flex-col gap-0.5">
                                  <div className={`h-1.5 w-3/4 rounded-sm ${option.colors.accent}`} />
                                  <div className={`h-1 w-full rounded-sm ${option.colors.surface}`} />
                                  <div className={`h-1 w-2/3 rounded-sm ${option.colors.surface}`} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                              <span className="font-semibold text-primary">{option.label}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted">{option.description}</p>
                          </div>

                          {/* Check */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Info adicional */}
                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-secondary">
                      <strong>Dica:</strong> O modo automatico detecta as configuracoes do seu
                      dispositivo e ajusta o tema conforme a preferencia do sistema.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-theme flex items-center justify-between">
                <p className="text-sm text-muted">
                  Tema atual: <span className="font-medium text-primary">{isDark ? 'Escuro' : 'Claro'}</span>
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary px-6 py-2"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
