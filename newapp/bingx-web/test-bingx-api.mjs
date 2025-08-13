#!/usr/bin/env node

// Test des API BingX
console.log('🔬 Test des API BingX...\n');

const API_BASE = 'http://localhost:3000/api';

async function testAPI(endpoint, description) {
  try {
    console.log(`⏳ Test: ${description}`);
    console.log(`📡 GET ${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Succès!`);
    console.log(`📊 Données:`, JSON.stringify(data, null, 2).slice(0, 500) + '...');
    console.log('─'.repeat(50));
    
    return data;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    console.log('─'.repeat(50));
    return null;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests API BingX\n');
  
  // Test 1: Ticker d'un symbole spécifique
  await testAPI('/ticker?symbol=BTC-USDT', 'Ticker BTC-USDT');
  
  // Test 2: Tous les tickers
  await testAPI('/all-tickers', 'Tous les tickers');
  
  // Test 3: Carnet d'ordres
  await testAPI('/depth?symbol=BTC-USDT&limit=10', 'Carnet d\'ordres BTC-USDT');
  
  // Test 4: Historique des trades
  await testAPI('/trades?symbol=BTC-USDT&limit=10', 'Trades récents BTC-USDT');
  
  // Test 5: Données Kline
  await testAPI('/klines?symbol=BTC-USDT&interval=1m&limit=10', 'Données Kline BTC-USDT');
  
  console.log('\n🎉 Tests terminés!');
  
  // Instructions pour l'utilisateur
  console.log('\n📋 Instructions:');
  console.log('1. Si tous les tests passent: API BingX configurée correctement');
  console.log('2. Si des erreurs: vérifiez les clés API dans .env');
  console.log('3. Vous pouvez maintenant basculer useMockData=false dans l\'interface');
  console.log('\n🔗 Interface: http://localhost:3000/market');
}

// Exécution des tests
runTests().catch(console.error);
