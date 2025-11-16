import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2, Edit2 } from 'lucide-react';

interface Individual {
  id: string;
  name: string;
  affiliation_id: string | null;
  department_id: string | null;
  affiliations?: { name: string };
  departments?: { name: string };
}

interface Affiliation {
  id: string;
  name: string;
}

interface Department {
  id: string;
  affiliation_id: string;
  name: string;
}

export function IndividualManager() {
  const { user } = useAuth();
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    affiliation_id: '',
    department_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: individualsData } = await supabase
      .from('individuals')
      .select('id, name, affiliation_id, department_id, affiliations(name), departments(name)')
      .order('name');

    const { data: affiliationsData } = await supabase
      .from('affiliations')
      .select('*')
      .order('name');

    const { data: departmentsData } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    const formattedIndividuals = (individualsData || []).map(item => ({
      id: item.id,
      name: item.name,
      affiliation_id: item.affiliation_id,
      department_id: item.department_id,
      affiliations: Array.isArray(item.affiliations) ? item.affiliations[0] : item.affiliations,
      departments: Array.isArray(item.departments) ? item.departments[0] : item.departments,
    }));

    setIndividuals(formattedIndividuals);
    setAffiliations(affiliationsData || []);
    setDepartments(departmentsData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('individuals')
        .update({
          name: formData.name,
          affiliation_id: formData.affiliation_id || null,
          department_id: formData.department_id || null,
        })
        .eq('id', editingId);

      if (error) {
        console.error('Failed to update individual:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('individuals')
        .insert({
          name: formData.name,
          affiliation_id: formData.affiliation_id || null,
          department_id: formData.department_id || null,
          user_id: user?.id,
        });

      if (error) {
        console.error('Failed to create individual:', error);
        alert(`個人の登録に失敗しました: ${error.message}`);
        return;
      }
    }

    setFormData({ name: '', affiliation_id: '', department_id: '' });
    setShowForm(false);
    setEditingId(null);
    fetchData();
  };

  const handleEdit = (individual: Individual) => {
    setEditingId(individual.id);
    setFormData({
      name: individual.name,
      affiliation_id: individual.affiliation_id || '',
      department_id: individual.department_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この個人を削除してよろしいですか？関連する勤務記録も削除されます。')) return;

    const { error } = await supabase
      .from('individuals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete individual:', error);
      return;
    }

    fetchData();
  };

  const handleCancel = () => {
    setFormData({ name: '', affiliation_id: '', department_id: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const getFilteredDepartments = () => {
    if (!formData.affiliation_id) return [];
    return departments.filter(d => d.affiliation_id === formData.affiliation_id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">個人管理</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所属
              </label>
              <select
                value={formData.affiliation_id}
                onChange={e => setFormData({ ...formData, affiliation_id: e.target.value, department_id: '' })}
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
                部署
              </label>
              <select
                value={formData.department_id}
                onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                disabled={!formData.affiliation_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">選択してください</option>
                {getFilteredDepartments().map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingId ? '更新' : '追加'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-2 text-left font-semibold text-gray-700">氏名</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">所属</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">部署</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {individuals.map(individual => (
              <tr key={individual.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800 font-medium">{individual.name}</td>
                <td className="px-4 py-3 text-gray-600">{individual.affiliations?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{individual.departments?.name || '-'}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(individual)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(individual.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {individuals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            登録されている個人がいません
          </div>
        )}
      </div>
    </div>
  );
}
