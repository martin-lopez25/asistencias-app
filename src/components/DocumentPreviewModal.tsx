import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { generateMonthDays, getMonthName } from '../utils/calendarUtils';
import { DocumentFormat, ThemeColor } from '../types/attendance';
import { LiveSheetPreview } from './LiveSheetPreview';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  jobTitle: string;
  month: number;
  year: number;
  companyName?: string;
  themeColor?: ThemeColor;
  workSchedule?: string;
  onDownload?: () => void;
  format?: DocumentFormat;
}

const THEME_STYLES: Record<ThemeColor, {
  headerBg: string;
  accentText: string;
  tableHeaderBg: string;
  weekendBg: string;
}> = {
  indigo: {
    headerBg: 'bg-indigo-700',
    accentText: 'text-indigo-700',
    tableHeaderBg: 'bg-indigo-900',
    weekendBg: 'bg-indigo-50/40',
  },
  slate: {
    headerBg: 'bg-slate-900',
    accentText: 'text-slate-800',
    tableHeaderBg: 'bg-slate-900',
    weekendBg: 'bg-slate-100/70',
  },
  emerald: {
    headerBg: 'bg-emerald-800',
    accentText: 'text-emerald-800',
    tableHeaderBg: 'bg-emerald-950',
    weekendBg: 'bg-emerald-50/40',
  },
  rose: {
    headerBg: 'bg-rose-800',
    accentText: 'text-rose-800',
    tableHeaderBg: 'bg-rose-950',
    weekendBg: 'bg-rose-50/40',
  },
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  fullName,
  jobTitle,
  month,
  year,
  companyName = 'EMPRESA / INSTITUCIÓN',
  themeColor = 'indigo',
  workSchedule = '08:00 - 17:00',
  onDownload,
  format = 'pdf',
}) => {
  if (!isOpen) return null;

  if (format === 'zip') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 p-3 sm:p-8 flex justify-center" role="dialog" aria-modal="true" aria-label="Hojas quincenales">
        <div className="w-full max-w-4xl flex flex-col min-h-0">
          <button type="button" onClick={onClose} aria-label="Cerrar previsualización" title="Cerrar"
            className="self-end bg-white p-2 rounded-md mb-2"><X className="w-5 h-5" /></button>
          <LiveSheetPreview fullName={fullName} jobTitle={jobTitle} month={month} year={year} format={format} onDownload={onDownload} />
        </div>
      </div>
    );
  }

  const monthName = getMonthName(month);
  const days = generateMonthDays(year, month);
  const theme = THEME_STYLES[themeColor] || THEME_STYLES.indigo;
  const displayName = fullName.trim() || 'Colaborador no especificado';
  const displayRole = jobTitle.trim() || 'Cargo no especificado';
  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const scheduleParts = workSchedule.split('-').map((s) => s.trim());
  const entryDefault = scheduleParts[0] || '08:00';
  const exitDefault = scheduleParts[1] || '17:00';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Barra superior estilo Figma */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${theme.headerBg}`} />
            <h3 id="preview-title" className="text-sm font-display font-bold text-slate-900">
              Vista Completa de la Hoja de Asistencia
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              · {monthName} {year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Cerrar previsualización"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja de papel simulada (formato A4) */}
        <div className="p-6 sm:p-10 max-h-[78vh] overflow-y-auto bg-slate-100/50 flex justify-center print:p-0">
          <div className="w-full max-w-2xl bg-white p-8 rounded-sm document-sheet-shadow border border-slate-200 text-slate-900">
            {/* Encabezado del documento */}
            <div className={`h-1.5 w-full ${theme.headerBg} rounded-t-xs mb-4`} />
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.accentText}`}>
                {companyName}
              </span>
              <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide mt-0.5">
                Control Mensual de Asistencia Laboral
              </h1>
              <p className="text-xs text-slate-500 uppercase mt-0.5">
                Registro Oficial de Asistencia y Permanencia
              </p>
            </div>

            {/* Ficha técnica del colaborador */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-600">Colaborador: </span>
                <span className="text-slate-900 font-semibold uppercase">{displayName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">Cargo: </span>
                <span className="text-slate-900 font-semibold">{displayRole}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600">Período: </span>
                <span className="text-slate-900 font-semibold">
                  {monthName} {year}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-600">Fecha de emisión: </span>
                <span className="text-slate-900 font-mono">{todayStr}</span>
              </div>
            </div>

            {/* Cuadrícula de asistencia */}
            <div className="border border-slate-300 rounded overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className={`${theme.tableHeaderBg} text-white font-semibold`}>
                      <th className="py-1.5 px-2 text-center w-8 border-r border-white/20">Día</th>
                      <th className="py-1.5 px-2 border-r border-white/20">Día Semana</th>
                      <th className="py-1.5 px-2 text-center w-16 border-r border-white/20">Entrada</th>
                      <th className="py-1.5 px-2 w-32 border-r border-white/20">Firma Entrada</th>
                      <th className="py-1.5 px-2 text-center w-16 border-r border-white/20">Salida</th>
                      <th className="py-1.5 px-2 w-32 border-r border-white/20">Firma Salida</th>
                      <th className="py-1.5 px-2">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {days.map((d) => (
                      <tr
                        key={d.day}
                        className={
                          d.isWeekend
                            ? `${theme.weekendBg} text-slate-400`
                            : d.day % 2 === 0
                            ? 'bg-slate-50/60 text-slate-800'
                            : 'bg-white text-slate-800'
                        }
                      >
                        <td className="py-1 px-2 text-center font-mono font-medium border-r border-slate-200">
                          {d.day.toString().padStart(2, '0')}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 whitespace-nowrap">
                          {d.weekday}
                        </td>
                        <td className="py-1 px-2 text-center font-mono border-r border-slate-200">
                          {d.isWeekend ? '--:--' : entryDefault}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200"></td>
                        <td className="py-1 px-2 text-center font-mono border-r border-slate-200">
                          {d.isWeekend ? '--:--' : exitDefault}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200"></td>
                        <td className="py-1 px-2 text-[10px] text-slate-400 italic">
                          {d.observation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloque de firmas */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center text-xs">
              <div className="pt-8 border-t border-slate-400">
                <p className="font-bold text-slate-900 uppercase">{displayName}</p>
                <p className="text-slate-500 mt-0.5">{displayRole}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Firma del Colaborador</p>
              </div>
              <div className="pt-8 border-t border-slate-400">
                <p className="font-bold text-slate-900 uppercase">Supervisión / RRHH</p>
                <p className="text-slate-500 mt-0.5">Gestión de Talento Humano</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Firma y Sello de Validación</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar previsualización
          </button>
        </div>
      </div>
    </div>
  );
};
