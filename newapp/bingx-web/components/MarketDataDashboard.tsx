import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FireIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface MarketDataDashboardProps {
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
}

interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  count: number;
}

interface DepthData {
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

interface RecentTrade {
  id: string;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

interface FundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice?: string;
}

const MarketDataDashboard: React.FC<MarketDataDashboardProps> = ({ 
  selectedSymbol = 'BTC-USDT', 
  onSymbolSelect 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'depth' | 'trades' | 'funding'>('overview');
  const [loading, setLoading] = useState({ ticker: false, depth: false, trades: false, funding: false });
  const [error, setError] = useState<string | null>(null);

  // États des données
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [topSymbols, setTopSymbols] = useState<TickerData[]>([]);

  // Récupérer les données ticker
  const fetchTickerData = useCallback(async (symbol: string) => {
    setLoading(prev => ({ ...prev, ticker: true }));
    try {
      const response = await fetch(`/api/market/ticker?symbol=${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        setTickerData(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError(`Erreur ticker: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(prev => ({ ...prev, ticker: false }));
    }
  }, []);

  // Récupérer la profondeur de marché
  const fetchDepthData = useCallback(async (symbol: string) => {
    setLoading(prev => ({ ...prev, depth: true }));
    try {
      const response = await fetch(`/api/market/depth?symbol=${symbol}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setDepthData(data.data);
      }
    } catch (error) {
      console.error('Erreur profondeur:', error);
    } finally {
      setLoading(prev => ({ ...prev, depth: false }));
    }
  }, []);

  // Récupérer les transactions récentes
  const fetchRecentTrades = useCallback(async (symbol: string) => {
    setLoading(prev => ({ ...prev, trades: true }));
    try {
      const response = await fetch(`/api/market/trades?symbol=${symbol}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setRecentTrades(data.data.slice(0, 20)); // Limiter à 20 transactions
      }
    } catch (error) {
      console.error('Erreur transactions:', error);
    } finally {
      setLoading(prev => ({ ...prev, trades: false }));
    }
  }, []);

  // Récupérer les taux de financement
  const fetchFundingRates = useCallback(async () => {
    setLoading(prev => ({ ...prev, funding: true }));
    try {
      const response = await fetch('/api/market/funding-rate?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setFundingRates(data.data);
      }
    } catch (error) {
      console.error('Erreur taux de financement:', error);
    } finally {
      setLoading(prev => ({ ...prev, funding: false }));
    }
  }, []);

  // Récupérer le top des symboles
  const fetchTopSymbols = useCallback(async () => {
    try {
      const response = await fetch('/api/market/ticker');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Trier par volume et prendre les 10 premiers
        const sortedByVolume = data.data
          .filter((ticker: TickerData) => ticker.symbol.includes('USDT'))
          .sort((a: TickerData, b: TickerData) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 10);
        setTopSymbols(sortedByVolume);
      }
    } catch (error) {
      console.error('Erreur top symboles:', error);
    }
  }, []);

  useEffect(() => {
    fetchTickerData(selectedSymbol);
    fetchDepthData(selectedSymbol);
    fetchRecentTrades(selectedSymbol);
    fetchFundingRates();
    fetchTopSymbols();
  }, [selectedSymbol, fetchTickerData, fetchDepthData, fetchRecentTrades, fetchFundingRates, fetchTopSymbols]);

  useEffect(() => {
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchTickerData(selectedSymbol);
      if (activeTab === 'depth') fetchDepthData(selectedSymbol);
      if (activeTab === 'trades') fetchRecentTrades(selectedSymbol);
      if (activeTab === 'funding') fetchFundingRates();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSymbol, activeTab, fetchTickerData, fetchDepthData, fetchRecentTrades, fetchFundingRates]);

  const formatPrice = (price: string) => parseFloat(price).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toFixed(2);
  };

  const priceChangeColor = (change: string) => 
    parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Données de Marché - {selectedSymbol}
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de symbole rapide */}
          <select
            value={selectedSymbol}
            onChange={(e) => onSymbolSelect?.(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            {topSymbols.map(symbol => (
              <option key={symbol.symbol} value={symbol.symbol}>
                {symbol.symbol}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              fetchTickerData(selectedSymbol);
              fetchDepthData(selectedSymbol);
              fetchRecentTrades(selectedSymbol);
              fetchFundingRates();
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Vue d'ensemble rapide */}
      {tickerData && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Prix Actuel</p>
            <p className="text-2xl font-bold text-white">${formatPrice(tickerData.lastPrice)}</p>
            <p className={`text-sm flex items-center gap-1 ${priceChangeColor(tickerData.priceChange)}`}>
              {parseFloat(tickerData.priceChange) >= 0 ? 
                <ArrowTrendingUpIcon className="h-4 w-4" /> : 
                <ArrowTrendingDownIcon className="h-4 w-4" />
              }
              {tickerData.priceChangePercent}%
            </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Volume 24h</p>
            <p className="text-lg font-semibold text-cyan-400">{formatVolume(tickerData.volume)}</p>
            <p className="text-xs text-gray-400">≈ ${formatVolume(tickerData.quoteVolume)}</p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Haut 24h</p>
            <p className="text-lg font-semibold text-green-400">${formatPrice(tickerData.highPrice)}</p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Bas 24h</p>
            <p className="text-lg font-semibold text-red-400">${formatPrice(tickerData.lowPrice)}</p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: '📊 Vue d\'ensemble', icon: ChartBarIcon },
          { id: 'depth', label: '📈 Profondeur', icon: ArrowTrendingUpIcon },
          { id: 'trades', label: '🔄 Transactions', icon: ArrowPathIcon },
          { id: 'funding', label: '💰 Financement', icon: CurrencyDollarIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movers */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FireIcon className="h-5 w-5 mr-2 text-orange-400" />
              Top Volume
            </h4>
            <div className="space-y-2">
              {topSymbols.slice(0, 8).map(symbol => (
                <div key={symbol.symbol} className="flex justify-between items-center p-2 hover:bg-gray-600/50 rounded cursor-pointer"
                     onClick={() => onSymbolSelect?.(symbol.symbol)}>
                  <div>
                    <p className="font-semibold">{symbol.symbol}</p>
                    <p className="text-sm text-gray-400">${formatPrice(symbol.lastPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${priceChangeColor(symbol.priceChange)}`}>
                      {symbol.priceChangePercent}%
                    </p>
                    <p className="text-sm text-gray-400">{formatVolume(symbol.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Statistiques du Marché</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Symboles actifs:</span>
                <span className="text-white font-semibold">{topSymbols.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volume total:</span>
                <span className="text-cyan-400 font-semibold">
                  ${formatVolume(topSymbols.reduce((sum, s) => sum + parseFloat(s.quoteVolume), 0).toString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hausse/Baisse:</span>
                <span className="text-white">
                  <span className="text-green-400">{topSymbols.filter(s => parseFloat(s.priceChange) > 0).length}</span>
                  /
                  <span className="text-red-400">{topSymbols.filter(s => parseFloat(s.priceChange) < 0).length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'depth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading.depth ? (
            <div className="col-span-2 text-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : depthData ? (
            <>
              {/* Ordres de vente (asks) */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-red-400">Ordres de Vente</h4>
                <div className="space-y-1">
                  {depthData.asks.slice(0, 10).reverse().map((ask, index) => (
                    <div key={index} className="flex justify-between p-2 hover:bg-red-900/20 rounded">
                      <span className="text-red-400">${formatPrice(ask[0])}</span>
                      <span className="text-gray-300">{parseFloat(ask[1]).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ordres d'achat (bids) */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-green-400">Ordres d'Achat</h4>
                <div className="space-y-1">
                  {depthData.bids.slice(0, 10).map((bid, index) => (
                    <div key={index} className="flex justify-between p-2 hover:bg-green-900/20 rounded">
                      <span className="text-green-400">${formatPrice(bid[0])}</span>
                      <span className="text-gray-300">{parseFloat(bid[1]).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-400">
              Aucune donnée de profondeur disponible
            </div>
          )}
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Transactions Récentes
          </h4>
          {loading.trades ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : recentTrades.length > 0 ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {recentTrades.map((trade, index) => (
                <div key={trade.id || index} className="flex justify-between items-center p-2 hover:bg-gray-600/50 rounded">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${trade.isBuyerMaker ? 'bg-red-400' : 'bg-green-400'}`}></span>
                    <span className={trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}>
                      ${formatPrice(trade.price)}
                    </span>
                  </div>
                  <span className="text-gray-300">{parseFloat(trade.qty).toFixed(4)}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(trade.time).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Aucune transaction récente
            </div>
          )}
        </div>
      )}

      {activeTab === 'funding' && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Taux de Financement
          </h4>
          {loading.funding ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : fundingRates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fundingRates.map((rate, index) => (
                <div key={rate.symbol || index} className="bg-gray-600/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-cyan-400">{rate.symbol}</span>
                    <span className={`font-semibold ${parseFloat(rate.fundingRate) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(parseFloat(rate.fundingRate) * 100).toFixed(4)}%
                    </span>
                  </div>
                  {rate.markPrice && (
                    <div className="text-sm text-gray-400">
                      Prix de marque: ${formatPrice(rate.markPrice)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(rate.fundingTime).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Aucun taux de financement disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketDataDashboard;
