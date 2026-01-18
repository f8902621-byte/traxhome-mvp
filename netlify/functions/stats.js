const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  try {
    // Paramètres
    const params = event.queryStringParameters || {};
    const city = params.city || '';
    const category = params.category || '';

    // Mapping des catégories vers les types de biens
    const categoryTypes = {
      'apartment': ['căn hộ', 'chung cư', 'studio', 'penthouse'],
      'house': ['nhà ở', 'nhà phố', 'biệt thự', 'villa', 'nhà riêng', 'nhà mặt tiền', 'nhà hẻm'],
      'commercial': ['shophouse', 'văn phòng', 'cửa hàng', 'mặt bằng', 'kho', 'nhà xưởng', 'khách sạn'],
      'land': ['đất', 'đất nền', 'đất thổ cư', 'đất nông nghiệp']
    };

    const categoryLabels = {
      'apartment': '🏢 Appartements',
      'house': '🏠 Maisons/Villas',
      'commercial': '🏪 Commercial',
      'land': '🌳 Terrains',
      '': 'Tous types'
    };

    // 1. Récupérer TOUTES les annonces avec pagination
    let allListings = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      let url = `${SUPABASE_URL}/rest/v1/listings?select=district,city,price,area,price_per_m2,property_type,first_seen,last_seen&price=gt.0&area=gt.0&order=id&limit=${limit}&offset=${offset}`;
      
      if (city) {
        let searchTerm = city;
        if (city.includes('Hồ Chí Minh') || city.includes('Ho Chi Minh')) {
          searchTerm = 'Minh';
        } else if (city.includes('Hà Nội') || city.includes('Ha Noi')) {
          searchTerm = 'Nội';
        } else if (city.includes('Đà Nẵng')) {
          searchTerm = 'Nẵng';
        } else if (city.includes('Cần Thơ')) {
          searchTerm = 'Thơ';
        } else if (city.includes('Bình Định')) {
          searchTerm = 'Định';
        } else if (city.includes('Khánh Hòa')) {
          searchTerm = 'Hòa';
        } else if (city.includes('Lâm Đồng') || city.includes('Đà Lạt') || city.includes('Da Lat')) {
          searchTerm = 'Lâm Đồng';
        }
        url += `&city=ilike.*${encodeURIComponent(searchTerm)}*`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Supabase');
      }

      const listings = await response.json();
      allListings = allListings.concat(listings);
      
      console.log(`Stats pagination: offset=${offset}, got ${listings.length} listings`);
      
      if (listings.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
      
      // Sécurité : max 10 requêtes (10000 annonces)
      if (offset >= 10000) {
        hasMore = false;
      }
    }

    console.log(`Stats: ${allListings.length} annonces récupérées au total (ville: ${city || 'toutes'})`);

    // 2. Filtrer par catégorie si spécifiée
    let finalListings = allListings;
    if (category && categoryTypes[category]) {
      const types = categoryTypes[category];
      finalListings = allListings.filter(item => {
        const propType = (item.property_type || '').toLowerCase();
        return types.some(t => propType.includes(t));
      });
      console.log(`Stats: filtré par catégorie "${category}": ${allListings.length} → ${finalListings.length}`);
    }

    // 3. Compter le total d'annonces en base (sans filtres)
    const totalResponse = await fetch(`${SUPABASE_URL}/rest/v1/listings?select=id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact',
        'Range': '0-0'
      }
    });
    
    const totalCount = parseInt(totalResponse.headers.get('content-range')?.split('/')[1] || '0');

    // 4. Calculer les stats par district
    const districtStats = {};
    const today = new Date();
    cconst oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    for (const listing of finalListings) {
      const district = (listing.district || 'Inconnu').trim();
      if (!district || district === 'Inconnu') continue;

      if (!districtStats[district]) {
        districtStats[district] = {
          district: district,
          city: listing.city || '',
          count: 0,
          totalPrice: 0,
          totalArea: 0,
          pricesPerM2: [],
          countThisWeek: 0,
          pricesPerM2ThisWeek: [],
          countLastWeek: 0,
          pricesPerM2LastWeek: [],
        };
      }

      const stats = districtStats[district];
      stats.count++;
      stats.totalPrice += listing.price;
      stats.totalArea += listing.area;
      
      const pricePerM2 = listing.price / listing.area;
      stats.pricesPerM2.push(pricePerM2);

      const firstSeen = listing.first_seen ? new Date(listing.first_seen) : null;
      if (firstSeen) {
        if (firstSeen >= oneWeekAgo) {
          stats.countThisWeek++;
          stats.pricesPerM2ThisWeek.push(pricePerM2);
        } else {
          stats.countLastWeek++;
          stats.pricesPerM2LastWeek.push(pricePerM2);
        }
      }
    }

    // 5. Calculer moyennes et tendances
    const results = [];

    for (const [district, stats] of Object.entries(districtStats)) {
      if (stats.count < 3) continue;

      const avgPricePerM2 = stats.pricesPerM2.reduce((a, b) => a + b, 0) / stats.pricesPerM2.length;
      
      let priceTrend = null;
      let priceTrendPercent = 0;
      
      if (false) { // DÉSACTIVÉ - Pas assez de données pour un trend fiable (besoin 6+ mois)
        const avgThisWeek = stats.pricesPerM2ThisWeek.reduce((a, b) => a + b, 0) / stats.pricesPerM2ThisWeek.length;
        const avgLastWeek = stats.pricesPerM2LastWeek.reduce((a, b) => a + b, 0) / stats.pricesPerM2LastWeek.length;
        
        priceTrendPercent = Math.round(((avgThisWeek - avgLastWeek) / avgLastWeek) * 100);
        
        if (priceTrendPercent > 2) {
          priceTrend = 'up';
        } else if (priceTrendPercent < -2) {
          priceTrend = 'down';
        } else {
          priceTrend = 'stable';
        }
      }

      results.push({
        district: district,
        city: stats.city,
        count: stats.count,
        avgPricePerM2: Math.round(avgPricePerM2),
        avgPricePerM2Display: `${Math.round(avgPricePerM2 / 1000000)} tr/m²`,
        newThisWeek: stats.countThisWeek,
        priceTrend: priceTrend,
        priceTrendPercent: priceTrendPercent,
      });
    }

    results.sort((a, b) => b.count - a.count);

    // 6. Stats globales
    const globalStats = {
      totalListings: finalListings.length,
      totalInDatabase: totalCount,
      totalDistricts: results.length,
      avgPricePerM2: finalListings.length > 0 
        ? Math.round(finalListings.reduce((sum, l) => sum + l.price / l.area, 0) / finalListings.length)
        : 0,
      city: city || 'Toutes les villes',
      category: category,
      categoryLabel: categoryLabels[category] || 'Tous types',
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        global: globalStats,
        districts: results.slice(0, 20),
      })
    };

  } catch (error) {
    console.error('Stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
