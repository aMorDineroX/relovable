'use client';

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, BanknotesIcon, ChartBarIcon, ChartPieIcon, CreditCardIcon, CurrencyDollarIcon, ScaleIcon, TableCellsIcon, XMarkIcon, MagnifyingGlassIcon, ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronUpIcon, ChevronDownIcon, ChartBarSquareIcon, EyeIcon, Cog6ToothIcon, BookOpenIcon, WalletIcon, TrophyIcon, SparklesIcon } from '@heroicons/react/24/outline';
import RealTimePrices from '../components/RealTimePrices';
import OrderBook from '../components/OrderBook';
import TechnicalIndicators from '../components/TechnicalIndicators';
import AdvancedTrading from '../components/AdvancedTrading';
import AdvancedTradingPro from '../components/AdvancedTradingPro';
import MultiAssetsManagement from '../components/MultiAssetsManagement';
import MarketDataDashboard from '../components/MarketDataDashboard';
import AlertsAndNotifications from '../components/AlertsAndNotifications';
import UserSettingsPanel from '../components/UserSettingsPanel';
import PerformanceDashboard from '../components/PerformanceDashboard';
import EnhancedPortfolioView from '../components/EnhancedPortfolioView';
import EnhancedPositionsView from '../components/EnhancedPositionsView';
import RiskCalculator from '../components/RiskCalculator';
import TradingPerformance from '../components/TradingPerformance';
import TradingAlerts from '../components/TradingAlerts';
import PortfolioTracker from '../components/PortfolioTracker';

interface Balance {
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
  availableMargin: string;
  usedMargin: string;
}

interface Position {
  positionId: string;
  symbol: string;
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  availableAmt: string;
  initialMargin: string;
  avgPrice: string;
  unrealizedProfit: string;
  leverage: number;
  markPrice?: string;
  positionValue?: string;
  pnlRatio?: string;
}

interface Order {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  quantity: string;
  price: string;
  status: string;
  time: number;
  executedQty: string;
  avgPrice: string;
}

interface Symbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quotePrecision: number;
  minPrice: string;
  maxPrice: string;
  tickSize: string;
  minQty: string;
  maxQty: string;
  stepSize: string;
}

interface TradeOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: string;
  price?: string;
  leverage?: number;
}

type Tab = 'positions' | 'orders' | 'market' | 'trading' | 'portfolio' | 'performance' | 'enhanced';
type TradingSubTab = 'simple' | 'advanced' | 'analysis' | 'pro' | 'multi-assets';
type PositionFilter = 'all' | 'profitable' | 'losing';
type SortField = 'symbol' | 'positionSide' | 'positionAmt' | 'avgPrice' | 'unrealizedProfit' | 'leverage';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [filteredSymbols, setFilteredSymbols] = useState<Symbol[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({ balance: true, positions: true, orders: false, symbols: false });
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [activeTradingSubTab, setActiveTradingSubTab] = useState<TradingSubTab>('simple');
  const [searchTerm, setSearchTerm] = useState('');
  const [symbolSearchTerm, setSymbolSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [sortField, setSortField] = useState<SortField>('unrealizedProfit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChartPosition, setSelectedChartPosition] = useState<Position | null>(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  
  // États pour le trading
  const [tradingSymbol, setTradingSymbol] = useState('BTCUSDT');
  const [tradingSide, setTradingSide] = useState<'BUY' | 'SELL'>('BUY');
  const [tradingType, setTradingType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [tradingQuantity, setTradingQuantity] = useState('');
  const [tradingPrice, setTradingPrice] = useState('');
  const [tradingLeverage, setTradingLeverage] = useState(1);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Calculs des totaux
  const totalPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedProfit), 0);
  const totalPositionValue = positions.reduce((sum, pos) => sum + parseFloat(pos.positionValue || '0'), 0);
  const profitablePositions = positions.filter(pos => parseFloat(pos.unrealizedProfit) > 0);

  async function fetchData() {
    setLoading({ balance: true, positions: true, orders: false, symbols: false });
    setError(null);
    try {
      // Fetch Balance
      const balanceResponse = await fetch('/api/balance');
      const balanceData = await balanceResponse.json();
      if (!balanceResponse.ok || balanceData.code !== 0) {
        throw new Error(balanceData.msg || balanceData.error || 'Failed to fetch balance');
      }
      setBalance(balanceData.data.balance);

      // Fetch Positions
      const positionsResponse = await fetch('/api/positions');
      const positionsData = await positionsResponse.json();
      if (!positionsResponse.ok || positionsData.code !== 0) {
        throw new Error(positionsData.msg || positionsData.error || 'Failed to fetch positions');
      }
      setPositions(positionsData.data || []);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setBalance(null);
      setPositions([]);
    } finally {
      setLoading({ balance: false, positions: false, orders: false, symbols: false });
    }
  }

  async function fetchOrders() {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const ordersResponse = await fetch('/api/orders');
      const ordersData = await ordersResponse.json();
      if (!ordersResponse.ok || ordersData.code !== 0) {
        throw new Error(ordersData.msg || ordersData.error || 'Failed to fetch orders');
      }
      setOrders(ordersData.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }

  async function fetchSymbols() {
    setLoading(prev => ({ ...prev, symbols: true }));
    try {
      const symbolsResponse = await fetch('/api/symbols');
      const symbolsData = await symbolsResponse.json();
      if (!symbolsResponse.ok || symbolsData.code !== 0) {
        throw new Error(symbolsData.msg || symbolsData.error || 'Failed to fetch symbols');
      }
      setSymbols(symbolsData.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, symbols: false }));
    }
  }

  async function closePosition(position: Position) {
    try {
      const response = await fetch('/api/close-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: position.symbol,
          positionSide: position.positionSide,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.code !== 0) {
        throw new Error(result.msg || result.error || 'Failed to close position');
      }

      alert('Position fermée avec succès !');
      fetchData(); // Refresh data
      setShowCloseModal(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Erreur lors de la fermeture: ' + errorMessage);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }

  function getSortedPositions(positions: Position[]) {
    return [...positions].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'positionSide':
          aValue = a.positionSide;
          bValue = b.positionSide;
          break;
        case 'positionAmt':
          aValue = parseFloat(a.positionAmt);
          bValue = parseFloat(b.positionAmt);
          break;
        case 'avgPrice':
          aValue = parseFloat(a.avgPrice);
          bValue = parseFloat(b.avgPrice);
          break;
        case 'unrealizedProfit':
          aValue = parseFloat(a.unrealizedProfit);
          bValue = parseFloat(b.unrealizedProfit);
          break;
        case 'leverage':
          aValue = a.leverage;
          bValue = b.leverage;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
  }

  function convertToTradingViewSymbol(bingxSymbol: string) {
    // Convertir les symboles BingX vers TradingView
    // BingX utilise des formats comme "BTC-USDT", TradingView utilise "BTCUSDT"
    return bingxSymbol.replace('-', '');
  }

  function openChart(position: Position) {
    setSelectedChartPosition(position);
    setCustomSymbol(position.symbol);
    setShowChartModal(true);
  }

  async function placeOrder() {
    if (!tradingQuantity || (tradingType === 'LIMIT' && !tradingPrice)) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderData: TradeOrder = {
        symbol: tradingSymbol,
        side: tradingSide,
        type: tradingType,
        quantity: tradingQuantity,
        leverage: tradingLeverage,
      };

      if (tradingType === 'LIMIT') {
        orderData.price = tradingPrice;
      }

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!response.ok || result.code !== 0) {
        throw new Error(result.msg || result.error || 'Failed to place order');
      }

      alert('Ordre passé avec succès !');
      // Reset form
      setTradingQuantity('');
      setTradingPrice('');
      // Refresh data
      fetchData();
      fetchOrders();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Erreur lors du passage de l'ordre: ${errorMessage}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  // Filtrer et trier les positions
  useEffect(() => {
    let filtered = positions;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(pos => 
        pos.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par profitabilité
    if (positionFilter === 'profitable') {
      filtered = filtered.filter(pos => parseFloat(pos.unrealizedProfit) > 0);
    } else if (positionFilter === 'losing') {
      filtered = filtered.filter(pos => parseFloat(pos.unrealizedProfit) < 0);
    }

    // Appliquer le tri
    const sorted = getSortedPositions(filtered);
    setFilteredPositions(sorted);
    setCurrentPage(1); // Reset page when filters change
  }, [positions, searchTerm, positionFilter, sortField, sortDirection]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab, orders.length]);

  useEffect(() => {
    if (activeTab === 'market' && symbols.length === 0) {
      fetchSymbols();
    }
  }, [activeTab, symbols.length]);

  // Effet pour filtrer les symboles
  useEffect(() => {
    let filtered = symbols;
    
    if (symbolSearchTerm) {
      filtered = symbols.filter(symbol => 
        symbol.symbol.toLowerCase().includes(symbolSearchTerm.toLowerCase()) ||
        symbol.baseAsset.toLowerCase().includes(symbolSearchTerm.toLowerCase())
      );
    }
    
    setFilteredSymbols(filtered);
  }, [symbols, symbolSearchTerm]);

  const isLoading = loading.balance || loading.positions;

  // Calculs de pagination
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPositions = filteredPositions.slice(startIndex, endIndex);

  return (
    <main className="bg-gray-900 min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">BingX Dashboard Pro</h1>
          <div className="flex gap-4 items-center">
            <UserSettingsPanel />
            <AlertsAndNotifications />
            <TradingAlerts />
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="ml-2">Rafraîchir</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
            <p><strong>Erreur:</strong> {error}</p>
          </div>
        )}

        {/* Résumé des métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="P&L Total"
            value={`${totalPnL.toFixed(2)} USDT`}
            color={totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}
            icon={totalPnL >= 0 ? <ArrowTrendingUpIcon className="h-8 w-8" /> : <ArrowTrendingDownIcon className="h-8 w-8" />}
          />
          <MetricCard
            title="Positions Ouvertes"
            value={positions.length.toString()}
            color="text-cyan-400"
            icon={<TableCellsIcon className="h-8 w-8" />}
          />
          <MetricCard
            title="Positions Rentables"
            value={`${profitablePositions.length}/${positions.length}`}
            color="text-green-400"
            icon={<ArrowTrendingUpIcon className="h-8 w-8" />}
          />
          <MetricCard
            title="Valeur Totale"
            value={`${totalPositionValue.toFixed(2)} USDT`}
            color="text-white"
            icon={<CurrencyDollarIcon className="h-8 w-8" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg h-full">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ScaleIcon className="h-6 w-6 mr-3 text-cyan-400" />
                Balance du Compte
              </h2>
              
              {loading.balance ? (
                <div className="flex justify-center items-center h-48">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : balance ? (
                <div className="space-y-4">
                  <InfoCard icon={<BanknotesIcon className="h-6 w-6" />} title="Asset" value={balance.asset} />
                  <InfoCard icon={<CurrencyDollarIcon className="h-6 w-6" />} title="Balance" value={parseFloat(balance.balance).toFixed(2)} />
                  <InfoCard icon={<ChartPieIcon className="h-6 w-6" />} title="Equity" value={parseFloat(balance.equity).toFixed(2)} />
                  <InfoCard icon={<ChartBarIcon className="h-6 w-6" />} title="P/L Non Réalisé" value={parseFloat(balance.unrealizedProfit).toFixed(2)} color={parseFloat(balance.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'} />
                  <InfoCard icon={<CreditCardIcon className="h-6 w-6" />} title="Marge Disponible" value={parseFloat(balance.availableMargin).toFixed(2)} />
                  <InfoCard icon={<CreditCardIcon className="h-6 w-6 opacity-60" />} title="Marge Utilisée" value={parseFloat(balance.usedMargin).toFixed(2)} />
                </div>
              ) : !error ? (
                 <div className="text-center py-10 text-gray-500">
                    <p>Aucune donnée de balance disponible.</p>
                 </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              {/* Navigation améliorée */}
              <div className="mb-8">
                {/* Titre de section */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <ChartBarIcon className="h-7 w-7 mr-3 text-cyan-400" />
                    Tableau de Bord
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Temps réel</span>
                  </div>
                </div>

                {/* Onglets principaux améliorés */}
                <div className="bg-gray-900/80 p-2 rounded-xl border border-gray-700 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <TabButton
                      active={activeTab === 'positions'}
                      onClick={() => setActiveTab('positions')}
                      icon={<TableCellsIcon className="h-5 w-5" />}
                      label="Positions"
                      count={positions.length}
                      color="blue"
                    />
                    <TabButton
                      active={activeTab === 'orders'}
                      onClick={() => setActiveTab('orders')}
                      icon={<ClockIcon className="h-5 w-5" />}
                      label="Historique"
                      count={orders.length}
                      color="purple"
                    />
                    <TabButton
                      active={activeTab === 'market'}
                      onClick={() => {
                        setActiveTab('market');
                        if (symbols.length === 0) {
                          fetchSymbols();
                        }
                      }}
                      icon={<CurrencyDollarIcon className="h-5 w-5" />}
                      label="Market"
                      count={symbols.length}
                      color="green"
                    />
                    <TabButton
                      active={activeTab === 'trading'}
                      onClick={() => setActiveTab('trading')}
                      icon={<ChartBarIcon className="h-5 w-5" />}
                      label="Trading"
                      color="cyan"
                    />
                    <TabButton
                      active={activeTab === 'portfolio'}
                      onClick={() => setActiveTab('portfolio')}
                      icon={<WalletIcon className="h-5 w-5" />}
                      label="Portefeuille"
                      color="orange"
                    />
                    <TabButton
                      active={activeTab === 'performance'}
                      onClick={() => setActiveTab('performance')}
                      icon={<TrophyIcon className="h-5 w-5" />}
                      label="Performance"
                      color="yellow"
                    />
                    <TabButton
                      active={activeTab === 'enhanced'}
                      onClick={() => setActiveTab('enhanced')}
                      icon={<SparklesIcon className="h-5 w-5" />}
                      label="Enrichi"
                      color="purple"
                    />
                  </div>
                </div>

                {/* Barre d'outils dynamique */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getTabColor(activeTab)}`}></div>
                      <h3 className="font-semibold text-white">{getTabTitle(activeTab)}</h3>
                    </div>
                    {getTabDescription(activeTab) && (
                      <span className="text-sm text-gray-400">• {getTabDescription(activeTab)}</span>
                    )}
                  </div>

                  {/* Contrôles spécifiques par onglet */}
                  <div className="flex items-center space-x-3">
                    {(activeTab === 'positions' || activeTab === 'orders') && (
                      <>
                        {/* Pagination */}
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                        >
                          <option value={5}>5 par page</option>
                          <option value={10}>10 par page</option>
                          <option value={20}>20 par page</option>
                          <option value={50}>50 par page</option>
                        </select>

                        {/* Recherche */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder={activeTab === 'positions' ? "Rechercher symbole..." : "Rechercher ordre..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all min-w-[200px]"
                          />
                        </div>

                        {activeTab === 'positions' && (
                          <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value as PositionFilter)}
                            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                          >
                            <option value="all">🔍 Toutes</option>
                            <option value="profitable">📈 Rentables</option>
                            <option value="losing">📉 Perdantes</option>
                          </select>
                        )}
                      </>
                    )}

                    {activeTab === 'market' && (
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="🔍 Rechercher crypto..."
                          value={symbolSearchTerm}
                          onChange={(e) => setSymbolSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all min-w-[200px]"
                        />
                      </div>
                    )}

                    {activeTab === 'trading' && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-400">Mode:</span>
                        <span className="px-2 py-1 bg-cyan-600 text-white rounded-md font-medium">
                          {activeTradingSubTab === 'simple' ? '🎯 Simple' : 
                           activeTradingSubTab === 'advanced' ? '⚙️ Avancé' : '📊 Analyse'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {activeTab === 'positions' ? (
                loading.positions ? (
                  <div className="flex justify-center items-center h-48">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredPositions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <SortableHeader field="symbol" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              Symbole
                            </SortableHeader>
                            <SortableHeader field="positionSide" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              Côté
                            </SortableHeader>
                            <SortableHeader field="positionAmt" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              Quantité
                            </SortableHeader>
                            <SortableHeader field="avgPrice" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              Prix d&apos;Entrée
                            </SortableHeader>
                            <SortableHeader field="unrealizedProfit" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              P/L Non Réalisé
                            </SortableHeader>
                            <SortableHeader field="leverage" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                              Levier
                            </SortableHeader>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPositions.map(pos => (
                            <tr key={pos.positionId} className="border-b border-gray-800 hover:bg-gray-700/50">
                              <td className="p-3 font-semibold">{pos.symbol}</td>
                              <td className={`p-3 font-bold ${pos.positionSide === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                                {pos.positionSide}
                              </td>
                              <td className="p-3">{parseFloat(pos.positionAmt).toFixed(4)}</td>
                              <td className="p-3">{parseFloat(pos.avgPrice).toFixed(4)}</td>
                              <td className={`p-3 font-semibold ${parseFloat(pos.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {parseFloat(pos.unrealizedProfit).toFixed(2)} USDT
                              </td>
                              <td className="p-3">{pos.leverage}x</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openChart(pos)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                                  >
                                    <ChartBarSquareIcon className="h-4 w-4" />
                                    Graphique
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPosition(pos);
                                      setShowCloseModal(true);
                                    }}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                  >
                                    Fermer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400">
                          Affichage {startIndex + 1} à {Math.min(endIndex, filteredPositions.length)} sur {filteredPositions.length} positions
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          >
                            ← Précédent
                          </button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 rounded ${
                                    currentPage === pageNum 
                                      ? 'bg-cyan-600 text-white' 
                                      : 'bg-gray-700 text-white hover:bg-gray-600'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          >
                            Suivant →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : !error ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>Aucune position trouvée.</p>
                  </div>
                ) : null
              ) : (
                // Onglet Historique des ordres
                loading.orders ? (
                  <div className="flex justify-center items-center h-48">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="p-3">Symbole</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Côté</th>
                          <th className="p-3">Quantité</th>
                          <th className="p-3">Prix</th>
                          <th className="p-3">Statut</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 50).map(order => (
                          <tr key={order.orderId} className="border-b border-gray-800 hover:bg-gray-700/50">
                            <td className="p-3 font-semibold">{order.symbol}</td>
                            <td className="p-3">{order.type}</td>
                            <td className={`p-3 font-bold ${order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              {order.side}
                            </td>
                            <td className="p-3">{parseFloat(order.quantity).toFixed(4)}</td>
                            <td className="p-3">{parseFloat(order.price).toFixed(4)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status === 'FILLED' ? 'bg-green-900 text-green-300' :
                                order.status === 'CANCELED' ? 'bg-red-900 text-red-300' :
                                'bg-yellow-900 text-yellow-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-400">
                              {new Date(order.time).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>Aucun ordre trouvé.</p>
                  </div>
                )
              )}

              {activeTab === 'market' && (
                <MarketDataDashboard
                  selectedSymbol={symbolSearchTerm || 'BTC-USDT'}
                  onSymbolSelect={(symbol) => {
                    setSymbolSearchTerm(symbol);
                    setTradingSymbol(symbol);
                  }}
                />
              )}

              {activeTab === 'trading' && (
                <div className="space-y-6">
                  {/* Sous-onglets pour Trading */}
                  <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTradingSubTab('simple')}
                      className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                        activeTradingSubTab === 'simple' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <ChartBarIcon className="h-4 w-4 inline mr-2" />
                      Trading Simple
                    </button>
                    <button
                      onClick={() => setActiveTradingSubTab('advanced')}
                      className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                        activeTradingSubTab === 'advanced' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                      Trading Avancé
                    </button>
                    <button
                      onClick={() => setActiveTradingSubTab('analysis')}
                      className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                        activeTradingSubTab === 'analysis' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <BookOpenIcon className="h-4 w-4 inline mr-2" />
                      Analyse
                    </button>
                    <button
                      onClick={() => setActiveTradingSubTab('pro')}
                      className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                        activeTradingSubTab === 'pro' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <ChartBarIcon className="h-4 w-4 inline mr-2" />
                      Pro Trading
                    </button>
                    <button
                      onClick={() => setActiveTradingSubTab('multi-assets')}
                      className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                        activeTradingSubTab === 'multi-assets' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                      Multi-Assets
                    </button>
                  </div>

                  {activeTradingSubTab === 'simple' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Colonne 1: Prix en temps réel */}
                      <div className="lg:col-span-1">
                        <RealTimePrices 
                          selectedSymbol={tradingSymbol}
                          onSymbolSelect={setTradingSymbol}
                        />
                      </div>

                      {/* Colonne 2: Interface de trading simple */}
                      <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                          <h3 className="text-xl font-semibold mb-6 flex items-center">
                            <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
                            Trading Rapide - {tradingSymbol}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colonne gauche - Paramètres de l'ordre */}
                            <div className="space-y-4">
                              {/* Symbole */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Symbole
                                </label>
                                <input
                                  type="text"
                                  value={tradingSymbol}
                                  onChange={(e) => setTradingSymbol(e.target.value.toUpperCase())}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                  placeholder="BTCUSDT"
                                />
                              </div>

                              {/* Type d'ordre */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Type d'ordre
                                </label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setTradingType('MARKET')}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                      tradingType === 'MARKET'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    Market
                                  </button>
                                  <button
                                    onClick={() => setTradingType('LIMIT')}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                      tradingType === 'LIMIT'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    Limit
                                  </button>
                                </div>
                              </div>

                              {/* Côté */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Côté
                                </label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setTradingSide('BUY')}
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                      tradingSide === 'BUY'
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    Acheter
                                  </button>
                                  <button
                                    onClick={() => setTradingSide('SELL')}
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                      tradingSide === 'SELL'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    Vendre
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Colonne droite - Prix et quantité */}
                            <div className="space-y-4">
                              {/* Prix (seulement pour les ordres LIMIT) */}
                              {tradingType === 'LIMIT' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Prix (USDT)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={tradingPrice}
                                    onChange={(e) => setTradingPrice(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                    placeholder="0.00"
                                  />
                                </div>
                              )}

                              {/* Quantité */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Quantité
                                </label>
                                <input
                                  type="number"
                                  step="0.001"
                                  value={tradingQuantity}
                                  onChange={(e) => setTradingQuantity(e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                  placeholder="0.000"
                                />
                                {/* Boutons de quantité rapide */}
                                <div className="flex space-x-2 mt-2">
                                  {['25%', '50%', '75%', '100%'].map(percent => (
                                    <button
                                      key={percent}
                                      onClick={() => {
                                        const currentQty = parseFloat(tradingQuantity) || 1;
                                        const percentValue = parseInt(percent) / 100;
                                        const newQty = (currentQty * percentValue).toString();
                                        setTradingQuantity(newQty);
                                      }}
                                      className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 text-xs rounded transition-colors"
                                    >
                                      {percent}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Levier */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Levier: {tradingLeverage}x
                                </label>
                                <input
                                  type="range"
                                  min="1"
                                  max="125"
                                  value={tradingLeverage}
                                  onChange={(e) => setTradingLeverage(Number(e.target.value))}
                                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                  <span>1x</span>
                                  <span>25x</span>
                                  <span>50x</span>
                                  <span>100x</span>
                                  <span>125x</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bouton de soumission */}
                          <div className="mt-6">
                            <button
                              onClick={placeOrder}
                              disabled={isSubmittingOrder || !tradingQuantity}
                              className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                                tradingSide === 'BUY'
                                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                              {isSubmittingOrder ? (
                                <div className="flex items-center justify-center">
                                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                                  Traitement...
                                </div>
                              ) : (
                                `${tradingSide === 'BUY' ? 'Acheter' : 'Vendre'} ${tradingSymbol}`
                              )}
                            </button>
                          </div>

                          {/* Informations de l'ordre */}
                          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Résumé de l'ordre:</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Symbole:</span>
                                <span className="text-white font-semibold">{tradingSymbol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white">{tradingType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Côté:</span>
                                <span className={tradingSide === 'BUY' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                  {tradingSide === 'BUY' ? 'Achat' : 'Vente'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Levier:</span>
                                <span className="text-cyan-400 font-semibold">{tradingLeverage}x</span>
                              </div>
                              {tradingType === 'LIMIT' && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Prix:</span>
                                  <span className="text-white font-mono">{tradingPrice || '0.00'} USDT</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-400">Quantité:</span>
                                <span className="text-white font-mono">{tradingQuantity || '0.000'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTradingSubTab === 'advanced' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Colonne 1: Interface de trading avancée */}
                        <div>
                          <AdvancedTrading 
                            symbol={tradingSymbol}
                            onOrderUpdate={(data) => console.log('Order updated:', data)}
                          />
                        </div>

                        {/* Colonne 2: Carnet d'ordres */}
                        <div>
                          <OrderBook symbol={tradingSymbol} />
                        </div>
                      </div>

                      {/* Calculateur de risque en pleine largeur */}
                      <div>
                        <RiskCalculator 
                          symbol={tradingSymbol}
                          currentPrice={43500} // Prix simulé, vous pouvez le connecter aux données réelles
                        />
                      </div>
                    </div>
                  )}

                  {activeTradingSubTab === 'analysis' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne 1: Prix en temps réel */}
                        <div className="lg:col-span-1">
                          <RealTimePrices 
                            selectedSymbol={tradingSymbol}
                            onSymbolSelect={setTradingSymbol}
                          />
                        </div>

                        {/* Colonne 2: Indicateurs techniques */}
                        <div className="lg:col-span-1">
                          <TechnicalIndicators symbol={tradingSymbol} />
                        </div>

                        {/* Colonne 3: Carnet d'ordres */}
                        <div className="lg:col-span-1">
                          <OrderBook symbol={tradingSymbol} />
                        </div>
                      </div>

                      {/* Performance de trading en pleine largeur */}
                      <div>
                        <TradingPerformance />
                      </div>
                    </div>
                  )}
                  {activeTradingSubTab === 'pro' && (
                    <div>
                      <AdvancedTradingPro 
                        symbol={tradingSymbol}
                        onOrderUpdate={(data) => {
                          console.log('Pro order updated:', data);
                          fetchData(); // Refresh positions and balance
                          fetchOrders(); // Refresh orders
                        }}
                      />
                    </div>
                  )}

                  {activeTradingSubTab === 'multi-assets' && (
                    <div>
                      <MultiAssetsManagement 
                        onUpdate={(data) => {
                          console.log('Multi-assets updated:', data);
                          fetchData(); // Refresh data
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'portfolio' && (
                <PortfolioTracker />
              )}

              {activeTab === 'performance' && (
                <PerformanceDashboard />
              )}

              {activeTab === 'enhanced' && (
                <div className="space-y-8">
                  <EnhancedPortfolioView />
                  <EnhancedPositionsView />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmation pour fermer une position */}
        {showCloseModal && selectedPosition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Fermer la Position</h3>
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  Êtes-vous sûr de vouloir fermer cette position ?
                </p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p><strong>Symbole:</strong> {selectedPosition.symbol}</p>
                  <p><strong>Côté:</strong> {selectedPosition.positionSide}</p>
                  <p><strong>Quantité:</strong> {parseFloat(selectedPosition.positionAmt).toFixed(4)}</p>
                  <p className={`${parseFloat(selectedPosition.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <strong>P/L:</strong> {parseFloat(selectedPosition.unrealizedProfit).toFixed(2)} USDT
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => closePosition(selectedPosition)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Fermer Position
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal TradingView Chart */}
        {showChartModal && selectedChartPosition && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-6xl h-5/6 flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <ChartBarSquareIcon className="h-6 w-6 text-cyan-400" />
                      Graphique TradingView
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Position {selectedChartPosition.positionSide} • Levier {selectedChartPosition.leverage}x • 
                      <span className={parseFloat(selectedChartPosition.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {parseFloat(selectedChartPosition.unrealizedProfit).toFixed(2)} USDT
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <label className="text-sm text-gray-400 font-medium">Symbole:</label>
                    <input
                      type="text"
                      value={customSymbol}
                      onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 min-w-32"
                      placeholder="Ex: BTCUSDT"
                    />
                    <div className="flex gap-1">
                      {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'].map(symbol => (
                        <button
                          key={symbol}
                          onClick={() => setCustomSymbol(symbol)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            customSymbol === symbol 
                              ? 'bg-cyan-500 text-white' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {symbol.replace('USDT', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="text-gray-400 hover:text-white p-2 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6">
                <iframe
                  key={customSymbol} // Force re-render when symbol changes
                  src={`https://fr.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${convertToTradingViewSymbol(customSymbol)}&interval=15&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=fr&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BINANCE:${convertToTradingViewSymbol(customSymbol)}`}
                  className="w-full h-full rounded-lg border border-gray-700"
                  style={{ border: 'none' }}
                  allowFullScreen={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ title, value, color = 'text-white', icon }: { 
  title: string; 
  value: string; 
  color?: string; 
  icon: React.ReactElement; 
}) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="p-3 bg-gray-900 rounded-full text-cyan-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, color = 'text-white' }: { 
  icon: React.ReactElement; 
  title: string; 
  value: string; 
  color?: string; 
}) {
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center">
      <div className="p-2 bg-gray-900 rounded-full mr-4 text-cyan-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-lg font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count, color }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
  count?: number;
  color: string;
}) {
  const colorClasses = {
    blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'hover:bg-blue-600/20 hover:text-blue-300',
    purple: active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' : 'hover:bg-purple-600/20 hover:text-purple-300',
    green: active ? 'bg-green-600 text-white shadow-lg shadow-green-600/25' : 'hover:bg-green-600/20 hover:text-green-300',
    cyan: active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' : 'hover:bg-cyan-600/20 hover:text-cyan-300',
    orange: active ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' : 'hover:bg-orange-600/20 hover:text-orange-300',
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-200 group ${
        active 
          ? `${colorClasses[color as keyof typeof colorClasses]} border-transparent transform scale-105` 
          : `bg-gray-800/50 text-gray-300 border-gray-600 ${colorClasses[color as keyof typeof colorClasses]}`
      }`}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-700 group-hover:bg-gray-600'}`}>
          {icon}
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold">{label}</div>
          {count !== undefined && (
            <div className={`text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}>
              {count} {count === 1 ? 'élément' : 'éléments'}
            </div>
          )}
        </div>
      </div>
      
      {active && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  );
}

// Fonctions utilitaires pour les onglets
function getTabColor(tab: Tab): string {
  const colors = {
    positions: 'bg-blue-400',
    orders: 'bg-purple-400',
    market: 'bg-green-400',
    trading: 'bg-cyan-400',
    portfolio: 'bg-orange-400',
    performance: 'bg-yellow-400',
    enhanced: 'bg-purple-600',
  };
  return colors[tab];
}

function getTabTitle(tab: Tab): string {
  const titles = {
    positions: 'Gestion des Positions',
    orders: 'Historique des Ordres',
    market: 'Données de Marché',
    trading: 'Interface de Trading',
    portfolio: 'Suivi de Portefeuille',
    performance: 'Performance & Analytics',
    enhanced: 'Données Enrichies BingX',
  };
  return titles[tab];
}

function getTabDescription(tab: Tab): string | null {
  const descriptions = {
    positions: 'Surveillez vos positions ouvertes',
    orders: 'Consultez l\'historique des transactions',
    market: 'Explorez les cryptomonnaies disponibles',
    trading: 'Passez des ordres d\'achat et de vente',
    portfolio: 'Analysez les performances de votre portefeuille',
    performance: 'Métriques détaillées et analyse de performance',
    enhanced: 'Données avancées avec calculs de risque et marché',
  };
  return descriptions[tab];
}

function SortableHeader({ field, currentField, direction, onSort, children }: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = currentField === field;
  
  return (
    <th 
      className="p-3 cursor-pointer hover:bg-gray-600/50 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUpIcon 
            className={`h-3 w-3 ${isActive && direction === 'asc' ? 'text-cyan-400' : 'text-gray-500'}`} 
          />
          <ChevronDownIcon 
            className={`h-3 w-3 -mt-1 ${isActive && direction === 'desc' ? 'text-cyan-400' : 'text-gray-500'}`} 
          />
        </div>
      </div>
    </th>
  );
}
