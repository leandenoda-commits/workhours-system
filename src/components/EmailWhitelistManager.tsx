import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AllowedEmail {
  id: string;
  email: string;
  added_by: string;
  created_at: string;
  notes: string | null;
}

export function EmailWhitelistManager() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('メールリストの読み込みに失敗しました');
      console.error(error);
    } else {
      setEmails(data || []);
    }
  };

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const emailLower = newEmail.toLowerCase().trim();

    if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      setError('有効なメールアドレスを入力してください');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('allowed_emails')
      .insert([
        {
          email: emailLower,
          added_by: user?.id,
          notes: notes || null,
        },
      ]);

    setLoading(false);

    if (error) {
      if (error.message.includes('duplicate')) {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError('メールアドレスの追加に失敗しました');
      }
      console.error(error);
    } else {
      setSuccess('メールアドレスを追加しました');
      setNewEmail('');
      setNotes('');
      fetchEmails();
    }
  };

  const deleteEmail = async (id: string, email: string) => {
    if (!confirm(`${email} を削除してもよろしいですか？`)) {
      return;
    }

    const { error } = await supabase
      .from('allowed_emails')
      .delete()
      .eq('id', id);

    if (error) {
      setError('メールアドレスの削除に失敗しました');
      console.error(error);
    } else {
      setSuccess('メールアドレスを削除しました');
      fetchEmails();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">許可メールアドレス管理</h2>
          <p className="text-sm text-slate-600">サインアップを許可するメールアドレスを管理します</p>
        </div>
      </div>

      <form onSubmit={addEmail} className="mb-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
            メモ（任意）
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例：営業部の田中さん"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {loading ? '追加中...' : 'メールアドレスを追加'}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">許可済みメールアドレス一覧</h3>
        {emails.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">許可されているメールアドレスがありません</p>
        ) : (
          <div className="space-y-2">
            {emails.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.email}</p>
                  {item.notes && (
                    <p className="text-xs text-slate-500 truncate">{item.notes}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                {item.added_by === user?.id && (
                  <button
                    onClick={() => deleteEmail(item.id, item.email)}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
