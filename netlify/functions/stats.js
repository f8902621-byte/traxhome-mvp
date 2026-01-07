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
    // Paramètres optionnels
    const params = event.queryStringParameters || {};
    const city = params.city || '';

    // 1. Récupérer toutes les annonces de la base
    let url = `${SUPABASE_URL}/rest/v1/listings?select=district,city,price,area,price_per_m2,first_seen,last_seen&price=gt.0&area=gt.0`;
    
    if (city) {
      url += `&city=ilike.*${encodeURIComponent(city)}*`;
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
    console.log(`Stats: ${listings.length} annonces récupérées`);

    // 2. Calculer les stats par district
    const districtStats = {};
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const listing of listings) {
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
          // Pour tendance
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

      // Calculer tendance (cette semaine vs avant)
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

    // 3. Calculer moyennes et tendances
    const results = [];

    for (const [district, stats] of Object.entries(districtStats)) {
      if (stats.count < 3) continue; // Minimum 3 annonces

      const avgPricePerM2 = stats.pricesPerM2.reduce((a, b) => a + b, 0) / stats.pricesPerM2.length;
      
      // Tendance prix
      let priceTrend = null;
      let priceTrendPercent = 0;
      
      if (stats.pricesPerM2ThisWeek.length >= 2 && stats.pricesPerM2LastWeek.length >= 2) {
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

    // Trier par nombre d'annonces
    results.sort((a, b) => b.count - a.count);

    // 4. Stats globales
    const globalStats = {
      totalListings: listings.length,
      totalDistricts: results.length,
      avgPricePerM2: listings.length > 0 
        ? Math.round(listings.reduce((sum, l) => sum + l.price / l.area, 0) / listings.length)
        : 0,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        global: globalStats,
        districts: results.slice(0, 20), // Top 20 districts
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
