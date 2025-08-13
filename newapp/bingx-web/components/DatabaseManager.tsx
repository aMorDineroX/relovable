import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, CircleStackIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DatabaseStats {
  totalPositions: number;
  totalOrders: number;
  portfolioAssets: number;
  marketDataPoints: number;
  lastUpdate: string;
}

interface SyncResponse {
  success: boolean;
  message?: string;
  results?: any;
  error?: string;
}

const DatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // Charger les statistiques de la base de données
  const loadStats = async () => {
    try {
      const response = await fetch('/api/database?type=all');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  // Synchroniser les données avec BingX
  const syncData = async (syncTypes: string[] = ['all']) => {
    setIsLoading(true);
    setSyncStatus('syncing');
    setSyncMessage('Synchronisation en cours...');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncTypes })
      });

      const result: SyncResponse = await response.json();

      if (result.success) {
        setSyncStatus('success');
        setSyncMessage(result.message || 'Synchronisation réussie');
        setLastSync(new Date().toLocaleString('fr-FR'));
        await loadStats(); // Recharger les stats
      } else {
        setSyncStatus('error');
        setSyncMessage(result.error || 'Erreur lors de la synchronisation');
      }
    } catch (error: any) {
      setSyncStatus('error');
      setSyncMessage(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
      // Reset le status après 3 secondes
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Nettoyer les anciennes données
  const cleanOldData = async () => {
    try {
      const response = await fetch('/api/database?type=logs', {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setSyncMessage('Données anciennes supprimées');
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <CircleStackIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CircleStackIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Gestionnaire de Base de Données
          </h2>
        </div>
        <button
          onClick={() => loadStats()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPositions}</div>
            <div className="text-sm text-blue-800">Positions</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
            <div className="text-sm text-green-800">Ordres</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.portfolioAssets}</div>
            <div className="text-sm text-purple-800">Assets</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.marketDataPoints}</div>
            <div className="text-sm text-orange-800">Données Marché</div>
          </div>
        </div>
      )}

      {/* Status de synchronisation */}
      <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">
            {syncStatus === 'idle' ? 'Prêt pour synchronisation' : syncMessage}
          </span>
        </div>
        {lastSync && (
          <div className="text-sm text-gray-600 mt-1">
            Dernière synchronisation: {lastSync}
          </div>
        )}
      </div>

      {/* Boutons de synchronisation */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => syncData(['balance'])}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Sync Balance
          </button>
          <button
            onClick={() => syncData(['positions'])}
            disabled={isLoading}
            className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            Sync Positions
          </button>
          <button
            onClick={() => syncData(['orders'])}
            disabled={isLoading}
            className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
          >
            Sync Ordres
          </button>
          <button
            onClick={() => syncData(['market'])}
            disabled={isLoading}
            className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            Sync Marché
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => syncData(['all'])}
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Synchronisation Complète</span>
          </button>
          
          <button
            onClick={cleanOldData}
            disabled={isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Nettoyer
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Informations</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• La synchronisation sauvegarde les données BingX dans la base PostgreSQL</p>
          <p>• Les données sont mises à jour automatiquement lors des synchronisations</p>
          <p>• Le nettoyage supprime les données de plus de 7 jours</p>
          <p>• Base de données: Neon PostgreSQL</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
