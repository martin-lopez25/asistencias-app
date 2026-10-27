/** Generación local de hojas DOCX a partir de la plantilla original. */
import JSZip from 'jszip';
import { AttendanceFormData, GeneratedDocument } from '../types/attendance';
import { getMonthName, getRemainingYearPeriod } from '../utils/calendarUtils';
import { generateOriginalDocx } from '../utils/originalDocxGenerator';

export interface GenerationResponse {
  success: boolean;
  document?: GeneratedDocument;
  error?: string;
}

export async function generateAttendanceSheet(formData: AttendanceFormData): Promise<GenerationResponse> {
  const { fullName, jobTitle, department, year, themeColor, companyName, month } = formData;
  const periodMode = formData.periodMode ?? 'remaining';
  const fortnight = formData.fortnight ?? 1;
  const currentPeriod = getRemainingYearPeriod();
  const startMonth = periodMode === 'remaining' ? currentPeriod.startMonth : month;
  const endMonth = periodMode === 'remaining' ? 12 : month;
  const fortnights: (1 | 2)[] = periodMode === 'fortnight' ? [fortnight] : [1, 2];
  const sheetCount = (endMonth - startMonth + 1) * fortnights.length;
  const periodLabel = periodMode === 'remaining'
    ? currentPeriod.label
    : periodMode === 'month'
      ? getMonthName(month)
      : `${getMonthName(month)}, quincena ${fortnight}`;
  const safeName = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const archive = new JSZip();

  for (let month = startMonth; month <= endMonth; month += 1) {
    for (const selectedFortnight of fortnights) {
      const docx = await generateOriginalDocx({
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        department: department?.trim(),
        month,
        year,
        fortnight: selectedFortnight,
      });
      archive.file(`ASISTENCIA_${year}_${String(month).padStart(2, '0')}_Q${selectedFortnight}.docx`, docx);
    }
  }

  const fileBlob = await archive.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  const fileUrl = URL.createObjectURL(fileBlob);
  const rangeSuffix = periodMode === 'remaining'
    ? `${String(startMonth).padStart(2, '0')}_a_12`
    : periodMode === 'month'
      ? String(month).padStart(2, '0')
      : `${String(month).padStart(2, '0')}_Q${fortnight}`;

  return {
    success: true,
    document: {
      id: `local-${Date.now()}`,
      filename: `asistencias_${safeName}_${year}_${rangeSuffix}.zip`,
      fileBlob,
      fileUrl,
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      month: startMonth,
      monthName: periodLabel,
      year,
      companyName,
      sizeBytes: fileBlob.size,
      sheetCount,
      createdAt: new Date().toISOString(),
      isSimulation: false,
      format: 'zip',
      themeColor,
    },
  };
}
