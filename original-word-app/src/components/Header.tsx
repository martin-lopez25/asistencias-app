import React from 'react';
export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex items-center gap-3">
        {/* Zona 1: Logo & Marca moderna (Sin login) */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-asistencia.jpg`}
            alt=""
            className="h-32 w-32 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-base font-display font-bold tracking-tight text-slate-900 leading-none">
              Generador de Asistencia
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
