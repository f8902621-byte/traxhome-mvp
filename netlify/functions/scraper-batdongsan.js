/**
 * K Trix - Batdongsan Scraper via ScraperAPI
 * Le site le plus protégé du Vietnam - enfin accessible !
 */

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Mapping des villes
const CITY_MAPPING = {
  'hồ chí minh': 'tp-hcm',
  'hà nội': 'ha-noi',
  'đà nẵng': 'da-nang',
  'bình dương': 'binh-duong',
  'đồng nai': 'dong-nai',
  'hải phòng': 'hai-phong',
  'cần thơ': 'can-tho',
  'khánh hòa': 'khanh-hoa',
  'bà rịa - vũng tàu': 'ba-ria-vung-tau',
  'lâm đồng': 'lam-dong',
};

// Mapping des types de biens
const PROPERTY_TYPE_MAPPING = {
  'căn hộ chung cư': 'ban-can-ho-chung-cu',
  'nhà ở': 'ban-nha-rieng',
  'nhà biệt thự': 'ban-biet-thu-lien-ke',
  'đất': 'ban-dat',
  'đất nền': 'ban-dat-nen-du-an',
  'shophouse': 'ban-shophouse',
  'văn phòng': 'ban-van-phong',
  'mặt bằng': 'ban-mat-bang-kinh-doanh',
};

/**
 * Construire l'URL de recherche Batdongsan
 */
function buildSearchUrl(params) {
  const { city = 'hồ chí minh', propertyType = 'căn hộ chung cư', priceMax = 10, page = 1 } = params;
  
  const citySlug = CITY_MAPPING[city.toLowerCase()] || 'tp-hcm';
  const typeSlug = PROPERTY_TYPE_MAPPING[propertyType.toLowerCase()] || 'ban-can-ho-chung-cu';
  
  let url = `https://batdongsan.com.vn/${typeSlug}-${citySlug}`;
  
  // Ajouter le filtre prix
  if (priceMax) {
    url += `?gcn=${priceMax}-ty`;
  }
  
  // Ajouter la pagination
  if (page > 1) {
    url += url.includes('?') ? `&p=${page}` : `?p=${page}`;
  }
  
  return url;
}

/**
 * Scraper via ScraperAPI
 */
async function scrapeWithScraperAPI(targetUrl) {
  const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=vn`;
  
  console.log(`[BDS] Scraping: ${targetUrl}`);
  const startTime = Date.now();
  
  const response = await fetch(scraperUrl);
  const duration = Date.now() - startTime;
  
  console.log(`[BDS] Response: ${response.status} (${duration}ms)`);
  
  if (!response.ok) {
    throw new Error(`ScraperAPI error: ${response.status}`);
  }
  
  return await response.text();
}

/**
 * Parser le HTML pour extraire les annonces
 */
function parseListings(html, city, propertyType) {
  const listings = [];
  
  // Pattern pour extraire les URLs d'annonces avec leur ID
  const urlPattern = /href="(\/ban-[^"]*-pr(\d+)[^"]*)"/gi;
  const urls = new Map(); // Utiliser Map pour éviter les doublons
  
  let match;
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1];
    const id = match[2];
    if (!urls.has(id)) {
      urls.set(id, url);
    }
  }
  
  console.log(`[BDS] Found ${urls.size} unique listing URLs`);
  
  // Pour chaque URL trouvée, essayer d'extraire les infos depuis le HTML
  // On va chercher les blocs de données associés
  
  // Pattern pour les cartes d'annonces (js__card contient les données)
  const cardPattern = /<a[^>]*class="[^"]*js__card[^"]*"[^>]*href="([^"]*-pr(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  
  let cardMatch;
  while ((cardMatch = cardPattern.exec(html)) !== null) {
    try {
      const url = cardMatch[1];
      const id = cardMatch[2];
      const cardHtml = cardMatch[3];
      
      const listing = extractListingData(cardHtml, id, url, city, propertyType);
      if (listing) {
        listings.push(listing);
      }
    } catch (e) {
      console.log(`[BDS] Parse error: ${e.message}`);
    }
  }
  
  // Si pas assez de résultats avec le pattern card, essayer avec data-product
  if (listings.length < 5) {
    const productPattern = /data-product-id="(\d+)"[^>]*>([\s\S]*?)(?=data-product-id="|$)/gi;
    
    while ((productMatch = productPattern.exec(html)) !== null) {
      try {
        const id = productMatch[1];
        const productHtml = productMatch[2];
        
        // Trouver l'URL correspondante
        const urlForId = urls.get(id) || '';
        
        const listing = extractListingData(productHtml, id, urlForId, city, propertyType);
        if (listing && !listings.find(l => l.external_id === listing.external_id)) {
          listings.push(listing);
        }
      } catch (e) {
        console.log(`[BDS] Parse error: ${e.message}`);
      }
    }
  }
  
  // Fallback: créer des listings basiques depuis les URLs
  if (listings.length < 5) {
    for (const [id, url] of urls) {
      if (!listings.find(l => l.external_id === `bds_${id}`)) {
        // Extraire le titre depuis l'URL
        const titleFromUrl = url
          .replace(/^\/ban-/, '')
          .replace(/-pr\d+.*$/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        listings.push({
          external_id: `bds_${id}`,
          source: 'batdongsan',
          url: `https://batdongsan.com.vn${url}`,
          title: titleFromUrl.substring(0, 100),
          city: city,
          property_type: propertyType,
          scraped_at: new Date().toISOString(),
        });
      }
    }
  }
  
  return listings;
}

/**
 * Extraire les données d'une annonce
 */
function extractListingData(cardHtml, id, url, city, propertyType) {
  const listing = {
    external_id: `bds_${id}`,
    source: 'batdongsan',
    url: url.startsWith('http') ? url : `https://batdongsan.com.vn${url}`,
    city: city,
    property_type: propertyType,
    scraped_at: new Date().toISOString(),
  };
  
  // Extraire le titre
  const titleMatch = cardHtml.match(/class="[^"]*pr-title[^"]*"[^>]*>([^<]+)</i) ||
                     cardHtml.match(/title="([^"]+)"/i) ||
                     cardHtml.match(/<h3[^>]*>([^<]+)</i);
  if (titleMatch) {
    listing.title = titleMatch[1].trim();
  }
  
  // Extraire le prix (format: X,X tỷ ou XXX triệu)
  const priceMatch = cardHtml.match(/([\d,.]+)\s*tỷ/i);
  if (priceMatch) {
    const priceValue = parseFloat(priceMatch[1].replace(',', '.'));
    listing.price = Math.round(priceValue * 1000000000);
    listing.price_raw = priceMatch[0];
  } else {
    const priceTrieuMatch = cardHtml.match(/([\d,.]+)\s*triệu/i);
    if (priceTrieuMatch) {
      const priceValue = parseFloat(priceTrieuMatch[1].replace(',', '.'));
      listing.price = Math.round(priceValue * 1000000);
      listing.price_raw = priceTrieuMatch[0];
    }
  }
  
  // Extraire la surface (format: XX m²)
  const areaMatch = cardHtml.match(/([\d,.]+)\s*m²/i);
  if (areaMatch) {
    listing.area = parseFloat(areaMatch[1].replace(',', '.'));
  }
  
  // Extraire le nombre de chambres
  const bedroomMatch = cardHtml.match(/(\d+)\s*(?:PN|pn|phòng ngủ)/i);
  if (bedroomMatch) {
    listing.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  // Extraire l'adresse/district
  const addressMatch = cardHtml.match(/(?:Quận|Huyện|TP\.?|Phường)\s*[^<,]+/i);
  if (addressMatch) {
    listing.address = addressMatch[0].trim();
  }
  
  // Extraire l'image
  const imageMatch = cardHtml.match(/(?:src|data-src)="(https?:\/\/[^"]*(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
                     cardHtml.match(/(?:src|data-src)="([^"]*file\d*\.batdongsan[^"]*)"/i);
  if (imageMatch) {
    listing.image = imageMatch[1];
  }
  
  return listing;
}

/**
 * Handler Netlify
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (!SCRAPER_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SCRAPER_API_KEY not configured' })
    };
  }
  
  try {
    const params = event.queryStringParameters || {};
    const city = params.city || 'Hồ Chí Minh';
    const propertyType = params.propertyType || 'Căn hộ chung cư';
    const priceMax = params.priceMax || 10;
    const maxPages = Math.min(parseInt(params.maxPages) || 1, 3);
    
    console.log(`[BDS] Search: city=${city}, type=${propertyType}, priceMax=${priceMax}`);
    
    let allListings = [];
    
    for (let page = 1; page <= maxPages; page++) {
      const url = buildSearchUrl({ city, propertyType, priceMax, page });
      
      try {
        const html = await scrapeWithScraperAPI(url);
        const listings = parseListings(html, city, propertyType);
        allListings = allListings.concat(listings);
        
        console.log(`[BDS] Page ${page}: ${listings.length} listings`);
        
        // Pause entre les pages
        if (page < maxPages) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (e) {
        console.log(`[BDS] Page ${page} error: ${e.message}`);
        break;
      }
    }
    
    // Dédupliquer par external_id
    const uniqueListings = Array.from(
      new Map(allListings.map(l => [l.external_id, l])).values()
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: 'batdongsan',
        city,
        propertyType,
        totalListings: uniqueListings.length,
        listings: uniqueListings,
      }, null, 2)
    };
    
  } catch (error) {
    console.error('[BDS] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

---

**Pour tester après le commit :**
```
https://ktrix-vn.netlify.app/.netlify/functions/scraper-batdongsan?city=Hồ Chí Minh&propertyType=Căn hộ chung cư&priceMax=5
