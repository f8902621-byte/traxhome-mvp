const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

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
    keywords 
  } = body;

  try {
    const datasetUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`;
    
    const response = await fetch(datasetUrl);
    
    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    let results = await response.json();

    // Filtrer les résultats sans prix
    results = results.filter(item => item.price && item.price > 0);

    // Filtrer par prix min (convertir Tỷ en VND)
    if (priceMin) {
      const priceMinVND = parseFloat(priceMin) * 1000000000;
      results = results.filter(item => item.price >= priceMinVND);
    }

    // Filtrer par prix max (convertir Tỷ en VND)
    if (priceMax) {
      const priceMaxVND = parseFloat(priceMax) * 1000000000;
      results = results.filter(item => item.price <= priceMaxVND);
    }

    // Filtrer par surface min
    if (livingAreaMin) {
      results = results.filter(item => item.floorAreaSqm && item.floorAreaSqm >= parseInt(livingAreaMin));
    }

    // Filtrer par surface max
    if (livingAreaMax) {
      results = results.filter(item => item.floorAreaSqm && item.floorAreaSqm <= parseInt(livingAreaMax));
    }

    // Filtrer par nombre de chambres
    if (bedrooms) {
      results = results.filter(item => item.bedrooms && item.bedrooms >= parseInt(bedrooms));
    }

    // Filtrer par ville (recherche dans l'adresse)
    if (city) {
      const cityLower = city.toLowerCase();
      results = results.filter(item => {
        const address = (item.address || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        return address.includes(cityLower) || title.includes(cityLower);
      });
    }

    // Filtrer par district
    if (district) {
      const districtLower = district.toLowerCase();
      results = results.filter(item => {
        const address = (item.address || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        return address.includes(districtLower) || title.includes(districtLower);
      });
    }

    // Filtrer par type de bien
    if (propertyType) {
      const typeLower = propertyType.toLowerCase();
      results = results.filter(item => {
        const title = (item.title || '').toLowerCase();
        const propType = (item.propertyType || '').toLowerCase();
        
        // Mapping des types
        const typeMapping = {
          'căn hộ chung cư': ['căn hộ', 'chung cư', 'apartment'],
          'căn hộ nghỉ dưỡng': ['căn hộ nghỉ dưỡng', 'resort apartment'],
          'nhà ở': ['nhà', 'nhà phố', 'nhà riêng', 'house'],
          'nhà biệt thự': ['biệt thự', 'villa'],
          'nhà nghỉ dưỡng': ['nghỉ dưỡng'],
          'studio': ['studio'],
          'mặt bằng': ['mặt bằng', 'commercial'],
          'shophouse': ['shophouse'],
          'văn phòng': ['văn phòng', 'office'],
          'cửa hàng': ['cửa hàng', 'shop'],
          'kho, nhà xưởng': ['kho', 'nhà xưởng', 'warehouse'],
          'đất': ['đất', 'land'],
          'đất nghỉ dưỡng': ['đất nghỉ dưỡng'],
          'tất cả nhà đất': [], // Ne filtre pas
          'các loại nhà bán': ['nhà'],
          'bất động sản khác': []
        };

        const keywords = typeMapping[typeLower] || [typeLower];
        
        if (keywords.length === 0) return true; // "Tất cả" - pas de filtre
        
        return keywords.some(kw => title.includes(kw) || propType.includes(kw));
      });
    }

    // Filtrer par jours depuis publication
    if (daysListed) {
      const maxDays = parseInt(daysListed);
      const now = new Date();
      results = results.filter(item => {
        if (!item.postedOn) return true;
        
        // Parser la date vietnamienne
        const postedStr = item.postedOn.toLowerCase();
        if (postedStr.includes('hôm nay') || postedStr.includes('today')) return true;
        if (postedStr.includes('hôm qua') || postedStr.includes('yesterday')) return maxDays >= 1;
        
        // Essayer de parser une date
        const dateMatch = postedStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dateMatch) {
          const postedDate = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1]);
          const diffDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
          return diffDays <= maxDays;
        }
        
        return true;
      });
    }

    // Calculer le score de pertinence
    const calculateScore = (item) => {
      let score = 50; // Score de base

      // Bonus pour mots-clés urgents
      const urgentWords = ['gấp', 'nhanh', 'kẹt tiền', 'cần tiền', 'thanh lý', 'rẻ', 'lỗ', 'ngộp'];
      const titleLower = (item.title || '').toLowerCase();
      urgentWords.forEach(word => {
        if (titleLower.includes(word)) score += 10;
      });

      // Bonus si photo disponible
      if (item.thumbnail || (item.images && item.images.length > 0)) score += 5;

      // Bonus si publié récemment
      const postedStr = (item.postedOn || '').toLowerCase();
      if (postedStr.includes('hôm nay') || postedStr.includes('today')) score += 15;
      else if (postedStr.includes('hôm qua') || postedStr.includes('yesterday')) score += 10;

      // Bonus si prix/m² raisonnable
      if (item.floorAreaSqm && item.price) {
        const pricePerSqm = item.price / item.floorAreaSqm;
        if (pricePerSqm < 50000000) score += 10; // < 50M/m²
      }

      // Limiter entre 0 et 100
      return Math.min(100, Math.max(0, score));
    };

    // Mapper les données au format frontend
    const mappedResults = results.slice(0, 100).map((item, index) => ({
      id: item.id || index,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.floorAreaSqm && item.price ? Math.round(item.price / item.floorAreaSqm) : 0,
      city: city || item.address?.split(',').pop()?.trim() || 'Vietnam',
      district: district || item.address?.split(',')[0]?.trim() || '',
      address: item.address || '',
      floorArea: item.floorAreaSqm || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      imageUrl: item.thumbnail || item.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
      images: item.images || [],
      url: item.url || '#',
      score: calculateScore(item),
      hasUrgentKeyword: /gấp|nhanh|kẹt tiền|cần tiền|thanh lý|lỗ|ngộp/i.test(item.title || ''),
      isNew: /hôm nay|today/i.test(item.postedOn || ''),
      postedOn: item.postedOn || '',
      agentName: item.agentName || '',
      agentPhone: item.agentPhone || ''
    }));

    // Trier par score décroissant par défaut
    mappedResults.sort((a, b) => b.score - a.score);

    const prices = mappedResults.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
      highestPrice: prices.length > 0 ? Math.max(...prices) : 0,
      totalResults: mappedResults.length
    };

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
