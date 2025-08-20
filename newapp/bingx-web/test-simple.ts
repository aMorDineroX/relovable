#!/usr/bin/env tsx

// Script de test simple pour vérifier la connexion
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

console.log('🔍 Test des variables d\'environnement...');
console.log('DATABASE_URL présente:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL trouvée');
  
  try {
    console.log('🚀 Test de connexion...');
    
    // Import dynamique pour éviter les problèmes d'initialisation
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connexion réussie !', result);
    
    // Test d'insertion simple
    console.log('📊 Test d\'insertion d\'une position...');
    
    const position = await sql`
      INSERT INTO positions (symbol, position_side, size, entry_price, mark_price, unrealized_pnl)
      VALUES ('TESTUSDT', 'LONG', 1.0, 100.0, 101.0, 1.0)
      RETURNING *
    `;
    
    console.log('✅ Position créée:', position[0]);
    
    // Nettoyer le test
    await sql`DELETE FROM positions WHERE symbol = 'TESTUSDT'`;
    console.log('🧹 Test nettoyé');
    
    console.log('🎉 Tous les tests réussis ! La base de données fonctionne parfaitement.');
    
  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : String(error));
  }
} else {
  console.error('❌ DATABASE_URL non trouvée dans les variables d\'environnement');
}
