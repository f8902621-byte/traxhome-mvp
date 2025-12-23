// ============================================
// TRAXHOME - BETA SIGNUP
// Enregistre les emails dans Airtable
// ============================================

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appZ0RLqVclJCsbgf';
const AIRTABLE_TABLE_NAME = 'Leads';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
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

  try {
    const { email, language, source } = JSON.parse(event.body || '{}');

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email invalide' })
      };
    }

    // Vérifier que l'API key est configurée
    if (!AIRTABLE_API_KEY) {
      console.error('AIRTABLE_API_KEY non configurée');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuration serveur manquante' })
      };
    }

    // Envoyer à Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
    
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Email': email,
              'Status': 'New',
              // Champs optionnels si ils existent dans ta table
              // 'Language': language || 'vn',
              // 'Source': source || 'landing',
            }
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Airtable error:', data);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erreur lors de l\'enregistrement', details: data })
      };
    }

    console.log('Beta signup success:', email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email enregistré avec succès',
        id: data.records?.[0]?.id 
      })
    };

  } catch (error) {
    console.error('Beta signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
