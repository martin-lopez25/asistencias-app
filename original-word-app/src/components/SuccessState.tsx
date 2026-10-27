import React, { useEffect } from 'react';
import { Download, RotateCcw, CheckCircle2, FileText, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedDocument } from '../types/attendance';

interface SuccessStateProps {
  documents: GeneratedDocument[];
  onDownload: (document: GeneratedDocument) => void;
  onReset: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  documents,
  onDownload,
  onReset,
}) => {
  const firstDocument = documents[0];
  const sheetCount = documents.reduce((total, item) => total + (item.sheetCount ?? 1), 0);
  const totalSize = documents.reduce((total, item) => total + item.sizeBytes, 0);
  const formattedSize = (totalSize / 1024).toFixed(1);
  const isZip = documents.length === 1 && firstDocument.format === 'zip';
  const periodName = documents.length > 1
    ? firstDocument.monthName.replace(/, quincena [12]$/, '')
    : firstDocument.monthName;

  // Celebración visual al generar con éxito (UIverse / Lovable style)
  useEffect(() => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0f766e', '#14b8a6', '#10b981', '#d97706'],
      });
    } catch {
      // Ignorar si el entorno bloquea canvas
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner de confirmación con gradiente sutil */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-slate-900">
            {sheetCount === 1 ? '¡La hoja está lista!' : `¡Las ${sheetCount} hojas están listas!`}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Documento procesado correctamente para <strong className="text-slate-900">{firstDocument.fullName}</strong> ({firstDocument.jobTitle}).
          </p>
        </div>
      </div>

      {/* Tarjeta de resumen de datos del documento */}
      <div className="border border-slate-200/90 rounded-2xl p-5 bg-white shadow-xs space-y-4">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {documents.length === 1 ? firstDocument.filename : `${documents.length} archivos Word`}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-indigo-600">{isZip ? 'ZIP' : 'DOCX'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formattedSize} KB</span>
              <span aria-hidden="true">·</span>
              <span>{periodName} {firstDocument.year}</span>
            </div>
          </div>
        </div>

        {/* Metadatos capturados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">
              Colaborador
            </span>
            <span className="text-slate-900 font-semibold text-xs mt-0.5 block truncate">
              {firstDocument.fullName}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">
              Cargo registrado
            </span>
            <span className="text-slate-900 font-semibold text-xs mt-0.5 block truncate">
              {firstDocument.jobTitle}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">
              Período
            </span>
            <span className="text-slate-900 font-semibold text-xs mt-0.5 block">
              {periodName} {firstDocument.year}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">
              Motor de generación
            </span>
            <span className="text-slate-900 font-semibold text-xs mt-0.5 block">
              Plantilla Word original
            </span>
          </div>
        </div>

        {/* Aviso transparente de simulación */}
        {documents.every((document) => document.format === 'zip' || document.format === 'docx') && (
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-800">Documento Word original generado en este dispositivo.</strong> No requiere servidor ni instalar Word.
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción principales */}
      <div className="space-y-3">
        <div className="space-y-2">
          {documents.map((generatedDocument) => (
            <div key={generatedDocument.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">{generatedDocument.filename}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {generatedDocument.format.toUpperCase()} · {(generatedDocument.sizeBytes / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDownload(generatedDocument)}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-800"
              >
                <Download className="h-4 w-4" />
                Descargar {generatedDocument.format === 'zip' ? 'ZIP' : 'Word'}
              </button>
            </div>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={onReset}
            className="h-10 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Generar otra</span>
          </button>
        </div>
      </div>
    </div>
  );
};
