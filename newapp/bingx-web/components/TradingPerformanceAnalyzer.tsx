import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface TradingPerformanceProps {
  accountType: 'perpetual' | 'standard';
}

interface PositionHistory {
  symbol: string;
  positionSide: 'LONG' | 'SHORT';
  netPnl: string;
  roi: string;
  durationFormatted: string;
  openTimeFormatted: string;
  closeTimeFormatted: string;
  performanceScore: 'excellent' | 'good' | 'positive' | 'poor' | 'bad';
  isWin: boolean;
  invested: string;
  commissionPercent: string;
}

interface PerformanceMetrics {
  totalTrades: number;
  winRate: string;
  totalPnl: string;
  overallROI: string;
  profitFactor: string;
  averageWin: string;
  averageLoss: string;
  bestTrade: PositionHistory | null;
  worstTrade: PositionHistory | null;
  tradingAdvice: {
    performance: string;
    suggestion: string;
  };
}

interface CommissionRate {
  symbol: string;
  makerRatePercent: string;
  takerRatePercent: string;
  spread: string;
  savingsPercent: string;
  projections: {
    '1K': { maker: string; taker: string };
    '10K': { maker: string; taker: string };
    '100K': { maker: string; taker: string };
  };
}

export default function TradingPerformanceAnalyzer({ accountType }: TradingPerformanceProps) {
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'history' | 'fees'>('performance');

  useEffect(() => {
    fetchTradingData();
  }, [accountType]);

  const fetchTradingData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer l'historique des positions
      const historyResponse = await fetch('/api/trading/position-history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPositionHistory(historyData.data || []);
        setPerformance(historyData.performance || null);
      }

      // Récupérer les taux de commission
      const commissionResponse = await fetch('/api/trading/commission-rates');
      if (commissionResponse.ok) {
        const commissionData = await commissionResponse.json();
        setCommissionRates(commissionData.data || []);
      }

    } catch (err) {
      setError('Erreur lors du chargement des données de performance');
      console.error('Trading data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-400 bg-green-400/20 border-green-400';
      case 'good': return 'text-blue-400 bg-blue-400/20 border-blue-400';
      case 'positive': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400';
      case 'poor': return 'text-orange-400 bg-orange-400/20 border-orange-400';
      case 'bad': return 'text-red-400 bg-red-400/20 border-red-400';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec onglets */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Analyse de Performance - {accountType === 'perpetual' ? 'Perpetual' : 'Standard'} Futures
          </h2>
          <button
            onClick={fetchTradingData}
            className="px-4 py-2 bg-blue-500/20 border border-blue-400 rounded-lg text-blue-100 hover:bg-blue-500/30 transition-all"
          >
            Actualiser
          </button>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'performance', label: 'Performance', icon: ArrowTrendingUpIcon },
            { id: 'history', label: 'Historique', icon: ClockIcon },
            { id: 'fees', label: 'Frais', icon: CurrencyDollarIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                activeTab === id
                  ? 'bg-blue-500/30 text-blue-100 border border-blue-400'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Contenu des onglets */}
      {activeTab === 'performance' && performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Métriques principales */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vue d'Ensemble</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Trades:</span>
                <span className="text-white font-mono">{performance.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Taux de Réussite:</span>
                <span className={`font-mono ${parseFloat(performance.winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {performance.winRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">P&L Total:</span>
                <span className={`font-mono ${parseFloat(performance.totalPnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${performance.totalPnl}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">ROI Global:</span>
                <span className={`font-mono ${parseFloat(performance.overallROI) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {performance.overallROI}
                </span>
              </div>
            </div>
          </div>

          {/* Facteur de profit */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analyse Risque/Rendement</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Facteur de Profit:</span>
                <span className={`font-mono ${parseFloat(performance.profitFactor) >= 2 ? 'text-green-400' : parseFloat(performance.profitFactor) >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {performance.profitFactor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Gain Moyen:</span>
                <span className="text-green-400 font-mono">${performance.averageWin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Perte Moyenne:</span>
                <span className="text-red-400 font-mono">${performance.averageLoss}</span>
              </div>
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Conseils IA</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-300 text-sm">Performance:</span>
                <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
                  performance.tradingAdvice.performance === 'Excellent' ? 'bg-green-400/20 text-green-400' :
                  performance.tradingAdvice.performance === 'Good' ? 'bg-blue-400/20 text-blue-400' :
                  performance.tradingAdvice.performance === 'Average' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-red-400/20 text-red-400'
                }`}>
                  {performance.tradingAdvice.performance}
                </div>
              </div>
              <div>
                <span className="text-gray-300 text-sm">Suggestion:</span>
                <p className="text-white text-sm mt-1">{performance.tradingAdvice.suggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique des positions */}
      {activeTab === 'history' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Historique des Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-gray-300">
                  <th className="text-left py-2">Symbole</th>
                  <th className="text-left py-2">Direction</th>
                  <th className="text-left py-2">P&L</th>
                  <th className="text-left py-2">ROI</th>
                  <th className="text-left py-2">Durée</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Fermeture</th>
                </tr>
              </thead>
              <tbody>
                {positionHistory.slice(0, 10).map((position, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 text-white font-mono">{position.symbol}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        position.positionSide === 'LONG' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {position.positionSide}
                      </span>
                    </td>
                    <td className={`py-2 font-mono ${position.isWin ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.netPnl}
                    </td>
                    <td className={`py-2 font-mono ${position.isWin ? 'text-green-400' : 'text-red-400'}`}>
                      {position.roi}
                    </td>
                    <td className="py-2 text-gray-300">{position.durationFormatted}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs border ${getPerformanceColor(position.performanceScore)}`}>
                        {position.performanceScore}
                      </span>
                    </td>
                    <td className="py-2 text-gray-300 text-xs">{position.closeTimeFormatted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frais de trading */}
      {activeTab === 'fees' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Structure des Frais</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 text-gray-300">
                  <th className="text-left py-2">Symbole</th>
                  <th className="text-left py-2">Maker</th>
                  <th className="text-left py-2">Taker</th>
                  <th className="text-left py-2">Spread</th>
                  <th className="text-left py-2">Économies</th>
                  <th className="text-left py-2">Projection 10K</th>
                </tr>
              </thead>
              <tbody>
                {commissionRates.slice(0, 10).map((rate, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 text-white font-mono">{rate.symbol}</td>
                    <td className="py-2 text-green-400 font-mono">{rate.makerRatePercent}</td>
                    <td className="py-2 text-yellow-400 font-mono">{rate.takerRatePercent}</td>
                    <td className="py-2 text-gray-300 font-mono">{rate.spread}</td>
                    <td className="py-2 text-blue-400 font-mono">{rate.savingsPercent}</td>
                    <td className="py-2 text-gray-300 font-mono">
                      ${rate.projections['10K'].maker} / ${rate.projections['10K'].taker}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}