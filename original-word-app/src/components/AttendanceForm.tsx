import React, { useState } from 'react';
import {
  Loader2,
  ArrowRight,
  User,
  Briefcase,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { AttendanceFormData, AttendancePeriodMode, FormErrors } from '../types/attendance';
import { MONTH_NAMES_ES, getRemainingYearPeriod } from '../utils/calendarUtils';

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
  const periodMode = formData.periodMode ?? 'remaining';
  const selectedMonthName = MONTH_NAMES_ES[formData.month - 1];
  const documentCount = periodMode === 'remaining' ? period.documentCount : periodMode === 'month' ? 2 : 1;
  const periodLabel = periodMode === 'remaining'
    ? period.label.toLowerCase()
    : periodMode === 'month'
      ? selectedMonthName.toLowerCase()
      : `${selectedMonthName.toLowerCase()}, quincena ${formData.fortnight ?? 1}`;

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

      {/* Opciones avanzadas */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Ocultar opciones avanzadas' : 'Más opciones'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="periodMode" className="block text-xs font-semibold text-slate-700 mb-1">
                  Período de generación
                </label>
                <select
                  id="periodMode"
                  disabled={isLoading}
                  value={periodMode}
                  onChange={(e) => onChange('periodMode', e.target.value as AttendancePeriodMode)}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                >
                  <option value="remaining">Desde el mes actual hasta diciembre</option>
                  <option value="month">Un mes completo</option>
                  <option value="fortnight">Una quincena</option>
                </select>
              </div>
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
            </div>
            {periodMode !== 'remaining' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="monthSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mes
                  </label>
                  <select
                    id="monthSelect"
                    disabled={isLoading}
                    value={formData.month}
                    onChange={(e) => onChange('month', parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                  >
                    {MONTH_NAMES_ES.map((name, index) => (
                      <option key={name} value={index + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                {periodMode === 'fortnight' && (
                  <div>
                    <label htmlFor="fortnightSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                      Quincena
                    </label>
                    <select
                      id="fortnightSelect"
                      disabled={isLoading}
                      value={formData.fortnight ?? 1}
                      onChange={(e) => onChange('fortnight', parseInt(e.target.value, 10))}
                      className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                    >
                      <option value={1}>Primera (días 1 al 15)</option>
                      <option value={2}>Segunda (del 16 al fin de mes)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Formato de salida</span>
              <p className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800">
                Word original · {documentCount} {documentCount === 1 ? 'hoja' : 'hojas'} (.zip)
              </p>
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
              <span>Generar {documentCount} {documentCount === 1 ? 'hoja' : 'hojas'}: {periodLabel}</span>
              <ArrowRight className="w-4 h-4 text-indigo-200" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
