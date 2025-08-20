'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface StandardOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price: number;
  filled: number;
  status: 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'PENDING';
  timestamp: string;
  fee: number;
  pnl?: number;
  contractType: 'DELIVERY' | 'PERPETUAL';
  deliveryDate?: string;
}

interface StandardBalance {
  asset: string;
  balance: string;
  crossWalletBalance: string;
  availableBalance: string;
}

interface StandardPosition {
  symbol: string;
  side: string;
  size: string;
  markPrice: string;
  entryPrice: string;
  unrealizedProfit: string;
  leverage: string;
}

const StandardFuturesView: React.FC = () => {
  const [orders, setOrders] = useState<StandardOrder[]>([]);
  const [balance, setBalance] = useState<StandardBalance[]>([]);
  const [positions, setPositions] = useState<StandardPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'balance' | 'positions'>('orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les ordres Standard Futures
  const fetchStandardOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/standard/orders?limit=100');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Données Standard Futures Orders:', data);
      
      if (data.error) {
        setError(`Erreur API Standard Futures: ${data.error}`);
        setOrders([]);
        return;
      }
      
      // Traiter la réponse selon le format BingX Standard Futures
      let ordersArray = [];
      
      if (data.data && data.data.orders && Array.isArray(data.data.orders)) {
        ordersArray = data.data.orders;
      } else if (data.data && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data.code === 0 && data.data) {
        ordersArray = Array.isArray(data.data) ? data.data : [data.data];
      } else {
        console.log('Structure de réponse Standard Futures:', data);
        setError('Impossible de traiter la réponse de l\'API Standard Futures.');
        setOrders([]);
        return;
      }
      
      if (ordersArray.length === 0) {
        setOrders([]);
        setError('Votre historique Standard Futures est vide.');
        return;
      }
      
      // Transformer les données Standard Futures au format attendu
      const transformedOrders: StandardOrder[] = ordersArray.map((order: any, index: number) => ({
        id: order.orderId?.toString() || 
            order.clientOrderId?.toString() || 
            order.id?.toString() || 
            `standard-order-${index}`,
        symbol: order.symbol || 'N/A',
        side: (order.side === 'BUY' || order.side === 'SELL') ? order.side : 'BUY',
        type: order.type || 'MARKET',
        quantity: parseFloat(order.origQty || order.quantity || '0'),
        price: parseFloat(order.avgPrice || order.price || '0'),
        filled: parseFloat(order.executedQty || order.cumQuantity || '0'),
        status: order.status || 'PENDING',
        timestamp: order.time ? 
                  new Date(parseInt(order.time)).toISOString() : 
                  order.updateTime ? 
                  new Date(parseInt(order.updateTime)).toISOString() :
                  new Date().toISOString(),
        fee: Math.abs(parseFloat(order.commission || order.fee || '0')),
        pnl: order.profit ? parseFloat(order.profit) : 
             order.realizedPnl ? parseFloat(order.realizedPnl) : undefined,
        contractType: 'DELIVERY', // Standard Futures sont des contrats à livraison
        deliveryDate: order.deliveryDate || order.time ? 
                     new Date(parseInt(order.time) + 30 * 24 * 60 * 60 * 1000).toISOString() : 
                     undefined,
      }));
      
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des ordres Standard Futures:', error);
      if (error instanceof Error) {
        setError(`Erreur Standard Futures: ${error.message}`);
      } else {
        setError('Erreur inconnue lors de la récupération des ordres Standard Futures');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer le solde Standard Futures
  const fetchStandardBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/standard/balance');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Données Standard Futures Balance:', data);
      
      if (data.error) {
        setError(`Erreur API Standard Futures Balance: ${data.error}`);
        setBalance([]);
        return;
      }
      
      // Traiter les données de balance
      let balanceArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        balanceArray = data.data;
      } else if (data.data && data.data.balance) {
        balanceArray = [data.data.balance];
      } else if (data.code === 0 && data.data) {
        balanceArray = Array.isArray(data.data) ? data.data : [data.data];
      }
      
      setBalance(balanceArray);
      
    } catch (error) {
      console.error('Erreur Standard Futures Balance:', error);
      if (error instanceof Error) {
        setError(`Erreur Balance Standard Futures: ${error.message}`);
      }
      setBalance([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les positions Standard Futures
  const fetchStandardPositions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/standard/positions');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Données Standard Futures Positions:', data);
      
      if (data.error) {
        setError(`Erreur API Standard Futures Positions: ${data.error}`);
        setPositions([]);
        return;
      }
      
      // Traiter les données de positions
      let positionsArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        positionsArray = data.data;
      } else if (data.code === 0 && data.data) {
        positionsArray = Array.isArray(data.data) ? data.data : [data.data];
      }
      
      setPositions(positionsArray);
      
    } catch (error) {
      console.error('Erreur Standard Futures Positions:', error);
      if (error instanceof Error) {
        setError(`Erreur Positions Standard Futures: ${error.message}`);
      }
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchStandardOrders();
    } else if (activeTab === 'balance') {
      fetchStandardBalance();
    } else if (activeTab === 'positions') {
      fetchStandardPositions();
    }
  }, [activeTab]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'text-green-600 bg-green-100';
      case 'PARTIALLY_FILLED': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Standard Futures (Contrats à Livraison)</h2>
          <p className="text-gray-600">Gérez vos contrats Standard Futures avec dates de livraison</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (activeTab === 'orders') fetchStandardOrders();
              else if (activeTab === 'balance') fetchStandardBalance();
              else if (activeTab === 'positions') fetchStandardPositions();
            }}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { key: 'orders', label: 'Ordres', icon: DocumentArrowDownIcon },
              { key: 'balance', label: 'Soldes', icon: CurrencyDollarIcon },
              { key: 'positions', label: 'Positions', icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.key ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
              <p className="text-gray-500 mb-4">Impossible de récupérer les données Standard Futures.</p>
              <button
                onClick={() => {
                  if (activeTab === 'orders') fetchStandardOrders();
                  else if (activeTab === 'balance') fetchStandardBalance();
                  else if (activeTab === 'positions') fetchStandardPositions();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {/* Onglet Ordres */}
              {activeTab === 'orders' && (
                <div>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID Ordre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contrat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Côté
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Livraison
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {order.symbol}
                                <div className="text-xs text-blue-600">{order.contractType}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <span className={getSideColor(order.side)}>
                                  {order.side}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(order.quantity)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${formatPrice(order.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(order.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📋 Aucun ordre Standard Futures trouvé</div>
                      <p className="text-gray-500">Vos ordres Standard Futures apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Soldes */}
              {activeTab === 'balance' && (
                <div>
                  {balance.length > 0 ? (
                    <div className="space-y-6">
                      {/* Soldes avec fonds (mis en avant) */}
                      {balance.filter(bal => parseFloat(bal.balance) > 0).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            💰 Soldes Actifs - Standard Futures
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {balance.filter(bal => parseFloat(bal.balance) > 0).length} actif(s)
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {balance
                              .filter(bal => parseFloat(bal.balance) > 0)
                              .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
                              .map((bal, index) => (
                              <div key={index} className="bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="text-xl font-bold text-gray-900">{bal.asset}</h4>
                                    <p className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                                      Standard Futures
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <CurrencyDollarIcon className="h-10 w-10 text-green-500 mx-auto mb-1" />
                                    <span className="text-xs text-green-600 font-medium">ACTIF</span>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-white/70 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-700">Balance Totale:</span>
                                      <span className="text-lg font-bold text-gray-900">
                                        {parseFloat(bal.balance).toLocaleString('fr-FR', { 
                                          minimumFractionDigits: 2, 
                                          maximumFractionDigits: 8 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bg-white/50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">Disponible:</span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {parseFloat(bal.availableBalance).toLocaleString('fr-FR', { 
                                          minimumFractionDigits: 2, 
                                          maximumFractionDigits: 8 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bg-white/50 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">Cross Wallet:</span>
                                      <span className="text-sm font-semibold text-blue-600">
                                        {parseFloat(bal.crossWalletBalance).toLocaleString('fr-FR', { 
                                          minimumFractionDigits: 2, 
                                          maximumFractionDigits: 8 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Soldes à zéro (section pliable) */}
                      {balance.filter(bal => parseFloat(bal.balance) === 0).length > 0 && (
                        <details className="bg-gray-50 rounded-lg border border-gray-200">
                          <summary className="cursor-pointer p-4 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                📊 Cryptos avec solde zéro ({balance.filter(bal => parseFloat(bal.balance) === 0).length})
                              </span>
                              <span className="text-xs text-gray-500">Cliquer pour afficher/masquer</span>
                            </div>
                          </summary>
                          <div className="p-4 pt-0 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {balance
                                .filter(bal => parseFloat(bal.balance) === 0)
                                .sort((a, b) => a.asset.localeCompare(b.asset))
                                .map((bal, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <div className="text-sm font-medium text-gray-600">{bal.asset}</div>
                                  <div className="text-xs text-gray-400 mt-1">Solde: 0</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">💰 Aucun solde Standard Futures</div>
                      <p className="text-gray-500">Vos soldes Standard Futures apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Positions */}
              {activeTab === 'positions' && (
                <div>
                  {positions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contrat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Côté
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Taille
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix d'Entrée
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix Mark
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PnL Non Réalisé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Levier
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {positions.map((position, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {position.symbol}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                <span className={getSideColor(position.side)}>
                                  {position.side}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {position.size}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${parseFloat(position.entryPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${parseFloat(position.markPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={parseFloat(position.unrealizedProfit) >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                  {parseFloat(position.unrealizedProfit) >= 0 ? '+' : ''}${parseFloat(position.unrealizedProfit).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {position.leverage}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📊 Aucune position Standard Futures</div>
                      <p className="text-gray-500">Vos positions Standard Futures ouvertes apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandardFuturesView;