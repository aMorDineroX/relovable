import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface EnhancedAccountData {
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
  availableMargin: string;
  usedMargin: string;
  marginRatio: string;
  freeMarginRatio: string;
  pnlRatio: string;
  leverageUsed: string;
  accountStatus: {
    canTrade: boolean;
    marginLevel: 'healthy' | 'warning' | 'critical';
    hasOpenPositions: boolean;
  };
  lastUpdated: string;
}

interface TradingHistory {
  orders: {
    summary: {
      total: number;
      filled: number;
      fillRate: string;
      totalCommission: string;
      totalVolume: string;
    }
  };
  positions: {
    summary: {
      total: number;
      profitable: number;
      winRate: string;
      totalRealizedPnl: string;
      averageHoldingTimeHours: string;
    }
  };
}

const EnhancedPortfolioView: React.FC = () => {
  const [accountData, setAccountData] = useState<EnhancedAccountData | null>(null);
  const [tradingHistory, setTradingHistory] = useState<TradingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchEnhancedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer les informations de compte enrichies
      const accountResponse = await fetch('/api/account/info');
      const accountResult = await accountResponse.json();
      
      if (accountResult.success) {
        setAccountData(accountResult.data);
      } else {
        throw new Error(accountResult.error || 'Erreur lors de la récupération des données de compte');
      }

      // Récupérer l'historique de trading
      const historyResponse = await fetch('/api/trading/history?limit=50');
      const historyResult = await historyResponse.json();
      
      if (historyResult.success) {
        setTradingHistory(historyResult.data);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur fetching enhanced data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedData();
    
    // Rafraîchir automatiquement toutes les 60 secondes
    const interval = setInterval(fetchEnhancedData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getMarginLevelColor = (level: string) => {
    switch (level) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMarginLevelIcon = (level: string) => {
    switch (level) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'critical': return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Chargement des données enrichies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl">
        <div className="flex items-center text-red-400 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          <span className="font-semibold">Erreur</span>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={fetchEnhancedData}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec dernière mise à jour */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Portfolio Enrichi</h2>
        <div className="flex items-center text-sm text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          Dernière MAJ: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {/* Informations de compte principales */}
      {accountData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solde et equity */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Solde du Compte</h3>
              {getMarginLevelIcon(accountData.accountStatus.marginLevel)}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Solde Total:</span>
                <span className="text-white font-semibold">${parseFloat(accountData.balance).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Equity:</span>
                <span className="text-cyan-400 font-semibold">${parseFloat(accountData.equity).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">PnL Non-réalisé:</span>
                <span className={`font-semibold ${parseFloat(accountData.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(accountData.unrealizedProfit) >= 0 ? '+' : ''}${parseFloat(accountData.unrealizedProfit).toFixed(2)}
                  <span className="text-sm ml-1">({accountData.pnlRatio}%)</span>
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">PnL Réalisé:</span>
                <span className={`font-semibold ${parseFloat(accountData.realisedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(accountData.realisedProfit) >= 0 ? '+' : ''}${parseFloat(accountData.realisedProfit).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Gestion des marges */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Gestion des Marges</h3>
              <ScaleIcon className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Marge Utilisée:</span>
                <span className="text-white font-semibold">${parseFloat(accountData.usedMargin).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Marge Disponible:</span>
                <span className="text-green-400 font-semibold">${parseFloat(accountData.availableMargin).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Ratio de Marge:</span>
                <span className={`font-semibold ${getMarginLevelColor(accountData.accountStatus.marginLevel)}`}>
                  {accountData.marginRatio}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Marge Libre:</span>
                <span className="text-cyan-400 font-semibold">{accountData.freeMarginRatio}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Levier Utilisé:</span>
                <span className="text-white font-semibold">{accountData.leverageUsed}x</span>
              </div>
            </div>
            
            {/* Barre de progression de la marge */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Utilisation de la marge</span>
                <span>{accountData.marginRatio}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    parseFloat(accountData.marginRatio) < 50 ? 'bg-green-400' :
                    parseFloat(accountData.marginRatio) < 80 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(parseFloat(accountData.marginRatio), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statut du compte */}
      {accountData && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Statut du Compte</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              {accountData.accountStatus.canTrade ? (
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              )}
              <div>
                <p className="text-sm text-gray-400">Trading</p>
                <p className={`font-semibold ${accountData.accountStatus.canTrade ? 'text-green-400' : 'text-red-400'}`}>
                  {accountData.accountStatus.canTrade ? 'Autorisé' : 'Restreint'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getMarginLevelIcon(accountData.accountStatus.marginLevel)}
              <div>
                <p className="text-sm text-gray-400">Niveau de Marge</p>
                <p className={`font-semibold ${getMarginLevelColor(accountData.accountStatus.marginLevel)}`}>
                  {accountData.accountStatus.marginLevel === 'healthy' ? 'Sain' :
                   accountData.accountStatus.marginLevel === 'warning' ? 'Attention' : 'Critique'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {accountData.accountStatus.hasOpenPositions ? (
                <ChartBarIcon className="h-6 w-6 text-cyan-400" />
              ) : (
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-400">Positions</p>
                <p className="font-semibold text-white">
                  {accountData.accountStatus.hasOpenPositions ? 'Ouvertes' : 'Aucune'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique de trading résumé */}
      {tradingHistory && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Résumé de Trading</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistiques des ordres */}
            <div>
              <h4 className="text-md font-semibold text-cyan-400 mb-3">Ordres Récents</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white">{tradingHistory.orders.summary.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exécutés:</span>
                  <span className="text-green-400">{tradingHistory.orders.summary.filled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taux d'exécution:</span>
                  <span className="text-cyan-400">{tradingHistory.orders.summary.fillRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume total:</span>
                  <span className="text-white">${parseFloat(tradingHistory.orders.summary.totalVolume).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Commissions:</span>
                  <span className="text-red-400">${parseFloat(tradingHistory.orders.summary.totalCommission).toFixed(6)}</span>
                </div>
              </div>
            </div>
            
            {/* Statistiques des positions */}
            <div>
              <h4 className="text-md font-semibold text-orange-400 mb-3">Positions Fermées</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white">{tradingHistory.positions.summary.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rentables:</span>
                  <span className="text-green-400">{tradingHistory.positions.summary.profitable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taux de réussite:</span>
                  <span className="text-cyan-400">{tradingHistory.positions.summary.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PnL réalisé total:</span>
                  <span className={`${parseFloat(tradingHistory.positions.summary.totalRealizedPnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(tradingHistory.positions.summary.totalRealizedPnl) >= 0 ? '+' : ''}${parseFloat(tradingHistory.positions.summary.totalRealizedPnl).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Temps moyen:</span>
                  <span className="text-white">{parseFloat(tradingHistory.positions.summary.averageHoldingTimeHours).toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex gap-4">
        <button
          onClick={fetchEnhancedData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
          Actualiser
        </button>
        
        <button
          onClick={() => window.open('/api/trading/history', '_blank')}
          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Historique Détaillé
        </button>
      </div>
    </div>
  );
};

export default EnhancedPortfolioView;
