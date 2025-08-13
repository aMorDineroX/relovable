import sql from '../lib/database';

// Types pour les données de trading
export interface Position {
  id?: number;
  symbol: string;
  position_side: 'LONG' | 'SHORT';
  size: number;
  entry_price: number;
  mark_price?: number;
  unrealized_pnl?: number;
  percentage?: number;
  margin?: number;
  leverage?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Order {
  id?: number;
  order_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  quantity: number;
  price?: number;
  status: string;
  executed_qty?: number;
  executed_price?: number;
  commission?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PortfolioAsset {
  id?: number;
  asset: string;
  free: number;
  locked: number;
  total: number;
  usd_value?: number;
  percentage?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MarketData {
  id?: number;
  symbol: string;
  price: number;
  change_24h?: number;
  volume_24h?: number;
  high_24h?: number;
  low_24h?: number;
  funding_rate?: number;
  open_interest?: number;
  created_at?: Date;
}

// Fonctions pour les positions
export async function savePosition(position: Position) {
  const result = await sql`
    INSERT INTO positions (
      symbol, position_side, size, entry_price, mark_price, 
      unrealized_pnl, percentage, margin, leverage
    ) VALUES (
      ${position.symbol}, ${position.position_side}, ${position.size}, 
      ${position.entry_price}, ${position.mark_price}, ${position.unrealized_pnl}, 
      ${position.percentage}, ${position.margin}, ${position.leverage}
    )
    ON CONFLICT (symbol, position_side) 
    DO UPDATE SET 
      size = EXCLUDED.size,
      mark_price = EXCLUDED.mark_price,
      unrealized_pnl = EXCLUDED.unrealized_pnl,
      percentage = EXCLUDED.percentage,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

export async function getPositions() {
  return await sql`
    SELECT * FROM positions 
    ORDER BY created_at DESC
  `;
}

export async function deletePosition(symbol: string, side: string) {
  return await sql`
    DELETE FROM positions 
    WHERE symbol = ${symbol} AND position_side = ${side}
  `;
}

// Fonctions pour les ordres
export async function saveOrder(order: Order) {
  const result = await sql`
    INSERT INTO orders (
      order_id, symbol, side, type, quantity, price, status, 
      executed_qty, executed_price, commission
    ) VALUES (
      ${order.order_id}, ${order.symbol}, ${order.side}, ${order.type}, 
      ${order.quantity}, ${order.price}, ${order.status}, 
      ${order.executed_qty}, ${order.executed_price}, ${order.commission}
    )
    ON CONFLICT (order_id) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      executed_qty = EXCLUDED.executed_qty,
      executed_price = EXCLUDED.executed_price,
      commission = EXCLUDED.commission,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

export async function getOrders(limit = 50) {
  return await sql`
    SELECT * FROM orders 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
}

export async function getOrdersBySymbol(symbol: string, limit = 20) {
  return await sql`
    SELECT * FROM orders 
    WHERE symbol = ${symbol}
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
}

// Fonctions pour le portefeuille
export async function savePortfolioAsset(asset: PortfolioAsset) {
  const result = await sql`
    INSERT INTO portfolio (
      asset, free, locked, total, usd_value, percentage
    ) VALUES (
      ${asset.asset}, ${asset.free}, ${asset.locked}, 
      ${asset.total}, ${asset.usd_value}, ${asset.percentage}
    )
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
  return result[0];
}

export async function getPortfolio() {
  return await sql`
    SELECT * FROM portfolio 
    WHERE total > 0
    ORDER BY usd_value DESC NULLS LAST
  `;
}

// Fonctions pour les données de marché
export async function saveMarketData(data: MarketData) {
  const result = await sql`
    INSERT INTO market_data (
      symbol, price, change_24h, volume_24h, high_24h, 
      low_24h, funding_rate, open_interest
    ) VALUES (
      ${data.symbol}, ${data.price}, ${data.change_24h}, 
      ${data.volume_24h}, ${data.high_24h}, ${data.low_24h}, 
      ${data.funding_rate}, ${data.open_interest}
    )
    RETURNING *
  `;
  return result[0];
}

export async function getLatestMarketData(symbol?: string) {
  if (symbol) {
    return await sql`
      SELECT * FROM market_data 
      WHERE symbol = ${symbol}
      ORDER BY created_at DESC 
      LIMIT 1
    `;
  }
  
  return await sql`
    SELECT DISTINCT ON (symbol) * FROM market_data 
    ORDER BY symbol, created_at DESC
  `;
}

// Fonctions pour les logs d'activité
export async function logActivity(action: string, description?: string, data?: any) {
  const result = await sql`
    INSERT INTO activity_logs (action, description, data)
    VALUES (${action}, ${description}, ${JSON.stringify(data)})
    RETURNING *
  `;
  return result[0];
}

export async function getActivityLogs(limit = 100) {
  return await sql`
    SELECT * FROM activity_logs 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
}

// Fonction pour nettoyer les anciennes données
export async function cleanOldData(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  // Nettoyer les données de marché anciennes
  await sql`
    DELETE FROM market_data 
    WHERE created_at < ${cutoffDate.toISOString()}
  `;
  
  // Nettoyer les logs d'activité anciens
  await sql`
    DELETE FROM activity_logs 
    WHERE created_at < ${cutoffDate.toISOString()}
  `;
  
  await logActivity('CLEANUP', `Données plus anciennes que ${daysToKeep} jours supprimées`);
}
