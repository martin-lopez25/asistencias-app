import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export const Footer: React.FC = () => {
  const isNativeApp = Capacitor.isNativePlatform();
  const apkUrl = import.meta.env.VITE_ANDROID_APK_URL?.trim() || `${import.meta.env.BASE_URL}asistencia.apk`;

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start text-xs text-slate-500">
        {!isNativeApp && <section aria-label="Descarga para Android" className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-800">Aplicación para Android</p>
            <p>{apkUrl ? 'Descarga el instalador para Android.' : 'El APK todavía no está publicado.'}</p>
          </div>
          {apkUrl ? (
            <a
              href={apkUrl}
              download
              className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 font-semibold text-white transition-colors hover:bg-emerald-800"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Descargar APK
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-md bg-slate-200 px-3 py-2 font-semibold text-slate-500"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              APK no disponible
            </button>
          )}
        </section>}
      </div>
    </footer>
  );
};
