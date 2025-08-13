'use client';

import { useState, useEffect } from 'react';
import { 
  getPositions, 
  getPortfolio, 
  getOrders, 
  getActivityLogs,
  logActivity 
} from '../lib/db-utils';

interface Position {
  id?: number;
  symbol: string;
  position_side: 'LONG' | 'SHORT';
  size: number;
  entry_price: number;
  mark_price?: number;
  unrealized_pnl?: number;
  percentage?: number;
  leverage?: number;
}

interface PortfolioAsset {
  id?: number;
  asset: string;
  total: number;
  usd_value?: number;
  percentage?: number;
}

interface Order {
  id?: number;
  order_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  quantity: number;
  price?: number;
  status: string;
  created_at?: Date;
}

interface ActivityLog {
  id?: number;
  action: string;
  description?: string;
  created_at?: Date;
}

export default function DatabaseDashboard() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Charger toutes les données depuis la base
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [positionsData, portfolioData, ordersData, logsData] = await Promise.all([
        getPositions(),
        getPortfolio(),
        getOrders(10), // 10 derniers ordres
        getActivityLogs(5) // 5 derniers logs
      ]);

      setPositions(positionsData);
      setPortfolio(portfolioData);
      setOrders(ordersData);
      setLogs(logsData);
      setLastUpdate(new Date());

      // Logger l'activité de consultation
      await logActivity('DASHBOARD_VIEW', 'Dashboard consulté');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et configurer l'actualisation automatique
  useEffect(() => {
    loadData();
    
    // Actualiser toutes les minutes
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculer les statistiques du portefeuille
  const portfolioStats = {
    totalValue: portfolio.reduce((sum, asset) => sum + (asset.usd_value || 0), 0),
    totalAssets: portfolio.length,
    totalPnL: positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de connexion</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              🗄️ Dashboard Base de Données BingX
            </h1>
            <div className="text-right">
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Actualiser
              </button>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Dernière MAJ: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Portefeuille</h3>
            <p className="text-3xl font-bold text-green-600">
              ${portfolioStats.totalValue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{portfolioStats.totalAssets} actifs</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📊 Positions</h3>
            <p className="text-3xl font-bold text-blue-600">{positions.length}</p>
            <p className="text-sm text-gray-500">positions ouvertes</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 PnL Total</h3>
            <p className={`text-3xl font-bold ${portfolioStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolioStats.totalPnL.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">non réalisé</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Positions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Positions Ouvertes</h2>
            {positions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune position ouverte</p>
            ) : (
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{position.symbol}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        position.position_side === 'LONG' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.position_side}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Taille:</p>
                        <p className="font-medium">{position.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Prix d'entrée:</p>
                        <p className="font-medium">${position.entry_price?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Prix actuel:</p>
                        <p className="font-medium">${position.mark_price?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">PnL:</p>
                        <p className={`font-medium ${
                          (position.unrealized_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${position.unrealized_pnl?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portefeuille */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Actifs du Portefeuille</h2>
            {portfolio.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun actif dans le portefeuille</p>
            ) : (
              <div className="space-y-3">
                {portfolio.map((asset, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{asset.asset}</h3>
                      <span className="text-sm text-gray-500">
                        {asset.percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Quantité:</p>
                        <p className="font-medium">{asset.total.toFixed(8)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valeur USD:</p>
                        <p className="font-medium">${asset.usd_value?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Ordres récents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Ordres Récents</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun ordre récent</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800">{order.symbol}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.side === 'BUY' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.side}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'FILLED' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Type:</p>
                        <p className="font-medium">{order.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantité:</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Prix:</p>
                        <p className="font-medium">${order.price?.toFixed(2) || 'Market'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ID:</p>
                        <p className="font-medium text-xs">{order.order_id.slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs d'activité */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Activité Récente</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{log.action}</h3>
                        {log.description && (
                          <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at!).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
