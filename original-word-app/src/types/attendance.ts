/**
 * Tipos de datos para el Generador de Hojas de Asistencia
 */

export type ThemeColor = 'indigo' | 'slate' | 'emerald' | 'rose';
export type DocumentFormat = 'zip' | 'docx' | 'pdf' | 'csv';
export type AttendancePeriodMode = 'remaining' | 'month' | 'fortnight';

export interface AttendanceFormData {
  fullName: string;
  jobTitle: string;
  month: number; // 1-12
  year: number;
  periodMode?: AttendancePeriodMode;
  fortnight?: 1 | 2;
  department?: string;
  companyName?: string;
  format: DocumentFormat;
  themeColor: ThemeColor;
  workSchedule: string;
}

export interface FormErrors {
  fullName?: string;
  jobTitle?: string;
}

export type GenerationStatus = 'idle' | 'validating' | 'loading' | 'success' | 'error';

export interface GeneratedDocument {
  id: string;
  filename: string;
  fileBlob: Blob;
  fileUrl: string;
  fullName: string;
  jobTitle: string;
  month: number;
  monthName: string;
  year: number;
  companyName?: string;
  sizeBytes: number;
  sheetCount?: number;
  createdAt: string;
  isSimulation: boolean;
  format: DocumentFormat;
  themeColor: ThemeColor;
}

export interface DayRow {
  day: number;
  weekday: string;
  dateStr: string;
  isWeekend: boolean;
  entryTime: string;
  exitTime: string;
  observation: string;
}
