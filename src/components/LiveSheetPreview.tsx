import React, { useEffect, useState } from 'react';
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { generateMonthDays, getMonthName, getRemainingYearPeriod } from '../utils/calendarUtils';
import { DocumentFormat, ThemeColor } from '../types/attendance';

interface LiveSheetPreviewProps {
  fullName: string;
  jobTitle: string;
  department?: string;
  month: number;
  year: number;
  companyName?: string;
  themeColor?: ThemeColor;
  workSchedule?: string;
  onDownload?: () => void;
  isGenerated?: boolean;
  format?: DocumentFormat;
}

const THEME_STYLES: Record<ThemeColor, {
  headerBg: string;
  accentText: string;
  badgeBg: string;
  badgeBorder: string;
  tableHeaderBg: string;
  weekendBg: string;
  borderAccent: string;
}> = {
  indigo: {
    headerBg: 'bg-indigo-700',
    accentText: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    tableHeaderBg: 'bg-indigo-900',
    weekendBg: 'bg-indigo-50/40',
    borderAccent: 'border-indigo-600',
  },
  slate: {
    headerBg: 'bg-slate-900',
    accentText: 'text-slate-800',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    tableHeaderBg: 'bg-slate-900',
    weekendBg: 'bg-slate-100/70',
    borderAccent: 'border-slate-900',
  },
  emerald: {
    headerBg: 'bg-emerald-800',
    accentText: 'text-emerald-800',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    tableHeaderBg: 'bg-emerald-950',
    weekendBg: 'bg-emerald-50/40',
    borderAccent: 'border-emerald-700',
  },
  rose: {
    headerBg: 'bg-rose-800',
    accentText: 'text-rose-800',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    tableHeaderBg: 'bg-rose-950',
    weekendBg: 'bg-rose-50/40',
    borderAccent: 'border-rose-700',
  },
};

export const LiveSheetPreview: React.FC<LiveSheetPreviewProps> = ({
  fullName,
  jobTitle,
  department = 'COORDINACION DE VINCULACION ESTATAL',
  month,
  year,
  companyName = 'EMPRESA / INSTITUCIÓN',
  themeColor = 'indigo',
  workSchedule = '08:00 - 17:00',
  onDownload,
  isGenerated = false,
  format = 'pdf',
}) => {
  const [scale, setScale] = useState<number>(0.92);
  const [quincena, setQuincena] = useState<1 | 2>(1);
  const [pages, setPages] = useState<{ src: string; width: number; height: number }[]>([]);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (format !== 'zip') return;
    const controller = new AbortController();
    setPreviewLoading(true);
    setPreviewError(null);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/asistencia/original/preview/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            job_title: jobTitle,
            adscripcion: department,
            year,
            month,
            fortnight: quincena,
          }),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pudo abrir la vista de Word.');
        if (!result.pages?.length) throw new Error('Word no devolvio paginas para mostrar.');
        if (!controller.signal.aborted) setPages(result.pages);
      } catch (error) {
        if (!controller.signal.aborted) setPreviewError(error instanceof Error ? error.message : 'No se pudo cargar el Word.');
      } finally {
        if (!controller.signal.aborted) setPreviewLoading(false);
      }
    }, 700);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fullName, jobTitle, department, year, month, quincena, format, retry]);
  const monthName = getMonthName(month);
  const days = generateMonthDays(year, month);
  const theme = THEME_STYLES[themeColor] || THEME_STYLES.indigo;

  const displayName = fullName.trim() || 'Nombre del Colaborador';
  const displayRole = jobTitle.trim() || 'Cargo o Función';
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

  if (format === 'zip') {
    return (
      <div className="flex flex-col h-full min-w-0 border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border-b border-slate-200">
          <div role="group" aria-label="Quincena" className="flex gap-1">
            {([1, 2] as const).map((half) => (
              <button type="button" key={half} aria-pressed={quincena === half}
                onClick={() => setQuincena(half)}
                className={`px-3 py-2 text-xs rounded-md ${quincena === half ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                Quincena {half}
              </button>
            ))}
          </div>
          <button type="button" onClick={onDownload} title={`Descargar ${getRemainingYearPeriod().documentCount} hojas: ${getRemainingYearPeriod().label} ${year}`}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-emerald-700 text-white rounded-md">
            <Download className="w-4 h-4" /> Descargar hojas
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-6" aria-busy={previewLoading}>
          {previewLoading ? (
            <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando Word...
            </div>
          ) : previewError ? (
            <div role="alert" className="p-4 text-sm text-red-700 space-y-3">
              <p>{previewError}</p>
              <button type="button" onClick={() => setRetry(value => value + 1)} className="flex items-center gap-2 text-slate-800">
                <RotateCcw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          ) : pages.map((page, index) => (
            <img key={index} src={page.src} width={page.width} height={page.height}
              alt={`Word original: ${monthName} ${year}, quincena ${quincena}, página ${index + 1}`}
              className="block w-full h-auto bg-white shadow-sm mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100/70 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Barra de herramientas estilo Figma / Studio */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          <span className="text-xs font-semibold text-slate-800">
            Vista Previa en Tiempo Real
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            · {monthName} {year}
          </span>
        </div>

        {/* Controles de Zoom y Acciones */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setScale(Math.max(0.65, scale - 0.1))}
              className="p-1 hover:text-slate-900 rounded cursor-pointer"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale(Math.min(1.15, scale + 0.1))}
              className="p-1 hover:text-slate-900 rounded cursor-pointer"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Imprimir documento"
          >
            <Printer className="w-4 h-4" />
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          )}
        </div>
      </div>

      {/* Área del Canvas con fondo cuadriculado sutil estilo Figma */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-100/90 relative">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out"
        >
          {/* Hoja de Asistencia A4 */}
          <div className="w-[620px] bg-white rounded-sm document-sheet-shadow border border-slate-300/80 p-8 text-slate-900 min-h-[860px] flex flex-col justify-between">
            <div>
              {/* Franja de acento superior */}
              <div className={`h-1.5 w-full ${theme.headerBg} rounded-t-xs mb-4`} />

              {/* Encabezado */}
              <div className="flex items-start justify-between pb-3 border-b-2 border-slate-800 mb-4">
                <div>
                  <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.accentText}`}>
                    {companyName}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase mt-0.5">
                    Control Mensual de Asistencia Laboral
                  </h2>
                  <p className="text-[10px] text-slate-500 tracking-wide uppercase">
                    Registro Oficial de Entrada, Permanencia y Salida
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">CÓDIGO DOC:</span>
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    ASIST-{year}-{month.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Ficha de datos del colaborador */}
              <div className="bg-slate-50/80 border border-slate-200 rounded p-3 mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Colaborador / Empleado
                  </span>
                  <span className="font-bold text-slate-900 uppercase truncate block">
                    {displayName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Cargo o Función
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {displayRole}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Período Registrado
                  </span>
                  <span className="font-semibold text-slate-900">
                    {monthName} {year}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                    Fecha de Emisión
                  </span>
                  <span className="font-mono text-slate-700">{todayStr}</span>
                </div>
              </div>

              {/* Cuadrícula de registro mensual */}
              <div className="border border-slate-300 rounded overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className={`${theme.tableHeaderBg} text-white font-semibold text-[9.5px]`}>
                      <th className="py-1 px-1.5 text-center w-7 border-r border-white/20">Día</th>
                      <th className="py-1 px-2 border-r border-white/20 w-20">Día Semana</th>
                      <th className="py-1 px-1 text-center w-14 border-r border-white/20">Entrada</th>
                      <th className="py-1 px-2 border-r border-white/20">Firma Entrada</th>
                      <th className="py-1 px-1 text-center w-14 border-r border-white/20">Salida</th>
                      <th className="py-1 px-2 border-r border-white/20">Firma Salida</th>
                      <th className="py-1 px-2 w-20">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {days.slice(0, 31).map((d) => (
                      <tr
                        key={d.day}
                        className={
                          d.isWeekend
                            ? `${theme.weekendBg} text-slate-400 font-normal`
                            : d.day % 2 === 0
                            ? 'bg-slate-50/60 text-slate-800'
                            : 'bg-white text-slate-800'
                        }
                      >
                        <td className="py-0.5 px-1 text-center font-mono font-bold border-r border-slate-200">
                          {d.day.toString().padStart(2, '0')}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200 whitespace-nowrap">
                          {d.weekday}
                        </td>
                        <td className="py-0.5 px-1 text-center font-mono border-r border-slate-200">
                          {d.isWeekend ? '--:--' : entryDefault}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200"></td>
                        <td className="py-0.5 px-1 text-center font-mono border-r border-slate-200">
                          {d.isWeekend ? '--:--' : exitDefault}
                        </td>
                        <td className="py-0.5 px-2 border-r border-slate-200"></td>
                        <td className="py-0.5 px-2 text-[9px] text-slate-400 italic">
                          {d.observation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloque de firmas */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-10 text-center text-[10px]">
                <div className="pt-6 border-t border-slate-400">
                  <p className="font-bold text-slate-900 uppercase truncate">{displayName}</p>
                  <p className="text-slate-600 truncate">{displayRole}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Firma del Colaborador</p>
                </div>
                <div className="pt-6 border-t border-slate-400">
                  <p className="font-bold text-slate-900 uppercase">Supervisión / RRHH</p>
                  <p className="text-slate-600">Gestión de Talento Humano</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Firma y Sello de Validación</p>
                </div>
              </div>
              <p className="text-center text-[8.5px] text-slate-400 mt-4">
                Documento de control interno conforme a la legislación laboral aplicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
