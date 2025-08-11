'use client';

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, BanknotesIcon, ChartBarIcon, ChartPieIcon, CreditCardIcon, CurrencyDollarIcon, ScaleIcon, TableCellsIcon, XMarkIcon, MagnifyingGlassIcon, ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronUpIcon, ChevronDownIcon, ChartBarSquareIcon, EyeIcon } from '@heroicons/react/24/outline';

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

type Tab = 'positions' | 'orders';
type PositionFilter = 'all' | 'profitable' | 'losing';
type SortField = 'symbol' | 'positionSide' | 'positionAmt' | 'avgPrice' | 'unrealizedProfit' | 'leverage';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({ balance: true, positions: true, orders: false });
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [sortField, setSortField] = useState<SortField>('unrealizedProfit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChartPosition, setSelectedChartPosition] = useState<Position | null>(null);
  const [showChartModal, setShowChartModal] = useState(false);

  // Calculs des totaux
  const totalPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedProfit), 0);
  const totalPositionValue = positions.reduce((sum, pos) => sum + parseFloat(pos.positionValue || '0'), 0);
  const profitablePositions = positions.filter(pos => parseFloat(pos.unrealizedProfit) > 0);

  async function fetchData() {
    setLoading({ balance: true, positions: true, orders: false });
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
      setLoading({ balance: false, positions: false, orders: false });
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
    setShowChartModal(true);
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
          <div className="flex gap-4">
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
              {/* Onglets */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'positions' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <TableCellsIcon className="h-5 w-5 inline mr-2" />
                    Positions
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'orders' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <ClockIcon className="h-5 w-5 inline mr-2" />
                    Historique
                  </button>
                </div>

                {activeTab === 'positions' && (
                  <div className="flex gap-2 items-center">
                    {/* Sélecteur d'éléments par page */}
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                    >
                      <option value={5}>5 par page</option>
                      <option value={10}>10 par page</option>
                      <option value={20}>20 par page</option>
                      <option value={50}>50 par page</option>
                    </select>

                    {/* Barre de recherche */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher symbole..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    
                    {/* Filtre */}
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value as PositionFilter)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">Toutes</option>
                      <option value="profitable">Rentables</option>
                      <option value="losing">Perdantes</option>
                    </select>
                  </div>
                )}
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
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <ChartBarSquareIcon className="h-6 w-6 text-cyan-400" />
                    Graphique {selectedChartPosition.symbol}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Position {selectedChartPosition.positionSide} • Levier {selectedChartPosition.leverage}x • 
                    <span className={parseFloat(selectedChartPosition.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {parseFloat(selectedChartPosition.unrealizedProfit).toFixed(2)} USDT
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6">
                <iframe
                  src={`https://fr.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:${convertToTradingViewSymbol(selectedChartPosition.symbol)}&interval=15&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=fr&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=BINANCE:${convertToTradingViewSymbol(selectedChartPosition.symbol)}`}
                  className="w-full h-full rounded-lg border border-gray-700"
                  frameBorder="0"
                  allowTransparency={true}
                  scrolling="no"
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
