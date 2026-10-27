import React, { useState } from 'react';
import { X, Check, Copy, Terminal, Server, ArrowRight } from 'lucide-react';

interface DjangoIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DjangoIntegrationModal: React.FC<DjangoIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const curlCommand = `curl -X POST http://localhost:8000/api/asistencia/generar/ \\
  -H "Content-Type: application/json" \\
  -d '{"full_name": "Carlos Mendoza", "job_title": "Analista de Operaciones", "month": 10, "year": 2026}' \\
  --output hoja_asistencia.pdf`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="django-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-white">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="django-modal-title" className="text-sm font-semibold text-slate-900">
                Arquitectura de Integración con Django
              </h3>
              <p className="text-xs text-slate-500">
                Conexión entre el frontend React y el script existente en Python
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Flujo de datos */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Flujo de Ejecución</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block">1. React UI</span>
                <span className="text-[11px] text-slate-500">Captura Nombre y Cargo</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block">2. REST API</span>
                <span className="text-[11px] text-slate-500">POST con payload JSON</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block">3. Python Script</span>
                <span className="text-[11px] text-slate-500">Genera matriz y documento</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-900 block">4. Descarga</span>
                <span className="text-[11px] text-slate-500">Devuelve archivo binario</span>
              </div>
            </div>
          </div>

          {/* Archivos incluidos en el proyecto */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Archivos preparados en la carpeta /backend</h4>
            <ul className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[11px]">
              <li><strong className="text-slate-900">backend/attendance_generator.py:</strong> Script base en Python con la lógica de generación.</li>
              <li><strong className="text-slate-900">backend/serializers.py:</strong> Serializador DRF para validación estricta de parámetros.</li>
              <li><strong className="text-slate-900">backend/views.py:</strong> Vista que ejecuta el script y responde con el archivo.</li>
              <li><strong className="text-slate-900">backend/urls.py:</strong> Enrutamiento del endpoint REST.</li>
              <li><strong className="text-slate-900">backend/README.md:</strong> Guía de configuración con CORS y comandos.</li>
            </ul>
          </div>

          {/* Comando cURL de prueba */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Prueba rápida del endpoint Django
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar comando</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
              <code>{curlCommand}</code>
            </pre>
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
