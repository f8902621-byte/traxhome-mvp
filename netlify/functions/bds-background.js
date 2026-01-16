// ============================================
// BDS-BACKGROUND.JS - Background Function Netlify
// Scrape Batdongsan en arrière-plan (jusqu'à 15 min)
// Stocke progressivement dans Supabase
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Configuration
const MAX_DETAILS = 30; // Nombre max d'annonces à scraper en détail
const BATCH_SIZE = 5;   // Sauvegarder par lots de 5

// ============================================
// HELPERS
// ============================================
function removeVietnameseAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

// ============================================
// ANALYSE NLP (copié de search.js)
// ============================================
function analyzeListingText(title, body) {
  const text = ((title || '') + ' ' + (body || '')).toLowerCase();
  const analysis = {
    extractedStreetWidth: null,
    extractedFloors: null,
    extractedFacade: null,
    extractedDirection: null,
    extractedRentalIncome: null,
    hasMetroNearby: false,
    hasNewRoad: false,
    hasInvestmentPotential: false,
    hasLegalIssue: false,
    hasPlanningRisk: false,
    detectedKeywords: []
  };

  // Étages
  const floorMatch = text.match(/(\d+)\s*tầng/i) || text.match(/(\d+)\s*lầu/i);
  if (floorMatch && parseInt(floorMatch[1]) <= 20) {
    analysis.extractedFloors = parseInt(floorMatch[1]);
  }

  // Opportunités
  if (/metro|tàu\s*điện/i.test(text)) {
    analysis.hasMetroNearby = true;
    analysis.detectedKeywords.push('🚇 Gần Metro');
  }
  if (/mở\s*đường|sắp\s*mở|đường\s*mới/i.test(text)) {
    analysis.hasNewRoad = true;
    analysis.detectedKeywords.push('🛣️ Sắp mở đường');
  }
  if (/đầu\s*tư|sinh\s*lời|tăng\s*giá|tiềm\s*năng/i.test(text)) {
    analysis.hasInvestmentPotential = true;
    analysis.detectedKeywords.push('📈 Tiềm năng đầu tư');
  }

  // Risques
  if (/chưa\s*(có\s*)?sổ|giấy\s*tay|không\s*sổ/i.test(text)) {
    analysis.hasLegalIssue = true;
    analysis.detectedKeywords.push('⚠️ Chưa có sổ');
  }
  if (/giải\s*tỏa|quy\s*hoạch\s*(treo|đỏ)|tranh\s*chấp/i.test(text)) {
    analysis.hasPlanningRisk = true;
    analysis.detectedKeywords.push('🚨 Rủi ro quy hoạch');
  }

  return analysis;
}

// ============================================
// SUPABASE - Mise à jour du statut de la tâche
// ============================================
async function updateTaskStatus(taskId, status, data = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  
  try {
    const payload = {
      id: taskId,
      status,
      updated_at: new Date().toISOString(),
      ...data
    };
    
    await fetch(`${SUPABASE_URL}/rest/v1/bds_tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Task ${taskId}: status=${status}`);
  } catch (error) {
    console.error('updateTaskStatus error:', error.message);
  }
}

// ============================================
// SUPABASE - Sauvegarder les annonces BDS
// ============================================
async function saveBdsListings(taskId, listings) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || listings.length === 0) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = listings.map(item => ({
      id: item.id,
      task_id: taskId,
      source: 'batdongsan.com.vn',
      title: item.title || '',
      price: item.price || 0,
      area: item.area || 0,
      price_per_m2: item.area > 0 && item.price > 0 ? Math.round(item.price / item.area) : 0,
      district: item.district || '',
      ward: item.ward || '',
      city: item.city || '',
      property_type: item.propertyType || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      floors: item.floors || null,
      street_width: item.streetWidth || null,
      facade_width: item.facadeWidth || null,
      legal_status: item.legalStatus || null,
      direction: item.direction || null,
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      images: item.images || [],
      last_seen: today,
      created_at: new Date().toISOString(),
      // NLP data
      has_metro_nearby: item.hasMetroNearby || false,
      has_new_road: item.hasNewRoad || false,
      has_investment_potential: item.hasInvestmentPotential || false,
      has_legal_issue: item.hasLegalIssue || false,
      has_planning_risk: item.hasPlanningRisk || false,
      detected_keywords: item.detectedKeywords || []
    }));
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bds_listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(records)
    });
    
    if (response.ok) {
      console.log(`Supabase: ${records.length} annonces BDS sauvegardées pour task ${taskId}`);
    } else {
      const error = await response.text();
      console.error('Supabase BDS error:', error);
    }
  } catch (error) {
    console.error('saveBdsListings error:', error.message);
  }
}

// ============================================
// SCRAPING BATDONGSAN - DÉTAIL D'UNE ANNONCE
// ============================================
async function scrapeDetailPage(urlInfo) {
  try {
    const detailUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(urlInfo.fullUrl)}`;
    const response = await fetch(detailUrl);
    
    if (!response.ok) {
      console.log(`BDS detail ${urlInfo.id}: HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    const listing = {
      id: `bds_${urlInfo.id}`,
      source: 'batdongsan.com.vn',
      url: urlInfo.fullUrl,
    };
    
    // Titre
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      listing.title = titleMatch[1].replace(/ - Batdongsan.com.vn$/i, '').substring(0, 150);
    }
    
    // Prix depuis JSON embarqué
    const priceMatch = html.match(/price:\s*(\d{8,12})[,\s]/);
    if (priceMatch) {
      listing.price = parseInt(priceMatch[1]);
    }
    
    // Surface
    const areaMatch = html.match(/area:\s*(\d+)/);
    if (areaMatch) {
      listing.area = parseInt(areaMatch[1]);
    }
    
    // Fallback: extraire surface depuis le titre si pas trouvée
    if (!listing.area && listing.title) {
      const areaTitleMatch = listing.title.match(/(\d+[.,]?\d*)\s*m2/i);
      if (areaTitleMatch) {
        listing.area = parseFloat(areaTitleMatch[1].replace(',', '.'));
      }
    }
    // Chambres
    const bedroomMatch = html.match(/bedroom[s]?:\s*(\d+)/i) || html.match(/(\d+)\s*(?:PN|phòng ngủ)/i);
    if (bedroomMatch) {
      listing.bedrooms = parseInt(bedroomMatch[1]);
    }
    
    // Salles de bain
    const bathroomMatch = html.match(/bathroom[s]?:\s*(\d+)/i) || html.match(/(\d+)\s*(?:WC|phòng tắm)/i);
    if (bathroomMatch) {
      listing.bathrooms = parseInt(bathroomMatch[1]);
    }
    
    // District depuis l'URL ou le contenu
    const districtMatch = urlInfo.fullUrl.match(/quan-(\d+)|district-(\d+)/i) || 
                          html.match(/Quận\s*(\d+)/i);
    if (districtMatch) {
      listing.district = `Quận ${districtMatch[1] || districtMatch[2]}`;
    }
    
    // Image principale
    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) ||
                        html.match(/content="([^"]+)"\s+property="og:image"/i);
    if (ogImageMatch) {
      listing.thumbnail = ogImageMatch[1];
      listing.images = [ogImageMatch[1]];
    } else {
      // Chercher images CDN
      const cdnMatches = html.match(/https:\/\/file4\.batdongsan\.com\.vn\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
      if (cdnMatches && cdnMatches.length > 0) {
        listing.thumbnail = cdnMatches[0];
        listing.images = [...new Set(cdnMatches)].slice(0, 10);
      }
    }
    
    // Analyse NLP
    const bodyMatch = html.match(/<div[^>]*class="[^"]*re__pr-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const bodyText = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, ' ').trim() : '';
    const nlp = analyzeListingText(listing.title, bodyText);
    
    listing.floors = nlp.extractedFloors;
    listing.streetWidth = nlp.extractedStreetWidth;
    listing.hasMetroNearby = nlp.hasMetroNearby;
    listing.hasNewRoad = nlp.hasNewRoad;
    listing.hasInvestmentPotential = nlp.hasInvestmentPotential;
    listing.hasLegalIssue = nlp.hasLegalIssue;
    listing.hasPlanningRisk = nlp.hasPlanningRisk;
    listing.detectedKeywords = nlp.detectedKeywords;
    
    // Ne garder que si on a un prix valide
    if (listing.price && listing.price > 0) {
      return listing;
    }
    
    console.log(`BDS detail ${urlInfo.id}: pas de prix trouvé`);
    return null;
    
  } catch (error) {
    console.error(`BDS detail ${urlInfo.id} error:`, error.message);
    return null;
  }
}

// ============================================
// SCRAPING BATDONGSAN - PAGE DE LISTE
// ============================================
async function scrapeBdsListPage(city, propertyType, priceMax) {
  const cityMapping = {
    'ho chi minh': 'tp-hcm',
    'ha noi': 'ha-noi',
    'da nang': 'da-nang',
    'binh duong': 'binh-duong',
    'khanh hoa': 'khanh-hoa',
    'can tho': 'can-tho',
    'hai phong': 'hai-phong',
    'ba ria vung tau': 'vung-tau-vt',
    'vung tau': 'vung-tau-vt',
    'lam dong': 'lam-dong',
    'da lat': 'lam-dong',
  };
  
  const typeMapping = {
    'can ho chung cu': 'ban-can-ho-chung-cu',
    'can ho': 'ban-can-ho-chung-cu',
    'chung cu': 'ban-can-ho-chung-cu',
    'apartment': 'ban-can-ho-chung-cu',
    'nha o': 'ban-nha-rieng',
    'nha rieng': 'ban-nha-rieng',
    'house': 'ban-nha-rieng',
    'nha biet thu': 'ban-nha-biet-thu-lien-ke',
    'biet thu': 'ban-nha-biet-thu-lien-ke',
    'villa': 'ban-nha-biet-thu-lien-ke',
    'dat': 'ban-dat',
    'dat nen': 'ban-dat-nen-du-an',
    'land': 'ban-dat',
    'shophouse': 'ban-shophouse-nha-pho-thuong-mai',
  };
  
  const cityNorm = removeVietnameseAccents(city || '').toLowerCase();
  const typeNorm = removeVietnameseAccents(propertyType || '').toLowerCase();
  
  let citySlug = 'tp-hcm';
  for (const [key, value] of Object.entries(cityMapping)) {
    if (cityNorm.includes(key)) { citySlug = value; break; }
  }
  
  let typeSlug = 'ban-can-ho-chung-cu';
  for (const [key, value] of Object.entries(typeMapping)) {
    if (typeNorm.includes(key)) { typeSlug = value; break; }
  }
  
  // Construire l'URL BDS
  let bdsUrl = `https://batdongsan.com.vn/${typeSlug}-${citySlug}`;
  if (priceMax) {
    bdsUrl += `?gcn=${priceMax}-ty`;
  }
  
  console.log(`BDS Background: Scraping liste ${bdsUrl}`);
  
  const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(bdsUrl)}&render=true`;
  const response = await fetch(scraperUrl);
  
  if (!response.ok) {
    throw new Error(`Liste BDS HTTP ${response.status}`);
  }
  
  const html = await response.text();
  
  // Extraire les URLs des annonces
  const urlRegex = /href="(\/ban-[^"]*-pr(\d+)[^"]*)"/gi;
  const urls = [];
  const seen = {};
  let match;
  
  while ((match = urlRegex.exec(html)) !== null) {
    const path = match[1];
    const id = match[2];
    if (!seen[id]) {
      seen[id] = true;
      urls.push({ id, path, fullUrl: 'https://batdongsan.com.vn' + path });
    }
  }
  
  console.log(`BDS Background: ${urls.length} URLs trouvées`);
  return urls;
}

// ============================================
// HANDLER PRINCIPAL - BACKGROUND FUNCTION
// ============================================
exports.handler = async (event, context) => {
  // Les Background Functions doivent retourner immédiatement
  // Le traitement continue en arrière-plan
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }

  const { taskId, city, propertyType, priceMax } = body;

  if (!taskId) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ error: 'taskId requis' }) 
    };
  }

  if (!SCRAPER_API_KEY) {
    await updateTaskStatus(taskId, 'error', { error: 'SCRAPER_API_KEY non configuré' });
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: 'SCRAPER_API_KEY manquant' }) 
    };
  }

  console.log(`=== BDS BACKGROUND START ===`);
  console.log(`Task: ${taskId}, City: ${city}, Type: ${propertyType}`);

  try {
    // Marquer la tâche comme "en cours"
    await updateTaskStatus(taskId, 'running', { 
      started_at: new Date().toISOString(),
      city,
      property_type: propertyType,
      progress: 0
    });

    // Étape 1: Récupérer la liste des URLs
    const urls = await scrapeBdsListPage(city, propertyType, priceMax);
    
    if (urls.length === 0) {
      await updateTaskStatus(taskId, 'completed', { 
        total_found: 0,
        total_scraped: 0,
        progress: 100
      });
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ success: true, message: 'Aucune annonce trouvée' }) 
      };
    }

    await updateTaskStatus(taskId, 'running', { 
      total_found: urls.length,
      progress: 10
    });

    // Étape 2: Scraper les détails (par lots)
    const listings = [];
    const urlsToScrape = urls.slice(0, MAX_DETAILS);
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const urlInfo = urlsToScrape[i];
      
      console.log(`BDS scraping ${i + 1}/${urlsToScrape.length}: ${urlInfo.id}`);
      
      const listing = await scrapeDetailPage(urlInfo);
      
      if (listing) {
        listing.city = city;
        listing.propertyType = propertyType;
        listings.push(listing);
      }
      
      // Sauvegarder par lots de BATCH_SIZE
      if (listings.length > 0 && listings.length % BATCH_SIZE === 0) {
        await saveBdsListings(taskId, listings.slice(-BATCH_SIZE));
        
        const progress = Math.round(10 + (i / urlsToScrape.length) * 85);
        await updateTaskStatus(taskId, 'running', { 
          total_scraped: listings.length,
          progress
        });
      }
      
      // Petite pause pour ne pas surcharger ScraperAPI
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Sauvegarder les dernières annonces
    const remaining = listings.length % BATCH_SIZE;
    if (remaining > 0) {
      await saveBdsListings(taskId, listings.slice(-remaining));
    }

    // Marquer comme terminé
    await updateTaskStatus(taskId, 'completed', { 
      total_found: urls.length,
      total_scraped: listings.length,
      progress: 100,
      completed_at: new Date().toISOString()
    });

    console.log(`=== BDS BACKGROUND COMPLETE ===`);
    console.log(`Task ${taskId}: ${listings.length} annonces scrapées sur ${urls.length} trouvées`);

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        success: true, 
        taskId,
        totalFound: urls.length,
        totalScraped: listings.length 
      }) 
    };

  } catch (error) {
    console.error('BDS Background error:', error);
    
    await updateTaskStatus(taskId, 'error', { 
      error: error.message,
      completed_at: new Date().toISOString()
    });

    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ success: false, error: error.message }) 
    };
  }
};
