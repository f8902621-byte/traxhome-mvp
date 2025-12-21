const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// MAPPING DES VILLES
// ============================================
const CITY_ALIASES = {
  'hồ chí minh': ['hồ chí minh', 'ho chi minh', 'hcm', 'tp hcm', 'tp. hcm', 'tphcm', 'sài gòn', 'saigon', 'sg'],
  'hà nội': ['hà nội', 'ha noi', 'hanoi', 'hn'],
  'đà nẵng': ['đà nẵng', 'da nang', 'danang', 'đn'],
  'bình dương': ['bình dương', 'binh duong', 'bd'],
  'đồng nai': ['đồng nai', 'dong nai', 'dn'],
  'hải phòng': ['hải phòng', 'hai phong', 'hp'],
  'cần thơ': ['cần thơ', 'can tho', 'ct'],
  'khánh hòa': ['khánh hòa', 'khanh hoa', 'nha trang'],
  'bà rịa - vũng tàu': ['bà rịa', 'vũng tàu', 'vung tau', 'brvt'],
  'quảng ninh': ['quảng ninh', 'quang ninh', 'hạ long'],
  'lâm đồng': ['lâm đồng', 'lam dong', 'đà lạt', 'da lat'],
};

// Mapping ville → code région Chotot
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
};

function getChototRegion(city) {
  if (!city) return '13000'; // Default: HCM
  const cityLower = city.toLowerCase().trim();
  
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
// CHOTOT API AVEC PAGINATION (200 résultats)
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax } = params;
  
  const regionCode = getChototRegion(city);
  console.log(`Chotot: ville=${city} → region=${regionCode}`);
  
  // Construire les paramètres de base
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000'); // Catégorie immobilier
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k'); // À vendre
  baseParams.append('limit', '50');
  
  // Filtre prix (passé directement à l'API)
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    baseParams.append('price', `${minPrice}-${maxPrice}`);
  }
  
  // Faire 4 appels paginés pour récupérer 200 résultats
  const allAds = [];
  const offsets = [0, 50, 100, 150];
  
  for (const offset of offsets) {
    try {
      const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
      console.log(`Chotot fetch: offset=${offset}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ads && data.ads.length > 0) {
        allAds.push(...data.ads);
        console.log(`Chotot offset=${offset}: ${data.ads.length} résultats (total API: ${data.total})`);
      } else {
        break; // Plus de résultats
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL récupéré: ${allAds.length} annonces`);
  
  // Mapper les résultats
  return allAds.map(ad => ({
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
  }));
}

// ============================================
// NHADAT247 API
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
      floorAreaSqm: item.area || 0,
      area: item.area || 0,
      district: item.district || '',
      city: item.city || '',
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
// BATDONGSAN API (données pré-scrapées)
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
      floorAreaSqm: item.floorAreaSqm || item.area || 0,
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
// NORMALISER TITRE POUR DÉDUPLICATION
// ============================================
function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/bán\s*gấp|cần\s*bán|bán\s*nhanh|bán/g, '')
    .replace(/căn\s*hộ|chung\s*cư|apartment/g, '')
    .replace(/sổ\s*hồng|shr|sổ\s*đỏ/g, '')
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '')
    .substring(0, 25);
}

// ============================================
// FILTRES POST-API (pour Nhadat247 et Batdongsan)
// ============================================
function applyFilters(results, filters) {
  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms } = filters;
  let filtered = [...results];
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
    console.log(`Après prix min (${priceMin} tỷ): ${filtered.length}`);
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
    console.log(`Après prix max (${priceMax} tỷ): ${filtered.length}`);
  }
  
  if (district) {
    const d = district.toLowerCase();
    filtered = filtered.filter(item => 
      (item.district || '').toLowerCase().includes(d) || 
      (item.title || '').toLowerCase().includes(d)
    );
    console.log(`Après district (${district}): ${filtered.length}`);
  }
  
  if (livingAreaMin) {
    const min = parseInt(livingAreaMin);
    filtered = filtered.filter(item => (item.area || 0) >= min);
    console.log(`Après surface min (${livingAreaMin}m²): ${filtered.length}`);
  }
  
  if (livingAreaMax) {
    const max = parseInt(livingAreaMax);
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= max;
    });
    console.log(`Après surface max (${livingAreaMax}m²): ${filtered.length}`);
  }
  
  if (bedrooms) {
    const min = parseInt(bedrooms);
    filtered = filtered.filter(item => item.bedrooms >= min);
    console.log(`Après chambres (${bedrooms}+): ${filtered.length}`);
  }
  
  if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
    const type = propertyType.toLowerCase();
    let keywords = [];
    if (type.includes('căn hộ') || type.includes('chung cư')) keywords = ['căn hộ', 'chung cư', 'apartment'];
    else if (type.includes('biệt thự')) keywords = ['biệt thự', 'villa'];
    else if (type.includes('nhà')) keywords = ['nhà'];
    else if (type.includes('đất')) keywords = ['đất'];
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        return keywords.some(k => t.includes(k));
      });
      console.log(`Après type (${propertyType}): ${filtered.length}`);
    }
  }
  
  return filtered;
}

// ============================================
// DÉDUPLICATION
// ============================================
function deduplicateResults(results) {
  const seen = new Set();
  const unique = [];
  
  for (const item of results) {
    const titleKey = normalizeTitle(item.title);
    const priceKey = Math.round((item.price || 0) / 500000000);
    const key = `${titleKey}_${priceKey}`;
    
    if (seen.has(key)) {
      console.log(`DOUBLON: "${item.title.substring(0, 40)}..."`);
      continue;
    }
    
    seen.add(key);
    unique.push(item);
  }
  
  return unique;
}

// ============================================
// SCORE
// ============================================
function calculateScore(item) {
  let score = 50;
  const title = (item.title || '').toLowerCase();
  
  if (/gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/.test(title)) score += 15;
  if (item.thumbnail) score += 5;
  if ((item.postedOn || '').toLowerCase().includes('hôm nay')) score += 10;
  if (item.area > 0 && item.price > 0 && item.price / item.area < 60000000) score += 10;
  
  return Math.min(100, score);
}

// ============================================
// HANDLER
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

  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sources }));

  try {
    let allResults = [];
    
    // CHOTOT - Source principale avec pagination (200 résultats)
    if (sources?.includes('chotot')) {
      const chototResults = await fetchChotot({ city, priceMin, priceMax });
      console.log(`Chotot: ${chototResults.length} résultats`);
      allResults.push(...chototResults);
    }
    
    // BATDONGSAN - Données pré-scrapées (limité à HCM actuellement)
    if (sources?.includes('batdongsan')) {
      const batdongsanResults = await fetchBatdongsan();
      const filteredBatdongsan = applyFilters(batdongsanResults, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Batdongsan: ${batdongsanResults.length} bruts → ${filteredBatdongsan.length} filtrés`);
      allResults.push(...filteredBatdongsan);
    }
    
    // NHADAT247 - Données pré-scrapées (limité à HCM actuellement)
    if (sources?.includes('nhadat247')) {
      const nhadat247Results = await fetchNhadat247();
      const filteredNhadat247 = applyFilters(nhadat247Results, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Nhadat247: ${nhadat247Results.length} bruts → ${filteredNhadat247.length} filtrés`);
      allResults.push(...filteredNhadat247);
    }
    
    console.log(`TOTAL AVANT DÉDUP: ${allResults.length}`);
    
    // Filtres type de bien pour Chotot (pas filtré côté API)
    if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
      const type = propertyType.toLowerCase();
      let keywords = [];
      if (type.includes('căn hộ') || type.includes('chung cư')) keywords = ['căn hộ', 'chung cư', 'apartment', 'cc'];
      else if (type.includes('biệt thự')) keywords = ['biệt thự', 'villa'];
      else if (type.includes('nhà')) keywords = ['nhà'];
      else if (type.includes('đất')) keywords = ['đất'];
      
      if (keywords.length > 0) {
        allResults = allResults.filter(item => {
          const t = (item.title || '').toLowerCase();
          return keywords.some(k => t.includes(k));
        });
        console.log(`Après filtre type global (${propertyType}): ${allResults.length}`);
      }
    }
    
    // Déduplication
    const unique = deduplicateResults(allResults);
    console.log(`APRÈS DÉDUP: ${unique.length} (${allResults.length - unique.length} doublons)`);
    
    // Mapper pour frontend
    const results = unique.slice(0, 100).map((item, i) => ({
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
      score: calculateScore(item),
      hasUrgentKeyword: /gấp|nhanh|kẹt|thanh lý|lỗ|ngộp/i.test(item.title),
      isNew: /hôm nay|today/i.test(item.postedOn || ''),
      postedOn: item.postedOn || '',
    }));

    results.sort((a, b) => b.score - a.score);

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      totalResults: results.length
    };

    console.log(`FINAL: ${results.length} résultats, ${stats.lowestPrice/1e9}-${stats.highestPrice/1e9} tỷ`);

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
      body: JSON.stringify({ success: false, error: error.message, results: [], stats: { lowestPrice: 0, highestPrice: 0, totalResults: 0 } })
    };
  }
};
