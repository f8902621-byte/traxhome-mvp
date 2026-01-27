// ============================================
// KTRIX - API MONITORING
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const report = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    stats: {},
    errors: [],
    warnings: []
  };

  // Test Chotot API
  try {
    const start = Date.now();
    const response = await fetch('https://gateway.chotot.com/v1/public/ad-listing?cg=1000&limit=1');
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      report.services.chotot = {
        status: 'healthy',
        responseTime,
        message: 'API accessible'
      };
    } else {
      report.services.chotot = {
        status: 'degraded',
        responseTime,
        message: `HTTP ${response.status}`
      };
      report.warnings.push('Chotot API returned non-200 status');
    }
  } catch (error) {
    report.services.chotot = {
      status: 'down',
      message: error.message
    };
    report.errors.push(`Chotot API error: ${error.message}`);
  }

  // Test Alonhadat (via ScraperAPI si configuré)
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
  if (SCRAPER_API_KEY) {
    try {
      const start = Date.now();
      const testUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent('https://alonhadat.com.vn')}&render=false`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      const responseTime = Date.now() - start;
      
      report.services.alonhadat = {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        message: response.ok ? 'ScraperAPI accessible' : `HTTP ${response.status}`
      };
    } catch (error) {
      report.services.alonhadat = {
        status: 'down',
        message: error.message
      };
    }
  } else {
    report.services.alonhadat = {
      status: 'degraded',
      message: 'SCRAPER_API_KEY non configuré'
    };
    report.warnings.push('ScraperAPI key not configured');
  }


  // Test Supabase
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/listings?select=count&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const responseTime = Date.now() - start;

      if (response.ok) {
        report.services.supabase = {
          status: 'healthy',
          responseTime,
          message: 'Database accessible'
        };

        // Get stats
       const listingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/listings?select=id&limit=1`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'count=exact'
  }
});
if (listingsResponse.ok) {
  const contentRange = listingsResponse.headers.get('content-range');
  report.stats.total_listings = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
}

 const archiveResponse = await fetch(`${SUPABASE_URL}/rest/v1/archive?select=id&limit=1`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'count=exact'
  }
});
if (archiveResponse.ok) {
  const contentRange = archiveResponse.headers.get('content-range');
  report.stats.total_archive = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
}
      } else {
        report.services.supabase = {
          status: 'degraded',
          responseTime,
          message: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      report.services.supabase = {
        status: 'down',
        message: error.message
      };
      report.errors.push(`Supabase error: ${error.message}`);
    }
  } else {
    report.services.supabase = {
      status: 'degraded',
      message: 'Supabase non configuré'
    };
    report.warnings.push('Supabase not configured');
  }

  // Determine overall status
  const statuses = Object.values(report.services).map(s => s.status);
  if (statuses.includes('down')) {
    report.status = 'degraded';
  }
  if (statuses.filter(s => s === 'down').length > 1) {
    report.status = 'critical';
  }
  if (report.errors.length > 0) {
    report.status = 'degraded';
  }

  return res.status(200).json(report);
}
