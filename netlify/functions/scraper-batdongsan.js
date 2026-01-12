/**
 * K Trix - Batdongsan Scraper via ScraperAPI
 * Le site le plus protege du Vietnam - enfin accessible !
 */

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

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
    
    // Variables pour l'extraction
    var priceMatch = null;
    var areaMatch = null;
    var bedroomMatch = null;
    var imageUrl = null;
    var isTrieu = false;
    
    // Chercher le contexte autour de l'URL
    var urlIndex = html.indexOf(url);
    if (urlIndex > 0) {
      var context = html.substring(Math.max(0, urlIndex - 2000), Math.min(html.length, urlIndex + 3000));
      
// Prix - Extraction améliorée avec plusieurs patterns
      var pricePatterns = [
        /([\d]+[,.][\d]+)\s*t[yỷ]/gi,      // 3,5 tỷ ou 3.5 tỷ
        /([\d]+)\s*t[yỷ]/gi,                // 5 tỷ
        /price[^>]*>([\d,.]+)\s*t/gi,       // dans balise price
        />([\d]+[,.][\d]+)\s*t[yỷ]/gi,      // après une balise >3,5 tỷ
        />([\d]+)\s*t[yỷ]/gi,               // après une balise >5 tỷ
        /"price"[^:]*:\s*"?([\d,.]+)/gi,    // JSON price
      ];
      
      for (var pi = 0; pi < pricePatterns.length && !priceMatch; pi++) {
        priceMatch = pricePatterns[pi].exec(context);
      }
      
      // Si pas trouvé, essayer dans l'URL (format "gia-X-Y-ty")
      if (!priceMatch) {
        var urlPriceRegex = /(\d+)[,-]?(\d*)\s*t[yỷ]/gi;
        priceMatch = urlPriceRegex.exec(url);
      }
      
      // Essayer les prix en triệu/tr
      if (!priceMatch) {
        var trieuPatterns = [
          /([\d]+)\s*(?:triệu|trieu|tr)\b/gi,
          />([\d]+)\s*(?:triệu|trieu|tr)/gi,
        ];
        for (var ti = 0; ti < trieuPatterns.length && !priceMatch; ti++) {
          priceMatch = trieuPatterns[ti].exec(context);
          if (priceMatch) {
            isTrieu = true;
          }
        }
      }
      
      // Surface
      var areaRegex = /([\d,.]+)\s*m/gi;
      areaMatch = areaRegex.exec(context);
      
      // Chambres
      var bedroomRegex = /(\d+)\s*(?:PN|pn)/gi;
      bedroomMatch = bedroomRegex.exec(context);
      
      // Image - chercher les URLs amcdn.vn (CDN de Batdongsan)
      var imageRegex = /https?:\/\/[^"'\s<>]*amcdn\.vn\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
      var imageMatch = imageRegex.exec(context);
      if (imageMatch) {
        imageUrl = imageMatch[0];
      }
      
      // Alternative : chercher data-src ou src avec image
      if (!imageUrl) {
        var imgSrcRegex = /(?:data-src|src)=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
        var imgMatch = imgSrcRegex.exec(context);
        if (imgMatch && imgMatch[1] && !imgMatch[1].includes('logo') && !imgMatch[1].includes('icon')) {
          imageUrl = imgMatch[1];
        }
      }
      
      // Pattern pour background-image: url(...)
      if (!imageUrl) {
        var bgRegex = /background-image:\s*url\(['"]?([^'")\s]+\.(?:jpg|jpeg|png|webp)[^'")\s]*)['"]?\)/gi;
        var bgMatch = bgRegex.exec(context);
        if (bgMatch && bgMatch[1]) {
          imageUrl = bgMatch[1];
        }
      }
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
      if (isTrieu) {
        priceValue = priceValue / 1000; // Convertir triệu en tỷ
      }
      if (!isNaN(priceValue) && priceValue > 0) {
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
    
    if (imageUrl) {
      listing.image_url = imageUrl;
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
