const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// MAPPING DES VILLES → CODE RÉGION CHOTOT
// ============================================
const CHOTOT_REGIONS = {
  // Codes vérifiés Janvier 2026
  'ho chi minh': '13000',
  'ha noi': '12000',
  'da nang': '3017',
  'binh duong': '2011',
  'khanh hoa': '7044',
  'nha trang': '7044',
  'can tho': '5027',
  'hai phong': '4019',
  'ba ria': '2010',
  'vung tau': '2010',
  'ba ria vung tau': '2010',
  'quy nhon': '7043',
'binh dinh': '7043',
};
// ============================================
// MAPPING STATUT LÉGAL
// ============================================
const getLegalStatus = (code) => {
  const legalMap = {
    1: 'Sổ đỏ/Sổ hồng',
    2: 'Hợp đồng mua bán',
    3: 'Đang chờ sổ',
  };
  return legalMap[code] || null;
};

// ============================================
// MAPPING UNIVERSEL DES TYPES DE BIENS K TRIX
// ============================================
const PROPERTY_TYPE_MAPPING = {
  // Clé = valeur normalisée du type sélectionné par l'utilisateur
  // Chaque entrée contient: chotot (code), batdongsan (slug), include (mots-clés à inclure), exclude (mots-clés à exclure)
  
  'tat_ca': {
    label: { vn: 'Tất cả nhà đất', en: 'All Properties', fr: 'Tous biens' },
    chotot: 1000,
    batdongsan: null,
    include: [],
    exclude: []
  },
  
  // === APPARTEMENTS (Code Chotot 1010) ===
  'can_ho_chung_cu': {
    label: { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['căn hộ', 'chung cư', 'apartment', 'cc'],
    exclude: ['nghỉ dưỡng', 'condotel', 'resort', 'studio']
  },
  'can_ho_nghi_duong': {
    label: { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Condo', fr: 'Appart. Vacances' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['nghỉ dưỡng', 'condotel', 'resort'],
    exclude: []
  },
  'studio': {
    label: { vn: 'Studio', en: 'Studio', fr: 'Studio' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['studio'],
    exclude: []
  },
  
  // === MAISONS (Code Chotot 1020) ===
  'nha_o': {
    label: { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    chotot: 1020,
    batdongsan: 'ban-nha-rieng',
    include: ['nhà riêng', 'nhà ở', 'nhà phố'],
    exclude: ['biệt thự', 'villa', 'nghỉ dưỡng', 'resort']
  },
  'nha_biet_thu': {
    label: { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    chotot: 1020,
    batdongsan: 'ban-nha-biet-thu-lien-ke',
    include: ['biệt thự', 'villa', 'liền kề'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'nha_nghi_duong': {
    label: { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances' },
    chotot: 1020,
    batdongsan: 'ban-nha-rieng',
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
  
  // === COMMERCIAL (Code Chotot 1030) ===
  'shophouse': {
    label: { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['shophouse', 'nhà phố thương mại'],
    exclude: []
  },
  'van_phong': {
    label: { vn: 'Văn phòng', en: 'Office', fr: 'Bureau' },
    chotot: 1030,
    batdongsan: null, // N'existe pas sur Batdongsan
    include: ['văn phòng', 'office', 'officetel'],
    exclude: []
  },
  'cua_hang': {
    label: { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['cửa hàng', 'shop', 'ki ốt', 'kiot'],
    exclude: []
  },
  'mat_bang': {
    label: { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['mặt bằng', 'mặt tiền'],
    exclude: ['shophouse', 'văn phòng', 'kho']
  },
  'kho_nha_xuong': {
    label: { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt' },
    chotot: 1030,
    batdongsan: 'ban-kho-nha-xuong',
    include: ['kho', 'nhà xưởng', 'xưởng', 'warehouse'],
    exclude: []
  },
  
  // === TERRAIN (Code Chotot 1040) ===
  'dat': {
    label: { vn: 'Đất', en: 'Land', fr: 'Terrain' },
    chotot: 1040,
    batdongsan: 'ban-dat-dat-nen',
    include: ['đất', 'đất nền', 'lô đất'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'dat_nghi_duong': {
    label: { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances' },
    chotot: 1040,
    batdongsan: 'ban-dat-dat-nen',
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
  
  // === AUTRES ===
  'bat_dong_san_khac': {
    label: { vn: 'Bất động sản khác', en: 'Other', fr: 'Autre bien' },
    chotot: 1000,
    batdongsan: null,
    include: [],
    exclude: []
  }
};

// Fonction pour trouver le mapping à partir du texte utilisateur
function getPropertyTypeMapping(userInput) {
  if (!userInput) return PROPERTY_TYPE_MAPPING['tat_ca'];
  
  const input = removeVietnameseAccents(userInput.toLowerCase());
  
  // Recherche par correspondance dans les labels ou mots-clés
  for (const [key, mapping] of Object.entries(PROPERTY_TYPE_MAPPING)) {
    const labelVn = removeVietnameseAccents(mapping.label.vn.toLowerCase());
    const labelEn = mapping.label.en.toLowerCase();
    const labelFr = mapping.label.fr.toLowerCase();
    
    // Correspondance exacte ou partielle avec les labels
    if (input.includes(labelVn) || labelVn.includes(input) ||
        input.includes(labelEn) || labelEn.includes(input) ||
        input.includes(labelFr) || labelFr.includes(input)) {
      return mapping;
    }
    
    // Correspondance avec les mots-clés d'inclusion
    for (const kw of mapping.include) {
      if (input.includes(removeVietnameseAccents(kw))) {
        return mapping;
      }
    }
  }
  
  // Mappings spécifiques pour termes courants
  if (input.includes('can ho') || input.includes('chung cu') || input.includes('apartment')) {
    return PROPERTY_TYPE_MAPPING['can_ho_chung_cu'];
  }
  if (input.includes('biet thu') || input.includes('villa')) {
    return PROPERTY_TYPE_MAPPING['nha_biet_thu'];
  }
  if (input.includes('nha') && !input.includes('biet thu') && !input.includes('nghi duong')) {
    return PROPERTY_TYPE_MAPPING['nha_o'];
  }
  if (input.includes('dat') && !input.includes('nghi duong')) {
    return PROPERTY_TYPE_MAPPING['dat'];
  }
  if (input.includes('nghi duong') || input.includes('resort')) {
    if (input.includes('can ho')) return PROPERTY_TYPE_MAPPING['can_ho_nghi_duong'];
    if (input.includes('dat')) return PROPERTY_TYPE_MAPPING['dat_nghi_duong'];
    return PROPERTY_TYPE_MAPPING['nha_nghi_duong'];
  }
  
  return PROPERTY_TYPE_MAPPING['tat_ca'];
}

// Fonction pour supprimer les accents vietnamiens
function removeVietnameseAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

function getChototRegion(city) {
  if (!city) return '13000'; // Défaut: HCM
  
  const cityNormalized = removeVietnameseAccents(city);
  console.log(`City mapping: "${city}" → normalized: "${cityNormalized}"`);
  
  // Correspondance directe
  for (const [cityName, code] of Object.entries(CHOTOT_REGIONS)) {
    if (cityNormalized.includes(cityName) || cityName.includes(cityNormalized)) {
      console.log(`City matched: "${cityName}" → code ${code}`);
      return code;
    }
  }
  
  // Mappings spécifiques supplémentaires
  if (cityNormalized.includes('sai gon') || cityNormalized.includes('saigon') || cityNormalized.includes('hcm') || cityNormalized.includes('tphcm')) {
    return '13000';
  }
  if (cityNormalized.includes('hanoi') || cityNormalized.includes('hn')) {
    return '12000';
  }
  if (cityNormalized.includes('danang') || cityNormalized.includes('dn')) {
    return '3017';
  }
  if (cityNormalized.includes('nha trang')) {
    return '7044';
  }
  if (cityNormalized.includes('da lat') || cityNormalized.includes('dalat')) {
    return '15200';
  }
  
  console.log(`City not found, defaulting to HCM (13000)`);
  return '13000'; // Défaut: HCM
}

// ============================================
// CHOTOT API - 300 RÉSULTATS AVEC TRI PAR PRIX
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax, sortBy, propertyType } = params;
  
  const regionCode = getChototRegion(city);
  const typeMapping = getPropertyTypeMapping(propertyType);
  
  console.log(`Chotot: ville="${city}" → region=${regionCode}, type="${propertyType}" → code=${typeMapping.chotot}`);
  
  // Paramètres de base
  const baseParams = new URLSearchParams();
  baseParams.append('cg', typeMapping.chotot.toString()); // Code catégorie
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
  
  console.log(`Chotot TOTAL brut: ${allAds.length} annonces`);
  
  // Mapper les résultats
  let results = allAds
    .filter(ad => ad.price && ad.price > 0)
    .map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || 'Không có tiêu đề',
      price: ad.price || 0,
      floorAreaSqm: ad.size || ad.area || 0,
      area: ad.size || ad.area || 0,
      address: [ad.street_name, ad.ward_name, ad.area_name].filter(Boolean).join(', ') || '',
      street: ad.street_name || '',
      ward: ad.ward_name || '',
      district: ad.area_name || '',
      city: ad.region_name || '',
      bedrooms: ad.rooms || null,
      bathrooms: ad.toilets || null,
      thumbnail: ad.image || ad.images?.[0] || '',
      images: ad.images || (ad.image ? [ad.image] : []),
      url: `https://www.chotot.com/${ad.list_id}.htm`,
      source: 'chotot.com',
      postedOn: ad.list_time ? new Date(ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
      list_time: ad.list_time || 0,
      category: ad.category || null,
      propertyType: ad.category_name || '',
      pricePerM2: ad.price_million_per_m2 || null,
      legalStatus: ad.property_legal_document ? getLegalStatus(ad.property_legal_document) : null,
    }));
  
  // Appliquer le filtrage par mots-clés INCLURE/EXCLURE
  if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
    const beforeFilter = results.length;
    results = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
    console.log(`Chotot filtre mots-clés: ${beforeFilter} → ${results.length}`);
  }

  
  return results;
}

// ============================================
// FILTRAGE PAR MOTS-CLÉS (INCLURE/EXCLURE)
// ============================================
function filterByKeywords(results, includeKeywords, excludeKeywords) {
  return results.filter(item => {
    const title = removeVietnameseAccents(item.title || '');
    const propertyType = removeVietnameseAccents(item.propertyType || '');
    const combined = title + ' ' + propertyType;
    
    // Vérifier exclusions d'abord
    if (excludeKeywords.length > 0) {
      for (const kw of excludeKeywords) {
        if (combined.includes(removeVietnameseAccents(kw))) {
          return false; // Exclure cet item
        }
      }
    }
    
    // Vérifier inclusions (si spécifiées)
    if (includeKeywords.length > 0) {
      let hasMatch = false;
      for (const kw of includeKeywords) {
        if (combined.includes(removeVietnameseAccents(kw))) {
          hasMatch = true;
          break;
        }
      }
      return hasMatch;
    }
    
    return true; // Pas de filtre inclusion = tout passe
  });
}

// ============================================
// NHADAT247 API (données pré-scrapées HCM)
// ============================================
async function fetchNhadat247(propertyType) {
  const NHADAT247_ACTOR_ID = 'outlandish_bookcases~nhadat247-scraper';
  const typeMapping = getPropertyTypeMapping(propertyType);
  
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${NHADAT247_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) {
      console.log('Nhadat247: API non disponible');
      return [];
    }
    const data = await response.json();
    console.log(`Nhadat247: ${(data || []).length} annonces récupérées`);
    
    let results = (data || []).map(item => ({
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
      list_time: 0,
      category: null,
      propertyType: item.propertyType || '',
    }));
    
    // Appliquer filtrage par mots-clés
    if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
      const beforeFilter = results.length;
      results = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
      console.log(`Nhadat247 filtre mots-clés: ${beforeFilter} → ${results.length}`);
    }
    
    return results;
  } catch (error) {
    console.error('Nhadat247 error:', error);
    return [];
  }
}

// ============================================
// BATDONGSAN API (données pré-scrapées)
// ============================================
async function fetchBatdongsan(propertyType) {
  const typeMapping = getPropertyTypeMapping(propertyType);
  
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) return [];
    const data = await response.json();
    
    let results = (data || []).filter(item => item.price > 0).map(item => ({
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
    
    // Appliquer filtrage par mots-clés
    if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
      const beforeFilter = results.length;
      results = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
      console.log(`Batdongsan filtre mots-clés: ${beforeFilter} → ${results.length}`);
    }
    
    return results;
  } catch (error) {
    console.error('Batdongsan error:', error);
    return [];
  }
}

// ============================================
// FILTRES POST-API
// ============================================
function applyFilters(results, filters) {
  const { city, district, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, legalStatus } = filters;
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
  // Filtre par statut légal
  if (legalStatus) {
    filtered = filtered.filter(item => {
      if (legalStatus === 'sohong') return item.legalStatus === 'Sổ đỏ/Sổ hồng';
      if (legalStatus === 'hopdong') return item.legalStatus === 'Hợp đồng mua bán';
      if (legalStatus === 'dangcho') return item.legalStatus === 'Đang chờ sổ';
      return true;
    });
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
// SCORE DE NÉGOCIATION INTELLIGENT
// ============================================

// Mots-clés urgents avec poids
const URGENT_KEYWORDS = [
  { pattern: /bán\s*gấp/i, weight: 25, label: 'Bán gấp' },
  { pattern: /cần\s*bán\s*gấp/i, weight: 25, label: 'Cần bán gấp' },
  { pattern: /kẹt\s*tiền/i, weight: 25, label: 'Kẹt tiền' },
  { pattern: /cần\s*tiền/i, weight: 20, label: 'Cần tiền' },
  { pattern: /ngộp\s*bank/i, weight: 25, label: 'Ngộp bank' },
  { pattern: /thanh\s*lý/i, weight: 20, label: 'Thanh lý' },
  { pattern: /bán\s*lỗ/i, weight: 25, label: 'Bán lỗ' },
  { pattern: /giá\s*rẻ/i, weight: 15, label: 'Giá rẻ' },
  { pattern: /bán\s*nhanh/i, weight: 15, label: 'Bán nhanh' },
  { pattern: /chính\s*chủ/i, weight: 10, label: 'Chính chủ' },
  { pattern: /cắt\s*lỗ/i, weight: 25, label: 'Cắt lỗ' },
  { pattern: /hạ\s*giá/i, weight: 20, label: 'Hạ giá' },
];

function calculateNegotiationScore(item, avgPricePerM2) {
  let score = 0;
  const details = {
    urgentKeywords: [],
    priceAnalysis: null,
    listingAge: null,
    photoAnalysis: null,
    priceType: null,
  };
  
  const title = (item.title || '').toLowerCase();
  
  // 1. Mots-clés urgents (max 25 points - on prend le plus fort)
  let maxUrgentWeight = 0;
  for (const kw of URGENT_KEYWORDS) {
    if (kw.pattern.test(title) || kw.pattern.test(item.title || '')) {
      details.urgentKeywords.push(kw.label);
      if (kw.weight > maxUrgentWeight) {
        maxUrgentWeight = kw.weight;
      }
    }
  }
  score += maxUrgentWeight;
  
  // 2. Analyse prix/m² vs moyenne (max 25 points)
  if (item.area > 0 && item.price > 0 && avgPricePerM2 > 0) {
    const itemPricePerM2 = item.price / item.area;
    const priceDiff = ((avgPricePerM2 - itemPricePerM2) / avgPricePerM2) * 100;
    
    details.priceAnalysis = {
      itemPricePerM2: Math.round(itemPricePerM2),
      avgPricePerM2: Math.round(avgPricePerM2),
      diffPercent: Math.round(priceDiff),
    };
    
    if (priceDiff >= 20) {
      score += 25;
      details.priceAnalysis.verdict = 'excellent';
    } else if (priceDiff >= 10) {
      score += 20;
      details.priceAnalysis.verdict = 'good';
    } else if (priceDiff >= 5) {
      score += 10;
      details.priceAnalysis.verdict = 'fair';
    } else if (priceDiff >= 0) {
      score += 5;
      details.priceAnalysis.verdict = 'average';
    } else {
      details.priceAnalysis.verdict = 'above_average';
    }
  }
  
  // 3. Durée en ligne (max 20 points)
  const postedOn = item.postedOn || '';
  const listTime = item.list_time || 0;
  
  let daysOnline = 0;
  if (listTime > 0) {
    const listTimeMs = listTime > 10000000000 ? listTime : listTime * 1000;
    daysOnline = Math.floor((Date.now() - listTimeMs) / (1000 * 60 * 60 * 24));
    if (daysOnline < 0 || daysOnline > 3650) {
      daysOnline = 0;
    }
  } else if (postedOn) {
    const match = postedOn.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const postedDate = new Date(match[3], match[2] - 1, match[1]);
      daysOnline = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOnline < 0 || daysOnline > 3650) {
        daysOnline = 0;
      }
    }
  }
  
  details.listingAge = { days: daysOnline };
  
  if (daysOnline > 60) {
    score += 20;
    details.listingAge.verdict = 'very_old';
  } else if (daysOnline > 30) {
    score += 15;
    details.listingAge.verdict = 'old';
  } else if (daysOnline > 14) {
    score += 5;
    details.listingAge.verdict = 'moderate';
  } else {
    details.listingAge.verdict = 'fresh';
  }
  
  // 4. Analyse photos (max 10 points)
  const numPhotos = (item.images || []).length || (item.thumbnail ? 1 : 0);
  details.photoAnalysis = { count: numPhotos };
  
  if (numPhotos === 0) {
    score += 10;
    details.photoAnalysis.verdict = 'none';
  } else if (numPhotos <= 2) {
    score += 5;
    details.photoAnalysis.verdict = 'few';
  } else {
    details.photoAnalysis.verdict = 'good';
  }
  
  // 5. Prix rond (max 5 points)
  const priceInBillion = item.price / 1000000000;
  const isRoundPrice = priceInBillion === Math.floor(priceInBillion) || 
                       (priceInBillion * 10) === Math.floor(priceInBillion * 10);
  
  if (isRoundPrice && priceInBillion >= 1) {
    score += 5;
    details.priceType = 'round';
  } else {
    details.priceType = 'precise';
  }
  
  const finalScore = Math.min(100, score);
  
  let negotiationLevel;
  if (finalScore >= 70) {
    negotiationLevel = 'excellent';
  } else if (finalScore >= 50) {
    negotiationLevel = 'good';
  } else if (finalScore >= 30) {
    negotiationLevel = 'moderate';
  } else {
    negotiationLevel = 'low';
  }
  
  return {
    score: finalScore,
    level: negotiationLevel,
    details,
  };
}

function calculateScore(item) {
  const result = calculateNegotiationScore(item, 50000000);
  return result.score;
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

  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources, sortBy, keywords, keywordsOnly, legalStatus } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sortBy, sources }));
  
  // Log du mapping utilisé
  const typeMapping = getPropertyTypeMapping(propertyType);
  console.log('Type mapping:', JSON.stringify({
    input: propertyType,
    chotot: typeMapping.chotot,
    batdongsan: typeMapping.batdongsan,
    include: typeMapping.include,
    exclude: typeMapping.exclude
  }));

  try {
    let allResults = [];
    
    // CHOTOT - Source principale (300 résultats, toutes villes)
    if (sources?.includes('chotot')) {
      const chototResults = await fetchChotot({ city, priceMin, priceMax, sortBy, propertyType });
      allResults.push(...chototResults);
    }
    
    // BATDONGSAN - Données pré-scrapées
    if (sources?.includes('batdongsan')) {
      const batdongsanResults = await fetchBatdongsan(propertyType);
      const filtered = applyFilters(batdongsanResults, { city, district, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Batdongsan: ${batdongsanResults.length} → ${filtered.length} après filtres`);
      allResults.push(...filtered);
    }
    
    // NHADAT247 - Données pré-scrapées HCM UNIQUEMENT
    if (sources?.includes('nhadat247')) {
      const cityNormalized = removeVietnameseAccents(city || '');
      const isHCM = cityNormalized.includes('ho chi minh') || 
                    cityNormalized.includes('saigon') || 
                    cityNormalized.includes('hcm') ||
                    cityNormalized.includes('tphcm');
      
      if (isHCM) {
        const nhadat247Results = await fetchNhadat247(propertyType);
        const filtered = applyFilters(nhadat247Results, { city, district, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, legalStatus });
        console.log(`Nhadat247 (HCM): ${nhadat247Results.length} → ${filtered.length} après filtres`);
        allResults.push(...filtered);
      } else {
        console.log(`Nhadat247: ignoré (ville=${city} n'est pas HCM)`);
      }
    }
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    // Déduplication
    let unique = deduplicateResults(allResults);
    
    // Filtre keywordsOnly - ne garder que les annonces avec mots-clés urgents
    if (keywordsOnly) {
      const before = unique.length;
      const vietnameseKeywords = [
        'bán gấp', 'bán nhanh', 'cần bán nhanh', 'kẹt tiền', 'cần tiền', 
        'giá rẻ', 'ngộp bank', 'chính chủ', 'miễn trung gian', 
        'giá thương lượng', 'bán lỗ', 'cắt lỗ', 'hạ giá', 'thanh lý'
      ];
      unique = unique.filter(item => {
        const title = removeVietnameseAccents(item.title || '');
        return vietnameseKeywords.some(kw => title.includes(removeVietnameseAccents(kw)));
      });
      console.log(`Filtre keywordsOnly: ${before} → ${unique.length}`);
    }
    
    let sortedResults = [...unique];
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      sortedResults = sortedResults.map(item => ({ ...item, score: calculateScore(item) }));
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    // Calculer le prix moyen au m²
    const validPricePerM2 = sortedResults
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => item.price / item.area);
    const avgPricePerM2 = validPricePerM2.length > 0 
      ? validPricePerM2.reduce((a, b) => a + b, 0) / validPricePerM2.length 
      : 50000000;
    
    // Limiter à 100 résultats
    const results = sortedResults.slice(0, 100).map((item, i) => {
      const negotiation = calculateNegotiationScore(item, avgPricePerM2);
      
      return {
        id: item.id || i,
        title: item.title || 'Sans titre',
        price: item.price || 0,
        pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
        avgPricePerSqm: Math.round(avgPricePerM2),
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
        score: negotiation.score,
        negotiationLevel: negotiation.level,
        negotiationDetails: negotiation.details,
        hasUrgentKeyword: negotiation.details.urgentKeywords.length > 0,
        urgentKeywords: negotiation.details.urgentKeywords,
        isNew: /hôm nay|phút|today/i.test(item.postedOn || ''),
        postedOn: item.postedOn || '',
        daysOnline: negotiation.details.listingAge?.days || 0,
      };
    });

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      avgPricePerSqm: Math.round(avgPricePerM2),
      totalResults: results.length,
      totalAvailable: unique.length,
    };

    console.log(`FINAL: ${results.length} résultats affichés, ${unique.length} disponibles, prix moyen/m²: ${Math.round(avgPricePerM2/1000000)}M`);

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
