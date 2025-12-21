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
};

function cityMatches(searchCity, itemText) {
  if (!searchCity || !itemText) return true;
  const searchLower = searchCity.toLowerCase().trim();
  const textLower = itemText.toLowerCase();
  let aliases = [searchLower];
  for (const [mainCity, cityAliases] of Object.entries(CITY_ALIASES)) {
    if (cityAliases.includes(searchLower) || mainCity === searchLower) {
      aliases = cityAliases;
      break;
    }
  }
  return aliases.some(alias => textLower.includes(alias));
}

// ============================================
// CHOTOT API
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax } = params;
  const regionMapping = {
    'hồ chí minh': '13000',
    'hà nội': '12000',
    'đà nẵng': '15000',
  };
  let regionCode = '13000';
  if (city) {
    const cityLower = city.toLowerCase();
    for (const [cityName, code] of Object.entries(regionMapping)) {
      if (cityLower.includes(cityName) || cityName.includes(cityLower)) {
        regionCode = code;
        break;
      }
    }
  }
  const urlParams = new URLSearchParams();
  urlParams.append('limit', '50');
  urlParams.append('cg', '1000');
  urlParams.append('region_v2', regionCode);
  urlParams.append('st', 's,k');
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    urlParams.append('price', `${minPrice}-${maxPrice}`);
  }
  try {
    const response = await fetch(`https://gateway.chotot.com/v1/public/ad-listing?${urlParams}`);
    const data = await response.json();
    return (data.ads || []).map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || '',
      price: ad.price || 0,
      floorAreaSqm: ad.size || ad.area || 0,
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
  } catch (error) {
    console.error('Chotot error:', error);
    return [];
  }
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
// BATDONGSAN API
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
    .replace(/bán\s*gấp|cần\s*bán|bán\s*nhanh|bán/g, '') // Supprimer "bán gấp", "cần bán", etc.
    .replace(/căn\s*hộ|chung\s*cư|apartment/g, '') // Supprimer type de bien
    .replace(/sổ\s*hồng|shr|sổ\s*đỏ/g, '') // Supprimer statut légal
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '') // Garder que lettres/chiffres
    .substring(0, 25); // Premiers 25 caractères
}

// ============================================
// FILTRES
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
  
  if (city) {
    filtered = filtered.filter(item => {
      const text = [item.city, item.district, item.title].join(' ');
      return cityMatches(city, text);
    });
    console.log(`Après ville (${city}): ${filtered.length}`);
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
// DÉDUPLICATION TRÈS AGRESSIVE
// ============================================
function deduplicateResults(results) {
  const seen = new Set();
  const unique = [];
  
  for (const item of results) {
    // Clé basée sur titre normalisé + prix arrondi à 500M
    const titleKey = normalizeTitle(item.title);
    const priceKey = Math.round((item.price || 0) / 500000000);
    const key = `${titleKey}_${priceKey}`;
    
    if (seen.has(key)) {
      console.log(`DOUBLON SUPPRIMÉ: "${item.title.substring(0, 40)}..." (clé: ${key})`);
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
  console.log('Params:', JSON.stringify({ city, propertyType, priceMax, sources }));

  try {
    let allResults = [];
    
    if (sources?.includes('batdongsan')) {
      const r = await fetchBatdongsan();
      console.log(`Batdongsan: ${r.length} bruts`);
      allResults.push(...r);
    }
    
    if (sources?.includes('chotot')) {
      const r = await fetchChotot(body);
      console.log(`Chotot: ${r.length} bruts`);
      allResults.push(...r);
    }
    
    if (sources?.includes('nhadat247')) {
      const r = await fetchNhadat247();
      console.log(`Nhadat247: ${r.length} bruts`);
      allResults.push(...r);
    }
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    // Filtres
    const filtered = applyFilters(allResults, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
    console.log(`APRÈS FILTRES: ${filtered.length}`);
    
    // Déduplication
    const unique = deduplicateResults(filtered);
    console.log(`APRÈS DÉDUP: ${unique.length} (${filtered.length - unique.length} doublons)`);
    
    // Mapper
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
