import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { minutesToHoursMinutes } from './workHoursCalculations';
import { NotoSansJPFont } from './NotoSansJP-font';

interface WorkRecord {
  id: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_start: string | null;
  break_end: string | null;
  totalWorkMinutes?: number;
  within8Hours?: number;
  overtimeHours?: number;
  nightWorkMinutes?: number;
  dayOfWeek?: string;
  isHoliday?: boolean;
  holidayName?: string;
}

interface MonthlyTotals {
  totalWorkMinutes: number;
  totalNightMinutes: number;
  totalWithin8Hours: number;
  totalOvertimeMinutes: number;
}

interface DayOfWeekSummary {
  [key: string]: {
    dayName: string;
    totalWorkMinutes: number;
    nightWorkMinutes: number;
    within8Hours: number;
    overtimeHours: number;
  };
}

interface HolidaySummary {
  totalWorkMinutes: number;
  nightWorkMinutes: number;
  within8Hours: number;
  overtimeHours: number;
}

interface ExportOptions {
  individualName: string;
  month: string;
  workRecords: WorkRecord[];
  monthlyTotals: MonthlyTotals;
  dayOfWeekSummary: DayOfWeekSummary;
  holidaySummary: HolidaySummary;
}

export function exportToPDF(options: ExportOptions) {
  const { individualName, month, workRecords, monthlyTotals, dayOfWeekSummary, holidaySummary } = options;

  const labels = {
    title: String.fromCharCode(0x52e4, 0x52d9, 0x8a18, 0x9332, 0x8868),
    name: String.fromCharCode(0x6c0f, 0x540d),
    targetMonth: String.fromCharCode(0x5bfe, 0x8c61, 0x6708),
    monthlyTotal: String.fromCharCode(0x6708, 0x9593, 0x5408, 0x8a08),
    item: String.fromCharCode(0x9805, 0x76ee),
    hours: String.fromCharCode(0x6642, 0x9593),
    totalWorkHours: String.fromCharCode(0x7dcf, 0x52b4, 0x50cd, 0x6642, 0x9593),
    nightHours: String.fromCharCode(0x6df1, 0x591c, 0x6642, 0x9593, 0x6570),
    within8Hours: String.fromCharCode(0x0038, 0x6642, 0x9593, 0x4ee5, 0x5185),
    overtime: String.fromCharCode(0x8d85, 0x904e, 0x6642, 0x9593),
    weekdaySummary: String.fromCharCode(0x66dc, 0x65e5, 0x5225, 0x96c6, 0x8a08),
    weekday: String.fromCharCode(0x66dc, 0x65e5),
    totalWork: String.fromCharCode(0x7dcf, 0x52b4, 0x50cd),
    night: String.fromCharCode(0x6df1, 0x591c),
    within8h: String.fromCharCode(0x0038, 0x6642, 0x9593, 0x4ee5, 0x5185),
    over: String.fromCharCode(0x8d85, 0x904e),
    holiday: String.fromCharCode(0x795d, 0x65e5),
    dailyRecords: String.fromCharCode(0x65e5, 0x5225, 0x52e4, 0x52d9, 0x8a18, 0x9332),
    date: String.fromCharCode(0x65e5, 0x4ed8),
    clockIn: String.fromCharCode(0x51fa, 0x52e4),
    clockOut: String.fromCharCode(0x9000, 0x52e4),
    breakTime: String.fromCharCode(0x4f11, 0x61a9),
    within8hShort: String.fromCharCode(0x0038, 0x0068, 0x4ee5, 0x5185)
  };

  const doc = new jsPDF();

  doc.addFileToVFS('NotoSansJP.ttf', NotoSansJPFont);
  doc.addFont('NotoSansJP.ttf', 'NotoSansJP', 'normal');
  doc.setFont('NotoSansJP');

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(18);
  doc.text(labels.title, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`${labels.name}: ${individualName}`, 14, yPosition);
  yPosition += 7;
  doc.text(`${labels.targetMonth}: ${month}`, 14, yPosition);

  yPosition += 12;
  doc.setFontSize(14);
  doc.text(labels.monthlyTotal, 14, yPosition);

  yPosition += 8;
  autoTable(doc, {
    startY: yPosition,
    columns: [
      { header: labels.item, dataKey: 'item' },
      { header: labels.hours, dataKey: 'hours' }
    ],
    body: [
      { item: labels.totalWorkHours, hours: minutesToHoursMinutes(monthlyTotals.totalWorkMinutes) },
      { item: labels.nightHours, hours: minutesToHoursMinutes(monthlyTotals.totalNightMinutes) },
      { item: labels.within8Hours, hours: minutesToHoursMinutes(monthlyTotals.totalWithin8Hours) },
      { item: labels.overtime, hours: minutesToHoursMinutes(monthlyTotals.totalOvertimeMinutes) },
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], font: 'NotoSansJP', fontStyle: 'normal' },
    styles: { font: 'NotoSansJP', fontStyle: 'normal' },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.text(labels.weekdaySummary, 14, yPosition);

  yPosition += 8;
  const dayOfWeekData = Object.entries(dayOfWeekSummary).map(([, data]) => [
    `${data.dayName}曜日`,
    minutesToHoursMinutes(data.totalWorkMinutes),
    minutesToHoursMinutes(data.nightWorkMinutes),
    minutesToHoursMinutes(data.within8Hours),
    minutesToHoursMinutes(data.overtimeHours),
  ]);

  dayOfWeekData.push([
    labels.holiday,
    minutesToHoursMinutes(holidaySummary.totalWorkMinutes),
    minutesToHoursMinutes(holidaySummary.nightWorkMinutes),
    minutesToHoursMinutes(holidaySummary.within8Hours),
    minutesToHoursMinutes(holidaySummary.overtimeHours),
  ]);

  autoTable(doc, {
    startY: yPosition,
    columns: [
      { header: labels.weekday, dataKey: 'weekday' },
      { header: labels.totalWork, dataKey: 'totalWork' },
      { header: labels.night, dataKey: 'night' },
      { header: labels.within8h, dataKey: 'within8h' },
      { header: labels.over, dataKey: 'over' }
    ],
    body: dayOfWeekData.map(row => ({
      weekday: row[0],
      totalWork: row[1],
      night: row[2],
      within8h: row[3],
      over: row[4]
    })),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], font: 'NotoSansJP', fontStyle: 'normal' },
    styles: { font: 'NotoSansJP', fontStyle: 'normal' },
    margin: { left: 14 },
  });

  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.text(labels.dailyRecords, 14, yPosition);

  yPosition += 8;
  const recordsData = workRecords.map(record => [
    `${record.work_date} (${record.dayOfWeek})${record.isHoliday ? ' [祝]' : ''}`,
    record.clock_in,
    record.clock_out,
    record.break_start && record.break_end
      ? `${record.break_start}-${record.break_end}`
      : '-',
    minutesToHoursMinutes(record.totalWorkMinutes || 0),
    minutesToHoursMinutes(record.nightWorkMinutes || 0),
    minutesToHoursMinutes(record.within8Hours || 0),
    minutesToHoursMinutes(record.overtimeHours || 0),
  ]);

  autoTable(doc, {
    startY: yPosition,
    columns: [
      { header: labels.date, dataKey: 'date' },
      { header: labels.clockIn, dataKey: 'clockIn' },
      { header: labels.clockOut, dataKey: 'clockOut' },
      { header: labels.breakTime, dataKey: 'breakTime' },
      { header: labels.totalWork, dataKey: 'totalWork' },
      { header: labels.night, dataKey: 'night' },
      { header: labels.within8hShort, dataKey: 'within8hShort' },
      { header: labels.over, dataKey: 'over' }
    ],
    body: recordsData.map(row => ({
      date: row[0],
      clockIn: row[1],
      clockOut: row[2],
      breakTime: row[3],
      totalWork: row[4],
      night: row[5],
      within8hShort: row[6],
      over: row[7]
    })),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], font: 'NotoSansJP', fontStyle: 'normal' },
    styles: { fontSize: 8, font: 'NotoSansJP', fontStyle: 'normal' },
    margin: { left: 14, right: 14 },
  });

  const fileName = `勤務記録_${individualName}_${month}.pdf`;
  doc.save(fileName);
}
