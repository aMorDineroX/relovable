'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  BellIcon,
  BookmarkIcon,
  CalculatorIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface MarketDataDashboardProps {
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
  useMockData?: boolean;
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
  weightedAvgPrice?: string;
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

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

const EnhancedMarketDataDashboard: React.FC<MarketDataDashboardProps> = ({ 
  selectedSymbol = 'BTC-USDT', 
  onSymbolSelect,
  useMockData = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'depth' | 'trades' | 'funding' | 'alerts' | 'calculator'>('overview');
  const [loading, setLoading] = useState({ ticker: false, depth: false, trades: false, funding: false });
  const [error, setError] = useState<string | null>(null);
  
  // États des données
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [allSymbols, setAllSymbols] = useState<TickerData[]>([]);
  
  // États pour les nouvelles fonctionnalités
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price' | 'name'>('volume');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>(['BTC-USDT', 'ETH-USDT']);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({ price: '', condition: 'above' as 'above' | 'below' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  
  // État pour la calculatrice
  const [calculator, setCalculator] = useState({
    amount: '',
    fromAsset: 'BTC',
    toAsset: 'USDT',
    result: 0
  });

  // Simulation de données WebSocket
  const [wsConnected, setWsConnected] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{[key: string]: number[]}>({});

  // Récupérer les données ticker avec mise en cache
  const fetchTickerData = useCallback(async (symbol: string) => {
    setLoading(prev => ({ ...prev, ticker: true }));
    try {
      // Simulation d'appel API - à remplacer par votre vraie API
      const mockData: TickerData = {
        symbol: symbol,
        lastPrice: (45000 + Math.random() * 2000).toFixed(2),
        priceChange: (Math.random() * 200 - 100).toFixed(2),
        priceChangePercent: (Math.random() * 10 - 5).toFixed(2),
        volume: (Math.random() * 50000).toFixed(2),
        quoteVolume: (Math.random() * 2000000000).toFixed(0),
        openPrice: (44000 + Math.random() * 1000).toFixed(2),
        highPrice: (46000 + Math.random() * 1000).toFixed(2),
        lowPrice: (43000 + Math.random() * 1000).toFixed(2),
        count: Math.floor(Math.random() * 100000),
        weightedAvgPrice: (45200 + Math.random() * 500).toFixed(2)
      };
      
      setTickerData(mockData);
      
      // Mettre à jour l'historique des prix
      setPriceHistory(prev => ({
        ...prev,
        [symbol]: [...(prev[symbol] || []).slice(-49), parseFloat(mockData.lastPrice)]
      }));
      
    } catch (error) {
      setError(`Erreur ticker: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(prev => ({ ...prev, ticker: false }));
    }
  }, []);

  // Récupérer tous les symboles avec performance améliorée
  const fetchAllSymbols = useCallback(async () => {
    try {
      // Simulation de données - à remplacer par votre vraie API
      const mockSymbols: TickerData[] = [
        'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'XRP-USDT', 
        'SOL-USDT', 'DOT-USDT', 'DOGE-USDT', 'AVAX-USDT', 'MATIC-USDT',
        'LINK-USDT', 'UNI-USDT', 'LTC-USDT', 'BCH-USDT', 'ALGO-USDT',
        'VET-USDT', 'ICP-USDT', 'FIL-USDT', 'TRX-USDT', 'ETC-USDT'
      ].map(symbol => ({
        symbol,
        lastPrice: (Math.random() * 100 + 1).toFixed(2),
        priceChange: (Math.random() * 20 - 10).toFixed(2),
        priceChangePercent: (Math.random() * 20 - 10).toFixed(2),
        volume: (Math.random() * 100000).toFixed(2),
        quoteVolume: (Math.random() * 1000000000).toFixed(0),
        openPrice: (Math.random() * 100 + 1).toFixed(2),
        highPrice: (Math.random() * 110 + 1).toFixed(2),
        lowPrice: (Math.random() * 90 + 1).toFixed(2),
        count: Math.floor(Math.random() * 50000),
        weightedAvgPrice: (Math.random() * 105 + 1).toFixed(2)
      }));
      
      setAllSymbols(mockSymbols);
    } catch (error) {
      console.error('Erreur récupération symboles:', error);
    }
  }, []);

  // Fonction pour gérer les favoris
  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  }, []);

  // Fonction pour ajouter une alerte
  const addPriceAlert = useCallback(() => {
    if (!newAlert.price || !selectedSymbol) return;
    
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      targetPrice: parseFloat(newAlert.price),
      condition: newAlert.condition,
      isActive: true
    };
    
    setPriceAlerts(prev => [...prev, alert]);
    setNewAlert({ price: '', condition: 'above' });
  }, [newAlert, selectedSymbol]);

  // Fonction pour supprimer une alerte
  const removeAlert = useCallback((alertId: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Calculatrice de conversion
  const calculateConversion = useCallback(() => {
    if (!calculator.amount || !tickerData) return;
    
    const amount = parseFloat(calculator.amount);
    const price = parseFloat(tickerData.lastPrice);
    
    let result = 0;
    if (calculator.fromAsset === 'BTC' && calculator.toAsset === 'USDT') {
      result = amount * price;
    } else if (calculator.fromAsset === 'USDT' && calculator.toAsset === 'BTC') {
      result = amount / price;
    }
    
    setCalculator(prev => ({ ...prev, result }));
  }, [calculator.amount, calculator.fromAsset, calculator.toAsset, tickerData]);

  // Filtrage et tri des symboles
  const filteredAndSortedSymbols = useMemo(() => {
    let filtered = allSymbols;
    
    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(symbol => 
        symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par catégorie
    switch (filterBy) {
      case 'gainers':
        filtered = filtered.filter(s => parseFloat(s.priceChangePercent) > 0);
        break;
      case 'losers':
        filtered = filtered.filter(s => parseFloat(s.priceChangePercent) < 0);
        break;
      case 'favorites':
        filtered = filtered.filter(s => favorites.includes(s.symbol));
        break;
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume);
        case 'change':
          return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
        case 'price':
          return parseFloat(b.lastPrice) - parseFloat(a.lastPrice);
        case 'name':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allSymbols, searchTerm, filterBy, sortBy, favorites]);

  // Vérification des alertes
  useEffect(() => {
    if (!tickerData) return;
    
    const currentPrice = parseFloat(tickerData.lastPrice);
    priceAlerts.forEach(alert => {
      if (!alert.isActive) return;
      
      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);
      
      if (shouldTrigger) {
        // Déclencher notification (à implémenter avec votre système de notifications)
        console.log(`🔔 Alerte prix: ${alert.symbol} a atteint ${currentPrice}`);
        
        // Désactiver l'alerte
        setPriceAlerts(prev => 
          prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a)
        );
      }
    });
  }, [tickerData, priceAlerts]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchTickerData(selectedSymbol);
      fetchAllSymbols();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedSymbol, autoRefresh, refreshInterval, fetchTickerData, fetchAllSymbols]);

  // Initialisation
  useEffect(() => {
    fetchTickerData(selectedSymbol);
    fetchAllSymbols();
  }, [selectedSymbol, fetchTickerData, fetchAllSymbols]);

  const formatPrice = (price: string) => parseFloat(price).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  const formatVolume = (volume: string) => {
    const vol = parseFloat(volume);
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toFixed(2);
  };

  const priceChangeColor = (change: string) => 
    parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400';

  const getPriceChangeIcon = (change: string) => 
    parseFloat(change) >= 0 ? 
      <ArrowTrendingUpIcon className="h-4 w-4" /> : 
      <ArrowTrendingDownIcon className="h-4 w-4" />;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-6">
      {/* En-tête amélioré */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
            Marché Avancé - {selectedSymbol}
          </h3>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-400">
              {wsConnected ? 'En direct' : 'Hors ligne'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Recherche rapide */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm w-48"
            />
          </div>

          {/* Filtres */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="all">Tous</option>
            <option value="gainers">Hausse</option>
            <option value="losers">Baisse</option>
            <option value="favorites">Favoris</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="volume">Volume</option>
            <option value="change">Variation</option>
            <option value="price">Prix</option>
            <option value="name">Nom</option>
          </select>

          {/* Auto-refresh */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-400">Auto</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              disabled={!autoRefresh}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value={5}>5s</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
            </select>
          </div>

          <button
            onClick={() => {
              fetchTickerData(selectedSymbol);
              fetchAllSymbols();
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Vue d'ensemble améliorée */}
      {tickerData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg relative">
            <button
              onClick={() => toggleFavorite(selectedSymbol)}
              className="absolute top-2 right-2"
            >
              {favorites.includes(selectedSymbol) ? 
                <StarIconSolid className="h-4 w-4 text-yellow-400" /> :
                <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-400" />
              }
            </button>
            <p className="text-sm text-gray-400">Prix Actuel</p>
            <p className="text-2xl font-bold text-white">${formatPrice(tickerData.lastPrice)}</p>
            <p className={`text-sm flex items-center gap-1 ${priceChangeColor(tickerData.priceChange)}`}>
              {getPriceChangeIcon(tickerData.priceChange)}
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
            <p className="text-xs text-gray-400">
              +{((parseFloat(tickerData.highPrice) - parseFloat(tickerData.lowPrice)) / parseFloat(tickerData.lowPrice) * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Bas 24h</p>
            <p className="text-lg font-semibold text-red-400">${formatPrice(tickerData.lowPrice)}</p>
            <p className="text-xs text-gray-400">Spread: {formatVolume((parseFloat(tickerData.highPrice) - parseFloat(tickerData.lowPrice)).toString())}</p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Prix Moyen</p>
            <p className="text-lg font-semibold text-blue-400">
              ${formatPrice(tickerData.weightedAvgPrice || tickerData.lastPrice)}
            </p>
            <p className="text-xs text-gray-400">{tickerData.count} trades</p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Volatilité</p>
            <p className="text-lg font-semibold text-purple-400">
              {((parseFloat(tickerData.highPrice) - parseFloat(tickerData.lowPrice)) / parseFloat(tickerData.lowPrice) * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400">24h range</p>
          </div>
        </div>
      )}

      {/* Onglets améliorés */}
      <div className="flex flex-wrap gap-1 bg-gray-700 rounded-lg p-1">
        {[
          { id: 'overview', label: '📊 Vue d\'ensemble', icon: ChartBarIcon },
          { id: 'depth', label: '📈 Profondeur', icon: ArrowTrendingUpIcon },
          { id: 'trades', label: '🔄 Transactions', icon: ArrowPathIcon },
          { id: 'funding', label: '💰 Financement', icon: CurrencyDollarIcon },
          { id: 'alerts', label: '🔔 Alertes', icon: BellIcon },
          { id: 'calculator', label: '🧮 Calculatrice', icon: CalculatorIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm ${
              activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets amélioré */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Liste des symboles avec recherche et filtres */}
          <div className="xl:col-span-2 bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-cyan-400" />
                Marchés ({filteredAndSortedSymbols.length})
              </span>
              <span className="text-sm text-gray-400">
                {filterBy !== 'all' && `Filtre: ${filterBy}`}
              </span>
            </h4>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredAndSortedSymbols.map(symbol => (
                <div 
                  key={symbol.symbol} 
                  className={`flex items-center justify-between p-3 hover:bg-gray-600/50 rounded cursor-pointer transition-colors ${
                    selectedSymbol === symbol.symbol ? 'bg-cyan-900/30 border border-cyan-600' : ''
                  }`}
                  onClick={() => onSymbolSelect?.(symbol.symbol)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(symbol.symbol);
                      }}
                      className="p-1"
                    >
                      {favorites.includes(symbol.symbol) ? 
                        <StarIconSolid className="h-4 w-4 text-yellow-400" /> :
                        <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-400" />
                      }
                    </button>
                    <div>
                      <p className="font-semibold text-white">{symbol.symbol}</p>
                      <p className="text-sm text-gray-400">${formatPrice(symbol.lastPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold flex items-center gap-1 ${priceChangeColor(symbol.priceChange)}`}>
                      {getPriceChangeIcon(symbol.priceChange)}
                      {symbol.priceChangePercent}%
                    </p>
                    <p className="text-sm text-gray-400">{formatVolume(symbol.volume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques du marché */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-green-400" />
              Statistiques Globales
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Symboles actifs:</span>
                <span className="text-white font-semibold">{allSymbols.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Volume total:</span>
                <span className="text-cyan-400 font-semibold">
                  ${formatVolume(allSymbols.reduce((sum, s) => sum + parseFloat(s.quoteVolume), 0).toString())}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Hausse/Baisse:</span>
                <div className="flex gap-2">
                  <span className="text-green-400 font-semibold">
                    {allSymbols.filter(s => parseFloat(s.priceChange) > 0).length}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-400 font-semibold">
                    {allSymbols.filter(s => parseFloat(s.priceChange) < 0).length}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Favoris:</span>
                <span className="text-yellow-400 font-semibold">{favorites.length}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-600">
                <p className="text-sm text-gray-400 mb-2">Top Gagnants:</p>
                {allSymbols
                  .filter(s => parseFloat(s.priceChangePercent) > 0)
                  .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
                  .slice(0, 3)
                  .map(symbol => (
                    <div key={symbol.symbol} className="flex justify-between text-sm mb-1">
                      <span className="text-white">{symbol.symbol}</span>
                      <span className="text-green-400">+{symbol.priceChangePercent}%</span>
                    </div>
                  ))
                }
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-2">Top Perdants:</p>
                {allSymbols
                  .filter(s => parseFloat(s.priceChangePercent) < 0)
                  .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
                  .slice(0, 3)
                  .map(symbol => (
                    <div key={symbol.symbol} className="flex justify-between text-sm mb-1">
                      <span className="text-white">{symbol.symbol}</span>
                      <span className="text-red-400">{symbol.priceChangePercent}%</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Créer une alerte */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-yellow-400" />
              Créer une Alerte - {selectedSymbol}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Prix cible</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={newAlert.price}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                >
                  <option value="above">Au-dessus de</option>
                  <option value="below">En-dessous de</option>
                </select>
              </div>
              
              <button
                onClick={addPriceAlert}
                disabled={!newAlert.price}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Créer l'Alerte
              </button>
            </div>
          </div>

          {/* Liste des alertes */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
                Mes Alertes ({priceAlerts.length})
              </span>
            </h4>
            
            {priceAlerts.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {priceAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-lg border ${
                      alert.isActive 
                        ? 'bg-gray-600/50 border-yellow-600' 
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{alert.symbol}</p>
                        <p className="text-sm text-gray-400">
                          Prix {alert.condition === 'above' ? 'au-dessus' : 'en-dessous'} de ${alert.targetPrice}
                        </p>
                        <p className={`text-xs ${alert.isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {alert.isActive ? 'Actif' : 'Déclenché'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                <p>Aucune alerte configurée</p>
                <p className="text-sm">Créez votre première alerte de prix</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-6 flex items-center">
              <CalculatorIcon className="h-6 w-6 mr-3 text-purple-400" />
              Calculatrice de Conversion
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Montant</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={calculator.amount}
                    onChange={(e) => setCalculator(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white text-lg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">De</label>
                    <select
                      value={calculator.fromAsset}
                      onChange={(e) => setCalculator(prev => ({ ...prev, fromAsset: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                    >
                      <option value="BTC">BTC</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Vers</label>
                    <select
                      value={calculator.toAsset}
                      onChange={(e) => setCalculator(prev => ({ ...prev, toAsset: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={calculateConversion}
                  disabled={!calculator.amount || !tickerData}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                >
                  Calculer
                </button>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center p-6 bg-gray-600/50 rounded-lg w-full">
                  <p className="text-sm text-gray-400 mb-2">Résultat</p>
                  <p className="text-3xl font-bold text-white">
                    {calculator.result ? calculator.result.toLocaleString('fr-FR', { 
                      minimumFractionDigits: calculator.toAsset === 'BTC' ? 8 : 2,
                      maximumFractionDigits: calculator.toAsset === 'BTC' ? 8 : 2
                    }) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-400">{calculator.toAsset}</p>
                  
                  {tickerData && (
                    <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-400">
                      <p>Prix de référence: ${formatPrice(tickerData.lastPrice)}</p>
                      <p>Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calculs rapides */}
            <div className="mt-6 pt-6 border-t border-gray-600">
              <p className="text-sm text-gray-400 mb-3">Calculs rapides (BTC → USDT):</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['0.1', '0.5', '1', '2'].map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setCalculator(prev => ({ 
                        ...prev, 
                        amount, 
                        fromAsset: 'BTC', 
                        toAsset: 'USDT' 
                      }));
                      if (tickerData) {
                        const result = parseFloat(amount) * parseFloat(tickerData.lastPrice);
                        setCalculator(prev => ({ ...prev, result }));
                      }
                    }}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    {amount} BTC
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets existants (depth, trades, funding) restent inchangés mais avec le nouveau style */}
      {activeTab === 'depth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading.depth ? (
            <div className="col-span-2 text-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : (
            <>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
                  Ordres de Vente
                </h4>
                <div className="space-y-1">
                  {/* Simulation de données pour la démo */}
                  {Array.from({length: 10}, (_, i) => ({
                    price: (45000 + i * 100).toString(),
                    quantity: (Math.random() * 5).toFixed(4)
                  })).reverse().map((ask, index) => (
                    <div key={index} className="flex justify-between p-2 hover:bg-red-900/20 rounded">
                      <span className="text-red-400">${formatPrice(ask.price)}</span>
                      <span className="text-gray-300">{ask.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  Ordres d'Achat
                </h4>
                <div className="space-y-1">
                  {Array.from({length: 10}, (_, i) => ({
                    price: (44900 - i * 100).toString(),
                    quantity: (Math.random() * 5).toFixed(4)
                  })).map((bid, index) => (
                    <div key={index} className="flex justify-between p-2 hover:bg-green-900/20 rounded">
                      <span className="text-green-400">${formatPrice(bid.price)}</span>
                      <span className="text-gray-300">{bid.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Transactions Récentes
            </span>
            <span className="text-sm text-gray-400">Dernières 50 transactions</span>
          </h4>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 font-semibold border-b border-gray-600 pb-2 mb-2">
              <span>Prix</span>
              <span>Quantité</span>
              <span>Total</span>
              <span>Heure</span>
            </div>
            
            {/* Simulation de données */}
            {Array.from({length: 20}, (_, i) => {
              const isBuy = Math.random() > 0.5;
              const price = 45000 + (Math.random() - 0.5) * 1000;
              const qty = Math.random() * 2;
              return {
                id: i.toString(),
                price: price.toFixed(2),
                qty: qty.toFixed(4),
                time: Date.now() - i * 60000,
                isBuyerMaker: !isBuy,
                total: (price * qty).toFixed(2)
              };
            }).map((trade, index) => (
              <div key={trade.id} className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-600/50 rounded text-sm">
                <span className={trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}>
                  ${formatPrice(trade.price)}
                </span>
                <span className="text-gray-300">{trade.qty}</span>
                <span className="text-gray-300">${formatPrice(trade.total)}</span>
                <span className="text-gray-400">
                  {new Date(trade.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'funding' && (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Taux de Financement
            </span>
            <span className="text-sm text-gray-400">Mise à jour toutes les 8h</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Simulation de données */}
            {['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'XRP-USDT', 'SOL-USDT'].map((symbol, index) => {
              const rate = (Math.random() - 0.5) * 0.001;
              return (
                <div key={symbol} className="bg-gray-600/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-cyan-400">{symbol}</span>
                    <span className={`font-semibold ${rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(rate * 100).toFixed(4)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Prix de marque: ${(Math.random() * 50000 + 10000).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Prochain financement: {new Date(Date.now() + 8 * 3600000).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMarketDataDashboard;
