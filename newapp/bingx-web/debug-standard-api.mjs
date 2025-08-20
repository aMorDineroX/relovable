import axios from 'axios';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString, secretKey) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

async function testStandardFuturesAPI() {
  console.log('🧪 Test API Standard Futures...\n');

  const endpoint = '/openApi/contract/v1/allOrders';
  const params = {
    timestamp: Date.now().toString(),
    limit: '3'
  };

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  const signature = sign(queryString, SECRET_KEY);
  const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.get(finalUrl, { 
      headers: { 'X-BX-APIKEY': API_KEY }
    });
    
    console.log('✅ Statut:', response.status);
    console.log('📦 Structure des données Standard Futures:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n🔍 Premier ordre détaillé:');
      const firstOrder = response.data.data[0];
      console.log(JSON.stringify(firstOrder, null, 2));
      
      console.log('\n📋 Champs disponibles:');
      Object.keys(firstOrder).forEach(key => {
        console.log(`  - ${key}: ${firstOrder[key]}`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testStandardFuturesAPI();