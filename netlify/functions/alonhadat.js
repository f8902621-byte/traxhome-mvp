/**
 * K Trix - Alonhadat Scraper via ScraperAPI
 * Version 2 - Parser corrigé basé sur la vraie structure HTML
 */

const https = require('https');

// Configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Mapping des villes Alonhadat
const CITY_MAPPING = {
  'ho-chi-minh': { name: 'Hồ Chí Minh', code: 1 },
  'ha-noi': { name: 'Hà Nội', code: 2 },
  'da-nang': { name: 'Đà Nẵng', code: 3 },
  'hai-phong': { name: 'Hải Phòng', code: 4 },
  'can-tho': { name: 'Cần Thơ', code: 5 },
  'binh-duong': { name: 'Bình Dương', code: 6 },
  'dong-nai': { name: 'Đồng Nai', code: 7 },
  'khanh-hoa': { name: 'Khánh Hòa', code: 8 },
  'lam-dong': { name: 'Lâm Đồng', code: 9 },
  'ba-ria-vung-tau': { name: 'Bà Rịa - Vũng Tàu', code: 10 },
  'quang-ninh': { name: 'Quảng Ninh', code: 11 },
  'thanh-hoa': { name: 'Thanh Hóa', code: 12 },
  'nghe-an': { name: 'Nghệ An', code: 13 },
  'thua-thien-hue': { name: 'Thừa Thiên Huế', code: 14 },
};

// Mapping des types de biens Alonhadat
const PROPERTY_TYPE_MAPPING = {
  'nha-dat': { slug: 'nha', name: 'Nhà', ktrix: 'Nhà ở' },
  'nha': { slug: 'nha', name: 'Nhà', ktrix: 'Nhà ở' },
  'can-ho-chung-cu': { slug: 'can-ho-chung-cu', name: 'Căn hộ chung cư', ktrix: 'Căn hộ chung cư' },
  'can-ho': { slug: 'can-ho-chung-cu', name: 'Căn hộ chung cư', ktrix: 'Căn hộ chung cư' },
  'dat': { slug: 'dat-tho-cu-dat-o', name: 'Đất', ktrix: 'Đất' },
  'dat-nen': { slug: 'dat-tho-cu-dat-o', name: 'Đất', ktrix: 'Đất' },
  'biet-thu': { slug: 'biet-thu-nha-lien-ke', name: 'Biệt thự', ktrix: 'Biệt thự' },
  'villa': { slug: 'biet-thu-nha-lien-ke', name: 'Biệt thự', ktrix: 'Biệt thự' },
  'nha-xuong-kho': { slug: 'kho-nha-xuong-dat-cong-nghiep', name: 'Kho nhà xưởng', ktrix: 'Kho, nhà xưởng' },
  'warehouse': { slug: 'kho-nha-xuong-dat-cong-nghiep', name: 'Kho nhà xưởng', ktrix: 'Kho, nhà xưởng' },
  'shophouse': { slug: 'shophouse-nha-pho-thuong-mai', name: 'Shophouse', ktrix: 'Shophouse' },
};

/**
 * Construire l'URL Alonhadat pour la recherche
 */
function buildAlonhadatUrl(params) {
  const { city = 'ho-chi-minh', propertyType = 'nha', page = 1 } = params;
  
  const propType = PROPERTY_TYPE_MAPPING[propertyType] || PROPERTY_TYPE_MAPPING['nha'];
  
  // Format: https://alonhadat.com.vn/can-ban-{type}/{ville}
  // Page 2+: https://alonhadat.com.vn/can-ban-{type}/{ville}/trang--{page}
  
  let url = `https://alonhadat.com.vn/can-ban-${propType.slug}/${city}`;
  
  if (page > 1) {
    url += `/trang--${page}`;
  }
  
  return url;
}

/**
 * Scraper une page via ScraperAPI
 */
async function scrapeWithScraperAPI(targetUrl) {
  return new Promise((resolve, reject) => {
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
    
    console.log(`[Alonhadat] Scraping: ${targetUrl}`);
    
    const startTime = Date.now();
    
    https.get(scraperUrl, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`[Alonhadat] Response: ${response.statusCode} (${duration}ms, ${(data.length/1024).toFixed(1)}KB)`);
        
        if (response.statusCode === 200) {
          resolve({ success: true, html: data, duration });
        } else {
          resolve({ success: false, error: `HTTP ${response.statusCode}`, duration });
        }
      });
    }).on('error', (err) => {
      console.log(`[Alonhadat] Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Parser le HTML Alonhadat pour extraire les annonces
 * Structure réelle: <article class="property-item"> contient les annonces
 */
function parseAlonhadatListings(html, city, propertyType) {
  const listings = [];
  
  // Regex pour extraire les articles (property-item)
  // La structure est: <article class="property-item" ...>...</article>
  const articleRegex = /<article\s+class=["']property-item["'][^>]*>([\s\S]*?)<\/article>/gi;
  let articleMatch;
  
  let articleCount = 0;
  while ((articleMatch = articleRegex.exec(html)) !== null) {
    articleCount++;
    const articleHtml = articleMatch[1];
    
    try {
      const listing = extractListingData(articleHtml, city, propertyType);
      if (listing && listing.title) {
        listings.push(listing);
      }
    } catch (e) {
      console.log(`[Alonhadat] Parse error article ${articleCount}: ${e.message}`);
    }
  }
  
  console.log(`[Alonhadat] Found ${articleCount} articles, parsed ${listings.length} listings`);
  return listings;
}

/**
 * Extraire les données d'une annonce individuelle
 * Basé sur la vraie structure HTML d'Alonhadat avec schema.org
 */
function extractListingData(articleHtml, city, propertyType) {
  const listing = {
    source: 'alonhadat',
    city: CITY_MAPPING[city]?.name || city,
    property_type: PROPERTY_TYPE_MAPPING[propertyType]?.ktrix || 'Nhà ở',
    scraped_at: new Date().toISOString(),
  };
  
  // Extraire l'URL et l'ID depuis le lien principal
  // <a class="link vip" data-memberid="160506" href="/-shophouse-5-tang-500-m2...html"
  const urlMatch = articleHtml.match(/href=["']([^"']*\.html)["']/i);
  if (urlMatch) {
    const href = urlMatch[1];
    listing.url = href.startsWith('http') ? href : `https://alonhadat.com.vn${href}`;
    // Extraire l'ID depuis data-memberid ou depuis l'URL
    const memberIdMatch = articleHtml.match(/data-memberid=["'](\d+)["']/i);
    if (memberIdMatch) {
      listing.external_id = `alonhadat_${memberIdMatch[1]}`;
    } else {
      // Fallback: utiliser un hash de l'URL
      listing.external_id = `alonhadat_${href.replace(/[^a-z0-9]/gi, '').slice(-10)}`;
    }
  }
  
  // Extraire le titre depuis <h3 class="property-title"> ou itemprop="name"
  const titleMatch = articleHtml.match(/itemprop=["']name["'][^>]*>([^<]+)</i) ||
                     articleHtml.match(/class=["']property-title["'][^>]*>([^<]+)</i) ||
                     articleHtml.match(/<h3[^>]*>([^<]+)</i);
  if (titleMatch) {
    listing.title = titleMatch[1].trim();
  }
  
  // Extraire le prix depuis itemprop="price" content="8600000000"
  const priceContentMatch = articleHtml.match(/itemprop=["']price["']\s+content=["'](\d+)["']/i);
  if (priceContentMatch) {
    listing.price = parseInt(priceContentMatch[1]);
  }
  
  // Aussi extraire le prix affiché (ex: "8,6 tỷ")
  const priceDisplayMatch = articleHtml.match(/itemprop=["']price["'][^>]*>([^<]*tỷ[^<]*)</i) ||
                            articleHtml.match(/>(\d+[\d,\.]*\s*tỷ)</i);
  if (priceDisplayMatch) {
    listing.price_raw = priceDisplayMatch[1].trim();
    // Si on n'a pas le prix en content, parser le prix affiché
    if (!listing.price) {
      listing.price = parsePrice(priceDisplayMatch[1]);
    }
  }
  
  // Extraire la surface depuis itemprop="floorSize" -> itemprop="value"
  const areaMatch = articleHtml.match(/class=["']area["'][^>]*>[\s\S]*?itemprop=["']value["'][^>]*>(\d+)/i) ||
                    articleHtml.match(/Diện tích:[^<]*<span[^>]*>(\d+)/i) ||
                    articleHtml.match(/>(\d+)\s*m²</i) ||
                    articleHtml.match(/>(\d+)<\/span>\s*<span[^>]*>m²/i);
  if (areaMatch) {
    listing.area = parseInt(areaMatch[1]);
  }
  
  // Extraire l'adresse depuis itemprop="streetAddress", "addressLocality", "addressRegion"
  const streetMatch = articleHtml.match(/itemprop=["']streetAddress["'][^>]*>([^<]+)</i);
  const localityMatch = articleHtml.match(/itemprop=["']addressLocality["'][^>]*>([^<]+)</i);
  const regionMatch = articleHtml.match(/itemprop=["']addressRegion["'][^>]*>([^<]+)</i);
  
  const addressParts = [];
  if (streetMatch) addressParts.push(streetMatch[1].trim());
  if (localityMatch) addressParts.push(localityMatch[1].trim());
  if (regionMatch) addressParts.push(regionMatch[1].trim());
  
  if (addressParts.length > 0) {
    listing.address = addressParts.join(', ');
    // Extraire le district depuis locality ou region
    listing.district = localityMatch ? localityMatch[1].trim() : (regionMatch ? regionMatch[1].trim() : null);
  }
  
  // Extraire l'image depuis <img src="..." class="thumbnail">
  const imageMatch = articleHtml.match(/class=["']thumbnail["'][^>]*src=["']([^"']+)["']/i) ||
                     articleHtml.match(/src=["']([^"']*(?:thumbnail|files\/properties)[^"']*)["']/i);
  if (imageMatch) {
    listing.image = imageMatch[1].startsWith('http') ? imageMatch[1] : `https://alonhadat.com.vn${imageMatch[1]}`;
  }
  
  // Extraire la date depuis datetime="2026-01-09"
  const dateMatch = articleHtml.match(/datetime=["']([^"']+)["']/i);
  if (dateMatch) {
    listing.posted_date = dateMatch[1];
  }
  
  // Extraire les caractéristiques depuis property-details
  // <span class="street-width">10m</span><span class="floors">5 tầng</span><span class="bedroom">
  
  // Chambres - itemprop="numberOfBedrooms" ou class="bedroom"
  const bedroomMatch = articleHtml.match(/itemprop=["']numberOfBedrooms["'][^>]*>(\d+)/i) ||
                       articleHtml.match(/class=["']bedroom["'][^>]*>(\d+)/i) ||
                       articleHtml.match(/>(\d+)\s*(?:pn|phòng ngủ|PN)</i);
  if (bedroomMatch) {
    listing.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  // Étages - class="floors"
  const floorMatch = articleHtml.match(/class=["']floors["'][^>]*>(\d+)/i) ||
                     articleHtml.match(/>(\d+)\s*tầng</i);
  if (floorMatch) {
    listing.floors = parseInt(floorMatch[1]);
  }
  
  // Largeur façade - class="street-width"
  const widthMatch = articleHtml.match(/class=["']street-width["'][^>]*>([^<]+)</i);
  if (widthMatch) {
    listing.frontage = widthMatch[1].trim();
  }
  
  // Description courte depuis class="brief"
  const briefMatch = articleHtml.match(/class=["']brief["'][^>]*itemprop=["']description["'][^>]*>([^<]+)</i);
  if (briefMatch) {
    listing.description = briefMatch[1].trim().substring(0, 500);
  }
  
  return listing;
}

/**
 * Parser le prix en VND
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // Tỷ = milliards
  if (priceStr.toLowerCase().includes('tỷ')) {
    const match = priceStr.match(/([\d.,]+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      return Math.round(value * 1000000000);
    }
  }
  
  // Triệu = millions
  if (priceStr.toLowerCase().includes('triệu') || priceStr.toLowerCase().includes('tr')) {
    const match = priceStr.match(/([\d.,]+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      return Math.round(value * 1000000);
    }
  }
  
  return null;
}

/**
 * Handler principal Netlify
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // Vérifier l'API Key
  if (!SCRAPER_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SCRAPER_API_KEY not configured' })
    };
  }
  
  try {
    // Parser les paramètres
    const params = event.queryStringParameters || {};
    const city = params.city || 'ho-chi-minh';
    const propertyType = params.propertyType || params.property_type || 'nha-dat';
    const page = parseInt(params.page) || 1;
    const maxPages = Math.min(parseInt(params.maxPages) || 1, 5); // Max 5 pages
    
    console.log(`[Alonhadat] Search: city=${city}, type=${propertyType}, pages=${maxPages}`);
    
    let allListings = [];
    let totalScraped = 0;
    
    // Scraper les pages demandées
    for (let p = page; p < page + maxPages; p++) {
      const url = buildAlonhadatUrl({ city, propertyType, page: p });
      const result = await scrapeWithScraperAPI(url);
      
      if (result.success) {
        const listings = parseAlonhadatListings(result.html, city, propertyType);
        allListings = allListings.concat(listings);
        totalScraped++;
        
        // Si pas de listings sur cette page, arrêter
        if (listings.length === 0) {
          console.log(`[Alonhadat] No listings on page ${p}, stopping`);
          break;
        }
        
        // Pause entre les requêtes
        if (p < page + maxPages - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } else {
        console.log(`[Alonhadat] Failed page ${p}: ${result.error}`);
        break;
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: 'alonhadat',
        city: CITY_MAPPING[city]?.name || city,
        propertyType: PROPERTY_TYPE_MAPPING[propertyType]?.name || propertyType,
        pagesScraped: totalScraped,
        totalListings: allListings.length,
        listings: allListings
      })
    };
    
  } catch (error) {
    console.error('[Alonhadat] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
