import { 
  savePosition, 
  saveOrder, 
  savePortfolioAsset, 
  saveMarketData, 
  logActivity,
  Position,
  Order,
  PortfolioAsset,
  MarketData
} from './db-utils';

// Service pour synchroniser les données BingX avec la base de données
export class DataSyncService {
  
  // Synchroniser les positions
  static async syncPositions(positionsData: any[]) {
    try {
      await logActivity('SYNC_START', 'Début de synchronisation des positions');
      
      const savedPositions = [];
      for (const pos of positionsData) {
        const position: Position = {
          symbol: pos.symbol,
          position_side: pos.positionSide,
          size: parseFloat(pos.positionAmt || '0'),
          entry_price: parseFloat(pos.entryPrice || '0'),
          mark_price: parseFloat(pos.markPrice || '0'),
          unrealized_pnl: parseFloat(pos.unRealizedProfit || '0'),
          percentage: parseFloat(pos.percentage || '0'),
          margin: parseFloat(pos.isolatedMargin || '0'),
          leverage: parseInt(pos.leverage || '1')
        };
        
        const saved = await savePosition(position);
        savedPositions.push(saved);
      }
      
      await logActivity('SYNC_COMPLETE', `${savedPositions.length} positions synchronisées`, { count: savedPositions.length });
      return savedPositions;
      
    } catch (error: any) {
      await logActivity('SYNC_ERROR', 'Erreur lors de la synchronisation des positions', { error: error?.message || 'Erreur inconnue' });
      throw error;
    }
  }
  
  // Synchroniser les ordres
  static async syncOrders(ordersData: any[]) {
    try {
      await logActivity('SYNC_START', 'Début de synchronisation des ordres');
      
      const savedOrders = [];
      for (const ord of ordersData) {
        const order: Order = {
          order_id: ord.orderId || ord.clientOrderId,
          symbol: ord.symbol,
          side: ord.side,
          type: ord.type,
          quantity: parseFloat(ord.origQty || ord.quantity || '0'),
          price: parseFloat(ord.price || '0'),
          status: ord.status,
          executed_qty: parseFloat(ord.executedQty || '0'),
          executed_price: parseFloat(ord.avgPrice || ord.executedPrice || '0'),
          commission: parseFloat(ord.commission || '0')
        };
        
        const saved = await saveOrder(order);
        savedOrders.push(saved);
      }
      
      await logActivity('SYNC_COMPLETE', `${savedOrders.length} ordres synchronisés`, { count: savedOrders.length });
      return savedOrders;
      
    } catch (error: any) {
      await logActivity('SYNC_ERROR', 'Erreur lors de la synchronisation des ordres', { error: error?.message || 'Erreur inconnue' });
      throw error;
    }
  }
  
  // Synchroniser le portefeuille
  static async syncPortfolio(balanceData: any[]) {
    try {
      await logActivity('SYNC_START', 'Début de synchronisation du portefeuille');
      
      const savedAssets = [];
      let totalUsdValue = 0;
      
      // Calculer la valeur totale d'abord
      for (const bal of balanceData) {
        const usdValue = parseFloat(bal.balance || '0') * parseFloat(bal.price || '1');
        totalUsdValue += usdValue;
      }
      
      for (const bal of balanceData) {
        const total = parseFloat(bal.balance || '0');
        const free = parseFloat(bal.availableBalance || bal.balance || '0');
        const locked = total - free;
        const usdValue = total * parseFloat(bal.price || '1');
        const percentage = totalUsdValue > 0 ? (usdValue / totalUsdValue) * 100 : 0;
        
        const asset: PortfolioAsset = {
          asset: bal.asset,
          free,
          locked,
          total,
          usd_value: usdValue,
          percentage
        };
        
        if (total > 0) { // Ne sauvegarder que les assets avec un solde > 0
          const saved = await savePortfolioAsset(asset);
          savedAssets.push(saved);
        }
      }
      
      await logActivity('SYNC_COMPLETE', `${savedAssets.length} assets du portefeuille synchronisés`, { 
        count: savedAssets.length, 
        totalValue: totalUsdValue 
      });
      return savedAssets;
      
    } catch (error: any) {
      await logActivity('SYNC_ERROR', 'Erreur lors de la synchronisation du portefeuille', { error: error?.message || 'Erreur inconnue' });
      throw error;
    }
  }
  
  // Synchroniser les données de marché
  static async syncMarketData(marketData: any[]) {
    try {
      await logActivity('SYNC_START', 'Début de synchronisation des données de marché');
      
      const savedData = [];
      for (const data of marketData) {
        const market: MarketData = {
          symbol: data.symbol,
          price: parseFloat(data.price || data.lastPrice || '0'),
          change_24h: parseFloat(data.priceChangePercent || data.change24h || '0'),
          volume_24h: parseFloat(data.volume || data.volume24h || '0'),
          high_24h: parseFloat(data.high || data.high24h || '0'),
          low_24h: parseFloat(data.low || data.low24h || '0'),
          funding_rate: parseFloat(data.fundingRate || '0'),
          open_interest: parseFloat(data.openInterest || '0')
        };
        
        const saved = await saveMarketData(market);
        savedData.push(saved);
      }
      
      await logActivity('SYNC_COMPLETE', `${savedData.length} données de marché synchronisées`, { count: savedData.length });
      return savedData;
      
    } catch (error: any) {
      await logActivity('SYNC_ERROR', 'Erreur lors de la synchronisation des données de marché', { error: error?.message || 'Erreur inconnue' });
      throw error;
    }
  }
  
  // Synchronisation complète
  static async fullSync(apiData: {
    positions?: any[],
    orders?: any[],
    balance?: any[],
    market?: any[]
  }) {
    try {
      await logActivity('FULL_SYNC_START', 'Début de synchronisation complète');
      
      const results = {
        positions: [] as any[],
        orders: [] as any[],
        portfolio: [] as any[],
        market: [] as any[]
      };
      
      if (apiData.positions?.length) {
        results.positions = await this.syncPositions(apiData.positions);
      }
      
      if (apiData.orders?.length) {
        results.orders = await this.syncOrders(apiData.orders);
      }
      
      if (apiData.balance?.length) {
        results.portfolio = await this.syncPortfolio(apiData.balance);
      }
      
      if (apiData.market?.length) {
        results.market = await this.syncMarketData(apiData.market);
      }
      
      await logActivity('FULL_SYNC_COMPLETE', 'Synchronisation complète terminée', results);
      return results;
      
    } catch (error: any) {
      await logActivity('FULL_SYNC_ERROR', 'Erreur lors de la synchronisation complète', { error: error?.message || 'Erreur inconnue' });
      throw error;
    }
  }
}
