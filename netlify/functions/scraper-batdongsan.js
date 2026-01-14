/**
 * K Trix - Batdongsan Scraper via ScraperAPI
 * Version 2: Scrape les pages de détail pour prix et images exacts
 */

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const MAX_DETAIL_PAGES = 8; // Limite pour éviter timeout Netlify

// Mapping des villes
const cityMapping = {
  'ho chi minh': 'tp-hcm',
  'ha noi': 'ha-noi',
  'da nang': 'da-nang',
  'binh duong': 'binh-duong',
  'khanh hoa': 'khanh-hoa',
  'can tho': 'can-tho',
  'hai phong': 'hai-phong',
  'ba ria vung tau': 'vung-tau-vt',
  'lam dong': 'lam-dong',
  'binh dinh': 'quy-nhon-bdd',
  'quy nhon': 'quy-nhon-bdd',
  'vung tau': 'vung-tau-vt',
  'ba ria': 'vung-tau-vt',
};

const PROPERTY_TYPE_MAPPING = {
  'can ho chung cu': 'ban-can-ho-chung-cu',
  'can ho': 'ban-can-ho-chung-cu',
  'chung cu': 'ban-can-ho-chung-cu',
  'apartment': 'ban-can-ho-chung-cu',
  'can ho mini': 'ban-can-ho-chung-cu-mini',
  'studio': 'ban-can-ho-chung-cu-mini',
  'nha biet thu': 'ban-nha-biet-thu-lien-ke',
  'biet thu': 'ban-nha-biet-thu-lien-ke',
  'villa': 'ban-nha-biet-thu-lien-ke',
  'lien ke': 'ban-nha-biet-thu-lien-ke',
  'nha mat pho': 'ban-nha-mat-pho',
  'mat pho': 'ban-nha-mat-pho',
  'nha rieng': 'ban-nha-rieng',
  'nha o': 'ban-nha-rieng',
  'house': 'ban-nha-rieng',
  'shophouse': 'ban-shophouse-nha-pho-thuong-mai',
  'nha pho thuong mai': 'ban-shophouse-nha-pho-thuong-mai',
  'dat nen': 'ban-dat-nen-du-an',
  'dat du an': 'ban-dat-nen-du-an',
  'dat': 'ban-dat',
  'land': 'ban-dat',
  'trang trai': 'ban-trang-trai-khu-nghi-duong',
  'khu nghi duong': 'ban-trang-trai-khu-nghi-duong',
  'resort': 'ban-trang-trai-khu-nghi-duong',
  'kho': 'ban-kho-nha-xuong',
  'nha xuong': 'ban-kho-nha-xuong',
  'warehouse': 'ban-kho-nha-xuong',
  'van phong': 'ban-loai-bat-dong-san-khac',
  'office': 'ban-loai-bat-dong-san-khac',
  'khac': 'ban-loai-bat-dong-san-khac',
};

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

function buildSearchUrl(params) {
  const { city = 'ho chi minh', propertyType = 'can ho chung cu', priceMax = 10, page = 1 } = params;
  
  const cityNorm = normalizeString(city);
  const typeNorm = normalizeString(propertyType);
  
  const citySlug = cityMapping[cityNorm] || 'tp-hcm';
  const typeSlug = PROPERTY_TYPE_MAPPING[typeNorm] || 'ban-can-ho-chung-cu';
  
  let url = 'https://batdongsan.com.vn/' + typeSlug + '-' + citySlug;
  
  if (priceMax) {
    url += '?gcn=' + priceMax + '-ty';
  }
  
  if (page > 1) {
    url += (url.includes('?') ? '&' : '?') + 'p=' + page;
  }
  
  return url;
}

async function scrapeWithScraperAPI(targetUrl) {
  var scraperUrl = 'https://api.scraperapi.com/?api_key=' + SCRAPER_API_KEY + 
    '&url=' + encodeURIComponent(targetUrl) + 
    '&country_code=vn';
  
  console.log('[BDS] Scraping: ' + targetUrl);
  var startTime = Date.now();
  
  var response = await fetch(scraperUrl);
  var duration = Date.now() - startTime;
  
  console.log('[BDS] Response: ' + response.status + ' (' + duration + 'ms)');
  
  if (!response.ok) {
    throw new Error('ScraperAPI error: ' + response.status);
  }
  
  return await response.text();
}

// Extraire les URLs des annonces depuis la page de liste
function extractListingUrls(html) {
  var urls = [];
  var seen = {};
  
  var urlRegex = /href="(\/ban-[^"]*-pr(\d+)[^"]*)"/gi;
  var match;
  
  while ((match = urlRegex.exec(html)) !== null) {
    var url = match[1];
    var id = match[2];
    if (!seen[id]) {
      seen[id] = true;
      urls.push({
        id: id,
        path: url,
        fullUrl: 'https://batdongsan.com.vn' + url
      });
    }
  }
  
  console.log('[BDS] Found ' + urls.length + ' unique listing URLs');
  return urls;
}

// Extraire les données depuis une page de détail
function parseDetailPage(html, urlInfo, city, propertyType) {
  var listing = {
    external_id: 'bds_' + urlInfo.id,
    source: 'batdongsan.com.vn',
    url: urlInfo.fullUrl,
    city: city,
    property_type: propertyType,
    scraped_at: new Date().toISOString()
  };
  
  // Extraire le titre depuis <title> ou <h1>
  var titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    listing.title = titleMatch[1]
      .replace(/ - Batdongsan.com.vn$/i, '')
      .replace(/ \| Batdongsan$/i, '')
      .substring(0, 150);
  }
  
  // Chercher le JSON avec price dans le JavaScript
  // Format: price: 1850000000,
  var priceMatch = html.match(/price:\s*(\d{8,12})[,\s]/);
  if (priceMatch) {
    var priceValue = parseInt(priceMatch[1]);
    if (priceValue > 100000000) { // > 100 millions VND
      listing.price = priceValue;
    }
  }
  
  // Chercher pricePerM2
  var priceM2Match = html.match(/pricePerM2:\s*([\d.]+)/);
  if (priceM2Match) {
    listing.pricePerSqm = Math.round(parseFloat(priceM2Match[1]));
  }
  
  // Chercher area (surface)
  var areaMatch = html.match(/area:\s*(\d+)/);
  if (areaMatch) {
    listing.area = parseInt(areaMatch[1]);
  }
  
  // Chercher bedrooms
  var bedroomMatch = html.match(/bedroom[s]?:\s*(\d+)/i);
  if (!bedroomMatch) {
    bedroomMatch = html.match(/(\d+)\s*(?:PN|phòng ngủ)/i);
  }
  if (bedroomMatch) {
    listing.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  // Chercher bathrooms
  var bathroomMatch = html.match(/bathroom[s]?:\s*(\d+)/i);
  if (!bathroomMatch) {
    bathroomMatch = html.match(/(\d+)\s*(?:WC|phòng tắm)/i);
  }
  if (bathroomMatch) {
    listing.bathrooms = parseInt(bathroomMatch[1]);
  }
  
  // Chercher l'image principale
  // Pattern 1: og:image meta tag
  var ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (!ogImageMatch) {
    ogImageMatch = html.match(/content="([^"]+)"\s+property="og:image"/i);
  }
  if (ogImageMatch && ogImageMatch[1]) {
    listing.image_url = ogImageMatch[1];
  }
  
  // Pattern 2: Images dans le CDN file4.batdongsan.com.vn
  if (!listing.image_url) {
    var cdnImageMatch = html.match(/https:\/\/file4\.batdongsan\.com\.vn\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
    if (cdnImageMatch) {
      listing.image_url = cdnImageMatch[0];
    }
  }
  
  // Pattern 3: Images amcdn.vn
  if (!listing.image_url) {
    var amcdnMatch = html.match(/https?:\/\/[^"'\s<>]*amcdn\.vn\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/i);
    if (amcdnMatch) {
      listing.image_url = amcdnMatch[0];
    }
  }
  
  // Chercher l'adresse
  var addressMatch = html.match(/address["\']?:\s*["\']([^"\']+)["\']/i);
  if (addressMatch) {
    listing.address = addressMatch[1];
  }
  
  // Chercher le district
  var districtMatch = html.match(/district["\']?:\s*["\']([^"\']+)["\']/i);
  if (districtMatch) {
    listing.district = districtMatch[1];
  }
  
  return listing;
}

exports.handler = async function(event, context) {
  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }
  
  if (!SCRAPER_API_KEY) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: 'SCRAPER_API_KEY not configured' })
    };
  }
  
  try {
    var params = event.queryStringParameters || {};
    var city = params.city || 'Ho Chi Minh';
    var propertyType = params.propertyType || 'Can ho chung cu';
    var priceMax = params.priceMax || 10;
    var maxListings = Math.min(parseInt(params.maxListings) || MAX_DETAIL_PAGES, 15);
    
    console.log('[BDS] Search: city=' + city + ', type=' + propertyType + ', priceMax=' + priceMax + ', maxListings=' + maxListings);
    
    // Étape 1: Récupérer la page de liste
    var listUrl = buildSearchUrl({ city: city, propertyType: propertyType, priceMax: priceMax, page: 1 });
    var listHtml = await scrapeWithScraperAPI(listUrl);
    
    // Étape 2: Extraire les URLs des annonces
    var listingUrls = extractListingUrls(listHtml);
    
    // Limiter le nombre d'annonces à scraper
    listingUrls = listingUrls.slice(0, maxListings);
    console.log('[BDS] Will scrape ' + listingUrls.length + ' detail pages');
    
    // Étape 3: Scraper chaque page de détail
    var listings = [];
    
    for (var i = 0; i < listingUrls.length; i++) {
      var urlInfo = listingUrls[i];
      
      try {
        console.log('[BDS] Detail ' + (i + 1) + '/' + listingUrls.length + ': ' + urlInfo.id);
        
        var detailHtml = await scrapeWithScraperAPI(urlInfo.fullUrl);
        var listing = parseDetailPage(detailHtml, urlInfo, city, propertyType);
        
        // Ne garder que les annonces avec un prix valide
        if (listing.price && listing.price > 0) {
          listings.push(listing);
        } else {
          console.log('[BDS] Skipped ' + urlInfo.id + ' - no valid price');
        }
        
        // Pause entre les requêtes pour éviter le rate limiting
        if (i < listingUrls.length - 1) {
          await new Promise(function(r) { setTimeout(r, 200); });
        }
        
      } catch (e) {
        console.log('[BDS] Detail error for ' + urlInfo.id + ': ' + e.message);
      }
    }
    
    console.log('[BDS] Final: ' + listings.length + ' listings with valid prices');
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        source: 'batdongsan',
        city: city,
        propertyType: propertyType,
        totalListings: listings.length,
        listings: listings
      }, null, 2)
    };
    
  } catch (error) {
    console.error('[BDS] Error:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
