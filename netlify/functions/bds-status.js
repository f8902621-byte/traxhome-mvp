// ============================================
// BDS-STATUS.JS - Vérifier le statut d'une tâche BDS
// Endpoint pour polling depuis le frontend
// ============================================

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

  // Récupérer taskId depuis query string ou body
  let taskId = event.queryStringParameters?.taskId;
  
  if (!taskId && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      taskId = body.taskId;
    } catch (e) {}
  }

  if (!taskId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'taskId requis' })
    };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase non configuré' })
    };
  }

  try {
    // 1. Récupérer le statut de la tâche
    const taskResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/bds_tasks?id=eq.${taskId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );

    if (!taskResponse.ok) {
      throw new Error('Erreur Supabase tasks');
    }

    const tasks = await taskResponse.json();
    
    if (tasks.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Tâche non trouvée', taskId })
      };
    }

    const task = tasks[0];

    // 2. Récupérer les annonces associées à cette tâche
    const listingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/bds_listings?task_id=eq.${taskId}&select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      }
    );

    let listings = [];
    if (listingsResponse.ok) {
      listings = await listingsResponse.json();
    }

    // 3. Formatter les annonces pour le frontend
    const formattedListings = listings.map(item => ({
      id: item.id,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.price_per_m2 || 0,
      city: item.city || '',
      district: item.district || '',
      floorArea: item.area || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=BDS',
      images: item.images || [],
      url: item.url || '#',
      source: 'batdongsan.com.vn',
      propertyType: item.property_type || '',
      floors: item.floors,
      streetWidth: item.street_width,
      legalStatus: item.legal_status,
      direction: item.direction,
      // NLP flags
      hasMetroNearby: item.has_metro_nearby || false,
      hasNewRoad: item.has_new_road || false,
      hasInvestmentPotential: item.has_investment_potential || false,
      hasLegalIssue: item.has_legal_issue || false,
      hasPlanningRisk: item.has_planning_risk || false,
      detectedKeywords: item.detected_keywords || [],
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        taskId,
        status: task.status,
        progress: task.progress || 0,
        totalFound: task.total_found || 0,
        totalScraped: task.total_scraped || 0,
        error: task.error || null,
        startedAt: task.started_at,
        completedAt: task.completed_at,
        listings: formattedListings,
        listingsCount: formattedListings.length
      })
    };

  } catch (error) {
    console.error('BDS status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
