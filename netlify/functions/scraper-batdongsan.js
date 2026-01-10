/**
 * K Trix - Batdongsan Scraper via ScraperAPI
 * Le site le plus protege du Vietnam - enfin accessible !
 */

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Mapping des villes
const CITY_MAPPING = {
  'ho chi minh': 'tp-hcm',
  'ha noi': 'ha-noi',
  'da nang': 'da-nang',
  'binh duong': 'binh-duong',
  'dong nai': 'dong-nai',
  'hai phong': 'hai-phong',
  'can tho': 'can-tho',
  'khanh hoa': 'khanh-hoa',
  'ba ria - vung tau': 'ba-ria-vung-tau',
  'lam dong': 'lam-dong',
  'binh dinh': 'quy-nhon-bdd',
  'quy nhon': 'quy-nhon-bdd',
};

// Mapping des types de biens
const PROPERTY_TYPE_MAPPING = {
  'can ho chung cu': 'ban-can-ho-chung-cu',
  'nha o': 'ban-nha-rieng',
  'nha biet thu': 'ban-biet-thu-lien-ke',
  'dat': 'ban-dat',
  'dat nen': 'ban-dat-nen-du-an',
  'shophouse': 'ban-shophouse',
  'van phong': 'ban-van-phong',
  'mat bang': 'ban-mat-bang-kinh-doanh',
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
  
  const citySlug = CITY_MAPPING[cityNorm] || 'tp-hcm';
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
  var scraperUrl = 'https://api.scraperapi.com/?api_key=' + SCRAPER_API_KEY + '&url=' + encodeURIComponent(targetUrl) + '&country_code=vn';
  
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

function parseListings(html, city, propertyType) {
  var listings = [];
  var urls = {};
  
  // Pattern pour extraire les URLs d'annonces avec leur ID
  var urlRegex = /href="(\/ban-[^"]*-pr(\d+)[^"]*)"/gi;
  var match;
  
  while ((match = urlRegex.exec(html)) !== null) {
    var url = match[1];
    var id = match[2];
    if (!urls[id]) {
      urls[id] = url;
    }
  }
  
  var urlCount = Object.keys(urls).length;
  console.log('[BDS] Found ' + urlCount + ' unique listing URLs');
  
  // Creer des listings depuis les URLs trouvees
  for (var id in urls) {
    var url = urls[id];
    
    // Extraire le titre depuis l'URL
    var titleFromUrl = url
      .replace(/^\/ban-/, '')
      .replace(/-pr\d+.*$/, '')
      .replace(/-/g, ' ');
    
    // Chercher le prix dans le HTML autour de cette URL
    var priceMatch = null;
    var areaMatch = null;
    var bedroomMatch = null;
    
    // Chercher le contexte autour de l'URL
    var urlIndex = html.indexOf(url);
    if (urlIndex > 0) {
      var context = html.substring(Math.max(0, urlIndex - 500), Math.min(html.length, urlIndex + 1000));
      
      // Prix
      var priceRegex = /([\d,.]+)\s*ty/gi;
      priceMatch = priceRegex.exec(context);
      
      // Surface
      var areaRegex = /([\d,.]+)\s*m/gi;
      areaMatch = areaRegex.exec(context);
      
      // Chambres
      var bedroomRegex = /(\d+)\s*(?:PN|pn)/gi;
      bedroomMatch = bedroomRegex.exec(context);
    }
    
    var listing = {
      external_id: 'bds_' + id,
      source: 'batdongsan',
      url: 'https://batdongsan.com.vn' + url,
      title: titleFromUrl.substring(0, 150),
      city: city,
      property_type: propertyType,
      scraped_at: new Date().toISOString()
    };
    
    if (priceMatch) {
      var priceValue = parseFloat(priceMatch[1].replace(',', '.'));
      if (!isNaN(priceValue)) {
        listing.price = Math.round(priceValue * 1000000000);
        listing.price_raw = priceMatch[0];
      }
    }
    
    if (areaMatch) {
      var areaValue = parseFloat(areaMatch[1].replace(',', '.'));
      if (!isNaN(areaValue) && areaValue > 0 && areaValue < 10000) {
        listing.area = areaValue;
      }
    }
    
    if (bedroomMatch) {
      listing.bedrooms = parseInt(bedroomMatch[1]);
    }
    
    listings.push(listing);
  }
  
  return listings;
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
    var maxPages = Math.min(parseInt(params.maxPages) || 1, 3);
    
    console.log('[BDS] Search: city=' + city + ', type=' + propertyType + ', priceMax=' + priceMax);
    
    var allListings = [];
    
    for (var page = 1; page <= maxPages; page++) {
      var url = buildSearchUrl({ city: city, propertyType: propertyType, priceMax: priceMax, page: page });
      
      try {
        var html = await scrapeWithScraperAPI(url);
        var listings = parseListings(html, city, propertyType);
        allListings = allListings.concat(listings);
        
        console.log('[BDS] Page ' + page + ': ' + listings.length + ' listings');
        
        if (page < maxPages) {
          await new Promise(function(r) { setTimeout(r, 2000); });
        }
      } catch (e) {
        console.log('[BDS] Page ' + page + ' error: ' + e.message);
        break;
      }
    }
    
    // Dedupliquer
    var seen = {};
    var uniqueListings = [];
    for (var i = 0; i < allListings.length; i++) {
      var listing = allListings[i];
      if (!seen[listing.external_id]) {
        seen[listing.external_id] = true;
        uniqueListings.push(listing);
      }
    }
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        success: true,
        source: 'batdongsan',
        city: city,
        propertyType: propertyType,
        totalListings: uniqueListings.length,
        listings: uniqueListings
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
