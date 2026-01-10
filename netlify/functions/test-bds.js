// netlify/functions/test-bds.js - Version debug

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const targetUrl = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-tp-hcm?gcn=5-ty';
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=vn`;
    
    const response = await fetch(scraperUrl);
    const html = await response.text();
    
    // Chercher tous les patterns de classes possibles
    const patterns = {
      'js__card': (html.match(/js__card/gi) || []).length,
      're__card': (html.match(/re__card/gi) || []).length,
      'product-item': (html.match(/product-item/gi) || []).length,
      'pr-container': (html.match(/pr-container/gi) || []).length,
      'listing-item': (html.match(/listing-item/gi) || []).length,
      'js__product': (html.match(/js__product/gi) || []).length,
      'pr-title': (html.match(/pr-title/gi) || []).length,
      're__srp-list': (html.match(/re__srp-list/gi) || []).length,
      'ProductItem': (html.match(/ProductItem/gi) || []).length,
      'data-product': (html.match(/data-product/gi) || []).length,
    };
    
    // Extraire un échantillon autour de "tỷ" (prix)
    const priceMatch = html.match(/.{200}tỷ.{200}/i);
    
    // Extraire les URLs d'annonces
    const urlMatches = html.match(/href="\/ban-[^"]+pr\d+"/gi) || [];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        htmlLength: html.length,
        patterns,
        sampleUrls: urlMatches.slice(0, 5),
        priceSample: priceMatch ? priceMatch[0] : 'not found',
      }, null, 2)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
