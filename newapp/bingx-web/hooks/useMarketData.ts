import { useState, useEffect, useCallback, useRef } from 'react';

// Types pour les données de marché
export interface MarketTicker {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  count: number;
  weightedAvgPrice?: string;
}

export interface MarketDepth {
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface MarketTrade {
  id: string;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

interface UseMarketDataOptions {
  symbol?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
  useMockData?: boolean; // Option pour basculer entre mock et vraies données
}

interface MarketDataState {
  ticker: MarketTicker | null;
  depth: MarketDepth | null;
  trades: MarketTrade[];
  allTickers: MarketTicker[];
  loading: {
    ticker: boolean;
    depth: boolean;
    trades: boolean;
    allTickers: boolean;
  };
  error: string | null;
  connected: boolean;
  lastUpdate: Date | null;
}

export function useMarketData(options: UseMarketDataOptions = {}) {
  const {
    symbol = 'BTC-USDT',
    autoRefresh = true,
    refreshInterval = 30000,
    enableWebSocket = false,
    useMockData = false
  } = options;

  const [state, setState] = useState<MarketDataState>({
    ticker: null,
    depth: null,
    trades: [],
    allTickers: [],
    loading: {
      ticker: false,
      depth: false,
      trades: false,
      allTickers: false
    },
    error: null,
    connected: false,
    lastUpdate: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // API calls vers nos endpoints Next.js
  const fetchFromAPI = useCallback(async (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`/api${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  }, []);

  // Fonctions pour générer des données mock (fallback)
  const generateMockTicker = useCallback((sym: string): MarketTicker => {
    const basePrice = sym.includes('BTC') ? 45000 : sym.includes('ETH') ? 2500 : Math.random() * 100 + 10;
    const change = (Math.random() - 0.5) * 0.1 * basePrice;
    
    return {
      symbol: sym,
      lastPrice: basePrice.toFixed(2),
      priceChange: change.toFixed(2),
      priceChangePercent: ((change / basePrice) * 100).toFixed(2),
      volume: (Math.random() * 100000).toFixed(2),
      quoteVolume: (Math.random() * 2000000000).toFixed(0),
      highPrice: (basePrice * (1 + Math.random() * 0.05)).toFixed(2),
      lowPrice: (basePrice * (1 - Math.random() * 0.05)).toFixed(2),
      openPrice: (basePrice * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2),
      count: Math.floor(Math.random() * 100000),
      weightedAvgPrice: (basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)
    };
  }, []);

  const generateMockDepth = useCallback((): MarketDepth => {
    const basePrice = 45000;
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];

    for (let i = 0; i < 20; i++) {
      const bidPrice = basePrice - (i + 1) * 10;
      const askPrice = basePrice + (i + 1) * 10;
      
      bids.push([
        bidPrice.toFixed(2),
        (Math.random() * 5).toFixed(4)
      ]);
      
      asks.push([
        askPrice.toFixed(2),
        (Math.random() * 5).toFixed(4)
      ]);
    }

    return {
      bids,
      asks,
      timestamp: Date.now()
    };
  }, []);

  const generateMockTrades = useCallback((count: number = 50): MarketTrade[] => {
    const trades: MarketTrade[] = [];
    const basePrice = 45000;

    for (let i = 0; i < count; i++) {
      const price = basePrice + (Math.random() - 0.5) * 1000;
      trades.push({
        id: (Date.now() + i).toString(),
        price: price.toFixed(2),
        qty: (Math.random() * 2).toFixed(4),
        time: Date.now() - i * 60000,
        isBuyerMaker: Math.random() > 0.5
      });
    }

    return trades.sort((a, b) => b.time - a.time);
  }, []);

  // Fetch ticker data
  const fetchTicker = useCallback(async (targetSymbol?: string) => {
    const sym = targetSymbol || symbol;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, ticker: true },
      error: null
    }));

    try {
      let ticker: MarketTicker;
      
      if (useMockData) {
        // Simuler un délai API
        await new Promise(resolve => setTimeout(resolve, 300));
        ticker = generateMockTicker(sym);
      } else {
        // Vraie API BingX
        ticker = await fetchFromAPI('/ticker', { symbol: sym });
      }
      
      setState(prev => ({
        ...prev,
        ticker,
        loading: { ...prev.loading, ticker: false },
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Error fetching ticker:', error);
      
      // Fallback vers données mock en cas d'erreur
      if (!useMockData) {
        console.log('Falling back to mock data for ticker');
        const ticker = generateMockTicker(sym);
        setState(prev => ({
          ...prev,
          ticker,
          loading: { ...prev.loading, ticker: false },
          error: `API Error (using mock data): ${error instanceof Error ? error.message : 'Unknown'}`,
          lastUpdate: new Date()
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, ticker: false },
          error: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      }
    }
  }, [symbol, useMockData, generateMockTicker, fetchFromAPI]);

  // Fetch depth data
  const fetchDepth = useCallback(async (targetSymbol?: string) => {
    const sym = targetSymbol || symbol;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, depth: true }
    }));

    try {
      let depth: MarketDepth;
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 200));
        depth = generateMockDepth();
      } else {
        depth = await fetchFromAPI('/depth', { symbol: sym, limit: '100' });
      }
      
      setState(prev => ({
        ...prev,
        depth,
        loading: { ...prev.loading, depth: false }
      }));
    } catch (error) {
      console.error('Error fetching depth:', error);
      
      // Fallback
      if (!useMockData) {
        const depth = generateMockDepth();
        setState(prev => ({
          ...prev,
          depth,
          loading: { ...prev.loading, depth: false },
          error: `API Error (using mock data): ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, depth: false },
          error: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      }
    }
  }, [symbol, useMockData, generateMockDepth, fetchFromAPI]);

  // Fetch trades data
  const fetchTrades = useCallback(async (targetSymbol?: string) => {
    const sym = targetSymbol || symbol;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, trades: true }
    }));

    try {
      let trades: MarketTrade[];
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 200));
        trades = generateMockTrades();
      } else {
        trades = await fetchFromAPI('/trades', { symbol: sym, limit: '500' });
      }
      
      setState(prev => ({
        ...prev,
        trades,
        loading: { ...prev.loading, trades: false }
      }));
    } catch (error) {
      console.error('Error fetching trades:', error);
      
      // Fallback
      if (!useMockData) {
        const trades = generateMockTrades();
        setState(prev => ({
          ...prev,
          trades,
          loading: { ...prev.loading, trades: false },
          error: `API Error (using mock data): ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, trades: false },
          error: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      }
    }
  }, [symbol, useMockData, generateMockTrades, fetchFromAPI]);

  // Fetch all tickers
  const fetchAllTickers = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, allTickers: true }
    }));

    try {
      let allTickers: MarketTicker[];
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const symbols = [
          'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'XRP-USDT',
          'SOL-USDT', 'DOT-USDT', 'DOGE-USDT', 'AVAX-USDT', 'MATIC-USDT',
          'LINK-USDT', 'UNI-USDT', 'LTC-USDT', 'BCH-USDT', 'ALGO-USDT',
          'VET-USDT', 'ICP-USDT', 'FIL-USDT', 'TRX-USDT', 'ETC-USDT'
        ];
        allTickers = symbols.map(generateMockTicker);
      } else {
        allTickers = await fetchFromAPI('/all-tickers');
      }
      
      setState(prev => ({
        ...prev,
        allTickers,
        loading: { ...prev.loading, allTickers: false }
      }));
    } catch (error) {
      console.error('Error fetching all tickers:', error);
      
      // Fallback
      if (!useMockData) {
        const symbols = [
          'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'XRP-USDT',
          'SOL-USDT', 'DOT-USDT', 'DOGE-USDT', 'AVAX-USDT', 'MATIC-USDT'
        ];
        const allTickers = symbols.map(generateMockTicker);
        setState(prev => ({
          ...prev,
          allTickers,
          loading: { ...prev.loading, allTickers: false },
          error: `API Error (using mock data): ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, allTickers: false },
          error: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      }
    }
  }, [useMockData, generateMockTicker, fetchFromAPI]);

  // Refresh all data
  const refreshAll = useCallback(() => {
    fetchTicker();
    fetchDepth();
    fetchTrades();
    fetchAllTickers();
  }, [fetchTicker, fetchDepth, fetchTrades, fetchAllTickers]);

  // WebSocket connection (simulation)
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || wsRef.current) return;

    try {
      // Simulation de WebSocket
      setState(prev => ({ ...prev, connected: true }));
      
      // Simuler des mises à jour en temps réel
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          ticker: prev.ticker ? {
            ...prev.ticker,
            lastPrice: (parseFloat(prev.ticker.lastPrice) + (Math.random() - 0.5) * 100).toFixed(2)
          } : null,
          lastUpdate: new Date()
        }));
      }, 2000);

      // Stocker l'interval comme référence WebSocket simulée
      wsRef.current = { close: () => clearInterval(interval) } as any;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        connected: false,
        error: `Erreur WebSocket: ${error instanceof Error ? error.message : 'Inconnu'}`
      }));
    }
  }, [enableWebSocket]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setState(prev => ({ ...prev, connected: false }));
    }
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(refreshAll, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshAll]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, [symbol]);

  // WebSocket setup
  useEffect(() => {
    if (enableWebSocket) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [enableWebSocket, connectWebSocket, disconnectWebSocket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    // Data
    ticker: state.ticker,
    depth: state.depth,
    trades: state.trades,
    allTickers: state.allTickers,
    
    // State
    loading: state.loading,
    error: state.error,
    connected: state.connected,
    lastUpdate: state.lastUpdate,
    
    // Actions
    fetchTicker,
    fetchDepth,
    fetchTrades,
    fetchAllTickers,
    refreshAll,
    connectWebSocket,
    disconnectWebSocket,
    
    // Utility functions
    formatPrice: (price: string | number) => 
      parseFloat(price.toString()).toLocaleString('fr-FR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }),
    
    formatVolume: (volume: string | number) => {
      const vol = parseFloat(volume.toString());
      if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`;
      if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
      if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
      return vol.toFixed(2);
    },
    
    getPriceChangeColor: (change: string | number) => 
      parseFloat(change.toString()) >= 0 ? 'text-green-400' : 'text-red-400'
  };
}
