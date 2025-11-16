import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, AlertCircle } from 'lucide-react';

interface Individual {
  id: string;
  name: string;
}

interface FormData {
  work_date: string;
  individual_id: string;
  clock_in: string;
  clock_out: string;
  break_start: string;
  break_end: string;
}

interface WorkEntryFormProps {
  onSubmitSuccess: () => void;
}

export function WorkEntryForm({ onSubmitSuccess }: WorkEntryFormProps) {
  const { user } = useAuth();
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [formData, setFormData] = useState<FormData>({
    work_date: new Date().toISOString().split('T')[0],
    individual_id: '',
    clock_in: '09:00',
    clock_out: '18:00',
    break_start: '12:00',
    break_end: '13:00',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (data && data.length > 0 && !formData.individual_id) {
        setFormData(prev => ({ ...prev, individual_id: data[0].id }));
      }
    };

    fetchIndividuals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.individual_id) return '個人を選択してください';
    if (!formData.work_date) return '日付を入力してください';
    if (!formData.clock_in) return '出勤時刻を入力してください';
    if (!formData.clock_out) return '退勤時刻を入力してください';

    if (formData.break_start && !formData.break_end) {
      return '休憩開始時刻が入力されている場合、休憩終了時刻も入力してください';
    }
    if (!formData.break_start && formData.break_end) {
      return '休憩終了時刻が入力されている場合、休憩開始時刻も入力してください';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        setError('ユーザーが認証されていません');
        return;
      }

      const { error: insertError } = await supabase
        .from('work_records')
        .insert({
          individual_id: formData.individual_id,
          work_date: formData.work_date,
          clock_in: formData.clock_in,
          clock_out: formData.clock_out,
          break_start: formData.break_start || null,
          break_end: formData.break_end || null,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      setFormData({
        work_date: new Date().toISOString().split('T')[0],
        individual_id: formData.individual_id,
        clock_in: '09:00',
        clock_out: '18:00',
        break_start: '12:00',
        break_end: '13:00',
      });

      onSubmitSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">勤務時間記録</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            個人 <span className="text-red-500">*</span>
          </label>
          <select
            name="individual_id"
            value={formData.individual_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {individuals.map(ind => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="work_date"
            value={formData.work_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            出勤時刻 <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="clock_in"
            value={formData.clock_in}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            退勤時刻 <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="clock_out"
            value={formData.clock_out}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            休憩開始時刻
          </label>
          <input
            type="time"
            name="break_start"
            value={formData.break_start}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            休憩終了時刻
          </label>
          <input
            type="time"
            name="break_end"
            value={formData.break_end}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '登録中...' : '登録'}
      </button>
    </form>
  );
}
