#!/usr/bin/env node

/**
 * Script de test pour valider les endpoints Standard Futures BingX
 * Usage: node test-standard-futures.mjs
 */

console.log('🚀 Test des endpoints Standard Futures BingX...\n');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, name) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ ${name}: HTTP ${response.status}`);
      console.log(`   Erreur: ${data.error || data.msg || 'Erreur inconnue'}\n`);
      return false;
    }
    
    console.log(`✅ ${name}: OK`);
    console.log(`   Code: ${data.code || 'N/A'}`);
    console.log(`   Message: ${data.msg || 'N/A'}`);
    
    if (data.data) {
      if (Array.isArray(data.data)) {
        console.log(`   Données: ${data.data.length} éléments`);
      } else if (data.data.orders && Array.isArray(data.data.orders)) {
        console.log(`   Ordres: ${data.data.orders.length} éléments`);
      } else if (data.data.balance) {
        console.log(`   Balance: ${JSON.stringify(data.data.balance)}`);
      } else {
        console.log(`   Données: ${typeof data.data}`);
      }
    }
    
    console.log('');
    return true;
    
  } catch (error) {
    console.log(`❌ ${name}: Erreur de connexion`);
    console.log(`   ${error.message}\n`);
    return false;
  }
}

// Tests des endpoints Standard Futures
const tests = [
  { path: '/api/standard/orders?limit=5', name: 'Standard Futures - Orders (Historique des ordres)' },
  { path: '/api/standard/balance', name: 'Standard Futures - Balance (Solde du compte)' },
  { path: '/api/standard/positions', name: 'Standard Futures - Positions (Positions ouvertes)' }
];

let totalTests = 0;
let passedTests = 0;

console.log('📊 Test des endpoints Standard Futures (Contrats à livraison):');
console.log('================================================================\n');

for (const test of tests) {
  totalTests++;
  if (await testEndpoint(test.path, test.name)) {
    passedTests++;
  }
}

console.log('📊 Résultats des tests Standard Futures:');
console.log(`   ✅ Réussis: ${passedTests}/${totalTests}`);
console.log(`   ❌ Échoués: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 Tous les endpoints Standard Futures fonctionnent !');
  console.log('🔗 Accédez aux Standard Futures: http://localhost:3001 (onglet "Standard Futures")');
} else {
  console.log('\n⚠️  Certains endpoints Standard Futures nécessitent une vérification.');
  console.log('💡 Note: Il est possible que votre compte BingX n\'ait pas d\'activité sur les Standard Futures.');
  console.log('   Les Standard Futures sont des contrats à livraison avec dates d\'échéance spécifiques.');
}