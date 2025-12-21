const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// MAPPING DES VILLES (normalisation)
// ============================================
const CITY_ALIASES = {
  'hồ chí minh': ['hồ chí minh', 'ho chi minh', 'hcm', 'tp hcm', 'tp. hcm', 'tphcm', 'sài gòn', 'saigon', 'sg'],
  'hà nội': ['hà nội', 'ha noi', 'hanoi', 'hn'],
  'đà nẵng': ['đà nẵng', 'da nang', 'danang', 'đn'],
  'bình dương': ['bình dương', 'binh duong', 'bd'],
  'đồng nai': ['đồng nai', 'dong nai', 'dn'],
  'khánh hòa': ['khánh hòa', 'khanh hoa', 'nha trang'],
  'hải phòng': ['hải phòng', 'hai phong', 'hp'],
  'cần thơ': ['cần thơ', 'can tho', 'ct'],
  'bà rịa - vũng tàu': ['bà rịa', 'vũng tàu', 'vung tau', 'brvt'],
  'quảng ninh': ['quảng ninh', 'quang ninh', 'hạ long', 'ha long'],
  'lâm đồng': ['lâm đồng', 'lam dong', 'đà lạt', 'da lat', 'dalat'],
  'thừa thiên huế': ['thừa thiên huế', 'thua thien hue', 'huế', 'hue'],
};

// Fonction pour normaliser et vérifier si une ville correspond
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
// CHOTOT API INTEGRATION
// ============================================
async function fetchChotot(params) {
  const { city, propertyType, priceMin, priceMax } = params;
  
  const regionMapping = {
    'hồ chí minh': '13000',
    'hà nội': '12000', 
    'đà nẵng': '15000',
    'bình dương': '13100',
    'đồng nai': '13200',
    'khánh hòa': '15100',
    'hải phòng': '12100',
    'cần thơ': '14000',
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
  
  const apiUrl = `https://gateway.chotot.com/v1/public/ad-listing?${urlParams}`;
  console.log('Chotot API URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return (data.ads || []).map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || 'Không có tiêu đề',
      price: ad.price || 0,
      priceFormatted: ad.price_string || '',
      floorAreaSqm: ad.size || ad.area || 0,
      area: ad.size || ad.area || 0,
      address: ad.area_name || ad.region_name || '',
      ward: ad.ward_name || '',
      district: ad.area_name || '',
      city: ad.region_name || '',
      bedrooms: ad.rooms || null,
      bathrooms: ad.toilets || null,
      description: ad.body || '',
      thumbnail: ad.image || ad.images?.[0] || '',
      images: ad.images || (ad.image ? [ad.image] : []),
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
// NHADAT247 API INTEGRATION
// ============================================
async function fetchNhadat247(params) {
  const NHADAT247_ACTOR_ID = 'outlandish_bookcases~nhadat247-scraper';
  
  try {
    const datasetUrl = `https://api.apify.com/v2/acts/${NHADAT247_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`;
    const response = await fetch(datasetUrl);
    
    if (!response.ok) {
      console.error('Nhadat247 API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    return (data || []).map(item => ({
      id: item.id || `nhadat247_${Date.now()}_${Math.random()}`,
      title: item.title || 'Không có tiêu đề',
      price: item.price || 0,
      priceFormatted: item.priceText || '',
      floorAreaSqm: item.area || 0,
      area: item.area || 0,
      address: item.address || '',
      district: item.district || '',
      city: item.city || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.imageUrl || '',
      images: item.imageUrl ? [item.imageUrl] : [],
      url: item.url || '',
      source: 'nhadat247.com.vn',
      postedOn: item.postedDate || '',
      propertyType: '',
    }));
  } catch (error) {
    console.error('Nhadat247 error:', error);
    return [];
  }
}

// ============================================
// BATDONGSAN API INTEGRATION
// ============================================
async function fetchBatdongsan(params) {
  try {
    const datasetUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`;
    const response = await fetch(datasetUrl);
    
    if (!response.ok) {
      console.error('Batdongsan API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    return (data || []).filter(item => item.price && item.price > 0).map(item => ({
      id: item.id || `batdongsan_${Date.now()}_${Math.random()}`,
      title: item.title || 'Không có tiêu đề',
      price: item.price || 0,
      priceFormatted: item.priceText || '',
      floorAreaSqm: item.floorAreaSqm || item.area || 0,
      area: item.floorAreaSqm || item.area || 0,
      address: item.address || '',
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
// FILTRES UNIVERSELS
// ============================================
function applyFilters(results, filters) {
  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, daysListed } = filters;
  
  let filtered = [...results];
  
  // 1. FILTRE PRIX MIN
  if (priceMin) {
    const priceMinVND = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => {
      if (!item.price || item.price <= 0) return false;
      return item.price >= priceMinVND;
    });
    console.log(`Après filtre prix min (${priceMin} tỷ): ${filtered.length} résultats`);
  }
  
  // 2. FILTRE PRIX MAX
  if (priceMax) {
    const priceMaxVND = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => {
      if (!item.price || item.price <= 0) return false;
      return item.price <= priceMaxVND;
    });
    console.log(`Après filtre prix max (${priceMax} tỷ): ${filtered.length} résultats`);
  }
  
 // 3. FILTRE VILLE (avec aliases) - VERSION TOLÉRANTE
  if (city) {
    filtered = filtered.filter(item => {
      const textToSearch = [
        item.address || '',
        item.city || '',
        item.district || '',
        item.title || ''
      ].join(' ');
      
      // Si aucune info de localisation, on garde le résultat (tolérant)
      if (!textToSearch.trim()) return true;
      
      return cityMatches(city, textToSearch);
    });
    console.log(`Après filtre ville (${city}): ${filtered.length} résultats`);
  }
  
  // 4. FILTRE DISTRICT
  if (district) {
    const districtLower = district.toLowerCase();
    filtered = filtered.filter(item => {
      const textToSearch = [
        item.address || '',
        item.district || '',
        item.title || ''
      ].join(' ').toLowerCase();
      
      return textToSearch.includes(districtLower);
    });
    console.log(`Après filtre district (${district}): ${filtered.length} résultats`);
  }
  
  // 5. FILTRE SURFACE MIN
  if (livingAreaMin) {
    const minArea = parseInt(livingAreaMin);
    filtered = filtered.filter(item => {
      const area = item.floorAreaSqm || item.area || 0;
      return area >= minArea;
    });
    console.log(`Après filtre surface min (${livingAreaMin}m²): ${filtered.length} résultats`);
  }
  
  // 6. FILTRE SURFACE MAX
  if (livingAreaMax) {
    const maxArea = parseInt(livingAreaMax);
    filtered = filtered.filter(item => {
      const area = item.floorAreaSqm || item.area || 0;
      return area > 0 && area <= maxArea;
    });
    console.log(`Après filtre surface max (${livingAreaMax}m²): ${filtered.length} résultats`);
  }
  
  // 7. FILTRE CHAMBRES
  if (bedrooms) {
    const minBedrooms = parseInt(bedrooms);
    filtered = filtered.filter(item => {
      return item.bedrooms && item.bedrooms >= minBedrooms;
    });
    console.log(`Après filtre chambres (${bedrooms}+): ${filtered.length} résultats`);
  }
  
  // 8. FILTRE TYPE DE BIEN
  if (propertyType) {
    const typeLower = propertyType.toLowerCase();
    
    const typeMapping = {
      'căn hộ chung cư': ['căn hộ', 'chung cư', 'apartment', 'can ho'],
      'căn hộ nghỉ dưỡng': ['căn hộ nghỉ dưỡng', 'resort apartment'],
      'nhà ở': ['nhà', 'nhà phố', 'nhà riêng', 'house', 'nha pho'],
      'nhà biệt thự': ['biệt thự', 'villa', 'biet thu'],
      'nhà nghỉ dưỡng': ['nghỉ dưỡng'],
      'studio': ['studio'],
      'mặt bằng': ['mặt bằng', 'commercial', 'mat bang'],
      'shophouse': ['shophouse'],
      'văn phòng': ['văn phòng', 'office', 'van phong'],
      'cửa hàng': ['cửa hàng', 'shop', 'cua hang'],
      'kho, nhà xưởng': ['kho', 'nhà xưởng', 'warehouse', 'xuong'],
      'đất': ['đất', 'land', 'dat nen'],
      'đất nghỉ dưỡng': ['đất nghỉ dưỡng'],
      'tất cả nhà đất': [],
      'các loại nhà bán': ['nhà'],
      'bất động sản khác': []
    };
    
    const keywords = typeMapping[typeLower] || [typeLower];
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const textToSearch = [
          item.title || '',
          item.propertyType || ''
        ].join(' ').toLowerCase();
        
        return keywords.some(kw => textToSearch.includes(kw));
      });
      console.log(`Après filtre type (${propertyType}): ${filtered.length} résultats`);
    }
  }
  
  // 9. FILTRE JOURS DEPUIS PUBLICATION
  if (daysListed) {
    const maxDays = parseInt(daysListed);
    const now = new Date();
    
    filtered = filtered.filter(item => {
      if (!item.postedOn) return true;
      
      const postedStr = (item.postedOn || '').toLowerCase();
      
      if (postedStr.includes('hôm nay') || postedStr.includes('today')) return true;
      if (postedStr.includes('hôm qua') || postedStr.includes('yesterday')) return maxDays >= 1;
      
      let postedDate = null;
      
      const dateMatch1 = postedStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dateMatch1) {
        postedDate = new Date(dateMatch1[3], dateMatch1[2] - 1, dateMatch1[1]);
      }
      
      const dateMatch2 = postedStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (!postedDate && dateMatch2) {
        postedDate = new Date(dateMatch2[1], dateMatch2[2] - 1, dateMatch2[3]);
      }
      
      if (postedDate && !isNaN(postedDate)) {
        const diffDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
        return diffDays <= maxDays;
      }
      
      return true;
    });
    console.log(`Après filtre jours (${daysListed}j): ${filtered.length} résultats`);
  }
  
  return filtered;
}

// ============================================
// DÉDUPLICATION AMÉLIORÉE
// ============================================
function deduplicateResults(results) {
  const seenIds = new Set();
  const seenProperties = new Set();
  
  return results.filter(item => {
    // Dédupliquer par ID exact
    if (item.id && seenIds.has(item.id)) return false;
    if (item.id) seenIds.add(item.id);
    
    // Dédupliquer par caractéristiques du bien (surface + prix + mots-clés adresse)
    const area = item.floorAreaSqm || item.area || 0;
    const price = item.price || 0;
    
    // Extraire les mots-clés d'adresse du titre (district, rue, projet)
    const titleLower = (item.title || '').toLowerCase();
    const addressKeywords = titleLower
      .replace(/bán|gấp|nhanh|cần|tiền|kẹt|thanh|lý|rẻ|lỗ|ngộp|căn hộ|chung cư|nhà|đất/g, '') // Supprimer mots génériques
      .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '')
      .trim()
      .substring(0, 30);
    
    // Clé unique : surface arrondie + prix arrondi + adresse simplifiée
    const propertyKey = `${Math.round(area)}_${Math.round(price/100000000)}_${addressKeywords}`;
    
    if (seenProperties.has(propertyKey)) return false;
    seenProperties.add(propertyKey);
    
    return true;
  });
}

// ============================================
// CALCUL DU SCORE
// ============================================
function calculateScore(item) {
  let score = 50;
  
  const urgentWords = ['gấp', 'nhanh', 'kẹt tiền', 'cần tiền', 'thanh lý', 'rẻ', 'lỗ', 'ngộp', 'bán gấp', 'cần bán'];
  const titleLower = (item.title || '').toLowerCase();
  urgentWords.forEach(word => {
    if (titleLower.includes(word)) score += 8;
  });
  
  if (item.thumbnail || (item.images && item.images.length > 0)) score += 5;
  
  const postedStr = (item.postedOn || '').toLowerCase();
  if (postedStr.includes('hôm nay') || postedStr.includes('today')) score += 15;
  else if (postedStr.includes('hôm qua') || postedStr.includes('yesterday')) score += 10;
  
  const area = item.floorAreaSqm || item.area || 0;
  if (area > 0 && item.price > 0) {
    const pricePerSqm = item.price / area;
    if (pricePerSqm < 50000000) score += 10;
    else if (pricePerSqm < 80000000) score += 5;
  }
  
  if (area > 0) score += 3;
  if (item.bedrooms && item.bedrooms > 0) score += 2;
  
  return Math.min(100, Math.max(0, score));
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    body = {};
  }

  const { 
    city, 
    district,
    propertyType, 
    priceMin,
    priceMax, 
    livingAreaMin,
    livingAreaMax,
    bedrooms,
    daysListed,
    keywords,
    sources
  } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Paramètres:', JSON.stringify({ city, district, propertyType, priceMin, priceMax, sources }));

  try {
    // ============================================
    // ÉTAPE 1: COLLECTER TOUTES LES DONNÉES
    // ============================================
    let allResults = [];
    
    // Batdongsan
    if (sources && sources.includes('batdongsan')) {
      console.log('Fetching Batdongsan...');
      const batdongsanResults = await fetchBatdongsan(body);
      console.log(`Batdongsan: ${batdongsanResults.length} résultats bruts`);
      allResults = [...allResults, ...batdongsanResults];
    }
    
    // Chotot
    if (sources && sources.includes('chotot')) {
      console.log('Fetching Chotot...');
      const chototResults = await fetchChotot(body);
      console.log(`Chotot: ${chototResults.length} résultats bruts`);
      allResults = [...allResults, ...chototResults];
    }
    
    // Nhadat247
    if (sources && sources.includes('nhadat247')) {
      console.log('Fetching Nhadat247...');
      const nhadat247Results = await fetchNhadat247(body);
      console.log(`Nhadat247: ${nhadat247Results.length} résultats bruts`);
      allResults = [...allResults, ...nhadat247Results];
    }
    
    console.log(`TOTAL BRUT: ${allResults.length} résultats`);
    
    // ============================================
    // ÉTAPE 2: APPLIQUER TOUS LES FILTRES
    // ============================================
    const filteredResults = applyFilters(allResults, {
      city,
      district,
      propertyType,
      priceMin,
      priceMax,
      livingAreaMin,
      livingAreaMax,
      bedrooms,
      daysListed
    });
    
    console.log(`APRÈS FILTRES: ${filteredResults.length} résultats`);
    
    // ============================================
    // ÉTAPE 3: DÉDUPLICATION
    // ============================================
    const uniqueResults = deduplicateResults(filteredResults);
    console.log(`APRÈS DÉDUPLICATION: ${uniqueResults.length} résultats (${filteredResults.length - uniqueResults.length} doublons supprimés)`);
    
    // ============================================
    // ÉTAPE 4: MAPPER AU FORMAT FRONTEND
    // ============================================
    const mappedResults = uniqueResults.slice(0, 100).map((item, index) => {
      const area = item.floorAreaSqm || item.area || 0;
      
      return {
        id: item.id || index,
        title: item.title || 'Sans titre',
        price: item.price || 0,
        pricePerSqm: area > 0 && item.price > 0 ? Math.round(item.price / area) : 0,
        city: item.city || city || 'Vietnam',
        district: item.district || district || '',
        address: item.address || '',
        floorArea: area,
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        imageUrl: item.thumbnail || item.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
        images: item.images || [],
        url: item.url || '#',
        source: item.source || 'unknown',
        score: calculateScore(item),
        hasUrgentKeyword: /gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/i.test(item.title || ''),
        isNew: /hôm nay|today/i.test(item.postedOn || ''),
        postedOn: item.postedOn || '',
        agentName: item.agentName || '',
        agentPhone: item.agentPhone || ''
      };
    });

    // Trier par score décroissant
    mappedResults.sort((a, b) => b.score - a.score);

    // Statistiques
    const prices = mappedResults.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
      highestPrice: prices.length > 0 ? Math.max(...prices) : 0,
      totalResults: mappedResults.length
    };

    console.log(`RÉSULTAT FINAL: ${mappedResults.length} résultats, prix ${stats.lowestPrice/1e9}-${stats.highestPrice/1e9} tỷ`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results: mappedResults,
        stats
      })
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
        stats: { lowestPrice: 0, highestPrice: 0, totalResults: 0 }
      })
    };
  }
};
