import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Plus, Trash2, Edit2 } from 'lucide-react';

interface Affiliation {
  id: string;
  name: string;
}

interface Department {
  id: string;
  affiliation_id: string;
  name: string;
}

export function AffiliationDepartmentManager() {
  const { user } = useAuth();
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAffiliationForm, setShowAffiliationForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [editingAffiliationId, setEditingAffiliationId] = useState<string | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);

  const [affiliationFormData, setAffiliationFormData] = useState({ name: '' });
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    affiliation_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: affiliationsData } = await supabase
      .from('affiliations')
      .select('*')
      .order('name');

    const { data: departmentsData } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    setAffiliations(affiliationsData || []);
    setDepartments(departmentsData || []);
  };

  const handleAffiliationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAffiliationId) {
      await supabase
        .from('affiliations')
        .update({ name: affiliationFormData.name })
        .eq('id', editingAffiliationId);
    } else {
      if (!user) return;
      await supabase
        .from('affiliations')
        .insert({ name: affiliationFormData.name, user_id: user.id });
    }

    setAffiliationFormData({ name: '' });
    setShowAffiliationForm(false);
    setEditingAffiliationId(null);
    fetchData();
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDepartmentId) {
      await supabase
        .from('departments')
        .update({
          name: departmentFormData.name,
          affiliation_id: departmentFormData.affiliation_id,
        })
        .eq('id', editingDepartmentId);
    } else {
      if (!user) return;
      await supabase
        .from('departments')
        .insert({
          name: departmentFormData.name,
          affiliation_id: departmentFormData.affiliation_id,
          user_id: user.id,
        });
    }

    setDepartmentFormData({ name: '', affiliation_id: '' });
    setShowDepartmentForm(false);
    setEditingDepartmentId(null);
    fetchData();
  };

  const handleEditAffiliation = (affiliation: Affiliation) => {
    setEditingAffiliationId(affiliation.id);
    setAffiliationFormData({ name: affiliation.name });
    setShowAffiliationForm(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartmentId(department.id);
    setDepartmentFormData({
      name: department.name,
      affiliation_id: department.affiliation_id,
    });
    setShowDepartmentForm(true);
  };

  const handleDeleteAffiliation = async (id: string) => {
    if (!confirm('この所属を削除してよろしいですか？関連する部署も削除されます。')) return;
    await supabase.from('affiliations').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('この部署を削除してよろしいですか？')) return;
    await supabase.from('departments').delete().eq('id', id);
    fetchData();
  };

  const getAffiliationName = (affiliationId: string) => {
    return affiliations.find(a => a.id === affiliationId)?.name || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">所属・部署管理</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">所属</h3>
            <button
              onClick={() => setShowAffiliationForm(!showAffiliationForm)}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          {showAffiliationForm && (
            <form onSubmit={handleAffiliationSubmit} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={affiliationFormData.name}
                  onChange={e => setAffiliationFormData({ name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  {editingAffiliationId ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAffiliationForm(false);
                    setEditingAffiliationId(null);
                    setAffiliationFormData({ name: '' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {affiliations.map(affiliation => (
              <div
                key={affiliation.id}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
              >
                <span className="text-gray-800">{affiliation.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAffiliation(affiliation)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAffiliation(affiliation.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {affiliations.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                登録されている所属がありません
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">部署</h3>
            <button
              onClick={() => setShowDepartmentForm(!showDepartmentForm)}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          {showDepartmentForm && (
            <form onSubmit={handleDepartmentSubmit} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属 <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentFormData.affiliation_id}
                  onChange={e => setDepartmentFormData({ ...departmentFormData, affiliation_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {affiliations.map(affiliation => (
                    <option key={affiliation.id} value={affiliation.id}>
                      {affiliation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部署名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={departmentFormData.name}
                  onChange={e => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  {editingDepartmentId ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepartmentForm(false);
                    setEditingDepartmentId(null);
                    setDepartmentFormData({ name: '', affiliation_id: '' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {departments.map(department => (
              <div
                key={department.id}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
              >
                <div>
                  <div className="text-gray-800">{department.name}</div>
                  <div className="text-xs text-gray-500">
                    {getAffiliationName(department.affiliation_id)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditDepartment(department)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                登録されている部署がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
