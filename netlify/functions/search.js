const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// MAPPING DES VILLES → CODE RÉGION CHOTOT
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

function getChototRegion(city) {
  if (!city) return '13000';
  const cityLower = city.toLowerCase().trim();
  
  // Correspondance directe
  for (const [cityName, code] of Object.entries(CHOTOT_REGIONS)) {
    if (cityLower.includes(cityName) || cityName.includes(cityLower)) {
      return code;
    }
  }
  
  // Chercher dans les aliases
  for (const [mainCity, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some(alias => cityLower.includes(alias) || alias.includes(cityLower))) {
      return CHOTOT_REGIONS[mainCity] || '13000';
    }
  }
  
  return '13000';
}

// ============================================
// CHOTOT API - 300 RÉSULTATS AVEC TRI PAR PRIX
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax, sortBy } = params;
  
  const regionCode = getChototRegion(city);
  console.log(`Chotot: ville="${city}" → region=${regionCode}`);
  
  // Paramètres de base
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000'); // Immobilier
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k'); // À vendre
  baseParams.append('limit', '50');
  
  // Filtre prix
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    baseParams.append('price', `${minPrice}-${maxPrice}`);
  }
  
  // Tri par prix si demandé
  if (sortBy === 'price_asc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'asc');
  } else if (sortBy === 'price_desc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'desc');
  }
  
  // 6 appels paginés = 300 résultats max
  const allAds = [];
  const offsets = [0, 50, 100, 150, 200, 250];
  
  for (const offset of offsets) {
    try {
      const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ads && data.ads.length > 0) {
        allAds.push(...data.ads);
        console.log(`Chotot offset=${offset}: +${data.ads.length} (total API: ${data.total})`);
      } else {
        break;
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL: ${allAds.length} annonces`);
  
  // Mapper et filtrer prix > 0
  return allAds
    .filter(ad => ad.price && ad.price > 0) // Exclure prix "à négocier"
    .map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || 'Không có tiêu đề',
      price: ad.price || 0,
      floorAreaSqm: ad.size || ad.area || 0,
      area: ad.size || ad.area || 0,
      district: ad.area_name || '',
      city: ad.region_name || '',
      bedrooms: ad.rooms || null,
      bathrooms: ad.toilets || null,
      thumbnail: ad.image || ad.images?.[0] || '',
      images: ad.images || (ad.image ? [ad.image] : []),
      url: `https://www.chotot.com/${ad.list_id}.htm`,
      source: 'chotot.com',
      postedOn: ad.list_time ? new Date(ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
      propertyType: ad.category_name || '',
      pricePerM2: ad.price_million_per_m2 || null,
    }));
}

// ============================================
// NHADAT247 API (données pré-scrapées HCM)
// ============================================
async function fetchNhadat247() {
  const NHADAT247_ACTOR_ID = 'outlandish_bookcases~nhadat247-scraper';
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${NHADAT247_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).map(item => ({
      id: item.id || `nhadat247_${Math.random()}`,
      title: item.title || '',
      price: item.price || 0,
      area: item.area || 0,
      district: item.district || '',
      city: item.city || 'Hồ Chí Minh',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.imageUrl || '',
      images: item.imageUrl ? [item.imageUrl] : [],
      url: item.url || '',
      source: 'nhadat247.com.vn',
      postedOn: item.postedDate || '',
    }));
  } catch (error) {
    console.error('Nhadat247 error:', error);
    return [];
  }
}

// ============================================
// BATDONGSAN API (données pré-scrapées - actuellement bloqué)
// ============================================
async function fetchBatdongsan() {
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).filter(item => item.price > 0).map(item => ({
      id: item.id || `batdongsan_${Math.random()}`,
      title: item.title || '',
      price: item.price || 0,
      area: item.floorAreaSqm || item.area || 0,
      district: item.district || '',
      city: item.city || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.thumbnail || item.images?.[0] || '',
      images: item.images || [],
      url: item.url || '',
      source: 'batdongsan.com.vn',
      postedOn: item.postedOn || '',
      propertyType: item.propertyType || '',
    }));
  } catch (error) {
    console.error('Batdongsan error:', error);
    return [];
  }
}

// ============================================
// FILTRES POST-API
// ============================================
function applyFilters(results, filters) {
  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms } = filters;
  let filtered = [...results];
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
  }
  
  if (district) {
    const d = district.toLowerCase();
    filtered = filtered.filter(item => 
      (item.district || '').toLowerCase().includes(d) || 
      (item.title || '').toLowerCase().includes(d)
    );
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
    if (type.includes('căn hộ') || type.includes('chung cư')) keywords = ['căn hộ', 'chung cư', 'apartment', 'cc', 'ccmn'];
    else if (type.includes('biệt thự')) keywords = ['biệt thự', 'villa'];
    else if (type.includes('nhà')) keywords = ['nhà'];
    else if (type.includes('đất')) keywords = ['đất'];
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        return keywords.some(k => t.includes(k));
      });
    }
  }
  
  return filtered;
}

// ============================================
// DÉDUPLICATION
// ============================================
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

// ============================================
// SCORE
// ============================================
function calculateScore(item) {
  let score = 50;
  const title = (item.title || '').toLowerCase();
  
  if (/gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/.test(title)) score += 15;
  if (item.thumbnail) score += 5;
  if ((item.postedOn || '').includes('hôm nay') || (item.postedOn || '').includes('phút')) score += 10;
  if (item.area > 0 && item.price > 0) {
    const pricePerM2 = item.price / item.area;
    if (pricePerM2 < 50000000) score += 10; // Bon rapport qualité/prix
  }
  
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
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sortBy, sources }));

  try {
    let allResults = [];
    
    // CHOTOT - Source principale (300 résultats, toutes villes)
    if (sources?.includes('chotot')) {
      const chototResults = await fetchChotot({ city, priceMin, priceMax, sortBy });
      allResults.push(...chototResults);
    }
    
    // BATDONGSAN - Données pré-scrapées (limité)
    if (sources?.includes('batdongsan')) {
      const batdongsanResults = await fetchBatdongsan();
      const filtered = applyFilters(batdongsanResults, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Batdongsan: ${batdongsanResults.length} → ${filtered.length} filtrés`);
      allResults.push(...filtered);
    }
    
    // NHADAT247 - Données pré-scrapées HCM
    if (sources?.includes('nhadat247')) {
      const nhadat247Results = await fetchNhadat247();
      const filtered = applyFilters(nhadat247Results, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Nhadat247: ${nhadat247Results.length} → ${filtered.length} filtrés`);
      allResults.push(...filtered);
    }
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    // Filtre type de bien global (pour Chotot qui ne filtre pas côté API)
    if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
      const type = propertyType.toLowerCase();
      let keywords = [];
      if (type.includes('căn hộ') || type.includes('chung cư')) keywords = ['căn hộ', 'chung cư', 'apartment', 'cc', 'ccmn'];
      else if (type.includes('biệt thự')) keywords = ['biệt thự', 'villa'];
      else if (type.includes('nhà')) keywords = ['nhà'];
      else if (type.includes('đất')) keywords = ['đất'];
      
      if (keywords.length > 0) {
        const before = allResults.length;
        allResults = allResults.filter(item => {
          const t = (item.title || '').toLowerCase();
          return keywords.some(k => t.includes(k));
        });
        console.log(`Filtre type "${propertyType}": ${before} → ${allResults.length}`);
      }
    }
    
    // Déduplication
    const unique = deduplicateResults(allResults);
    console.log(`Après dédup: ${unique.length} (${allResults.length - unique.length} doublons)`);
    
    // Tri final
    let sortedResults = [...unique];
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      // Par défaut: tri par score
      sortedResults = sortedResults.map(item => ({ ...item, score: calculateScore(item) }));
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    // Limiter à 100 résultats pour le frontend
    const results = sortedResults.slice(0, 100).map((item, i) => ({
      id: item.id || i,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
      city: item.city || city || '',
      district: item.district || '',
      address: item.address || '',
      floorArea: item.area || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
      images: item.images || [],
      url: item.url || '#',
      source: item.source || 'unknown',
      score: item.score || calculateScore(item),
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

    console.log(`FINAL: ${results.length} résultats affichés, ${unique.length} disponibles`);

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
