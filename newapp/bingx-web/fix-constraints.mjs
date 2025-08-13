// Script pour ajouter les contraintes manquantes
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

console.log('🔧 Ajout des contraintes uniques manquantes...\n');

try {
  // Ajouter contrainte unique pour positions
  console.log('📊 Ajout contrainte unique positions (symbol, position_side)...');
  try {
    await sql`
      ALTER TABLE positions 
      ADD CONSTRAINT unique_position_symbol_side 
      UNIQUE (symbol, position_side)
    `;
    console.log('✅ Contrainte positions ajoutée');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Contrainte positions existe déjà');
    } else {
      throw error;
    }
  }

  // Ajouter contrainte unique pour portfolio
  console.log('\n💰 Ajout contrainte unique portfolio (asset)...');
  try {
    await sql`
      ALTER TABLE portfolio 
      ADD CONSTRAINT unique_portfolio_asset 
      UNIQUE (asset)
    `;
    console.log('✅ Contrainte portfolio ajoutée');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Contrainte portfolio existe déjà');
    } else {
      throw error;
    }
  }

  // Vérifier les contraintes
  console.log('\n🔍 Vérification des contraintes créées...');
  const constraints = await sql`
    SELECT 
        tc.constraint_name, 
        tc.table_name, 
        tc.constraint_type,
        kcu.column_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public' 
      AND tc.constraint_type = 'UNIQUE'
      AND tc.table_name IN ('positions', 'portfolio', 'orders')
    ORDER BY tc.table_name, tc.constraint_name
  `;

  console.log('📋 Contraintes uniques présentes:');
  constraints.forEach(constraint => {
    console.log(`   - ${constraint.table_name}.${constraint.column_name} (${constraint.constraint_name})`);
  });

  console.log('\n🎉 Contraintes ajoutées avec succès !');
  console.log('💡 Vous pouvez maintenant relancer quick-start.mjs');

} catch (error) {
  console.error('❌ Erreur lors de l\'ajout des contraintes:', error.message);
}
