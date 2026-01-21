import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MonitoringPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">🔍 K Trix Monitoring</h1>
            {report && (
              <span className={`px-4 py-2 rounded-full font-bold border ${getStatusColor(report.status)}`}>
                {getStatusEmoji(report.status)} {report.status.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh
            </label>
            <button onClick={fetchReport} disabled={loading} className="px-4 py-2 bg-sky-500 text-white rounded-lg disabled:opacity-50">
              {loading ? '⏳' : '🔄'} Rafraîchir
            </button>
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 rounded-lg">
              ← Retour
            </button>
          </div>
        </div>

        {report && (
          <>
            {/* Services */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📡 Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.services).map(([name, data]) => (
                  <div key={name} className={`p-4 rounded-lg border-2 ${getStatusColor(data.status)}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold capitalize">{name.replace('_', ' ')}</span>
                      <span>{getStatusEmoji(data.status)}</span>
                    </div>
                    {data.responseTime && <p className="text-sm">⏱️ {data.responseTime}ms</p>}
                    {data.successRate !== undefined && <p className="text-sm">📊 {data.successRate}% succès</p>}
                    {data.tasksLast24h !== undefined && <p className="text-sm">📋 {data.tasksLast24h} tâches (24h)</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📊 Statistiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sky-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-sky-600">{report.stats.total_listings?.toLocaleString() || '-'}</p>
                  <p className="text-sm text-gray-600">Annonces totales</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{report.stats.total_bds_listings?.toLocaleString() || '-'}</p>
                  <p className="text-sm text-gray-600">Annonces BDS</p>
                </div>
                {report.stats.bds_tasks_24h && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{report.stats.bds_tasks_24h.completed}</p>
                      <p className="text-sm text-gray-600">Tâches OK (24h)</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-orange-600">{report.stats.bds_tasks_24h.successRate}%</p>
                      <p className="text-sm text-gray-600">Taux succès</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Alertes */}
            {(report.errors.length > 0 || report.warnings.length > 0) && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">⚠️ Alertes</h2>
                {report.errors.map((err, i) => (
                  <div key={i} className="bg-red-50 p-3 rounded mb-2 text-red-700">🚨 {err}</div>
                ))}
                {report.warnings.map((warn, i) => (
                  <div key={i} className="bg-yellow-50 p-3 rounded mb-2 text-yellow-700">⚠️ {warn}</div>
                ))}
              </div>
            )}

            <p className="text-center text-gray-500 text-sm">
              Dernière vérification : {new Date(report.timestamp).toLocaleString('fr-FR')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
