import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MonitoringPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [language, setLanguage] = useState('vn');

  // Récupérer la langue depuis l'URL ou localStorage
  useEffect(() => {
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ktrix_language');
      if (saved && ['vn', 'en', 'fr'].includes(saved)) {
        setLanguage(saved);
      }
    }
  }, [router.query.lang]);

  // Traductions
  const t = {
    vn: {
      title: 'K Trix Monitoring',
      autoRefresh: 'Tự động làm mới',
      refresh: 'Làm mới',
      back: 'Quay lại',
      services: 'Dịch vụ',
      statistics: 'Thống kê',
      alerts: 'Cảnh báo',
      totalListings: 'Tổng tin đăng',
      totalArchive: 'Lưu trữ',
      bdsTasks: 'Tác vụ BDS',
      successRate: 'Tỷ lệ thành công',
      lastCheck: 'Kiểm tra lần cuối',
      healthy: 'HOẠT ĐỘNG',
      degraded: 'SUY GIẢM',
      down: 'NGỪNG',
      responseTime: 'Thời gian phản hồi',
      success: 'thành công',
      tasks24h: 'tác vụ (24h)',
    },
    en: {
      title: 'K Trix Monitoring',
      autoRefresh: 'Auto-refresh',
      refresh: 'Refresh',
      back: 'Back',
      services: 'Services',
      statistics: 'Statistics',
      alerts: 'Alerts',
      totalListings: 'Total Listings',
      totalArchive: 'Archive',
      bdsTasks: 'BDS Tasks',
      successRate: 'Success Rate',
      lastCheck: 'Last check',
      healthy: 'HEALTHY',
      degraded: 'DEGRADED',
      down: 'DOWN',
      responseTime: 'Response time',
      success: 'success',
      tasks24h: 'tasks (24h)',
    },
    fr: {
      title: 'K Trix Monitoring',
      autoRefresh: 'Actualisation auto',
      refresh: 'Actualiser',
      back: 'Retour',
      services: 'Services',
      statistics: 'Statistiques',
      alerts: 'Alertes',
      totalListings: 'Annonces totales',
      totalArchive: 'Archives',
      bdsTasks: 'Tâches BDS',
      successRate: 'Taux de succès',
      lastCheck: 'Dernière vérification',
      healthy: 'OPÉRATIONNEL',
      degraded: 'DÉGRADÉ',
      down: 'HORS SERVICE',
      responseTime: 'Temps de réponse',
      success: 'succès',
      tasks24h: 'tâches (24h)',
    }
  }[language];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchReport, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'degraded') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusEmoji = (status) => {
    if (status === 'healthy') return '✅';
    if (status === 'degraded') return '⚠️';
    return '🚨';
  };

  const getStatusLabel = (status) => {
    if (status === 'healthy') return t.healthy;
    if (status === 'degraded') return t.degraded;
    return t.down;
  };

  const getLocale = () => {
    if (language === 'vn') return 'vi-VN';
    if (language === 'en') return 'en-US';
    return 'fr-FR';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">🔍 {t.title}</h1>
            {report && (
              <span className={`px-4 py-2 rounded-full font-bold border ${getStatusColor(report.status)}`}>
                {getStatusEmoji(report.status)} {getStatusLabel(report.status)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              {t.autoRefresh}
            </label>
            <button onClick={fetchReport} disabled={loading} className="px-4 py-2 bg-sky-500 text-white rounded-lg disabled:opacity-50">
              {loading ? '⏳' : '🔄'} {t.refresh}
            </button>
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 rounded-lg">
              ← {t.back}
            </button>
          </div>
        </div>

        {report && (
          <>
            {/* Services */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📡 {t.services}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.services).map(([name, data]) => (
                  <div key={name} className={`p-4 rounded-lg border-2 ${getStatusColor(data.status)}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold capitalize">{name.replace('_', ' ')}</span>
                      <span>{getStatusEmoji(data.status)}</span>
                    </div>
                    {data.responseTime && <p className="text-sm">⏱️ {data.responseTime}ms</p>}
                    {data.successRate !== undefined && <p className="text-sm">📊 {data.successRate}% {t.success}</p>}
                    {data.tasksLast24h !== undefined && <p className="text-sm">📋 {data.tasksLast24h} {t.tasks24h}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📊 {t.statistics}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sky-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-sky-600">{report.stats.total_listings?.toLocaleString() || '-'}</p>
                  <p className="text-sm text-gray-600">{t.totalListings}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{report.stats.total_archive?.toLocaleString() || '-'}</p>
                  <p className="text-sm text-gray-600">{t.totalArchive}</p>
                </div>
                {report.stats.bds_tasks_24h && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{report.stats.bds_tasks_24h.completed}</p>
                      <p className="text-sm text-gray-600">{t.bdsTasks}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-orange-600">{report.stats.bds_tasks_24h.successRate}%</p>
                      <p className="text-sm text-gray-600">{t.successRate}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Alertes */}
            {(report.errors.length > 0 || report.warnings.length > 0) && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">⚠️ {t.alerts}</h2>
                {report.errors.map((err, i) => (
                  <div key={i} className="bg-red-50 p-3 rounded mb-2 text-red-700">🚨 {err}</div>
                ))}
                {report.warnings.map((warn, i) => (
                  <div key={i} className="bg-yellow-50 p-3 rounded mb-2 text-yellow-700">⚠️ {warn}</div>
                ))}
              </div>
            )}

            <p className="text-center text-gray-500 text-sm">
              {t.lastCheck} : {new Date(report.timestamp).toLocaleString(getLocale())}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
