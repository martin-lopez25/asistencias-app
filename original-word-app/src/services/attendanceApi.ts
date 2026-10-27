/** Generación local de hojas DOCX a partir de la plantilla original. */
import JSZip from 'jszip';
import { AttendanceFormData, GeneratedDocument } from '../types/attendance';
import { getRemainingYearPeriod } from '../utils/calendarUtils';
import { generateOriginalDocx } from '../utils/originalDocxGenerator';

export interface GenerationResponse {
  success: boolean;
  document?: GeneratedDocument;
  error?: string;
}

export async function generateAttendanceSheet(formData: AttendanceFormData): Promise<GenerationResponse> {
  const { fullName, jobTitle, department, year, themeColor, companyName } = formData;
  const period = getRemainingYearPeriod();
  const safeName = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const archive = new JSZip();

  for (let month = period.startMonth; month <= 12; month += 1) {
    for (const fortnight of [1, 2] as const) {
      const docx = await generateOriginalDocx({
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        department: department?.trim(),
        month,
        year,
        fortnight,
      });
      archive.file(`ASISTENCIA_${year}_${String(month).padStart(2, '0')}_Q${fortnight}.docx`, docx);
    }
  }

  const fileBlob = await archive.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  const fileUrl = URL.createObjectURL(fileBlob);

  return {
    success: true,
    document: {
      id: `local-${Date.now()}`,
      filename: `asistencias_${safeName}_${year}_${String(period.startMonth).padStart(2, '0')}_a_12.zip`,
      fileBlob,
      fileUrl,
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      month: period.startMonth,
      monthName: period.label,
      year,
      companyName,
      sizeBytes: fileBlob.size,
      createdAt: new Date().toISOString(),
      isSimulation: false,
      format: 'zip',
      themeColor,
    },
  };
}
