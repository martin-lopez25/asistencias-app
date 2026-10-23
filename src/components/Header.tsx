import React from 'react';
import { Eye } from 'lucide-react';

interface HeaderProps {
  activeTab?: 'editor' | 'preview';
  onTabChange?: (tab: 'editor' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'editor',
  onTabChange,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Zona 1: Logo & Marca moderna (Sin login) */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/images/logo-asistencia.jpg"
            alt=""
            className="h-32 w-32 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-base font-display font-bold tracking-tight text-slate-900 leading-none">
              Generador de Asistencia
            </span>
          </div>
        </div>

        {/* Zona 2: Navegación por pestañas moderna (estilo HeroUI) */}
        <nav className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onTabChange?.('editor')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            Formulario
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.('preview')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900 text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hoja en Vivo</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
