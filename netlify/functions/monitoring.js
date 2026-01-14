// ============================================
// MONITORING.JS - Surveillance santé K Trix
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const report = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {},
    errors: [],
    warnings: [],
    stats: {}
  };

  // 1. TEST CHOTOT API
  try {
    const start = Date.now();
    const response = await fetch('https://gateway.chotot.com/v1/public/ad-listing?cg=1000&region_v2=13000&limit=1');
    const data = await response.json();
    report.services.chotot = {
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      hasData: data.ads && data.ads.length > 0
    };
  } catch (error) {
    report.services.chotot = { status: 'down', error: error.message };
    report.errors.push(`Chotot API: ${error.message}`);
    report.status = 'degraded';
  }

  // 2. TEST SUPABASE
  try {
    const start = Date.now();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?select=count&limit=1`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    report.services.supabase = {
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start
    };
  } catch (error) {
    report.services.supabase = { status: 'down', error: error.message };
    report.errors.push(`Supabase: ${error.message}`);
    report.status = 'critical';
  }

  // 3. VÉRIFIER TÂCHES BDS (24h)
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bds_tasks?created_at=gte.${yesterday}&select=*`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (response.ok) {
      const tasks = await response.json();
      const completed = tasks.filter(t => t.status === 'completed').length;
      const errors = tasks.filter(t => t.status === 'error').length;
      report.stats.bds_tasks_24h = {
        total: tasks.length,
        completed,
        errors,
        successRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 100
      };
      report.services.bds_background = {
        status: errors === 0 ? 'healthy' : errors < tasks.length / 2 ? 'degraded' : 'critical',
        tasksLast24h: tasks.length,
        successRate: report.stats.bds_tasks_24h.successRate
      };
      if (tasks.length > 0 && errors / tasks.length > 0.3) {
        report.warnings.push(`BDS: ${errors}/${tasks.length} tâches en erreur`);
        report.status = 'degraded';
      }
    }
  } catch (error) {
    report.services.bds_background = { status: 'unknown', error: error.message };
  }

  // 4. STATS DB
  try {
    const listingsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?select=id&limit=1`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'count=exact' } }
    );
    const totalListings = listingsRes.headers.get('content-range');
    if (totalListings) {
      const match = totalListings.match(/\/(\d+)/);
      if (match) report.stats.total_listings = parseInt(match[1]);
    }
    
    const bdsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bds_listings?select=id&limit=1`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'count=exact' } }
    );
    const totalBds = bdsRes.headers.get('content-range');
    if (totalBds) {
      const match = totalBds.match(/\/(\d+)/);
      if (match) report.stats.total_bds_listings = parseInt(match[1]);
    }
  } catch (error) {
    report.warnings.push(`Stats DB: ${error.message}`);
  }

  // 5. DÉTERMINER STATUT GLOBAL
  const statuses = Object.values(report.services).map(s => s.status);
  if (statuses.includes('down') || statuses.includes('critical')) {
    report.status = 'critical';
  } else if (statuses.includes('degraded') || report.warnings.length > 0) {
    report.status = 'degraded';
  }

  // 6. SAUVEGARDER LOG
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        timestamp: report.timestamp,
        status: report.status,
        services: report.services,
        errors: report.errors,
        warnings: report.warnings,
        stats: report.stats
      })
    });
  } catch (e) { console.log('Log save error:', e.message); }

  return {
    statusCode: report.status === 'critical' ? 500 : 200,
    headers,
    body: JSON.stringify(report, null, 2)
  };
};
