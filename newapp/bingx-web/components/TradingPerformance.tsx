'use client';

import React from 'react';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  tradesToday: number;
  tradesThisWeek: number;
  tradesThisMonth: number;
}

interface TradingPerformanceProps {
  stats?: TradingStats;
}

// Données simulées pour la démonstration
const mockStats: TradingStats = {
  totalTrades: 147,
  winningTrades: 89,
  losingTrades: 58,
  winRate: 60.54,
  totalPnL: 2840.75,
  avgWin: 145.30,
  avgLoss: -87.20,
  bestTrade: 890.50,
  worstTrade: -234.80,
  profitFactor: 1.67,
  maxDrawdown: -1250.30,
  sharpeRatio: 1.34,
  tradesToday: 3,
  tradesThisWeek: 12,
  tradesThisMonth: 41
};

export default function TradingPerformance({ stats = mockStats }: TradingPerformanceProps) {
  const getPerformanceColor = (value: number, isProfit: boolean = true) => {
    if (isProfit) {
      return value >= 0 ? 'text-green-400' : 'text-red-400';
    }
    return value >= 0 ? 'text-red-400' : 'text-green-400';
  };

  const getRatingColor = (value: number, good: number, excellent: number) => {
    if (value >= excellent) return 'text-green-400';
    if (value >= good) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Performance Trading
        </h3>
        <div className="flex items-center space-x-2">
          <TrophyIcon className="h-5 w-5 text-yellow-400" />
          <span className="text-sm text-gray-400">Score: 
            <span className={`ml-1 font-semibold ${getRatingColor(stats.winRate, 50, 70)}`}>
              {stats.winRate.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* P&L Total */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">P&L Total</p>
              <p className={`text-xl font-bold ${getPerformanceColor(stats.totalPnL)}`}>
                ${stats.totalPnL.toFixed(2)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${stats.totalPnL >= 0 ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              {stats.totalPnL >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Taux de Réussite */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Taux de Réussite</p>
              <p className={`text-xl font-bold ${getRatingColor(stats.winRate, 50, 70)}`}>
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-sm text-right">
              <p className="text-green-400">{stats.winningTrades} gains</p>
              <p className="text-red-400">{stats.losingTrades} pertes</p>
            </div>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Profit Factor</p>
              <p className={`text-xl font-bold ${getRatingColor(stats.profitFactor, 1.2, 1.5)}`}>
                {stats.profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="text-sm text-right">
              <p className="text-green-400">+${stats.avgWin.toFixed(2)}</p>
              <p className="text-red-400">${stats.avgLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sharpe Ratio</p>
              <p className={`text-xl font-bold ${getRatingColor(stats.sharpeRatio, 1, 1.5)}`}>
                {stats.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Qualité du<br />rendement
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistiques Détaillées */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-lg font-medium text-gray-300 border-b border-gray-600 pb-2">
            Statistiques Détaillées
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
                <span className="text-gray-400">Trades totaux:</span>
                <span className="text-white font-semibold">{stats.totalTrades}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-900/20 rounded border border-green-700/50">
                <span className="text-green-300">Meilleur trade:</span>
                <span className="text-green-400 font-semibold">+${stats.bestTrade.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-900/20 rounded border border-red-700/50">
                <span className="text-red-300">Pire trade:</span>
                <span className="text-red-400 font-semibold">${stats.worstTrade.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-900/20 rounded border border-orange-700/50">
                <span className="text-orange-300">Max Drawdown:</span>
                <span className="text-orange-400 font-semibold">${stats.maxDrawdown.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
                <span className="text-gray-400">Gain moyen:</span>
                <span className="text-green-400 font-semibold">+${stats.avgWin.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded">
                <span className="text-gray-400">Perte moyenne:</span>
                <span className="text-red-400 font-semibold">${stats.avgLoss.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-cyan-900/20 rounded border border-cyan-700/50">
                <span className="text-cyan-300">Ratio R/R moyen:</span>
                <span className="text-cyan-400 font-semibold">
                  1:{(Math.abs(stats.avgWin / stats.avgLoss)).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded border border-purple-700/50">
                <span className="text-purple-300">Expectancy:</span>
                <span className={`font-semibold ${getPerformanceColor(
                  (stats.winRate / 100) * stats.avgWin + ((100 - stats.winRate) / 100) * stats.avgLoss
                )}`}>
                  ${((stats.winRate / 100) * stats.avgWin + ((100 - stats.winRate) / 100) * stats.avgLoss).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activité Récente */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-300 border-b border-gray-600 pb-2">
            Activité Récente
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Aujourd&apos;hui:</span>
              </div>
              <span className="text-white font-semibold">{stats.tradesToday} trades</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-green-400" />
                <span className="text-gray-400">Cette semaine:</span>
              </div>
              <span className="text-white font-semibold">{stats.tradesThisWeek} trades</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">Ce mois:</span>
              </div>
              <span className="text-white font-semibold">{stats.tradesThisMonth} trades</span>
            </div>
            
            {/* Progression */}
            <div className="mt-4 p-3 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded border border-cyan-700/50">
              <div className="text-sm text-cyan-300 mb-2">Progression du mois</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.tradesThisMonth / 50) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.tradesThisMonth}/50 trades objectif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h5 className="text-blue-300 font-semibold mb-2">💡 Recommandations</h5>
        <div className="text-sm text-blue-200 space-y-1">
          {stats.winRate < 50 && (
            <p>• Travaillez sur votre stratégie d&apos;entrée pour améliorer votre taux de réussite.</p>
          )}
          {stats.profitFactor < 1.2 && (
            <p>• Optimisez votre ratio risque/récompense pour augmenter le profit factor.</p>
          )}
          {stats.sharpeRatio < 1 && (
            <p>• Réduisez la volatilité de vos retours pour améliorer le Sharpe ratio.</p>
          )}
          {Math.abs(stats.avgLoss) > stats.avgWin && (
            <p>• Vos pertes sont plus importantes que vos gains, ajustez vos stops et targets.</p>
          )}
        </div>
      </div>
    </div>
  );
}
