import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Home, Activity, Database, Globe, Search } from 'lucide-react';

export default function StatusPage() {
  const router = useRouter();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
const [debugMode, setDebugMode] = useState(false);

useEffect(() => {
  setDebugMode(router.query.debug === 'true');
}, [router.query]);
  const fetchHealth = async (full = false) => {
    setLoading(true);
    try {
      const url = full ? '/.netlify/functions/health?full=true' : '/.netlify/functions/health';
      const response = await fetch(url);
      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (error) {
      setHealth({
        status: 'error',
        error: error.message,
        services: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => fetchHealth(), 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Chotot':
        return '🛒';
      case 'Alonhadat':
        return '📍';
      case 'Supabase':
        return '🗄️';
      default:
        return '📊';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-sky-50 rounded-lg text-sky-600">
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-sky-500" />
              <span className="text-xl font-bold text-gray-900">K Trix Status</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-sky-500"
              />
              Auto-refresh
            </label>
            <button
              onClick={() => fetchHealth()}
              disabled={loading}
              className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg font-medium flex items-center gap-2 hover:bg-sky-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
{debugMode && (
  <button
    onClick={() => fetchHealth(true)}
    disabled={loading}
    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium flex items-center gap-2 hover:bg-orange-200 disabled:opacity-50"
  >
    <Search className="w-4 h-4" />
    Full Test
  </button>
)}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Global Status */}
        {health && (
          <div className={`rounded-xl border-2 p-6 mb-8 ${getStatusColor(health.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(health.status)}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {health.status === 'ok' ? 'Tous les systèmes opérationnels' :
                     health.status === 'warning' ? 'Certains services dégradés' :
                     'Problème détecté'}
                  </h1>
                  <p className="text-gray-600">
                    Dernière vérification : {lastRefresh?.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${getStatusBadge(health.status)}`}>
                {health.status?.toUpperCase()}
              </div>
            </div>
            
            {/* Summary */}
            {health.summary && (
              <div className="mt-4 flex gap-4">
                <span className="text-green-600 font-medium">✓ {health.summary.ok} OK</span>
                {health.summary.warning > 0 && (
                  <span className="text-yellow-600 font-medium">⚠ {health.summary.warning} Warning</span>
                )}
                {health.summary.error > 0 && (
                  <span className="text-red-600 font-medium">✕ {health.summary.error} Error</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Services */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Sources de données
        </h2>
        
        <div className="grid gap-4 mb-8">
          {health?.services?.map((service, i) => (
            <div key={i} className={`bg-white rounded-xl border p-5 ${service.status === 'error' ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSourceIcon(service.source)}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{service.source}</h3>
                    <p className="text-sm text-gray-600">{service.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-gray-500">
                    <p>{service.duration}ms</p>
                    {service.totalListings && <p>{service.totalListings.toLocaleString()} annonces</p>}
                    {service.resultCount > 0 && <p>{service.resultCount} résultats</p>}
                  </div>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tests */}
        {debugMode && health?.tests?.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Tests fonctionnels
            </h2>
            
            <div className="grid gap-4 mb-8">
              {health.tests.map((test, i) => (
                <div key={i} className={`bg-white rounded-xl border p-5 ${test.status === 'error' ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧪</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{test.test}</h3>
                        <p className="text-sm text-gray-600">{test.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm text-gray-500">
                        <p>{test.duration}ms</p>
                        {test.accuracy !== undefined && (
                          <p className={test.accuracy >= 70 ? 'text-green-600' : test.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {test.accuracy}% précision
                          </p>
                        )}
                      </div>
                      {getStatusIcon(test.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* System Info */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Informations système
        </h2>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Version</p>
              <p className="font-mono font-medium">{health?.version?.slice(0, 7) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Environnement</p>
              <p className="font-medium">{health?.environment || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Timestamp</p>
              <p className="font-medium">{health?.timestamp ? new Date(health.timestamp).toLocaleString('fr-FR') : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Auto-refresh</p>
              <p className="font-medium">{autoRefresh ? 'Activé (1 min)' : 'Désactivé'}</p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8 p-4 bg-sky-50 rounded-xl border border-sky-200">
          <h3 className="font-bold text-sky-800 mb-2">💡 Aide</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            <li><strong>Refresh</strong> : Vérifie la connexion aux sources (rapide)</li>
            <li><strong>Full Test</strong> : Effectue une vraie recherche et vérifie la qualité des résultats</li>
            <li><strong>Auto-refresh</strong> : Actualise automatiquement toutes les minutes</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
