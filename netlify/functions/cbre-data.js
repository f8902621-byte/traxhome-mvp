// CBRE Vietnam Market Reference Data
// Source: CBRE Research Q2-Q3 2025 Reports
// Last Updated: January 2026
// © CBRE Vietnam Research & Consulting. Data for reference only.

const CBRE_DATA = {
  // Date de mise à jour des données
  lastUpdated: 'Q3 2025',
  source: 'CBRE Vietnam Research & Consulting',
  
  // Classification des segments par prix (USD/m²) - Critères CBRE depuis Q1 2024
  segmentCriteria: {
    'ultra-luxury': { min: 12000, max: Infinity, labelVN: 'Siêu sang', labelFR: 'Ultra-luxe' },
    'luxury': { min: 5000, max: 12000, labelVN: 'Cao cấp', labelFR: 'Luxe' },
    'high-end': { min: 2500, max: 5000, labelVN: 'Hạng cao', labelFR: 'Haut de gamme' },
    'mid-end': { min: 1500, max: 2500, labelVN: 'Trung cấp', labelFR: 'Milieu de gamme' },
    'affordable': { min: 0, max: 1500, labelVN: 'Bình dân', labelFR: 'Abordable' }
  },

  // Taux de change de référence (pour conversion VND <-> USD)
  exchangeRate: {
    USD_VND: 24500,
    updated: 'Q3 2025'
  },

  // ============================================
  // HO CHI MINH CITY (HCMC) - Q3 2025
  // ============================================
  hcmc: {
    condominium: {
      primary: {
        average: 87,
        bySegment: {
          'ultra-luxury': { price: 350, trend: 'stable' },
          'luxury': { price: 180, trend: 'up' },
          'high-end': { price: 95, trend: 'up' },
          'mid-end': { price: 55, trend: 'up' },
          'affordable': { price: 35, trend: 'stable' }
        }
      },
      secondary: {
        average: 60,
        bySegment: {
          'ultra-luxury': { price: 280, trend: 'stable' },
          'luxury': { price: 140, trend: 'up' },
          'high-end': { price: 75, trend: 'up' },
          'mid-end': { price: 45, trend: 'up' },
          'affordable': { price: 30, trend: 'stable' }
        }
      }
    },
    landed: {
      primary: { average: 303 },
      secondary: { average: 167 }
    },
    districts: {
      'district-1': { avgPrice: 150, segment: 'luxury', zone: 'CBD' },
      'quan-1': { avgPrice: 150, segment: 'luxury', zone: 'CBD' },
      'district-3': { avgPrice: 100, segment: 'high-end', zone: 'CBD' },
      'quan-3': { avgPrice: 100, segment: 'high-end', zone: 'CBD' },
      'binh-thanh': { avgPrice: 75, segment: 'high-end', zone: 'inner' },
      'phu-nhuan': { avgPrice: 70, segment: 'high-end', zone: 'inner' },
      'district-2': { avgPrice: 85, segment: 'high-end', zone: 'inner' },
      'quan-2': { avgPrice: 85, segment: 'high-end', zone: 'inner' },
      'district-7': { avgPrice: 70, segment: 'high-end', zone: 'inner' },
      'quan-7': { avgPrice: 70, segment: 'high-end', zone: 'inner' },
      'tan-binh': { avgPrice: 55, segment: 'mid-end', zone: 'inner' },
      'go-vap': { avgPrice: 50, segment: 'mid-end', zone: 'inner' },
      'thu-duc': { avgPrice: 55, segment: 'mid-end', zone: 'outer' },
      'binh-tan': { avgPrice: 40, segment: 'affordable', zone: 'outer' },
      'binh-chanh': { avgPrice: 35, segment: 'affordable', zone: 'outer' }
    }
  },

  // ============================================
  // HANOI - Q3 2025
  // ============================================
  hanoi: {
    condominium: {
      primary: {
        average: 90,
        bySegment: {
          'ultra-luxury': { price: 320, trend: 'up' },
          'luxury': { price: 170, trend: 'up' },
          'high-end': { price: 85, trend: 'up' },
          'mid-end': { price: 50, trend: 'up' },
          'affordable': { price: 32, trend: 'limited' }
        }
      },
      secondary: {
        average: 58,
        bySegment: {
          'ultra-luxury': { price: 250, trend: 'up' },
          'luxury': { price: 130, trend: 'up' },
          'high-end': { price: 70, trend: 'up' },
          'mid-end': { price: 42, trend: 'up' },
          'affordable': { price: 28, trend: 'stable' }
        }
      }
    },
    landed: {
      primary: { average: 186 },
      secondary: { average: 198 }
    },
    districts: {
      'hoan-kiem': { avgPrice: 200, segment: 'ultra-luxury', zone: 'CBD' },
      'ba-dinh': { avgPrice: 150, segment: 'luxury', zone: 'CBD' },
      'dong-da': { avgPrice: 100, segment: 'high-end', zone: 'CBD' },
      'hai-ba-trung': { avgPrice: 90, segment: 'high-end', zone: 'CBD' },
      'tay-ho': { avgPrice: 120, segment: 'luxury', zone: 'inner' },
      'cau-giay': { avgPrice: 85, segment: 'high-end', zone: 'inner' },
      'thanh-xuan': { avgPrice: 70, segment: 'high-end', zone: 'inner' },
      'hoang-mai': { avgPrice: 55, segment: 'mid-end', zone: 'inner' },
      'long-bien': { avgPrice: 50, segment: 'mid-end', zone: 'inner' },
      'ha-dong': { avgPrice: 50, segment: 'mid-end', zone: 'outer' },
      'gia-lam': { avgPrice: 45, segment: 'mid-end', zone: 'outer' }
    }
  },

  // ============================================
  // DA NANG - Estimations
  // ============================================
  danang: {
    condominium: {
      primary: { average: 45 },
      secondary: { average: 38 }
    },
    landed: {
      primary: { average: 80 },
      secondary: { average: 65 }
    },
    districts: {
      'hai-chau': { avgPrice: 55, segment: 'high-end', zone: 'CBD' },
      'thanh-khe': { avgPrice: 40, segment: 'mid-end', zone: 'inner' },
      'son-tra': { avgPrice: 50, segment: 'high-end', zone: 'inner' },
      'ngu-hanh-son': { avgPrice: 45, segment: 'mid-end', zone: 'inner' },
      'lien-chieu': { avgPrice: 30, segment: 'affordable', zone: 'outer' }
    }
  },

  // ============================================
  // BINH DUONG
  // ============================================
  binhduong: {
    condominium: {
      primary: { average: 35 },
      secondary: { average: 30 }
    },
    districts: {
      'thu-dau-mot': { avgPrice: 40, segment: 'mid-end', zone: 'center' },
      'di-an': { avgPrice: 35, segment: 'mid-end', zone: 'inner' },
      'thuan-an': { avgPrice: 32, segment: 'affordable', zone: 'inner' }
    }
  }
};

// ============================================
// FONCTIONS D'ANALYSE
// ============================================

function normalizeCityKey(city) {
  if (!city) return null;
  
  const normalized = city.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
  
  const cityMap = {
    'hochiminh': 'hcmc',
    'hochiminhcity': 'hcmc',
    'hcmc': 'hcmc',
    'saigon': 'hcmc',
    'tphcm': 'hcmc',
    'hanoi': 'hanoi',
    'hn': 'hanoi',
    'danang': 'danang',
    'dn': 'danang',
    'binhduong': 'binhduong',
    'bd': 'binhduong'
  };
  
  return cityMap[normalized] || normalized;
}

function normalizeDistrictKey(district) {
  if (!district) return null;
  
  return district.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/quan\s*/g, 'quan-')
    .replace(/district\s*/g, 'district-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCBREAveragePrice(city, propertyType = 'condominium', market = 'secondary') {
  const cityKey = normalizeCityKey(city);
  const cityData = CBRE_DATA[cityKey];
  
  if (!cityData) return null;
  
  if (['villa', 'townhouse', 'shophouse', 'landed', 'nha-pho', 'biet-thu', 'nhà ở', 'nhà biệt thự'].includes(propertyType?.toLowerCase())) {
    return cityData.landed?.[market]?.average || null;
  }
  
  return cityData.condominium?.[market]?.average || null;
}

function getCBREDistrictPrice(city, district) {
  const cityKey = normalizeCityKey(city);
  const districtKey = normalizeDistrictKey(district);
  
  const cityData = CBRE_DATA[cityKey];
  if (!cityData?.districts) return null;
  
  // Recherche exacte
  if (cityData.districts[districtKey]) {
    return cityData.districts[districtKey];
  }
  
  // Recherche approximative
  for (const [key, data] of Object.entries(cityData.districts)) {
    if (districtKey.includes(key) || key.includes(districtKey)) {
      return data;
    }
  }
  
  return null;
}

function analyzePriceVsCBRE(pricePerM2, city, district = null, propertyType = 'condominium') {
  const result = {
    pricePerM2,
    referencePrice: null,
    referenceSource: null,
    percentDiff: null,
    rating: null,
    segment: null,
    analysis: null,
    // Attribution CBRE obligatoire
    dataSource: 'CBRE Vietnam Research & Consulting',
    dataSourceShort: 'CBRE',
    dataPeriod: CBRE_DATA.lastUpdated,
    disclaimer: '© CBRE Vietnam. Data for reference only.'
  };
  
  // Essayer d'abord le prix par district
  if (district) {
    const districtData = getCBREDistrictPrice(city, district);
    if (districtData) {
      result.referencePrice = districtData.avgPrice;
      result.referenceSource = `CBRE ${normalizeCityKey(city).toUpperCase()} - ${district}`;
      result.segment = districtData.segment;
    }
  }
  
  // Fallback sur le prix moyen de la ville
  if (!result.referencePrice) {
    const cityAvg = getCBREAveragePrice(city, propertyType, 'secondary');
    if (cityAvg) {
      result.referencePrice = cityAvg;
      result.referenceSource = `CBRE ${normalizeCityKey(city).toUpperCase()} average`;
    }
  }
  
  // Calculer la différence
  if (result.referencePrice && pricePerM2) {
    const diff = ((pricePerM2 - result.referencePrice) / result.referencePrice) * 100;
    result.percentDiff = Math.round(diff);
    
    // Rating basé sur l'écart
    if (diff <= -20) {
      result.rating = 'excellent';
      result.analysis = `${Math.abs(result.percentDiff)}% below CBRE market reference - Excellent deal`;
    } else if (diff <= -10) {
      result.rating = 'good';
      result.analysis = `${Math.abs(result.percentDiff)}% below CBRE reference - Good value`;
    } else if (diff <= 5) {
      result.rating = 'fair';
      result.analysis = `Close to CBRE reference price - Fair market value`;
    } else if (diff <= 15) {
      result.rating = 'above';
      result.analysis = `${result.percentDiff}% above CBRE reference - Slightly overpriced`;
    } else {
      result.rating = 'high';
      result.analysis = `${result.percentDiff}% above CBRE reference - Premium pricing`;
    }
    
    result.analysisWithSource = `${result.analysis} (Source: CBRE ${CBRE_DATA.lastUpdated})`;
  }
  
  return result;
}

function getCBREPriceScore(pricePerM2, city, district = null) {
  const analysis = analyzePriceVsCBRE(pricePerM2, city, district);
  
  if (analysis.percentDiff === null) return 0;
  
  const diff = analysis.percentDiff;
  
  if (diff <= -25) return 25;
  if (diff <= -20) return 22;
  if (diff <= -15) return 20;
  if (diff <= -10) return 15;
  if (diff <= -5) return 10;
  if (diff <= 0) return 5;
  if (diff <= 5) return 2;
  return 0;
}

// Export pour utilisation dans Netlify Functions
module.exports = {
  CBRE_DATA,
  getCBREAveragePrice,
  getCBREDistrictPrice,
  analyzePriceVsCBRE,
  getCBREPriceScore,
  normalizeCityKey,
  normalizeDistrictKey
};
