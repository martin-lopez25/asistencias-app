/**
 * Generador de archivos de Hojas de Asistencia (PDF y CSV)
 * Soporta personalización cromática ejecutiva y proporción A4 perfecta.
 */
import { jsPDF } from 'jspdf';
import { generateMonthDays, getMonthName } from './calendarUtils';
import { ThemeColor } from '../types/attendance';

interface GenerateDocumentOptions {
  fullName: string;
  jobTitle: string;
  month: number;
  year: number;
  department?: string;
  companyName?: string;
  themeColor?: ThemeColor;
  workSchedule?: string;
}

const THEME_PALETTES: Record<ThemeColor, { primary: [number, number, number]; accent: [number, number, number]; weekendBg: [number, number, number] }> = {
  indigo: {
    primary: [67, 56, 202], // indigo-700
    accent: [99, 102, 241], // indigo-500
    weekendBg: [245, 247, 255],
  },
  slate: {
    primary: [15, 23, 42], // slate-900
    accent: [71, 85, 105], // slate-600
    weekendBg: [241, 245, 249],
  },
  emerald: {
    primary: [6, 95, 70], // emerald-800
    accent: [16, 185, 129], // emerald-500
    weekendBg: [240, 253, 244],
  },
  rose: {
    primary: [159, 18, 57], // rose-800
    accent: [244, 63, 94], // rose-500
    weekendBg: [255, 241, 242],
  },
};

/**
 * Genera un PDF profesional con la cuadrícula mensual de asistencia completa
 */
export function generateAttendancePDF(options: GenerateDocumentOptions): Blob {
  const {
    fullName,
    jobTitle,
    month,
    year,
    companyName = 'EMPRESA / INSTITUCIÓN',
    themeColor = 'indigo',
    workSchedule = '08:00 - 17:00',
  } = options;

  const palette = THEME_PALETTES[themeColor] || THEME_PALETTES.indigo;
  const monthName = getMonthName(month);
  const days = generateMonthDays(year, month);
  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Horas por defecto a partir del horario
  const scheduleParts = workSchedule.split('-').map((s) => s.trim());
  const entryDefault = scheduleParts[0] || '08:00';
  const exitDefault = scheduleParts[1] || '17:00';

  // Crear documento A4 vertical
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // 1. Encabezado institucional con línea de acento de color
  doc.setFillColor(...palette.primary);
  doc.rect(marginX, 12, contentWidth, 1.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...palette.primary);
  doc.text(companyName.toUpperCase(), marginX, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('CONTROL MENSUAL DE ASISTENCIA LABORAL', marginX, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('REGISTRO OFICIAL DE CONTROL HORARIO, ASISTENCIA Y PERMANENCIA', marginX, 27);

  // 2. Ficha de datos del colaborador
  const infoY = 30;
  const infoHeight = 16;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, infoY, contentWidth, infoHeight, 1.5, 1.5, 'FD');

  // Columna 1
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...palette.accent);
  doc.text('COLABORADOR:', marginX + 4, infoY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(fullName.toUpperCase(), marginX + 32, infoY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...palette.accent);
  doc.text('CARGO / PUESTO:', marginX + 4, infoY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(jobTitle, marginX + 32, infoY + 12);

  // Columna 2
  const col2X = marginX + contentWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...palette.accent);
  doc.text('PERÍODO:', col2X, infoY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${monthName.toUpperCase()} ${year}`, col2X + 24, infoY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...palette.accent);
  doc.text('EMISIÓN:', col2X, infoY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(today, col2X + 24, infoY + 12);

  // 3. Tabla de días
  // Anchos: Día(9), DíaSemana(23), Entrada(16), FirmaEntrada(45), Salida(16), FirmaSalida(45), Obs(28) = 182
  const colWidths = [9, 23, 16, 45, 16, 45, 28];
  const colHeaders = [
    'Día',
    'Día Semana',
    'Entrada',
    'Firma Entrada',
    'Salida',
    'Firma Salida',
    'Observaciones',
  ];

  let currentY = 50;
  const headerHeight = 6;
  const rowHeight = 5.5;

  // Cabecera de la tabla con color temático
  doc.setFillColor(...palette.primary);
  doc.rect(marginX, currentY, contentWidth, headerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curX = marginX;
  for (let i = 0; i < colHeaders.length; i++) {
    const align = i === 0 || i === 2 || i === 4 ? 'center' : 'left';
    const textX = align === 'center' ? curX + colWidths[i] / 2 : curX + 2;
    doc.text(colHeaders[i], textX, currentY + 4.2, { align: align as 'left' | 'center' });
    curX += colWidths[i];
  }

  currentY += headerHeight;

  // Filas por cada día del mes
  days.forEach((dayData) => {
    // Fondo alternado o fin de semana
    if (dayData.isWeekend) {
      doc.setFillColor(...palette.weekendBg);
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    } else if (dayData.day % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    }

    // Línea inferior de fila
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

    // Contenido de la fila
    doc.setFont('helvetica', dayData.isWeekend ? 'normal' : 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(
      dayData.isWeekend ? 148 : 30,
      dayData.isWeekend ? 163 : 41,
      dayData.isWeekend ? 184 : 59
    );

    let cellX = marginX;

    // 1. Día número
    doc.text(
      dayData.day.toString().padStart(2, '0'),
      cellX + colWidths[0] / 2,
      currentY + 3.8,
      { align: 'center' }
    );
    cellX += colWidths[0];

    // 2. Día de la semana
    doc.setFont('helvetica', 'normal');
    doc.text(dayData.weekday, cellX + 2, currentY + 3.8);
    cellX += colWidths[1];

    // 3. Hora Entrada
    const entryTime = dayData.isWeekend ? '--:--' : entryDefault;
    doc.text(entryTime, cellX + colWidths[2] / 2, currentY + 3.8, { align: 'center' });
    cellX += colWidths[2];

    // 4. Firma Entrada
    cellX += colWidths[3];

    // 5. Hora Salida
    const exitTime = dayData.isWeekend ? '--:--' : exitDefault;
    doc.text(exitTime, cellX + colWidths[4] / 2, currentY + 3.8, { align: 'center' });
    cellX += colWidths[4];

    // 6. Firma Salida
    cellX += colWidths[5];

    // 7. Observación
    if (dayData.observation) {
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(dayData.observation, cellX + 2, currentY + 3.8);
    }

    // Líneas divisorias verticales sutiles
    let divX = marginX;
    for (let c = 0; c < colWidths.length; c++) {
      divX += colWidths[c];
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      doc.line(divX, currentY, divX, currentY + rowHeight);
    }

    currentY += rowHeight;
  });

  // Borde exterior de la tabla
  doc.setDrawColor(...palette.primary);
  doc.setLineWidth(0.35);
  doc.rect(marginX, 50, contentWidth, currentY - 50);

  // 4. Bloque de firmas al pie
  const signatureY = currentY + 10;
  const sigLineWidth = 70;

  // Firma Empleado
  const sigEmpX = marginX + 15;
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.35);
  doc.line(sigEmpX, signatureY + 8, sigEmpX + sigLineWidth, signatureY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName.toUpperCase(), sigEmpX + sigLineWidth / 2, signatureY + 12, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${jobTitle} (Firma del Empleado)`, sigEmpX + sigLineWidth / 2, signatureY + 16, {
    align: 'center',
  });

  // Firma Supervisor / RRHH
  const sigSupX = marginX + contentWidth - 15 - sigLineWidth;
  doc.line(sigSupX, signatureY + 8, sigSupX + sigLineWidth, signatureY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SUPERVISIÓN / TALENTO HUMANO', sigSupX + sigLineWidth / 2, signatureY + 12, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma y Sello de Conformidad', sigSupX + sigLineWidth / 2, signatureY + 16, {
    align: 'center',
  });

  // Pie de página institucional
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Documento de validez laboral interna. Conservar en archivo de gestión humana conforme a la legislación aplicable.',
    pageWidth / 2,
    291,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Genera el archivo en formato CSV compatible con Excel y hojas de cálculo
 */
export function generateAttendanceCSV(options: GenerateDocumentOptions): Blob {
  const {
    fullName,
    jobTitle,
    month,
    year,
    companyName = 'Institución General',
    workSchedule = '08:00 - 17:00',
  } = options;

  const monthName = getMonthName(month);
  const days = generateMonthDays(year, month);
  const today = new Date().toLocaleDateString('es-ES');
  const scheduleParts = workSchedule.split('-').map((s) => s.trim());
  const entryDefault = scheduleParts[0] || '08:00';
  const exitDefault = scheduleParts[1] || '17:00';

  const rows: string[] = [
    `REGISTRO MENSUAL DE ASISTENCIA LABORAL`,
    `Empresa / Institución,"${companyName}"`,
    `Empleado,"${fullName}"`,
    `Cargo,"${jobTitle}"`,
    `Período,"${monthName} ${year}"`,
    `Fecha de Emisión,"${today}"`,
    ``,
    `"Día","Día de la Semana","Fecha","Hora Entrada","Firma Entrada","Hora Salida","Firma Salida","Observaciones"`,
  ];

  days.forEach((d) => {
    if (d.isWeekend) {
      rows.push(`"${d.day}","${d.weekday}","${d.dateStr}","--","","--","","Fin de semana"`);
    } else {
      rows.push(`"${d.day}","${d.weekday}","${d.dateStr}","${entryDefault}","","${exitDefault}","",""`);
    }
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
