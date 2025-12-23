// ============================================
// TRAXHOME SEARCH - VERSION CHOTOT UNIQUEMENT
// 100% GRATUIT - Pas de frais Apify
// ============================================

// ============================================
// MAPPING DES VILLES → CODES RÉGION CHOTOT
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
  'thừa thiên huế': '15300',
};

const CITY_ALIASES = {
  'hồ chí minh': ['hcm', 'tphcm', 'sài gòn', 'saigon', 'sg', 'ho chi minh', 'hô chi minh'],
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
  'thừa thiên huế': ['hue', 'huế', 'thua thien hue'],
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

// ============================================
// CHOTOT API - 300 RÉSULTATS (GRATUIT)
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax, sortBy } = params;
  
  const regionCode = getChototRegion(city);
  const normalizedCity = normalizeCity(city);
  console.log(`Chotot: ville="${city}" → normalized="${normalizedCity}" → region=${regionCode}`);
  
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000'); // Catégorie immobilier
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k'); // Statut: à vendre
  baseParams.append('limit', '50');
  
  // Filtre prix
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    baseParams.append('price', `${minPrice}-${maxPrice}`);
  }
  
  // Tri
  if (sortBy === 'price_asc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'asc');
  } else if (sortBy === 'price_desc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'desc');
  }
  
  // Pagination: 6 pages x 50 = 300 résultats max
  const allAds = [];
  const offsets = [0, 50, 100, 150, 200, 250];
  
  for (const offset of offsets) {
    try {
      const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ads && data.ads.length > 0) {
        allAds.push(...data.ads);
        console.log(`Chotot offset=${offset}: +${data.ads.length} (total API: ${data.total || '?'})`);
      } else {
        break;
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL: ${allAds.length}`);
  
  return allAds
    .filter(ad => ad.price && ad.price > 0) // Exclure prix "à négocier"
    .map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || 'Không có tiêu đề',
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
// FILTRES
// ============================================
function applyFilters(results, filters) {
  const { propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms } = filters;
  let filtered = [...results];
  
  // Filtre prix min
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
  }
  
  // Filtre prix max
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
  }
  
  // Filtre surface min
  if (livingAreaMin) {
    filtered = filtered.filter(item => (item.area || 0) >= parseInt(livingAreaMin));
  }
  
  // Filtre surface max
  if (livingAreaMax) {
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= parseInt(livingAreaMax);
    });
  }
  
  // Filtre chambres
  if (bedrooms) {
    filtered = filtered.filter(item => item.bedrooms >= parseInt(bedrooms));
  }
  
  // Filtre type de bien
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
    } else if (type.includes('studio')) {
      keywords = ['studio'];
    } else if (type.includes('shophouse')) {
      keywords = ['shophouse'];
    }
    
    if (keywords.length > 0) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const propType = (item.propertyType || '').toLowerCase();
        return keywords.some(k => title.includes(k) || propType.includes(k));
      });
      console.log(`Filtre type "${propertyType}": ${beforeFilter} → ${filtered.length}`);
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
// CALCUL DU SCORE
// ============================================
function calculateScore(item, keywords = []) {
  let score = 50;
  const title = (item.title || '').toLowerCase();
  
  // Mots-clés urgents dans le titre
  if (/gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/.test(title)) score += 15;
  
  // Mots-clés personnalisés
  if (keywords.length > 0) {
    const hasKeyword = keywords.some(kw => title.includes(kw.toLowerCase()));
    if (hasKeyword) score += 10;
  }
  
  // A une image
  if (item.thumbnail) score += 5;
  
  // Annonce récente
  if ((item.postedOn || '').includes('hôm nay') || (item.postedOn || '').includes('phút')) score += 10;
  
  // Bon rapport qualité/prix (prix/m² bas)
  if (item.area > 0 && item.price > 0) {
    const pricePerM2 = item.price / item.area;
    if (pricePerM2 < 50000000) score += 10; // < 50 triệu/m²
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

  const { 
    city, 
    district, 
    propertyType, 
    priceMin, 
    priceMax, 
    livingAreaMin, 
    livingAreaMax, 
    bedrooms, 
    sortBy,
    keywords = []
  } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax }));

  try {
    // Récupérer les annonces de Chotot
    let allResults = await fetchChotot({ city, priceMin, priceMax, sortBy });
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    // Appliquer les filtres
    allResults = applyFilters(allResults, { 
      propertyType, 
      priceMin, 
      priceMax, 
      livingAreaMin, 
      livingAreaMax, 
      bedrooms 
    });
    console.log(`Après filtres: ${allResults.length}`);
    
    // Déduplication
    const unique = deduplicateResults(allResults);
    const duplicatesRemoved = allResults.length - unique.length;
    console.log(`Après dédup: ${unique.length} (${duplicatesRemoved} doublons)`);
    
    // Calculer score et trier
    let sortedResults = unique.map(item => ({ 
      ...item, 
      score: calculateScore(item, keywords) 
    }));
    
    if (sortBy === 'price_asc' || sortBy === 'priceAsc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc' || sortBy === 'priceDesc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    // Limiter à 100 résultats pour l'affichage
    const results = sortedResults.slice(0, 100).map((item, i) => ({
      id: item.id || i,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
      city: item.city || city || '',
      district: item.district || district || '',
      address: item.district ? `${item.district}, ${item.city || city}` : (item.city || city || ''),
      floorArea: item.area || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
      images: item.images || [],
      url: item.url || '#',
      source: item.source || 'chotot.com',
      score: item.score,
      hasUrgentKeyword: /gấp|nhanh|kẹt|thanh lý|lỗ|ngộp/i.test(item.title),
      isNew: /hôm nay|phút|today/i.test(item.postedOn || ''),
      postedOn: item.postedOn || '',
    }));

    // Statistiques
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
      body: JSON.stringify({ 
        success: false, 
        error: error.message, 
        results: [], 
        stats: {} 
      })
    };
  }
};
