-- Schema pour l'application BingX Trading Dashboard

-- Table pour stocker les informations des positions ouvertes
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    position_side VARCHAR(10) NOT NULL, -- 'LONG' ou 'SHORT'
    size DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 8) NOT NULL,
    mark_price DECIMAL(20, 8),
    unrealized_pnl DECIMAL(20, 8),
    percentage DECIMAL(10, 4),
    margin DECIMAL(20, 8),
    leverage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour stocker l'historique des ordres
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'BUY' ou 'SELL'
    type VARCHAR(20) NOT NULL, -- 'MARKET', 'LIMIT', etc.
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),
    status VARCHAR(20) NOT NULL, -- 'FILLED', 'PENDING', 'CANCELLED'
    executed_qty DECIMAL(20, 8) DEFAULT 0,
    executed_price DECIMAL(20, 8),
    commission DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour stocker les données de balance/portefeuille
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
);

-- Table pour stocker les données de marché en temps réel
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
);

-- Table pour stocker les performances historiques
CREATE TABLE IF NOT EXISTS performance_history (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_balance DECIMAL(20, 8) NOT NULL,
    unrealized_pnl DECIMAL(20, 8),
    realized_pnl DECIMAL(20, 8),
    total_pnl DECIMAL(20, 8),
    return_percentage DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_asset ON portfolio(asset);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_history(date);

-- Table pour les alertes de trading
CREATE TABLE IF NOT EXISTS trading_alerts (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(20) NOT NULL, -- 'PRICE_TARGET', 'STOP_LOSS', 'TAKE_PROFIT'
    condition_type VARCHAR(10) NOT NULL, -- 'ABOVE', 'BELOW'
    target_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8),
    is_triggered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP
);

-- Table pour les stratégies de trading
CREATE TABLE IF NOT EXISTS trading_strategies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL, -- 'DCA', 'GRID', 'SCALPING'
    parameters JSONB NOT NULL, -- Paramètres de la stratégie en JSON
    is_active BOOLEAN DEFAULT TRUE,
    total_orders INTEGER DEFAULT 0,
    total_profit DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
