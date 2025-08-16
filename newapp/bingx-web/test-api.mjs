import crypto from 'crypto';

// Test de configuration API
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

async function testAPIConnection() {
  console.log('🔍 Test de la configuration API BingX...');
  
  if (!API_KEY || !SECRET_KEY) {
    console.error('❌ Variables d\'environnement manquantes:');
    console.log('API_KEY:', API_KEY ? '✅ Configurée' : '❌ Manquante');
    console.log('SECRET_KEY:', SECRET_KEY ? '✅ Configurée' : '❌ Manquante');
    return;
  }

  console.log('✅ Variables d\'environnement configurées');
  
  // Test avec l'endpoint balance (plus sûr que place order)
  const timestamp = Date.now();
  const params = { timestamp };
  
  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signature = createSignature(queryString, SECRET_KEY);
  const url = `${BASE_URL}/openApi/swap/v2/user/balance?${queryString}&signature=${signature}`;
  
  try {
    console.log('📡 Test de connexion à l\'API...');
    
    const response = await fetch(url, {
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 Réponse API:', {
      status: response.status,
      ok: response.ok,
      code: data.code,
      msg: data.msg
    });
    
    if (response.ok && data.code === 0) {
      console.log('✅ Connexion API réussie !');
      console.log('💰 Balance disponible');
    } else {
      console.log('❌ Erreur API:', data.msg || 'Erreur inconnue');
      console.log('🔧 Vérifiez vos clés API et leurs permissions');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de validation des paramètres d'ordre
function validateOrderParams(orderData) {
  console.log('\n🔍 Validation des paramètres d\'ordre...');
  
  const required = ['symbol', 'side', 'type', 'quantity'];
  const missing = required.filter(field => !orderData[field]);
  
  if (missing.length > 0) {
    console.log('❌ Paramètres manquants:', missing);
    return false;
  }
  
  if (orderData.type === 'LIMIT' && !orderData.price) {
    console.log('❌ Prix requis pour les ordres LIMIT');
    return false;
  }
  
  console.log('✅ Paramètres d\'ordre valides');
  return true;
}

// Exemple de test
const testOrder = {
  symbol: 'BTC-USDT',
  side: 'BUY',
  type: 'LIMIT',
  quantity: '0.001',
  price: '50000'
};

console.log('🧪 Test de configuration pour les ordres de trading...\n');

testAPIConnection().then(() => {
  validateOrderParams(testOrder);
  console.log('\n✅ Tests terminés !');
});
