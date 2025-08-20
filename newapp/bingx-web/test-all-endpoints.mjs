#!/usr/bin/env node

/**
 * Script de test pour valider tous les endpoints de l'API BingX
 * Usage: node test-all-endpoints.mjs
 */

console.log('🚀 Test de tous les endpoints BingX API...\n');

const BASE_URL = 'http://localhost:3001';

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
        console.log(`   Balance USDT: ${data.data.balance.balance}`);
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

// Tests des endpoints
const tests = [
  { path: '/api/orders?limit=5', name: 'Orders (Historique des ordres)' },
  { path: '/api/balance', name: 'Balance (Solde du compte)' },
  { path: '/api/positions', name: 'Positions (Positions ouvertes)' }
];

let totalTests = 0;
let passedTests = 0;

for (const test of tests) {
  totalTests++;
  if (await testEndpoint(test.path, test.name)) {
    passedTests++;
  }
}

console.log('📊 Résultats des tests:');
console.log(`   ✅ Réussis: ${passedTests}/${totalTests}`);
console.log(`   ❌ Échoués: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 Tous les endpoints fonctionnent correctement !');
} else {
  console.log('\n⚠️  Certains endpoints nécessitent une vérification.');
}