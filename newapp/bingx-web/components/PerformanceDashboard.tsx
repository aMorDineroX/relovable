import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ChartPieIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface PerformanceData {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  dailyReturns: Array<{
    date: string;
    return: number;
    cumulative: number;
  }>;
  monthlyStats: Array<{
    month: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
  tradingPairs: Array<{
    symbol: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
  riskMetrics: {
    volatility: number;
    sortino: number;
    calmar: number;
    informationRatio: number;
  };
  currentStreak: {
    type: 'win' | 'loss';
    count: number;
  };
  bestDay: number;
  worstDay: number;
  tradingDays: number;
}

const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'pairs' | 'risk'>('overview');

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedPeriod]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/performance/stats?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.data);
      } else {
        setError(data.error || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des données de performance:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getStreakColor = (type: 'win' | 'loss') => {
    return type === 'win' ? 'text-green-400' : 'text-red-400';
  };

  const getPnLColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="text-center text-red-400">
          <p>Erreur: {error}</p>
          <button
            onClick={fetchPerformanceData}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChartBarIcon className="h-8 w-8 text-cyan-400" />
          Performance de Trading
        </h2>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
            <option value="1y">1 an</option>
          </select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">PnL Total</p>
              <p className={`text-2xl font-bold ${getPnLColor(performanceData.totalPnL)}`}>
                {formatCurrency(performanceData.totalPnL)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Taux de Réussite</p>
              <p className="text-2xl font-bold text-white">
                {formatPercentage(performanceData.winRate)}
              </p>
            </div>
            <TrophyIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-white">
                {performanceData.totalTrades}
              </p>
            </div>
            <ChartPieIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Série Actuelle</p>
              <p className={`text-2xl font-bold ${getStreakColor(performanceData.currentStreak.type)}`}>
                {performanceData.currentStreak.count} {performanceData.currentStreak.type === 'win' ? 'gains' : 'pertes'}
              </p>
            </div>
            {performanceData.currentStreak.type === 'win' ? (
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
            ) : (
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="border-b border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
            { id: 'monthly', label: 'Mensuel', icon: CalendarIcon },
            { id: 'pairs', label: 'Paires', icon: ScaleIcon },
            { id: 'risk', label: 'Risque', icon: CalculatorIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métriques secondaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Métriques de Performance</h3>
            
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Profit Factor</span>
                <span className={`font-semibold ${performanceData.profitFactor >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {performanceData.profitFactor.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ratio de Sharpe</span>
                <span className={`font-semibold ${performanceData.sharpeRatio >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {performanceData.sharpeRatio.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Drawdown Max</span>
                <span className="font-semibold text-red-400">
                  {formatPercentage(performanceData.maxDrawdown)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gain Moyen</span>
                <span className="font-semibold text-green-400">
                  {formatPercentage(performanceData.averageWin)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Perte Moyenne</span>
                <span className="font-semibold text-red-400">
                  {formatPercentage(performanceData.averageLoss)}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques de trading */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Statistiques de Trading</h3>
            
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Jours de Trading</span>
                <span className="font-semibold text-white">
                  {performanceData.tradingDays}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Meilleur Jour</span>
                <span className="font-semibold text-green-400">
                  {formatPercentage(performanceData.bestDay)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pire Jour</span>
                <span className="font-semibold text-red-400">
                  {formatPercentage(performanceData.worstDay)}
                </span>
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Volatilité</span>
                <span className="font-semibold text-yellow-400">
                  {formatPercentage(performanceData.riskMetrics.volatility)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Performance Mensuelle</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Mois</th>
                  <th className="text-right py-3 px-4 text-gray-400">Trades</th>
                  <th className="text-right py-3 px-4 text-gray-400">PnL</th>
                  <th className="text-right py-3 px-4 text-gray-400">Taux de Réussite</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.monthlyStats.map((month, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-medium">{month.month}</td>
                    <td className="py-3 px-4 text-right">{month.trades}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${getPnLColor(month.pnl)}`}>
                      {formatCurrency(month.pnl)}
                    </td>
                    <td className="py-3 px-4 text-right">{formatPercentage(month.winRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pairs' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Performance par Paire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceData.tradingPairs.map((pair, index) => (
              <div key={index} className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg">{pair.symbol}</h4>
                  <span className="text-sm text-gray-400">{pair.trades} trades</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">PnL:</span>
                    <span className={`font-semibold ${getPnLColor(pair.pnl)}`}>
                      {formatCurrency(pair.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taux:</span>
                    <span className="text-white">{formatPercentage(pair.winRate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Métriques de Risque</h3>
            <div className="space-y-4">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ratio de Sortino</span>
                  <span className="font-semibold text-white">
                    {performanceData.riskMetrics.sortino.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mesure du rendement ajusté au risque de baisse
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ratio de Calmar</span>
                  <span className="font-semibold text-white">
                    {performanceData.riskMetrics.calmar.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rendement annuel / Drawdown maximum
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ratio d'Information</span>
                  <span className="font-semibold text-white">
                    {performanceData.riskMetrics.informationRatio.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Excès de rendement / Erreur de suivi
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Analyse des Risques</h3>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-3">
                Votre profil de risque est basé sur vos métriques de performance:
              </p>
              
              {performanceData.riskMetrics.volatility > 0.02 && (
                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  <span className="text-sm">Volatilité élevée détectée</span>
                </div>
              )}
              
              {performanceData.maxDrawdown > 0.15 && (
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <ArrowTrendingDownIcon className="h-4 w-4" />
                  <span className="text-sm">Drawdown important</span>
                </div>
              )}
              
              {performanceData.sharpeRatio > 1 && (
                <div className="flex items-center gap-2 mb-2 text-green-400">
                  <TrophyIcon className="h-4 w-4" />
                  <span className="text-sm">Bon ratio risque/rendement</span>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-3">
                Recommandation: {performanceData.riskMetrics.volatility > 0.02 
                  ? "Considérez réduire la taille de vos positions"
                  : "Profil de risque acceptable"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
