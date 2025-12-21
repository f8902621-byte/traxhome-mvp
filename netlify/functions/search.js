const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

// ============================================
// CONFIGURATION SCRAPERS
// ============================================
const PROPERTYGURU_ACTOR_ID = 'fatihtahta~propertyguru-scraper-ddproperty-batdongsan';

// ============================================
// MAPPING DES VILLES
// ============================================
const CHOTOT_REGIONS = {
  'hồ chí minh': '13000',
  'hà nội': '12000',
  'đà nẵng': '15000',
  'bình dương': '13100',
  'đồng nai': '13200',
  'hải phòng': '12100',
  'cần thơ': '14000',
  'khánh hòa': '15100',
  'bà rịa - vũng tàu': '13300',
  'quảng ninh': '12200',
  'lâm đồng': '15200',
  'long an': '13400',
  'bắc ninh': '12300',
  'thanh hóa': '11000',
  'nghệ an': '11100',
};

const BATDONGSAN_CITIES = {
  'hồ chí minh': 'tp-hcm',
  'hà nội': 'ha-noi',
  'đà nẵng': 'da-nang',
  'bình dương': 'binh-duong',
  'đồng nai': 'dong-nai',
  'hải phòng': 'hai-phong',
  'cần thơ': 'can-tho',
  'khánh hòa': 'khanh-hoa',
  'bà rịa - vũng tàu': 'ba-ria-vung-tau',
  'quảng ninh': 'quang-ninh',
  'lâm đồng': 'lam-dong',
};

const CITY_ALIASES = {
  'hồ chí minh': ['hcm', 'tphcm', 'sài gòn', 'saigon', 'sg', 'ho chi minh'],
  'hà nội': ['hanoi', 'hn', 'ha noi'],
  'đà nẵng': ['danang', 'đn', 'da nang'],
  'bình dương': ['binh duong', 'bd'],
  'đồng nai': ['dong nai', 'bien hoa'],
  'hải phòng': ['hai phong', 'hp'],
  'cần thơ': ['can tho', 'ct'],
  'khánh hòa': ['khanh hoa', 'nha trang'],
  'bà rịa - vũng tàu': ['vung tau', 'brvt', 'ba ria'],
  'quảng ninh': ['quang ninh', 'ha long', 'hạ long'],
  'lâm đồng': ['lam dong', 'da lat', 'đà lạt'],
};

function normalizeCity(city) {
  if (!city) return 'hồ chí minh';
  const cityLower = city.toLowerCase().trim();
  
  // Correspondance directe
  if (CHOTOT_REGIONS[cityLower]) return cityLower;
  
  // Chercher dans les aliases
  for (const [mainCity, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some(alias => cityLower.includes(alias) || alias.includes(cityLower))) {
      return mainCity;
    }
  }
  
  return 'hồ chí minh';
}

function getChototRegion(city) {
  const normalized = normalizeCity(city);
  return CHOTOT_REGIONS[normalized] || '13000';
}

function getBatdongsanCity(city) {
  const normalized = normalizeCity(city);
  return BATDONGSAN_CITIES[normalized] || 'tp-hcm';
}

// ============================================
// CONSTRUIRE URL BATDONGSAN
// ============================================
function buildBatdongsanUrl(params) {
  const { city, propertyType, priceMax } = params;
  
  const citySlug = getBatdongsanCity(city);
  
  // Type de bien
  let typeSlug = 'ban-can-ho-chung-cu'; // Par défaut: appartement
  if (propertyType) {
    const type = propertyType.toLowerCase();
    if (type.includes('nhà') || type.includes('house')) {
      typeSlug = 'ban-nha-rieng';
    } else if (type.includes('biệt thự') || type.includes('villa')) {
      typeSlug = 'ban-biet-thu';
    } else if (type.includes('đất') || type.includes('land')) {
      typeSlug = 'ban-dat';
    }
  }
  
  let url = `https://batdongsan.com.vn/${typeSlug}-${citySlug}`;
  
  // Prix max
  if (priceMax) {
    url += `?gcn=${priceMax}-ty`;
  }
  
  return url;
}

// ============================================
// BATDONGSAN VIA PROPERTYGURU SCRAPER
// ============================================
async function fetchBatdongsan(params) {
  const { city, propertyType, priceMax } = params;
  
  const searchUrl = buildBatdongsanUrl({ city, propertyType, priceMax });
  console.log(`Batdongsan URL: ${searchUrl}`);
  
  const input = {
    country: "vn",
    startUrls: [searchUrl],
    maxItems: 30, // Limiter pour rester sous 26s timeout
  };
  
  try {
    // Lancer le scraper en mode synchrone (max 25s pour rester sous timeout Netlify)
    const response = await fetch(
      `https://api.apify.com/v2/acts/${PROPERTYGURU_ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=25`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );
    
    if (!response.ok) {
      console.error(`Batdongsan API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Batdongsan: ${data.length} résultats`);
    
    return (data || []).map(item => ({
      id: `batdongsan_${item.id || Math.random().toString(36).substr(2, 9)}`,
      title: item.title || '',
      price: item.price || 0,
      area: item.floorAreaSqm || 0,
      district: item.address || '',
      city: city || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.thumbnail || '',
      images: item.images || [],
      url: item.url || '',
      source: 'batdongsan.com.vn',
      postedOn: item.postedOn || '',
      pricePerM2: item.pricePerSqm || null,
    }));
    
  } catch (error) {
    console.error('Batdongsan error:', error.message);
    return [];
  }
}

// ============================================
// CHOTOT API - 300 RÉSULTATS
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax, sortBy } = params;
  
  const regionCode = getChototRegion(city);
  console.log(`Chotot: ville="${city}" → region=${regionCode}`);
  
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000');
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k');
  baseParams.append('limit', '50');
  
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    baseParams.append('price', `${minPrice}-${maxPrice}`);
  }
  
  if (sortBy === 'price_asc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'asc');
  } else if (sortBy === 'price_desc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'desc');
  }
  
  const allAds = [];
  const offsets = [0, 50, 100, 150, 200, 250];
  
  for (const offset of offsets) {
    try {
      const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ads && data.ads.length > 0) {
        allAds.push(...data.ads);
        console.log(`Chotot offset=${offset}: +${data.ads.length}`);
      } else {
        break;
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL: ${allAds.length}`);
  
  return allAds
    .filter(ad => ad.price && ad.price > 0)
    .map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || '',
      price: ad.price || 0,
      area: ad.size || ad.area || 0,
      district: ad.area_name || '',
      city: ad.region_name || '',
      bedrooms: ad.rooms || null,
      bathrooms: ad.toilets || null,
      thumbnail: ad.image || '',
      images: ad.images || [],
      url: `https://www.chotot.com/${ad.list_id}.htm`,
      source: 'chotot.com',
      postedOn: ad.list_time ? new Date(ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
      propertyType: ad.category_name || '',
    }));
}

// ============================================
// FILTRES & DÉDUPLICATION
// ============================================
function applyFilters(results, filters) {
  const { propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms } = filters;
  let filtered = [...results];
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
  }
  
  if (livingAreaMin) {
    filtered = filtered.filter(item => (item.area || 0) >= parseInt(livingAreaMin));
  }
  
  if (livingAreaMax) {
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= parseInt(livingAreaMax);
    });
  }
  
  if (bedrooms) {
    filtered = filtered.filter(item => item.bedrooms >= parseInt(bedrooms));
  }
  
  if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
    const type = propertyType.toLowerCase();
    let keywords = [];
    if (type.includes('căn hộ') || type.includes('chung cư')) {
      keywords = ['căn hộ', 'chung cư', 'apartment', 'cc', 'ccmn'];
    } else if (type.includes('biệt thự')) {
      keywords = ['biệt thự', 'villa'];
    } else if (type.includes('nhà')) {
      keywords = ['nhà'];
    } else if (type.includes('đất')) {
      keywords = ['đất'];
    }
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        return keywords.some(k => t.includes(k));
      });
    }
  }
  
  return filtered;
}

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/bán\s*gấp|cần\s*bán|bán\s*nhanh|bán/g, '')
    .replace(/căn\s*hộ|chung\s*cư|apartment/g, '')
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '')
    .substring(0, 30);
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(item => {
    const key = `${normalizeTitle(item.title)}_${Math.round((item.price || 0) / 500000000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function calculateScore(item) {
  let score = 50;
  const title = (item.title || '').toLowerCase();
  
  if (/gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/.test(title)) score += 15;
  if (item.thumbnail) score += 5;
  if ((item.postedOn || '').includes('hôm nay') || (item.postedOn || '').includes('phút')) score += 10;
  if (item.area > 0 && item.price > 0 && item.price / item.area < 50000000) score += 10;
  
  return Math.min(100, score);
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }

  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources, sortBy } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sources }));

  try {
    const promises = [];
    
    // CHOTOT - Rapide (~1s)
    if (sources?.includes('chotot')) {
      promises.push(
        fetchChotot({ city, priceMin, priceMax, sortBy })
          .then(results => ({ source: 'chotot', results }))
      );
    }
    
    // BATDONGSAN - Plus lent (~30s) mais données riches
    if (sources?.includes('batdongsan')) {
      promises.push(
        fetchBatdongsan({ city, propertyType, priceMax })
          .then(results => ({ source: 'batdongsan', results }))
      );
    }
    
    // Exécuter en parallèle
    const responses = await Promise.all(promises);
    
    let allResults = [];
    for (const { source, results } of responses) {
      console.log(`${source}: ${results.length} résultats`);
      allResults.push(...results);
    }
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    // Filtres (Chotot n'est pas filtré par type côté API)
    allResults = applyFilters(allResults, { propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
    console.log(`Après filtres: ${allResults.length}`);
    
    // Déduplication
    const unique = deduplicateResults(allResults);
    console.log(`Après dédup: ${unique.length}`);
    
    // Score et tri
    let sortedResults = unique.map(item => ({ ...item, score: calculateScore(item) }));
    
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    // Limiter à 100
    const results = sortedResults.slice(0, 100).map((item, i) => ({
      id: item.id || i,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
      city: item.city || city || '',
      district: item.district || '',
      floorArea: item.area || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
      images: item.images || [],
      url: item.url || '#',
      source: item.source || 'unknown',
      score: item.score,
      hasUrgentKeyword: /gấp|nhanh|kẹt|thanh lý|lỗ|ngộp/i.test(item.title),
      isNew: /hôm nay|phút|today/i.test(item.postedOn || ''),
      postedOn: item.postedOn || '',
    }));

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      totalResults: results.length,
      totalAvailable: unique.length,
    };

    console.log(`FINAL: ${results.length} résultats`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, results, stats })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message, results: [], stats: {} })
    };
  }
};
