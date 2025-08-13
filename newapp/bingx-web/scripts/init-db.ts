import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
config({ path: '.env.local' });

// Initialiser la connexion avec la variable d'environnement
const sql = neon(process.env.DATABASE_URL!);

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Créer les tables une par une avec des requêtes littérales
    console.log('Création de la table positions...');
    await sql`
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        position_side VARCHAR(10) NOT NULL,
        size DECIMAL(20, 8) NOT NULL,
        entry_price DECIMAL(20, 8) NOT NULL,
        mark_price DECIMAL(20, 8),
        unrealized_pnl DECIMAL(20, 8),
        percentage DECIMAL(10, 4),
        margin DECIMAL(20, 8),
        leverage INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table orders...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        quantity DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8),
        status VARCHAR(20) NOT NULL,
        executed_qty DECIMAL(20, 8) DEFAULT 0,
        executed_price DECIMAL(20, 8),
        commission DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table portfolio...');
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        asset VARCHAR(10) NOT NULL,
        free DECIMAL(20, 8) NOT NULL,
        locked DECIMAL(20, 8) NOT NULL,
        total DECIMAL(20, 8) NOT NULL,
        usd_value DECIMAL(20, 8),
        percentage DECIMAL(10, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table market_data...');
    await sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        change_24h DECIMAL(10, 4),
        volume_24h DECIMAL(20, 8),
        high_24h DECIMAL(20, 8),
        low_24h DECIMAL(20, 8),
        funding_rate DECIMAL(10, 6),
        open_interest DECIMAL(20, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table performance_history...');
    await sql`
      CREATE TABLE IF NOT EXISTS performance_history (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        total_balance DECIMAL(20, 8) NOT NULL,
        unrealized_pnl DECIMAL(20, 8),
        realized_pnl DECIMAL(20, 8),
        total_pnl DECIMAL(20, 8),
        return_percentage DECIMAL(10, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table trading_alerts...');
    await sql`
      CREATE TABLE IF NOT EXISTS trading_alerts (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        alert_type VARCHAR(20) NOT NULL,
        condition_type VARCHAR(10) NOT NULL,
        target_price DECIMAL(20, 8) NOT NULL,
        current_price DECIMAL(20, 8),
        is_triggered BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        triggered_at TIMESTAMP
      )
    `;
    
    console.log('Création de la table trading_strategies...');
    await sql`
      CREATE TABLE IF NOT EXISTS trading_strategies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        strategy_type VARCHAR(50) NOT NULL,
        parameters JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        total_orders INTEGER DEFAULT 0,
        total_profit DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Création de la table activity_logs...');
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Créer les index
    console.log('Création des index...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_asset ON portfolio(asset)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_history(date)`;
      console.log('✅ Index créés avec succès');
    } catch (error: any) {
      console.log(`⚠️ Certains index existent déjà: ${error?.message || 'Erreur inconnue'}`);
    }
    
    console.log('✅ Base de données initialisée avec succès !');
    
    // Tester la connexion
    const result = await sql`SELECT version()`;
    console.log('📊 Version PostgreSQL:', result[0].version);
    
    // Compter les tables créées
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log(`📋 Tables créées: ${tables.length}`);
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
