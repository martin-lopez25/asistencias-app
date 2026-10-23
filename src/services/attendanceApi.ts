/**
 * Servicio de comunicación con la API REST (Django) y generador adaptativo
 */
import { AttendanceFormData, GeneratedDocument } from '../types/attendance';
import { generateAttendancePDF, generateAttendanceCSV } from '../utils/pdfGenerator';
import { getMonthName, getRemainingYearPeriod } from '../utils/calendarUtils';

// URL base del backend de Django (configurable por variable de entorno)
export const DJANGO_API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export interface GenerationResponse {
  success: boolean;
  document?: GeneratedDocument;
  error?: string;
}

/**
 * Solicita la generación de la hoja de asistencia al backend Django.
 * Si el backend aún no está activo, ejecuta la generación del documento
 * identificando con total transparencia el modo de simulación/previsualización.
 */
export async function generateAttendanceSheet(
  formData: AttendanceFormData,
  options?: { forceSimulation?: boolean }
): Promise<GenerationResponse> {
  const { fullName, jobTitle, month, year, format, themeColor, companyName, workSchedule } = formData;
  const monthName = getMonthName(month);
  const safeName = fullName.trim().toLowerCase().replace(/\s+/g, '_');
  const fallbackFilename = `hoja_asistencia_${safeName}_${monthName.toLowerCase()}_${year}.${format}`;

  if (format === 'zip') {
    const period = getRemainingYearPeriod();
    const response = await fetch('/api/asistencia/original/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName.trim(), job_title: jobTitle.trim(), year }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(details?.error || 'No se pudo generar el Word. Comprueba el servidor Python local.');
    }
    if (!response.headers.get('Content-Type')?.includes('application/zip')) {
      throw new Error('El servidor no devolvio las hojas Word esperadas.');
    }
    const fileBlob = await response.blob();
    return {
      success: true,
      document: {
        id: `original-${Date.now()}`,
        filename: `asistencias_${safeName}_${year}_${String(period.startMonth).padStart(2, '0')}_a_12.zip`,
        fileBlob,
        fileUrl: URL.createObjectURL(fileBlob),
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        month: period.startMonth,
        monthName: period.label,
        year,
        companyName,
        sizeBytes: fileBlob.size,
        createdAt: new Date().toISOString(),
        isSimulation: false,
        format,
        themeColor,
      },
    };
  }

  // Intento de consulta al backend Django si está disponible
  if (!options?.forceSimulation) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${DJANGO_API_BASE_URL}/asistencia/generar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf, text/csv, application/octet-stream, text/html',
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          job_title: jobTitle.trim(),
          month,
          year,
          format_type: format,
          company_name: companyName,
          theme_color: themeColor,
          work_schedule: workSchedule,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const disposition = response.headers.get('Content-Disposition');
        let filename = fallbackFilename;
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }

        const fileBlob = await response.blob();
        const fileUrl = URL.createObjectURL(fileBlob);

        return {
          success: true,
          document: {
            id: `doc-${Date.now()}`,
            filename,
            fileBlob,
            fileUrl,
            fullName: fullName.trim(),
            jobTitle: jobTitle.trim(),
            month,
            monthName,
            year,
            companyName,
            sizeBytes: fileBlob.size,
            createdAt: new Date().toISOString(),
            isSimulation: false,
            format,
            themeColor,
          },
        };
      }
    } catch {
      // Backend Django no disponible todavía en este entorno
    }
  }

  // Simulación temporal y generación de documento real para pruebas
  await new Promise((resolve) => setTimeout(resolve, 500));

  const blob =
    format === 'csv'
      ? generateAttendanceCSV({
          fullName: fullName.trim(),
          jobTitle: jobTitle.trim(),
          month,
          year,
          companyName,
          workSchedule,
        })
      : generateAttendancePDF({
          fullName: fullName.trim(),
          jobTitle: jobTitle.trim(),
          month,
          year,
          companyName,
          themeColor,
          workSchedule,
        });

  const fileUrl = URL.createObjectURL(blob);

  return {
    success: true,
    document: {
      id: `doc-sim-${Date.now()}`,
      filename: fallbackFilename,
      fileBlob: blob,
      fileUrl,
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      month,
      monthName,
      year,
      companyName,
      sizeBytes: blob.size,
      createdAt: new Date().toISOString(),
      isSimulation: true,
      format,
      themeColor,
    },
  };
}
