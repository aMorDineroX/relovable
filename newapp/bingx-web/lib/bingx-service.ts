// Service pour l'API BingX
import crypto from 'crypto';

interface BingXConfig {
  apiKey: string;
  secretKey: string;
  baseURL: string;
}

interface BingXTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BingXDepth {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BingXTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
}

export class BingXService {
  private config: BingXConfig;

  constructor() {
    this.config = {
      apiKey: process.env.API_KEY || '',
      secretKey: process.env.SECRET_KEY || '',
      baseURL: 'https://open-api.bingx.com'
    };
  }

  private generateSignature(queryString: string, timestamp: number): string {
    const dataToSign = timestamp + 'GET' + '/openApi/spot/v1/ticker/24hr' + queryString;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(dataToSign)
      .digest('hex');
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now();
    const queryString = new URLSearchParams(params).toString();
    
    const headers: Record<string, string> = {
      'X-BX-APIKEY': this.config.apiKey,
      'Content-Type': 'application/json'
    };

    // Pour les endpoints qui nécessitent une signature
    if (endpoint.includes('ticker') || endpoint.includes('depth') || endpoint.includes('trades')) {
      const signature = this.generateSignature(queryString, timestamp);
      headers['X-BX-TIMESTAMP'] = timestamp.toString();
      headers['X-BX-SIGN'] = signature;
    }

    const url = `${this.config.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('BingX API Error:', error);
      throw error;
    }
  }

  // Obtenir le ticker pour un symbole spécifique
  async getTicker(symbol: string): Promise<BingXTicker> {
    try {
      const response = await this.makeRequest('/openApi/spot/v1/ticker/24hr', { symbol });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}:`, error);
      throw error;
    }
  }

  // Obtenir tous les tickers
  async getAllTickers(): Promise<BingXTicker[]> {
    try {
      const response = await this.makeRequest('/openApi/spot/v1/ticker/24hr');
      return Array.isArray(response.data) ? response.data : response;
    } catch (error) {
      console.error('Error fetching all tickers:', error);
      throw error;
    }
  }

  // Obtenir le carnet d'ordres
  async getDepth(symbol: string, limit: number = 100): Promise<BingXDepth> {
    try {
      const response = await this.makeRequest('/openApi/spot/v1/depth', { 
        symbol, 
        limit: Math.min(limit, 1000) 
      });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching depth for ${symbol}:`, error);
      throw error;
    }
  }

  // Obtenir l'historique des trades récents
  async getRecentTrades(symbol: string, limit: number = 500): Promise<BingXTrade[]> {
    try {
      const response = await this.makeRequest('/openApi/spot/v1/trades', { 
        symbol, 
        limit: Math.min(limit, 1000) 
      });
      return Array.isArray(response.data) ? response.data : response;
    } catch (error) {
      console.error(`Error fetching trades for ${symbol}:`, error);
      throw error;
    }
  }

  // Obtenir les données de prix pour les graphiques
  async getKlineData(
    symbol: string, 
    interval: string = '1m', 
    limit: number = 500
  ): Promise<any[]> {
    try {
      const response = await this.makeRequest('/openApi/spot/v1/klines', {
        symbol,
        interval,
        limit: Math.min(limit, 1000)
      });
      return Array.isArray(response.data) ? response.data : response;
    } catch (error) {
      console.error(`Error fetching kline data for ${symbol}:`, error);
      throw error;
    }
  }

  // Convertir les données BingX vers notre format interne
  convertTickerToInternal(bingxTicker: BingXTicker) {
    return {
      symbol: bingxTicker.symbol,
      lastPrice: bingxTicker.lastPrice,
      priceChange: bingxTicker.priceChange,
      priceChangePercent: bingxTicker.priceChangePercent,
      volume: bingxTicker.volume,
      quoteVolume: bingxTicker.quoteVolume,
      highPrice: bingxTicker.highPrice,
      lowPrice: bingxTicker.lowPrice,
      openPrice: bingxTicker.openPrice,
      count: bingxTicker.count,
      weightedAvgPrice: bingxTicker.weightedAvgPrice
    };
  }

  convertDepthToInternal(bingxDepth: BingXDepth) {
    return {
      bids: bingxDepth.bids,
      asks: bingxDepth.asks,
      timestamp: Date.now()
    };
  }

  convertTradesToInternal(bingxTrades: BingXTrade[]) {
    return bingxTrades.map(trade => ({
      id: trade.id.toString(),
      price: trade.price,
      qty: trade.qty,
      time: trade.time,
      isBuyerMaker: trade.isBuyerMaker
    }));
  }
}

// Instance singleton
export const bingxService = new BingXService();
