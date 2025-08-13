#!/usr/bin/env node

// 🚀 Script d'initialisation et de test des fonctionnalités DB
// Ce script vous aide à démarrer avec des données d'exemple

import { 
  savePosition, 
  saveOrder, 
  savePortfolioAsset, 
  saveMarketData, 
  logActivity,
  getPositions,
  getPortfolio,
  getOrders
} from '../lib/db-utils.ts';

// Configuration des données d'exemple
const SAMPLE_DATA = {
  positions: [
    {
      symbol: 'BTCUSDT',
      position_side: 'LONG',
      size: 0.25,
      entry_price: 45000.00,
      mark_price: 45500.00,
      unrealized_pnl: 125.00,
      percentage: 1.11,
      margin: 1125.00,
      leverage: 20
    },
    {
      symbol: 'ETHUSDT',
      position_side: 'SHORT',
      size: 2.0,
      entry_price: 2500.00,
      mark_price: 2480.00,
      unrealized_pnl: 40.00,
      percentage: 0.8,
      margin: 1250.00,
      leverage: 10
    }
  ],
  
  orders: [
    {
      order_id: 'ORD_BTC_' + Date.now(),
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 0.1,
      price: 44500.00,
      status: 'FILLED',
      executed_qty: 0.1,
      executed_price: 44500.00,
      commission: 2.225
    },
    {
      order_id: 'ORD_ETH_' + Date.now(),
      symbol: 'ETHUSDT',
      side: 'SELL',
      type: 'MARKET',
      quantity: 1.0,
      status: 'FILLED',
      executed_qty: 1.0,
      executed_price: 2485.00,
      commission: 1.24
    },
    {
      order_id: 'ORD_BNB_' + Date.now(),
      symbol: 'BNBUSDT',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 5.0,
      price: 300.00,
      status: 'PENDING'
    }
  ],
  
  portfolio: [
    {
      asset: 'USDT',
      free: 2500.00,
      locked: 750.00,
      total: 3250.00,
      usd_value: 3250.00,
      percentage: 65.0
    },
    {
      asset: 'BTC',
      free: 0.015,
      locked: 0.01,
      total: 0.025,
      usd_value: 1137.50,
      percentage: 22.75
    },
    {
      asset: 'ETH',
      free: 0.1,
      locked: 0.05,
      total: 0.15,
      usd_value: 372.75,
      percentage: 7.46
    },
    {
      asset: 'BNB',
      free: 0.8,
      locked: 0.2,
      total: 1.0,
      usd_value: 300.00,
      percentage: 6.0
    }
  ],
  
  marketData: [
    {
      symbol: 'BTCUSDT',
      price: 45500.00,
      change_24h: 2.35,
      volume_24h: 45000000,
      high_24h: 46200.00,
      low_24h: 44100.00,
      funding_rate: 0.0001,
      open_interest: 2100000000
    },
    {
      symbol: 'ETHUSDT',
      price: 2485.00,
      change_24h: -1.2,
      volume_24h: 28000000,
      high_24h: 2520.00,
      low_24h: 2465.00,
      funding_rate: -0.0002,
      open_interest: 850000000
    },
    {
      symbol: 'BNBUSDT',
      price: 298.50,
      change_24h: 0.85,
      volume_24h: 8500000,
      high_24h: 305.00,
      low_24h: 292.00,
      funding_rate: 0.0001,
      open_interest: 125000000
    }
  ]
};

async function initializeSampleData() {
  console.log('🚀 === INITIALISATION DES DONNÉES D\'EXEMPLE ===\n');
  
  try {
    // 1. Initialiser les positions
    console.log('📊 Initialisation des positions...');
    for (const position of SAMPLE_DATA.positions) {
      await savePosition(position);
      console.log(`   ✅ Position ${position.symbol} ${position.position_side} créée`);
    }
    
    // 2. Initialiser les ordres
    console.log('\n📈 Initialisation des ordres...');
    for (const order of SAMPLE_DATA.orders) {
      await saveOrder(order);
      console.log(`   ✅ Ordre ${order.symbol} ${order.side} ${order.status}`);
    }
    
    // 3. Initialiser le portefeuille
    console.log('\n💰 Initialisation du portefeuille...');
    for (const asset of SAMPLE_DATA.portfolio) {
      await savePortfolioAsset(asset);
      console.log(`   ✅ ${asset.asset}: ${asset.total} (≈ $${asset.usd_value})`);
    }
    
    // 4. Initialiser les données de marché
    console.log('\n📊 Initialisation des données de marché...');
    for (const data of SAMPLE_DATA.marketData) {
      await saveMarketData(data);
      console.log(`   ✅ ${data.symbol}: $${data.price} (${data.change_24h > 0 ? '+' : ''}${data.change_24h}%)`);
    }
    
    // 5. Logger l'initialisation
    await logActivity('INIT_SAMPLE_DATA', 'Données d\'exemple initialisées avec succès');
    
    console.log('\n🎉 === INITIALISATION TERMINÉE AVEC SUCCÈS ===');
    
    // 6. Afficher un résumé
    await displaySummary();
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'initialisation:', error.message);
    await logActivity('INIT_ERROR', 'Erreur lors de l\'initialisation', { error: error.message });
  }
}

async function displaySummary() {
  console.log('\n📋 === RÉSUMÉ DES DONNÉES ===');
  
  try {
    const [positions, portfolio, orders] = await Promise.all([
      getPositions(),
      getPortfolio(),
      getOrders(10)
    ]);
    
    console.log(`\n📊 Positions: ${positions.length}`);
    positions.forEach(pos => {
      console.log(`   - ${pos.symbol} ${pos.position_side}: ${pos.size} (PnL: $${pos.unrealized_pnl?.toFixed(2) || 'N/A'})`);
    });
    
    console.log(`\n💰 Portefeuille: ${portfolio.length} actifs`);
    const totalValue = portfolio.reduce((sum, asset) => sum + (asset.usd_value || 0), 0);
    console.log(`   Valeur totale: $${totalValue.toFixed(2)}`);
    portfolio.forEach(asset => {
      console.log(`   - ${asset.asset}: ${asset.total} (≈ $${asset.usd_value?.toFixed(2) || 'N/A'})`);
    });
    
    console.log(`\n📈 Ordres: ${orders.length}`);
    orders.slice(0, 5).forEach(order => {
      console.log(`   - ${order.symbol} ${order.side} ${order.status}: ${order.quantity} @ $${order.price?.toFixed(2) || 'Market'}`);
    });
    
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Visitez votre dashboard: http://localhost:3000');
    console.log('   2. Consultez le composant DatabaseDashboard.tsx');
    console.log('   3. Explorez les exemples dans examples/database-usage.js');
    console.log('   4. Lisez le guide: GUIDE_UTILISATION_DB.md');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage du résumé:', error.message);
  }
}

async function clearAllData() {
  console.log('🧹 === NETTOYAGE DE TOUTES LES DONNÉES ===\n');
  
  try {
    const sql = (await import('../lib/database.ts')).default;
    
    console.log('🗑️  Suppression des données...');
    await sql`DELETE FROM positions`;
    await sql`DELETE FROM orders`;
    await sql`DELETE FROM portfolio`;
    await sql`DELETE FROM market_data`;
    await sql`DELETE FROM activity_logs`;
    
    console.log('✅ Toutes les données ont été supprimées');
    console.log('💡 Vous pouvez maintenant relancer l\'initialisation');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Interface en ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    console.log('🔄 Initialisation des données d\'exemple...\n');
    initializeSampleData();
    break;
    
  case 'clear':
    console.log('⚠️  Attention: Cette action supprimera TOUTES les données !');
    console.log('⏳ Nettoyage dans 3 secondes... (Ctrl+C pour annuler)');
    setTimeout(clearAllData, 3000);
    break;
    
  case 'summary':
    displaySummary();
    break;
    
  default:
    console.log('🗄️  === GESTIONNAIRE DE BASE DE DONNÉES BINGX ===\n');
    console.log('Commandes disponibles:');
    console.log('  📥 init     - Initialiser avec des données d\'exemple');
    console.log('  📋 summary  - Afficher un résumé des données actuelles');
    console.log('  🧹 clear    - Supprimer toutes les données (ATTENTION!)');
    console.log('\nExemples:');
    console.log('  node scripts/init-sample-data.js init');
    console.log('  node scripts/init-sample-data.js summary');
    console.log('  node scripts/init-sample-data.js clear');
    console.log('\n💡 Commencez par "init" pour avoir des données d\'exemple !');
}
