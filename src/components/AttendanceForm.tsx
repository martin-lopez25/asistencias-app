import React, { useState } from 'react';
import {
  Loader2,
  ArrowRight,
  User,
  Briefcase,
  Building2,
  Calendar,
  SlidersHorizontal,
  Palette,
  Clock,
} from 'lucide-react';
import { AttendanceFormData, FormErrors, ThemeColor } from '../types/attendance';
import { MONTH_NAMES_ES, getRemainingYearPeriod } from '../utils/calendarUtils';

interface AttendanceFormProps {
  formData: AttendanceFormData;
  onChange: (field: keyof AttendanceFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: FormErrors;
}

const THEME_OPTIONS: { id: ThemeColor; label: string; colorClass: string; borderClass: string }[] = [
  { id: 'indigo', label: 'Índigo Ejecutivo', colorClass: 'bg-indigo-600', borderClass: 'border-indigo-600' },
  { id: 'slate', label: 'Azul Marino Clásico', colorClass: 'bg-slate-900', borderClass: 'border-slate-900' },
  { id: 'emerald', label: 'Esmeralda Corporativo', colorClass: 'bg-emerald-600', borderClass: 'border-emerald-600' },
  { id: 'rose', label: 'Borgoña Institucional', colorClass: 'bg-rose-700', borderClass: 'border-rose-700' },
];

const SCHEDULE_OPTIONS = [
  '08:00 - 17:00',
  '09:00 - 18:00',
  '07:30 - 16:30',
  '08:30 - 17:30',
];

const DEFAULT_DEPARTMENT = 'COORDINACION DE VINCULACION ESTATAL';

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  errors,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const isStaticPreview = import.meta.env.VITE_STATIC_PREVIEW === 'true';
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];
  const period = getRemainingYearPeriod();

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Campo: Nombre completo */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Nombre <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            id="fullName"
            type="text"
            autoCapitalize="characters"
            maxLength={120}
            disabled={isLoading}
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="EJ. ANA MARÍA GÓMEZ"
            aria-required="true"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
              errors.fullName
                ? 'border-rose-400 focus:ring-rose-500/10 focus:border-rose-500'
                : 'border-slate-300/90 focus:ring-indigo-500/15 focus:border-indigo-600'
            }`}
          />
        </div>
        {errors.fullName && (
          <p id="fullName-error" className="mt-1.5 text-xs text-rose-600 font-medium">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Campo: Cargo o puesto */}
      <div>
        <label
          htmlFor="jobTitle"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Puesto <span className="text-rose-500" aria-hidden="true">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Briefcase className="w-4 h-4" />
          </div>
          <input
            id="jobTitle"
            type="text"
            autoCapitalize="characters"
            maxLength={120}
            disabled={isLoading}
            value={formData.jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            placeholder="EJ. ENLACE ADMINISTRATIVO"
            aria-required="true"
            aria-invalid={!!errors.jobTitle}
            aria-describedby={errors.jobTitle ? 'jobTitle-error' : undefined}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
              errors.jobTitle
                ? 'border-rose-400 focus:ring-rose-500/10 focus:border-rose-500'
                : 'border-slate-300/90 focus:ring-indigo-500/15 focus:border-indigo-600'
            }`}
          />
        </div>
        {errors.jobTitle && (
          <p id="jobTitle-error" className="mt-1.5 text-xs text-rose-600 font-medium">
            {errors.jobTitle}
          </p>
        )}
      </div>

      {/* Campo: Adscripción */}
      <div>
        <label
          htmlFor="departmentOption"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Adscripción
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <select
            id="departmentOption"
            disabled={isLoading}
            value={formData.department === DEFAULT_DEPARTMENT ? DEFAULT_DEPARTMENT : 'custom'}
            onChange={(e) => onChange('department', e.target.value === 'custom' ? '' : e.target.value)}
            className="w-full appearance-none pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300/90 transition-all bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value={DEFAULT_DEPARTMENT}>{DEFAULT_DEPARTMENT}</option>
            <option value="custom">Otra adscripción...</option>
          </select>
        </div>
        {formData.department !== DEFAULT_DEPARTMENT && (
          <input
            id="department"
            type="text"
            autoCapitalize="characters"
            maxLength={120}
            disabled={isLoading}
            value={formData.department || ''}
            onChange={(e) => onChange('department', e.target.value)}
            placeholder="Escribe la adscripción"
            aria-label="Otra adscripción"
            className="mt-2 w-full px-4 py-3 text-sm rounded-xl border border-slate-300/90 transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500"
          />
        )}
      </div>

      {/* Selector de paleta cromática (Figma / UIverse style) */}
      {formData.format !== 'zip' && <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-500" />
          Estilo visual del documento
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = formData.themeColor === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onChange('themeColor', theme.id)}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${theme.colorClass} shrink-0`} />
                <span className="text-[11px] font-medium text-slate-800 truncate">
                  {theme.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>}

      {/* Desplegable de ajustes de período y horario */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Ocultar opciones avanzadas' : 'Más opciones (Período, Horario, Empresa)'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mes */}
              <div>
                <label htmlFor="monthSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.format === 'zip' ? 'Mes de vista previa' : 'Mes de registro'}
                </label>
                <select
                  id="monthSelect"
                  disabled={isLoading}
                  value={formData.month}
                  onChange={(e) => onChange('month', parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  {MONTH_NAMES_ES.map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año */}
              <div>
                <label htmlFor="yearSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                  Año
                </label>
                <select
                  id="yearSelect"
                  disabled={isLoading}
                  value={formData.year}
                  onChange={(e) => onChange('year', parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Horario */}
              <div className={formData.format === 'zip' ? 'hidden' : undefined}>
                <label htmlFor="scheduleSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                  Jornada habitual
                </label>
                <select
                  id="scheduleSelect"
                  disabled={isLoading || formData.format === 'zip'}
                  value={formData.workSchedule}
                  onChange={(e) => onChange('workSchedule', e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  {SCHEDULE_OPTIONS.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formato */}
              <div>
                <label htmlFor="formatSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                  Formato de salida
                </label>
                <select
                  id="formatSelect"
                  disabled={isLoading}
                  value={formData.format}
                  onChange={(e) => onChange('format', e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  {isStaticPreview ? (
                    <option value="pdf">PDF de muestra (.pdf)</option>
                  ) : (
                    <option value="zip">Word original - {period.documentCount} hojas (.zip)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Nombre de la empresa opcional */}
            <div className={formData.format === 'zip' ? 'hidden' : undefined}>
              <label htmlFor="companyNameInput" className="block text-xs font-semibold text-slate-700 mb-1">
                Encabezado institucional / Empresa (opcional)
              </label>
              <input
                id="companyNameInput"
                type="text"
                disabled={isLoading || formData.format === 'zip'}
                value={formData.companyName || ''}
                onChange={(e) => onChange('companyName', e.target.value)}
                placeholder="EMPRESA / INSTITUCIÓN"
                className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botón principal (UIverse gradient button with tactile interaction) */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-500/25 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-100" />
              <span>Generando tu hoja de asistencia...</span>
            </>
          ) : (
            <>
              <span>
                {isStaticPreview
                  ? 'Generar PDF de muestra'
                  : `Generar ${period.documentCount} hojas: ${period.label.toLowerCase()}`}
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-200" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
