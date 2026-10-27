/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AttendanceForm } from './components/AttendanceForm';
import { SuccessState } from './components/SuccessState';
import {
  AttendanceFormData,
  FormErrors,
  GenerationStatus,
  GeneratedDocument,
} from './types/attendance';
import { generateAttendanceSheet } from './services/attendanceApi';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('No se pudo preparar el archivo para compartir.'));
        return;
      }
      resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo generado.'));
    reader.readAsDataURL(blob);
  });
}

export default function App() {
  const currentDate = new Date();

  // Estado del formulario
  const [formData, setFormData] = useState<AttendanceFormData>({
    fullName: '',
    jobTitle: '',
    department: 'COORDINACION DE VINCULACION ESTATAL',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    companyName: 'EMPRESA / INSTITUCIÓN',
    format: 'zip',
    themeColor: 'indigo',
    workSchedule: '08:00 - 17:00',
  });

  // Estado de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado del proceso de generación
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejador de cambios en los campos
  const handleFieldChange = (field: keyof AttendanceFormData, value: any) => {
    const normalizedValue = field === 'fullName' || field === 'jobTitle' || field === 'department'
      ? String(value).toLocaleUpperCase('es-MX')
      : value;
    setFormData((prev) => ({ ...prev, [field]: normalizedValue }));

    // Limpiar error del campo modificado
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage(null);
    }
  };

  // Validación de campos obligatorios
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Por favor, introduce tu nombre completo.';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Por favor, introduce tu cargo o puesto.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesamiento y envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setStatus('validating');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await generateAttendanceSheet(formData);

      const documents = response.documents ?? (response.document ? [response.document] : []);
      if (response.success && documents.length > 0) {
        setGeneratedDocuments(documents);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(
          'No se pudo generar el documento en este momento. Por favor, verifica la información e intenta nuevamente.'
        );
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo generar la hoja en este dispositivo.'
      );
    }
  };

  // Descarga del documento generado
  const handleDownload = async (download: GeneratedDocument) => {
    if (status === 'loading') return;
    try {
      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: download.filename,
          data: await blobToBase64(download.fileBlob),
          directory: Directory.Cache,
        });
        await Share.share({
          title: download.filename,
          text: 'Hoja de asistencia en Word.',
          url: savedFile.uri,
          dialogTitle: 'Guardar hoja de asistencia',
        });
        return;
      }
      const link = document.createElement('a');
      link.href = download.fileUrl;
      link.download = download.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo descargar el documento.');
    }
  };

  // Restablecer para generar una nueva hoja
  const handleReset = () => {
    setStatus('idle');
    for (const generatedDocument of generatedDocuments) URL.revokeObjectURL(generatedDocument.fileUrl);
    setGeneratedDocuments([]);
    setErrorMessage(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 hero-gradient-bg">
      {/* Encabezado / Navbar (Sin login) */}
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-slate-900">
              Genera tu hoja de asistencia
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Hojas quincenales desde el mes actual hasta diciembre, usando el Word original.
            </p>
          </div>
        </div>

        <div className="glass-panel glow-card-indigo rounded-2xl p-5 sm:p-7 shadow-sm transition-all">
          {status === 'error' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3" role="alert">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">No se pudo completar la generación</h3>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950 underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reintentar
                </button>
              </div>
            </div>
          )}

          {status === 'success' && generatedDocuments.length > 0 ? (
            <SuccessState
              documents={generatedDocuments}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          ) : (
            <AttendanceForm
              formData={formData}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              isLoading={status === 'loading'}
              errors={errors}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
