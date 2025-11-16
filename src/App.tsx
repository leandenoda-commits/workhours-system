import { useState } from 'react';
import { WorkEntryForm } from './components/WorkEntryForm';
import { WorkAttendanceBook } from './components/WorkAttendanceBook';
import { IndividualManager } from './components/IndividualManager';
import { AffiliationDepartmentManager } from './components/AffiliationDepartmentManager';
import { EmailWhitelistManager } from './components/EmailWhitelistManager';
import { Auth } from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';

type TabType = 'whitelist' | 'affiliation' | 'individual' | 'entry' | 'book';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const { user, loading, signOut } = useAuth();

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">労働時間集計システム</h1>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('whitelist')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'whitelist'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                メールホワイトリスト管理
              </button>
              <button
                onClick={() => setActiveTab('affiliation')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'affiliation'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                所属・部署管理
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'individual'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                個人管理
              </button>
              <button
                onClick={() => setActiveTab('entry')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'entry'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                勤務時間記録
              </button>
              <button
                onClick={() => setActiveTab('book')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'book'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                勤務記録一覧
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'whitelist' && <EmailWhitelistManager />}
            {activeTab === 'affiliation' && <AffiliationDepartmentManager />}
            {activeTab === 'individual' && <IndividualManager />}
            {activeTab === 'entry' && <WorkEntryForm onSubmitSuccess={handleFormSuccess} />}
            {activeTab === 'book' && <WorkAttendanceBook key={refreshKey} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
