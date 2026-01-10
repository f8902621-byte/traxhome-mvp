/**
 * K Trix - Health Check & Monitoring
 * Vérifie l'état de toutes les sources de données
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

/**
 * Test Chotot API
 */
async function testChotot() {
  const startTime = Date.now();
  try {
    // Requête simple : appartements HCM, 1 résultat
    const url = 'https://gateway.chotot.com/v1/public/ad-listing?cg=1010&region_v2=13000&limit=3';
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        source: 'Chotot',
        status: 'error',
        message: `HTTP ${response.status}`,
        duration,
        lastCheck: new Date().toISOString()
      };
    }
    
    const data = await response.json();
    const hasResults = data.ads && data.ads.length > 0;
    const totalAvailable = data.total || 0;
    
    return {
      source: 'Chotot',
      status: hasResults ? 'ok' : 'warning',
      message: hasResults ? `${data.ads.length} résultats test, ${totalAvailable} disponibles` : 'Aucun résultat',
      duration,
      resultCount: data.ads?.length || 0,
      totalAvailable,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      source: 'Chotot',
      status: 'error',
      message: error.message,
      duration: Date.now() - startTime,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Test Alonhadat via ScraperAPI
 */
async function testAlonhadat() {
  const startTime = Date.now();
  
  if (!SCRAPER_API_KEY) {
    return {
      source: 'Alonhadat',
      status: 'error',
      message: 'SCRAPER_API_KEY non configuré',
      duration: 0,
      lastCheck: new Date().toISOString()
    };
  }
  
  try {
    // Test simple : page d'accueil Alonhadat via ScraperAPI
    const targetUrl = 'https://alonhadat.com.vn/nha-dat/can-ban/can-ho-chung-cu/2/ho-chi-minh.html';
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=vn`;
    
    const response = await fetch(scraperUrl);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        source: 'Alonhadat',
        status: 'error',
        message: `ScraperAPI HTTP ${response.status}`,
        duration,
        lastCheck: new Date().toISOString()
      };
    }
    
    const html = await response.text();
    const hasContent = html.includes('property-item') || html.includes('alonhadat');
    const articleCount = (html.match(/class="property-item"/g) || []).length;
    
    return {
      source: 'Alonhadat',
      status: hasContent ? 'ok' : 'warning',
      message: hasContent ? `Page OK, ${articleCount} annonces détectées` : 'Page reçue mais structure non reconnue',
      duration,
      resultCount: articleCount,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      source: 'Alonhadat',
      status: 'error',
      message: error.message,
      duration: Date.now() - startTime,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Test Supabase
 */
async function testSupabase() {
  const startTime = Date.now();
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      source: 'Supabase',
      status: 'error',
      message: 'Variables Supabase non configurées',
      duration: 0,
      lastCheck: new Date().toISOString()
    };
  }
  
  try {
    // Compter le nombre total d'annonces
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        source: 'Supabase',
        status: 'error',
        message: `HTTP ${response.status}`,
        duration,
        lastCheck: new Date().toISOString()
      };
    }
    
    // Extraire le count depuis le header
    const contentRange = response.headers.get('content-range');
    let totalCount = 0;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      if (match) totalCount = parseInt(match[1]);
    }
    
    return {
      source: 'Supabase',
      status: 'ok',
      message: `Base de données OK`,
      duration,
      totalListings: totalCount,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      source: 'Supabase',
      status: 'error',
      message: error.message,
      duration: Date.now() - startTime,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Test de recherche complet (simule une vraie recherche utilisateur)
 */
async function testFullSearch() {
  const startTime = Date.now();
  
  try {
    const baseUrl = process.env.URL || 'https://ktrix-vn.netlify.app';
    const response = await fetch(`${baseUrl}/.netlify/functions/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'Hồ Chí Minh',
        propertyType: 'Căn hộ chung cư',
        priceMax: '5',
        sources: ['chotot']
      })
    });
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        test: 'Full Search',
        status: 'error',
        message: `HTTP ${response.status}`,
        duration,
        lastCheck: new Date().toISOString()
      };
    }
    
    const data = await response.json();
    const resultCount = data.results?.length || 0;
    
    // Vérifier la qualité des résultats
    let correctTypes = 0;
    if (data.results) {
      for (const r of data.results.slice(0, 10)) {
        const title = (r.title || '').toLowerCase();
        if (title.includes('căn hộ') || title.includes('chung cư') || title.includes('apartment') || title.includes('cc')) {
          correctTypes++;
        }
      }
    }
    
    const accuracy = resultCount > 0 ? Math.round((correctTypes / Math.min(10, resultCount)) * 100) : 0;
    
    return {
      test: 'Full Search',
      status: resultCount > 0 && accuracy >= 50 ? 'ok' : 'warning',
      message: `${resultCount} résultats, ${accuracy}% pertinents`,
      duration,
      resultCount,
      accuracy,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      test: 'Full Search',
      status: 'error',
      message: error.message,
      duration: Date.now() - startTime,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Handler principal
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  const params = event.queryStringParameters || {};
  const fullTest = params.full === 'true';
  
  console.log(`[Health] Starting health check (full=${fullTest})`);
  
  // Tests en parallèle
  const tests = [
    testChotot(),
    testAlonhadat(),
    testSupabase()
  ];
  
  if (fullTest) {
    tests.push(testFullSearch());
  }
  
  const results = await Promise.all(tests);
  
  // Déterminer le statut global
  const hasError = results.some(r => r.status === 'error');
  const hasWarning = results.some(r => r.status === 'warning');
  
  let globalStatus = 'ok';
  if (hasError) globalStatus = 'error';
  else if (hasWarning) globalStatus = 'warning';
  
  // Construire la réponse
  const response = {
    status: globalStatus,
    timestamp: new Date().toISOString(),
    version: process.env.COMMIT_REF || 'unknown',
    environment: process.env.CONTEXT || 'unknown',
    services: results.filter(r => r.source),
    tests: results.filter(r => r.test),
    summary: {
      total: results.length,
      ok: results.filter(r => r.status === 'ok').length,
      warning: results.filter(r => r.status === 'warning').length,
      error: results.filter(r => r.status === 'error').length
    }
  };
  
  // Log pour monitoring
  console.log(`[Health] Status: ${globalStatus} | Chotot: ${results[0]?.status} | Alonhadat: ${results[1]?.status} | Supabase: ${results[2]?.status}`);
  
  return {
    statusCode: globalStatus === 'error' ? 503 : 200,
    headers,
    body: JSON.stringify(response, null, 2)
  };
};
