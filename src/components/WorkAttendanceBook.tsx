import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateWorkHours, minutesToHoursMinutes } from '../lib/workHoursCalculations';
import { isHoliday, getHolidayName } from '../lib/holidays';
import { exportToPDF } from '../lib/pdfExport';
import { Calendar, Trash2, Edit2, FileDown } from 'lucide-react';

interface Individual {
  id: string;
  name: string;
}

interface WorkRecord {
  id: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_start: string | null;
  break_end: string | null;
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

export function WorkAttendanceBook() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<WorkRecord | null>(null);

  useEffect(() => {
    const fetchIndividuals = async () => {
      const { data, error: err } = await supabase
        .from('individuals')
        .select('id, name')
        .order('name');

      if (err) {
        console.error('Failed to fetch individuals:', err);
        return;
      }

      setIndividuals(data || []);
      if (data && data.length > 0 && !selectedIndividualId) {
        setSelectedIndividualId(data[0].id);
      }
    };

    fetchIndividuals();
  }, []);

  useEffect(() => {
    if (selectedIndividualId) {
      fetchWorkRecords();
    }
  }, [selectedIndividualId, selectedMonth]);

  const fetchWorkRecords = async () => {
    if (!selectedIndividualId) return;

    setLoading(true);
    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate =
      month === '12'
        ? `${parseInt(year) + 1}-01-01`
        : `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`;

    const { data, error: err } = await supabase
      .from('work_records')
      .select('*')
      .eq('individual_id', selectedIndividualId)
      .gte('work_date', startDate)
      .lt('work_date', endDate)
      .order('work_date', { ascending: true });

    if (err) {
      console.error('Failed to fetch work records:', err);
      setLoading(false);
      return;
    }

    setWorkRecords(data || []);
    setLoading(false);
  };

  const calculateDayOfWeekSummary = (): { summary: DayOfWeekSummary; holidaySummary: HolidaySummary } => {
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const summary: DayOfWeekSummary = {};
    const holidaySummary: HolidaySummary = {
      totalWorkMinutes: 0,
      nightWorkMinutes: 0,
      within8Hours: 0,
      overtimeHours: 0,
    };

    daysOfWeek.forEach(day => {
      summary[day] = {
        dayName: day,
        totalWorkMinutes: 0,
        nightWorkMinutes: 0,
        within8Hours: 0,
        overtimeHours: 0,
      };
    });

    workRecords.forEach(record => {
      const date = new Date(record.work_date);
      const dayOfWeek = daysOfWeek[date.getDay()];

      const calculated = calculateWorkHours({
        work_date: record.work_date,
        clock_in: record.clock_in,
        clock_out: record.clock_out,
        break_start: record.break_start,
        break_end: record.break_end,
      });

      if (isHoliday(record.work_date)) {
        holidaySummary.totalWorkMinutes += calculated.totalWorkMinutes;
        holidaySummary.nightWorkMinutes += calculated.nightWorkMinutes;
        holidaySummary.within8Hours += calculated.within8Hours;
        holidaySummary.overtimeHours += calculated.overtimeHours;
      } else {
        summary[dayOfWeek].totalWorkMinutes += calculated.totalWorkMinutes;
        summary[dayOfWeek].nightWorkMinutes += calculated.nightWorkMinutes;
        summary[dayOfWeek].within8Hours += calculated.within8Hours;
        summary[dayOfWeek].overtimeHours += calculated.overtimeHours;
      }
    });

    return { summary, holidaySummary };
  };

  const calculateMonthlyTotals = () => {
    let totalWorkMinutes = 0;
    let totalNightMinutes = 0;
    let totalWithin8Hours = 0;
    let totalOvertimeMinutes = 0;

    workRecords.forEach(record => {
      const calculated = calculateWorkHours({
        work_date: record.work_date,
        clock_in: record.clock_in,
        clock_out: record.clock_out,
        break_start: record.break_start,
        break_end: record.break_end,
      });

      totalWorkMinutes += calculated.totalWorkMinutes;
      totalNightMinutes += calculated.nightWorkMinutes;
      totalWithin8Hours += calculated.within8Hours;
      totalOvertimeMinutes += calculated.overtimeHours;
    });

    return {
      totalWorkMinutes,
      totalNightMinutes,
      totalWithin8Hours,
      totalOvertimeMinutes,
    };
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('この記録を削除してよろしいですか？')) return;

    const { error: err } = await supabase
      .from('work_records')
      .delete()
      .eq('id', id);

    if (err) {
      console.error('Failed to delete record:', err);
      return;
    }

    fetchWorkRecords();
  };

  const updateRecord = async () => {
    if (!editFormData) return;

    const { error: err } = await supabase
      .from('work_records')
      .update(editFormData)
      .eq('id', editFormData.id);

    if (err) {
      console.error('Failed to update record:', err);
      return;
    }

    setEditingId(null);
    setEditFormData(null);
    fetchWorkRecords();
  };

  const { summary: dayOfWeekSummary, holidaySummary } = calculateDayOfWeekSummary();
  const monthlyTotals = calculateMonthlyTotals();
  const selectedIndividual = individuals.find(ind => ind.id === selectedIndividualId);

  const handleExportPDF = () => {
    if (!selectedIndividual) return;

    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const enrichedRecords = workRecords.map(record => {
      const calculated = calculateWorkHours({
        work_date: record.work_date,
        clock_in: record.clock_in,
        clock_out: record.clock_out,
        break_start: record.break_start,
        break_end: record.break_end,
      });

      const date = new Date(record.work_date);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const holidayCheck = isHoliday(record.work_date);
      const holidayName = getHolidayName(record.work_date);

      return {
        ...record,
        ...calculated,
        dayOfWeek,
        isHoliday: holidayCheck,
        holidayName: holidayName || undefined,
      };
    });

    exportToPDF({
      individualName: selectedIndividual.name,
      month: selectedMonth,
      workRecords: enrichedRecords,
      monthlyTotals,
      dayOfWeekSummary,
      holidaySummary,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">出勤簿</h2>
        </div>
        {workRecords.length > 0 && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FileDown className="w-5 h-5" />
            PDF出力
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            個人
          </label>
          <select
            value={selectedIndividualId}
            onChange={e => setSelectedIndividualId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {individuals.map(ind => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年月
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">日付</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">曜日</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">出勤</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">退勤</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">休憩開始</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">休憩終了</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">総労働時間</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">深夜時間</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">8時間以内</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">超過時間</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {workRecords.map(record => {
                  const calculated = calculateWorkHours({
                    work_date: record.work_date,
                    clock_in: record.clock_in,
                    clock_out: record.clock_out,
                    break_start: record.break_start,
                    break_end: record.break_end,
                  });

                  const date = new Date(record.work_date);
                  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                  const dateStr = record.work_date.split('-').slice(1).join('/');
                  const holidayName = getHolidayName(record.work_date);

                  const isEditing = editingId === record.id;

                  return (
                    <tr key={record.id} className={`border-b border-gray-200 hover:bg-gray-50 ${holidayName ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-2 text-gray-800">{dateStr}</td>
                      <td className="px-4 py-2 font-medium">
                        <div className={holidayName ? 'text-red-600' : 'text-gray-700'}>{dayOfWeek}</div>
                        {holidayName && <div className="text-xs text-red-500">{holidayName}</div>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editFormData?.clock_in || ''}
                            onChange={e => setEditFormData(prev => prev ? { ...prev, clock_in: e.target.value } : null)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          record.clock_in
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editFormData?.clock_out || ''}
                            onChange={e => setEditFormData(prev => prev ? { ...prev, clock_out: e.target.value } : null)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          record.clock_out
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editFormData?.break_start || ''}
                            onChange={e => setEditFormData(prev => prev ? { ...prev, break_start: e.target.value || null } : null)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          record.break_start || '-'
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-600">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editFormData?.break_end || ''}
                            onChange={e => setEditFormData(prev => prev ? { ...prev, break_end: e.target.value || null } : null)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          record.break_end || '-'
                        )}
                      </td>
                      <td className="px-4 py-2 text-center font-medium text-blue-600">
                        {minutesToHoursMinutes(calculated.totalWorkMinutes)}
                      </td>
                      <td className="px-4 py-2 text-center text-orange-600">
                        {minutesToHoursMinutes(calculated.nightWorkMinutes)}
                      </td>
                      <td className="px-4 py-2 text-center text-green-600">
                        {minutesToHoursMinutes(calculated.within8Hours)}
                      </td>
                      <td className="px-4 py-2 text-center text-red-600">
                        {minutesToHoursMinutes(calculated.overtimeHours)}
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={updateRecord}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditFormData(null);
                              }}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                              キャンセル
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(record.id);
                                setEditFormData({ ...record });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {workRecords.length > 0 && (
            <>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">月間合計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">総労働時間</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {minutesToHoursMinutes(monthlyTotals.totalWorkMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">深夜時間数</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {minutesToHoursMinutes(monthlyTotals.totalNightMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">8時間以内</p>
                    <p className="text-2xl font-bold text-green-600">
                      {minutesToHoursMinutes(monthlyTotals.totalWithin8Hours)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">超過時間</p>
                    <p className="text-2xl font-bold text-red-600">
                      {minutesToHoursMinutes(monthlyTotals.totalOvertimeMinutes)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">曜日別集計</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dayOfWeekSummary).map(([day, data]) => (
                    <div key={day} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-2">{data.dayName}曜日</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">
                          総労働: <span className="font-medium text-blue-600">{minutesToHoursMinutes(data.totalWorkMinutes)}</span>
                        </div>
                        <div className="text-gray-600">
                          深夜: <span className="font-medium text-orange-600">{minutesToHoursMinutes(data.nightWorkMinutes)}</span>
                        </div>
                        <div className="text-gray-600">
                          8時間以内: <span className="font-medium text-green-600">{minutesToHoursMinutes(data.within8Hours)}</span>
                        </div>
                        <div className="text-gray-600">
                          超過: <span className="font-medium text-red-600">{minutesToHoursMinutes(data.overtimeHours)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-red-700 mb-2">祝日</h4>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-600">
                        総労働: <span className="font-medium text-blue-600">{minutesToHoursMinutes(holidaySummary.totalWorkMinutes)}</span>
                      </div>
                      <div className="text-gray-600">
                        深夜: <span className="font-medium text-orange-600">{minutesToHoursMinutes(holidaySummary.nightWorkMinutes)}</span>
                      </div>
                      <div className="text-gray-600">
                        8時間以内: <span className="font-medium text-green-600">{minutesToHoursMinutes(holidaySummary.within8Hours)}</span>
                      </div>
                      <div className="text-gray-600">
                        超過: <span className="font-medium text-red-600">{minutesToHoursMinutes(holidaySummary.overtimeHours)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {workRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedIndividual?.name} の {selectedMonth} のデータはありません
            </div>
          )}
        </>
      )}
    </div>
  );
}
