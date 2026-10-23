/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AttendanceForm } from './components/AttendanceForm';
import { SuccessState } from './components/SuccessState';
import { LiveSheetPreview } from './components/LiveSheetPreview';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import {
  AttendanceFormData,
  FormErrors,
  GenerationStatus,
  GeneratedDocument,
} from './types/attendance';
import { generateAttendanceSheet } from './services/attendanceApi';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const currentDate = new Date();

  // Estado del formulario
  const [formData, setFormData] = useState<AttendanceFormData>({
    fullName: '',
    jobTitle: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    companyName: 'EMPRESA / INSTITUCIÓN',
    format: 'zip',
    themeColor: 'indigo',
    workSchedule: '08:00 - 17:00',
  });

  // Estado de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Pestaña activa en móvil ('editor' | 'preview')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Estado del proceso de generación
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de modales
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Manejador de cambios en los campos
  const handleFieldChange = (field: keyof AttendanceFormData, value: any) => {
    const normalizedValue = field === 'fullName' || field === 'jobTitle'
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

      if (response.success && response.document) {
        setGeneratedDoc(response.document);
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
        error instanceof Error ? error.message : 'No se pudo generar la hoja. Comprueba el servidor local.'
      );
    }
  };

  // Descarga del documento generado
  const handleDownload = async () => {
    if (status === 'loading' || !validate()) return;
    try {
      let download = generatedDoc;
      if (!download) {
        setStatus('loading');
        const response = await generateAttendanceSheet(formData);
        if (!response.document) throw new Error('No se pudo generar el documento.');
        download = response.document;
        setGeneratedDoc(download);
      }
      setStatus('success');
      setErrorMessage(null);
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
    if (generatedDoc) URL.revokeObjectURL(generatedDoc.fileUrl);
    setGeneratedDoc(null);
    setErrorMessage(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 hero-gradient-bg">
      {/* Encabezado / Navbar (Sin login) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Contenedor principal tipo Estudio Interactivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Cabecera de bienvenida inspirada en Lovable / HeroUI */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-slate-900">
              Genera tu hoja de asistencia
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl">
              Hojas de asistencia desde el mes actual hasta diciembre, en el formato Word original.
            </p>
          </div>

          {/* Selector de vista en pantallas móviles */}
          <div className="flex sm:hidden justify-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  activeTab === 'editor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Formulario
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Vista Previa
              </button>
            </div>
          </div>
        </div>

        {/* Cuadrícula de trabajo (Split Studio: Formulario a la izquierda, Lienzo en vivo a la derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Panel Izquierdo: Formulario & Estados */}
          <div
            className={`lg:col-span-5 space-y-6 ${
              activeTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="glass-panel glow-card-indigo rounded-2xl p-6 sm:p-7 shadow-sm transition-all">
              {/* Alerta de Error amigable */}
              {status === 'error' && (
                <div
                  className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-rose-900">
                      No se pudo completar la generación
                    </h3>
                    <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-950 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* Estado de Éxito o Formulario */}
              {status === 'success' && generatedDoc ? (
                <SuccessState
                  document={generatedDoc}
                  onDownload={handleDownload}
                  onPreview={() => setShowPreviewModal(true)}
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
          </div>

          {/* Panel Derecho: Lienzo de Vista Previa en Vivo (Estilo Figma Canvas) */}
          <div
            className={`lg:col-span-7 min-w-0 h-[700px] lg:h-[760px] sticky top-20 ${
              activeTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LiveSheetPreview
              fullName={formData.fullName}
              jobTitle={formData.jobTitle}
              month={formData.month}
              year={formData.year}
              companyName={formData.companyName}
              themeColor={formData.themeColor}
              workSchedule={formData.workSchedule}
              onDownload={handleDownload}
              isGenerated={status === 'success'}
              format={formData.format}
            />
          </div>
        </div>
      </main>

      {/* Modal de Previsualización Completa A4 */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        format={formData.format}
        onClose={() => setShowPreviewModal(false)}
        fullName={generatedDoc ? generatedDoc.fullName : formData.fullName}
        jobTitle={generatedDoc ? generatedDoc.jobTitle : formData.jobTitle}
        month={generatedDoc ? generatedDoc.month : formData.month}
        year={generatedDoc ? generatedDoc.year : formData.year}
        companyName={formData.companyName}
        themeColor={formData.themeColor}
        workSchedule={formData.workSchedule}
        onDownload={handleDownload}
      />

      {/* Pie de página discreto */}
      <Footer
        onOpenPreview={() => setShowPreviewModal(true)}
      />
    </div>
  );
}
