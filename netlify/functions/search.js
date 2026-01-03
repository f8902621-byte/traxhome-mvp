const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// MAPPING DES VILLES → CODE RÉGION CHOTOT
// ============================================
const CHOTOT_REGIONS = {
  'ho chi minh': '13000',
  'ha noi': '12000',
  'da nang': '3017',
  'binh duong': '13100',
  'dong nai': '13200',
  'hai phong': '12100',
  'can tho': '14000',
  'khanh hoa': '15100',
  'ba ria': '13300',
  'vung tau': '13300',
  'quang ninh': '12200',
  'lam dong': '15200',
  'long an': '13400',
  'bac ninh': '12300',
  'thanh hoa': '11000',
  'nghe an': '11100',
};

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
    return '15000';
  }
  if (cityNormalized.includes('nha trang')) {
    return '15100';
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
      // Adresse complète : street + ward + district
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
      score += 25; // 20%+ moins cher
      details.priceAnalysis.verdict = 'excellent';
    } else if (priceDiff >= 10) {
      score += 20; // 10-20% moins cher
      details.priceAnalysis.verdict = 'good';
    } else if (priceDiff >= 5) {
      score += 10; // 5-10% moins cher
      details.priceAnalysis.verdict = 'fair';
    } else if (priceDiff >= 0) {
      score += 5; // Prix moyen
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
    // list_time peut être en secondes ou millisecondes selon la source
    // Si > 10000000000, c'est en millisecondes, sinon en secondes
    const listTimeMs = listTime > 10000000000 ? listTime : listTime * 1000;
    daysOnline = Math.floor((Date.now() - listTimeMs) / (1000 * 60 * 60 * 24));
    // Sécurité : si le résultat est négatif ou absurde, on met 0
    if (daysOnline < 0 || daysOnline > 3650) {
      daysOnline = 0;
    }
  } else if (postedOn) {
    // Essayer de parser la date vietnamienne (dd/mm/yyyy)
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
    score += 10; // Pas de photo = vendeur amateur/pressé
    details.photoAnalysis.verdict = 'none';
  } else if (numPhotos <= 2) {
    score += 5; // Peu de photos
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
    details.priceType = 'round'; // Prix rond = plus négociable
  } else {
    details.priceType = 'precise';
  }
  
  // Score final (plafonné à 100)
  const finalScore = Math.min(100, score);
  
  // Niveau de négociation
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

// Fonction legacy pour compatibilité
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
    if (propertyType && !propertyType.toLowerCase().includes('tất cả') && !propertyType.toLowerCase().includes('all')) {
      const type = propertyType.toLowerCase();
      let categoryCode = null;
      let keywords = [];
      
      // Mapping des types vers les codes Chotot et mots-clés
      // CODES CHOTOT VÉRIFIÉS:
      // 1010 = Căn hộ/Chung cư (Apartment)
      // 1020 = Nhà ở (House)
      // 1030 = Biệt thự (Villa)
      // 1040 = Đất (Land)
      if (type.includes('căn hộ') || type.includes('chung cư') || type.includes('apartment')) {
        categoryCode = 1010; // Căn hộ/Chung cư
        keywords = ['căn hộ', 'chung cư', 'apartment', 'penthouse'];
      } else if (type.includes('biệt thự') || type.includes('villa')) {
        categoryCode = 1030; // Biệt thự
        keywords = ['biệt thự', 'villa'];
      } else if (type.includes('nhà') || type.includes('house')) {
        categoryCode = 1020; // Nhà ở
        keywords = ['nhà'];
      } else if (type.includes('đất') || type.includes('land')) {
        categoryCode = 1040; // Đất
        keywords = ['đất', 'lô đất'];
      }
      
      if (categoryCode || keywords.length > 0) {
        const before = allResults.length;
        allResults = allResults.filter(item => {
          // Priorité au category code si disponible
          if (item.category && categoryCode) {
            return item.category === categoryCode;
          }
          // Sinon filtre par mots-clés dans le titre
          const t = (item.title || '').toLowerCase();
          return keywords.some(k => t.includes(k));
        });
        console.log(`Filtre type "${propertyType}" (code=${categoryCode}): ${before} → ${allResults.length}`);
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
    
    // Calculer le prix moyen au m² pour comparaison
    const validPricePerM2 = sortedResults
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => item.price / item.area);
    const avgPricePerM2 = validPricePerM2.length > 0 
      ? validPricePerM2.reduce((a, b) => a + b, 0) / validPricePerM2.length 
      : 50000000;
    
    // Limiter à 100 résultats pour le frontend
    const results = sortedResults.slice(0, 100).map((item, i) => {
      // Calculer le score de négociation détaillé
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
        // Score de négociation
        score: negotiation.score,
        negotiationLevel: negotiation.level,
        negotiationDetails: negotiation.details,
        // Badges
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
