/**
 * Utilidades de calendario y formateo en español para hojas de asistencia
 */
import { DayRow } from '../types/attendance';

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const WEEKDAY_NAMES_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function getMonthName(monthNumber: number): string {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return MONTH_NAMES_ES[monthNumber - 1];
  }
  return `Mes ${monthNumber}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getRemainingYearPeriod(today = new Date()) {
  const startMonth = today.getMonth() + 1;
  return {
    startMonth,
    documentCount: (13 - startMonth) * 2,
    label: startMonth === 12 ? 'Diciembre' : `${getMonthName(startMonth)} a diciembre`,
  };
}

export function generateMonthDays(year: number, month: number): DayRow[] {
  const daysCount = getDaysInMonth(year, month);
  const rows: DayRow[] = [];

  for (let day = 1; day <= daysCount; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayName = WEEKDAY_NAMES_ES[dayOfWeek];

    const dayPad = day.toString().padStart(2, '0');
    const monthPad = month.toString().padStart(2, '0');

    rows.push({
      day,
      weekday: weekdayName,
      dateStr: `${dayPad}/${monthPad}/${year}`,
      isWeekend,
      entryTime: isWeekend ? '--:--' : '08:00',
      exitTime: isWeekend ? '--:--' : '17:00',
      observation: isWeekend ? 'Fin de semana' : '',
    });
  }

  return rows;
}
