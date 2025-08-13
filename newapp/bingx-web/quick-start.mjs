// 🚀 Guide pratique pour commencer avec la base de données BingX
// Exécutez ce fichier avec: node quick-start.mjs

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🚀 === GUIDE DE DÉMARRAGE RAPIDE - BASE DE DONNÉES BINGX ===\n');

// ========================================
// ÉTAPE 1: Tester la connexion
// ========================================

console.log('📡 ÉTAPE 1: Test de connexion...');
try {
  const test = await sql`SELECT 'Base de données connectée!' as message`;
  console.log('✅', test[0].message);
} catch (error) {
  console.error('❌ Erreur de connexion:', error.message);
  process.exit(1);
}

// ========================================
// ÉTAPE 2: Insérer des données d'exemple
// ========================================

console.log('\n💾 ÉTAPE 2: Ajout de données d\'exemple...');

// Exemple 1: Ajouter une position
console.log('📊 Ajout d\'une position BTC LONG...');
const position = await sql`
  INSERT INTO positions (symbol, position_side, size, entry_price, mark_price, unrealized_pnl, leverage)
  VALUES ('BTCUSDT', 'LONG', 0.5, 45000.00, 45200.00, 100.00, 20)
  ON CONFLICT (symbol, position_side) 
  DO UPDATE SET 
    mark_price = EXCLUDED.mark_price,
    unrealized_pnl = EXCLUDED.unrealized_pnl,
    updated_at = CURRENT_TIMESTAMP
  RETURNING *
`;
console.log('✅ Position créée:', position[0]);

// Exemple 2: Ajouter un ordre
console.log('\n📈 Ajout d\'un ordre d\'achat...');
const ordre = await sql`
  INSERT INTO orders (order_id, symbol, side, type, quantity, price, status)
  VALUES (${'ORD_' + Date.now()}, 'BTCUSDT', 'BUY', 'LIMIT', 0.1, 44500.00, 'FILLED')
  RETURNING *
`;
console.log('✅ Ordre créé:', ordre[0]);

// Exemple 3: Ajouter des actifs du portefeuille
console.log('\n💰 Ajout d\'actifs au portefeuille...');
const actifs = [
  { asset: 'USDT', free: 1000, locked: 500, total: 1500, usd_value: 1500, percentage: 60 },
  { asset: 'BTC', free: 0.02, locked: 0.005, total: 0.025, usd_value: 1125, percentage: 45 }
];

for (const actif of actifs) {
  const result = await sql`
    INSERT INTO portfolio (asset, free, locked, total, usd_value, percentage)
    VALUES (${actif.asset}, ${actif.free}, ${actif.locked}, ${actif.total}, ${actif.usd_value}, ${actif.percentage})
    ON CONFLICT (asset) 
    DO UPDATE SET 
      free = EXCLUDED.free,
      locked = EXCLUDED.locked,
      total = EXCLUDED.total,
      usd_value = EXCLUDED.usd_value,
      percentage = EXCLUDED.percentage,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  console.log(`✅ ${actif.asset} ajouté:`, result[0]);
}

// Exemple 4: Ajouter des données de marché
console.log('\n📊 Ajout de données de marché...');
const donneesMarche = await sql`
  INSERT INTO market_data (symbol, price, change_24h, volume_24h, high_24h, low_24h)
  VALUES ('BTCUSDT', 45200.00, 2.35, 25000000, 46000.00, 44500.00)
  RETURNING *
`;
console.log('✅ Données de marché ajoutées:', donneesMarche[0]);

// Exemple 5: Ajouter un log d'activité
console.log('\n📝 Ajout d\'un log d\'activité...');
const logActivite = await sql`
  INSERT INTO activity_logs (action, description, data)
  VALUES ('QUICK_START', 'Démarrage rapide exécuté', ${{timestamp: new Date().toISOString()}})
  RETURNING *
`;
console.log('✅ Log ajouté:', logActivite[0]);

// ========================================
// ÉTAPE 3: Lire les données
// ========================================

console.log('\n📋 ÉTAPE 3: Lecture des données...');

// Lire toutes les positions
const positions = await sql`SELECT * FROM positions ORDER BY created_at DESC LIMIT 5`;
console.log(`\n📊 Positions (${positions.length}):`);
positions.forEach(pos => {
  console.log(`   - ${pos.symbol} ${pos.position_side}: ${pos.size} (PnL: $${pos.unrealized_pnl})`);
});

// Lire le portefeuille
const portefeuille = await sql`SELECT * FROM portfolio ORDER BY usd_value DESC`;
console.log(`\n💰 Portefeuille (${portefeuille.length} actifs):`);
let totalValue = 0;
portefeuille.forEach(asset => {
  console.log(`   - ${asset.asset}: ${asset.total} (≈ $${asset.usd_value})`);
  totalValue += parseFloat(asset.usd_value) || 0;
});
console.log(`   💰 Valeur totale: $${totalValue.toFixed(2)}`);

// Lire les ordres récents
const ordres = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 3`;
console.log(`\n📈 Ordres récents (${ordres.length}):`);
ordres.forEach(order => {
  console.log(`   - ${order.symbol} ${order.side} ${order.status}: ${order.quantity} @ $${order.price || 'Market'}`);
});

// Lire les logs d'activité récents
const logs = await sql`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 3`;
console.log(`\n📝 Activité récente (${logs.length}):`);
logs.forEach(log => {
  console.log(`   - [${new Date(log.created_at).toLocaleTimeString()}] ${log.action}: ${log.description}`);
});

// ========================================
// ÉTAPE 4: Statistiques rapides
// ========================================

console.log('\n📈 ÉTAPE 4: Statistiques rapides...');

const stats = await sql`
  SELECT 
    (SELECT COUNT(*) FROM positions) as total_positions,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM portfolio WHERE total > 0) as active_assets,
    (SELECT SUM(usd_value) FROM portfolio) as total_portfolio_value,
    (SELECT SUM(unrealized_pnl) FROM positions) as total_unrealized_pnl
`;

const stat = stats[0];
console.log('📊 Résumé de votre compte:');
console.log(`   Positions ouvertes: ${stat.total_positions}`);
console.log(`   Ordres total: ${stat.total_orders}`);
console.log(`   Actifs actifs: ${stat.active_assets}`);
console.log(`   Valeur du portefeuille: $${parseFloat(stat.total_portfolio_value || 0).toFixed(2)}`);
console.log(`   PnL non réalisé: $${parseFloat(stat.total_unrealized_pnl || 0).toFixed(2)}`);

// ========================================
// ÉTAPE 5: Prochaines étapes
// ========================================

console.log('\n🎉 === FÉLICITATIONS ! VOTRE BASE DE DONNÉES EST OPÉRATIONNELLE ===');
console.log('\n🚀 Prochaines étapes recommandées:');
console.log('\n1. 🌐 Interface Web:');
console.log('   - Démarrez votre serveur: npm run dev');
console.log('   - Visitez: http://localhost:3000');
console.log('   - Ajoutez le composant DatabaseDashboard à votre page');

console.log('\n2. 📚 Approfondissement:');
console.log('   - Lisez le guide: GUIDE_UTILISATION_DB.md');
console.log('   - Explorez les exemples: examples/database-usage.js');
console.log('   - Consultez le schéma: database/schema.sql');

console.log('\n3. 🔄 Intégration API BingX:');
console.log('   - Connectez vos vraies données BingX');
console.log('   - Configurez la synchronisation automatique');
console.log('   - Activez les alertes et notifications');

console.log('\n4. 🛠️ Fonctionnalités avancées:');
console.log('   - Configurez les stratégies de trading automatisées');
console.log('   - Ajoutez des indicateurs techniques');
console.log('   - Créez des rapports de performance');

console.log('\n💡 Conseils:');
console.log('   - Sauvegardez régulièrement vos données importantes');
console.log('   - Surveillez les logs d\'activité pour détecter les problèmes');
console.log('   - Utilisez les fonctions de nettoyage pour maintenir les performances');

console.log('\n✨ Votre plateforme de trading BingX est maintenant prête !');
console.log('🔗 Documentation complète: https://docs.bingx.com');
