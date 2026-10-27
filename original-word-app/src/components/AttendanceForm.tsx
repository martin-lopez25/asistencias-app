import React, { useState } from 'react';
import {
  Loader2,
  ArrowRight,
  User,
  Briefcase,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { AttendanceFormData, FormErrors } from '../types/attendance';
import { getRemainingYearPeriod } from '../utils/calendarUtils';

interface AttendanceFormProps {
  formData: AttendanceFormData;
  onChange: (field: keyof AttendanceFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: FormErrors;
}

const DEFAULT_DEPARTMENT = 'COORDINACION DE VINCULACION ESTATAL';

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  errors,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);
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
              <div>
                <label htmlFor="yearSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                  Año de las hojas
                </label>
                <select
                  id="yearSelect"
                  disabled={isLoading}
                  value={formData.year}
                  onChange={(e) => onChange('year', parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1">Formato de salida</span>
                <p className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800">
                  Word original · {period.documentCount} hojas (.zip)
                </p>
              </div>
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
              <span>Generar {period.documentCount} hojas: {period.label.toLowerCase()}</span>
              <ArrowRight className="w-4 h-4 text-indigo-200" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
