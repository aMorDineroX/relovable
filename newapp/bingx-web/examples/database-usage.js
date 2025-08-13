// 🚀 Guide pratique d'utilisation de la base de données BingX
// Ce fichier contient des exemples concrets pour commencer à utiliser les fonctionnalités

import {
  savePosition,
  getPositions,
  deletePosition,
  saveOrder,
  getOrders,
  getOrdersBySymbol,
  savePortfolioAsset,
  getPortfolio,
  saveMarketData,
  getLatestMarketData,
  logActivity,
  getActivityLogs,
  cleanOldData
} from '../lib/db-utils.js';

// ========================================
// 1. 📊 GESTION DES POSITIONS
// ========================================

async function exemplePositions() {
  console.log('📊 === GESTION DES POSITIONS ===');
  
  try {
    // Créer une nouvelle position LONG sur BTC
    const nouvellePosition = {
      symbol: 'BTCUSDT',
      position_side: 'LONG',
      size: 0.5,
      entry_price: 45000.00,
      mark_price: 45200.00,
      unrealized_pnl: 100.00,
      percentage: 0.44,
      margin: 2250.00,
      leverage: 20
    };
    
    console.log('💾 Sauvegarde d\'une position...');
    const positionSauvee = await savePosition(nouvellePosition);
    console.log('✅ Position sauvée:', positionSauvee);
    
    // Récupérer toutes les positions
    console.log('📋 Récupération de toutes les positions...');
    const positions = await getPositions();
    console.log(`✅ ${positions.length} position(s) trouvée(s):`, positions);
    
    // Mettre à jour la position (même symbol + side = mise à jour)
    const positionMiseAJour = {
      ...nouvellePosition,
      mark_price: 45500.00,
      unrealized_pnl: 250.00,
      percentage: 1.11
    };
    
    console.log('🔄 Mise à jour de la position...');
    await savePosition(positionMiseAJour);
    console.log('✅ Position mise à jour');
    
  } catch (error) {
    console.error('❌ Erreur positions:', error.message);
  }
}

// ========================================
// 2. 📈 GESTION DES ORDRES
// ========================================

async function exempleOrdres() {
  console.log('\n📈 === GESTION DES ORDRES ===');
  
  try {
    // Créer un nouvel ordre
    const nouvelOrdre = {
      order_id: 'ORD_' + Date.now(),
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 0.1,
      price: 44500.00,
      status: 'PENDING',
      executed_qty: 0,
      executed_price: 0,
      commission: 0
    };
    
    console.log('💾 Sauvegarde d\'un ordre...');
    const ordreSauve = await saveOrder(nouvelOrdre);
    console.log('✅ Ordre sauvé:', ordreSauve);
    
    // Simuler l'exécution de l'ordre
    const ordreExecute = {
      ...nouvelOrdre,
      status: 'FILLED',
      executed_qty: 0.1,
      executed_price: 44500.00,
      commission: 4.45
    };
    
    console.log('🔄 Mise à jour de l\'ordre (exécuté)...');
    await saveOrder(ordreExecute);
    
    // Récupérer les ordres récents
    console.log('📋 Récupération des 10 derniers ordres...');
    const ordres = await getOrders(10);
    console.log(`✅ ${ordres.length} ordre(s) trouvé(s)`);
    
    // Récupérer les ordres pour un symbole spécifique
    console.log('🔍 Récupération des ordres BTCUSDT...');
    const ordresBTC = await getOrdersBySymbol('BTCUSDT', 5);
    console.log(`✅ ${ordresBTC.length} ordre(s) BTCUSDT trouvé(s)`);
    
  } catch (error) {
    console.error('❌ Erreur ordres:', error.message);
  }
}

// ========================================
// 3. 💰 GESTION DU PORTEFEUILLE
// ========================================

async function exemplePortefeuille() {
  console.log('\n💰 === GESTION DU PORTEFEUILLE ===');
  
  try {
    // Sauvegarder plusieurs actifs du portefeuille
    const actifs = [
      {
        asset: 'USDT',
        free: 1000.00,
        locked: 500.00,
        total: 1500.00,
        usd_value: 1500.00,
        percentage: 60.0
      },
      {
        asset: 'BTC',
        free: 0.02,
        locked: 0.005,
        total: 0.025,
        usd_value: 1125.00,
        percentage: 45.0
      },
      {
        asset: 'ETH',
        free: 0.1,
        locked: 0,
        total: 0.1,
        usd_value: 250.00,
        percentage: 10.0
      }
    ];
    
    console.log('💾 Sauvegarde du portefeuille...');
    for (const actif of actifs) {
      await savePortfolioAsset(actif);
      console.log(`✅ ${actif.asset} sauvé: $${actif.usd_value}`);
    }
    
    // Récupérer le portefeuille complet
    console.log('📋 Récupération du portefeuille...');
    const portefeuille = await getPortfolio();
    console.log(`✅ ${portefeuille.length} actif(s) dans le portefeuille:`);
    
    let totalUSD = 0;
    portefeuille.forEach(actif => {
      console.log(`   - ${actif.asset}: ${actif.total} (≈ $${actif.usd_value})`);
      totalUSD += parseFloat(actif.usd_value) || 0;
    });
    console.log(`💰 Valeur totale du portefeuille: $${totalUSD.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Erreur portefeuille:', error.message);
  }
}

// ========================================
// 4. 📊 DONNÉES DE MARCHÉ
// ========================================

async function exempleDonneesMarche() {
  console.log('\n📊 === DONNÉES DE MARCHÉ ===');
  
  try {
    // Sauvegarder des données de marché
    const donneesMarche = [
      {
        symbol: 'BTCUSDT',
        price: 45200.00,
        change_24h: 2.35,
        volume_24h: 25000000,
        high_24h: 46000.00,
        low_24h: 44500.00,
        funding_rate: 0.0001,
        open_interest: 150000000
      },
      {
        symbol: 'ETHUSDT',
        price: 2500.00,
        change_24h: -1.20,
        volume_24h: 15000000,
        high_24h: 2550.00,
        low_24h: 2480.00,
        funding_rate: -0.0002,
        open_interest: 80000000
      }
    ];
    
    console.log('💾 Sauvegarde des données de marché...');
    for (const donnee of donneesMarche) {
      await saveMarketData(donnee);
      console.log(`✅ ${donnee.symbol}: $${donnee.price} (${donnee.change_24h > 0 ? '+' : ''}${donnee.change_24h}%)`);
    }
    
    // Récupérer les dernières données pour BTC
    console.log('🔍 Récupération des données BTC...');
    const donneeBTC = await getLatestMarketData('BTCUSDT');
    if (donneeBTC.length > 0) {
      console.log('✅ Dernière donnée BTC:', donneeBTC[0]);
    }
    
    // Récupérer toutes les dernières données
    console.log('📋 Récupération de toutes les dernières données...');
    const toutesLesDonnees = await getLatestMarketData();
    console.log(`✅ ${toutesLesDonnees.length} symbole(s) suivis`);
    
  } catch (error) {
    console.error('❌ Erreur données marché:', error.message);
  }
}

// ========================================
// 5. 📝 SYSTÈME DE LOGS
// ========================================

async function exempleLogs() {
  console.log('\n📝 === SYSTÈME DE LOGS ===');
  
  try {
    // Enregistrer différents types d'activités
    await logActivity('USER_LOGIN', 'Utilisateur connecté au dashboard');
    await logActivity('POSITION_OPENED', 'Position LONG ouverte sur BTCUSDT', { 
      symbol: 'BTCUSDT', 
      size: 0.5, 
      price: 45000 
    });
    await logActivity('ORDER_PLACED', 'Ordre d\'achat placé', { 
      orderId: 'ORD_123456', 
      symbol: 'ETHUSDT' 
    });
    
    console.log('✅ Logs d\'activité enregistrés');
    
    // Récupérer les logs récents
    console.log('📋 Récupération des 5 derniers logs...');
    const logs = await getActivityLogs(5);
    console.log(`✅ ${logs.length} log(s) trouvé(s):`);
    
    logs.forEach(log => {
      console.log(`   [${log.created_at}] ${log.action}: ${log.description}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur logs:', error.message);
  }
}

// ========================================
// 6. 🧹 MAINTENANCE DE LA BASE
// ========================================

async function exempleNettoyage() {
  console.log('\n🧹 === NETTOYAGE DE LA BASE ===');
  
  try {
    console.log('🧹 Nettoyage des données anciennes (30 jours)...');
    await cleanOldData(30);
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error.message);
  }
}

// ========================================
// 🚀 FONCTION PRINCIPALE
// ========================================

export async function demonstrationComplete() {
  console.log('🚀 === DÉMONSTRATION COMPLÈTE DES FONCTIONNALITÉS DB ===\n');
  
  try {
    await exemplePositions();
    await exempleOrdres();
    await exemplePortefeuille();
    await exempleDonneesMarche();
    await exempleLogs();
    await exempleNettoyage();
    
    console.log('\n🎉 === DÉMONSTRATION TERMINÉE AVEC SUCCÈS ===');
    console.log('💡 Vous pouvez maintenant utiliser ces fonctions dans votre application !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la démonstration:', error.message);
  }
}

// Exécuter la démonstration si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrationComplete();
}
