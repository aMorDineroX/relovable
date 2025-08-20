'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface Order {
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
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSide, setFilterSide] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les vrais ordres depuis l'API BingX
  const fetchRealOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?limit=100');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Données reçues de l\'API BingX:', data);
      
      if (data.error) {
        setError(`Erreur API BingX: ${data.error}`);
        setOrders([]);
        return;
      }
      
      // Si l'API ne retourne pas de data mais un code de succès
      if (data.code === 0 && (!data.data || data.data.length === 0)) {
        setOrders([]);
        setError('Votre compte BingX n\'a pas d\'historique d\'ordres pour le moment.');
        return;
      }
      
      // BingX peut retourner plusieurs formats selon l'API
      let ordersArray = [];
      
      if (data.data && data.data.orders && Array.isArray(data.data.orders)) {
        // Format BingX standard: { data: { orders: [...] } }
        ordersArray = data.data.orders;
      } else if (data.data && Array.isArray(data.data)) {
        // Format: { data: [...] }
        ordersArray = data.data;
      } else if (Array.isArray(data)) {
        // Format direct: [...]
        ordersArray = data;
      } else if (data.code === 0 && data.data) {
        // Format avec code: { code: 0, data: {...} }
        ordersArray = Array.isArray(data.data) ? data.data : [data.data];
      } else {
        console.log('Structure de réponse BingX:', data);
        setError('Impossible de traiter la réponse de l\'API BingX. Vérifiez vos clés API.');
        setOrders([]);
        return;
      }
      
      if (ordersArray.length === 0) {
        setOrders([]);
        setError('Votre historique d\'ordres BingX est vide. Effectuez quelques trades pour voir vos ordres ici.');
        return;
      }
      
      // Transformer les données BingX au format attendu
      const transformedOrders: Order[] = ordersArray.map((order: any, index: number) => ({
        id: order.orderId?.toString() || 
            order.clientOrderId?.toString() || 
            order.id?.toString() || 
            `order-${index}`,
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
      }));
      
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des ordres:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Impossible de contacter l\'API BingX. Vérifiez votre connexion internet.');
        } else if (error.message.includes('404')) {
          setError('Endpoint API non trouvé. Problème de configuration serveur.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          setError('Authentification échouée. Vérifiez vos clés API BingX dans .env.local');
        } else {
          setError(`Erreur de connexion: ${error.message}`);
        }
      } else {
        setError('Erreur inconnue lors de la récupération des ordres');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealOrders();
  }, []);

  const refreshOrders = () => {
    fetchRealOrders();
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSide = filterSide === 'ALL' || order.side === filterSide;
    
    return matchesSearch && matchesStatus && matchesSide;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des Ordres</h2>
          <p className="text-gray-600">Consultez l'historique des transactions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher ordre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="FILLED">Exécuté</option>
            <option value="PARTIALLY_FILLED">Partiellement exécuté</option>
            <option value="CANCELLED">Annulé</option>
            <option value="PENDING">En attente</option>
          </select>

          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Achat et Vente</option>
            <option value="BUY">Achat seulement</option>
            <option value="SELL">Vente seulement</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredOrders.length} ordre(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Tableau des ordres */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : currentOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Ordre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paire
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
                      Exécuté
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PnL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {order.symbol}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.filled)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.pnl !== undefined ? (
                          <span className={order.pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {order.pnl >= 0 ? '+' : ''}${formatPrice(order.pnl)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{indexOfFirstOrder + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> sur{' '}
                    <span className="font-medium">{filteredOrders.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            {error ? (
              <>
                <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
                <p className="text-gray-500 mb-4">Impossible de récupérer l'historique des ordres.</p>
                <button
                  onClick={refreshOrders}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </>
            ) : (
              <>
                <div className="text-gray-400 text-lg mb-2">📋 Aucun ordre trouvé</div>
                <p className="text-gray-500 mb-2">Votre historique d'ordres BingX est vide.</p>
                <p className="text-gray-400 text-sm">
                  Les ordres apparaîtront ici après vos premières transactions.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;