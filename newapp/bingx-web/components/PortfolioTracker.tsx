'use client';

import React, { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import MiniChart from './MiniChart';

interface Asset {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  chartData: number[];
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  portfolioHistory: number[];
}

export default function PortfolioTracker() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    portfolioHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '1D' | '1W' | '1M'>('1D');

  // Données simulées du portefeuille
  const mockPortfolio = [
    { symbol: 'BTC', name: 'Bitcoin', quantity: 0.25, averagePrice: 42000 },
    { symbol: 'ETH', name: 'Ethereum', quantity: 2.5, averagePrice: 2500 },
    { symbol: 'SOL', name: 'Solana', quantity: 15, averagePrice: 95 },
    { symbol: 'ADA', name: 'Cardano', quantity: 1000, averagePrice: 0.42 },
    { symbol: 'BNB', name: 'BNB', quantity: 5, averagePrice: 300 },
  ];

  const currentPrices: { [key: string]: number } = {
    'BTC': 43500,
    'ETH': 2650,
    'SOL': 98,
    'ADA': 0.45,
    'BNB': 315,
  };

  const generatePortfolioData = () => {
    let totalValue = 0;
    let totalInvested = 0;

    const updatedAssets: Asset[] = mockPortfolio.map((asset) => {
      const currentPrice = currentPrices[asset.symbol] * (1 + (Math.random() - 0.5) * 0.02); // ±1% variation
      const value = asset.quantity * currentPrice;
      const invested = asset.quantity * asset.averagePrice;
      const pnl = value - invested;
      const pnlPercent = (pnl / invested) * 100;

      totalValue += value;
      totalInvested += invested;

      // Générer des données de graphique pour l'asset
      const existingAsset = assets.find(a => a.symbol === asset.symbol);
      let chartData = existingAsset?.chartData || [];
      chartData.push(currentPrice);
      if (chartData.length > 24) {
        chartData = chartData.slice(-24); // Garder 24 points
      }

      return {
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        averagePrice: asset.averagePrice,
        currentPrice,
        value,
        pnl,
        pnlPercent,
        allocation: 0, // Sera calculé après
        chartData
      };
    });

    // Calculer les allocations
    updatedAssets.forEach(asset => {
      asset.allocation = (asset.value / totalValue) * 100;
    });

    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = (totalPnL / totalInvested) * 100;
    const dayChange = totalValue * (Math.random() - 0.5) * 0.05; // ±2.5% variation journalière
    const dayChangePercent = (dayChange / totalValue) * 100;

    // Mettre à jour l'historique du portefeuille
    const existingHistory = stats.portfolioHistory || [];
    const newHistory = [...existingHistory, totalValue];
    if (newHistory.length > 50) {
      newHistory.splice(0, newHistory.length - 50); // Garder 50 points
    }

    setAssets(updatedAssets);
    setStats({
      totalValue,
      totalInvested,
      totalPnL,
      totalPnLPercent,
      dayChange,
      dayChangePercent,
      portfolioHistory: newHistory
    });
  };

  useEffect(() => {
    const updatePortfolio = () => {
      generatePortfolioData();
      setLoading(false);
    };

    // Mise à jour initiale
    updatePortfolio();

    // Mise à jour toutes les 5 secondes
    const interval = setInterval(updatePortfolio, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isPortfolioPositive = stats.totalPnLPercent >= 0;
  const isDayPositive = stats.dayChangePercent >= 0;

  return (
    <div className="space-y-6">
      {/* Statistiques du portefeuille */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <WalletIcon className="h-6 w-6 mr-3 text-cyan-400" />
            Évolution du Portefeuille
          </h3>
          <div className="flex space-x-2">
            {(['1H', '1D', '1W', '1M'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valeur Totale</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">P&L Total</p>
                <p className={`text-2xl font-bold ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}${stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              {isPortfolioPositive ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Variation 24h</p>
                <p className={`text-2xl font-bold ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isDayPositive ? '+' : ''}${stats.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isDayPositive ? '+' : ''}{stats.dayChangePercent.toFixed(2)}%
                </p>
              </div>
              {isDayPositive ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Investissement</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Graphique de l'évolution du portefeuille */}
        {stats.portfolioHistory.length > 1 && (
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-white">Évolution du Portefeuille</h4>
            <div className="flex justify-center">
              <MiniChart 
                data={stats.portfolioHistory} 
                color={isPortfolioPositive ? '#22c55e' : '#ef4444'}
                width={600}
                height={150}
              />
            </div>
          </div>
        )}
      </div>

      {/* Détail des assets */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <h4 className="text-lg font-semibold mb-4 text-white">Composition du Portefeuille</h4>
        
        <div className="space-y-3">
          {assets.map((asset) => {
            const isAssetPositive = asset.pnlPercent >= 0;
            
            return (
              <div key={asset.symbol} className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/80 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{asset.symbol}</span>
                        <span className="text-sm text-gray-400">{asset.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {asset.quantity} × ${asset.currentPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Mini graphique */}
                    <div className="hidden sm:block">
                      <MiniChart 
                        data={asset.chartData} 
                        color={isAssetPositive ? '#22c55e' : '#ef4444'}
                        width={60}
                        height={30}
                      />
                    </div>

                    {/* Allocation */}
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Allocation</div>
                      <div className="font-semibold text-white">{asset.allocation.toFixed(1)}%</div>
                    </div>

                    {/* Valeur */}
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm ${isAssetPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isAssetPositive ? '+' : ''}${asset.pnl.toFixed(2)} ({isAssetPositive ? '+' : ''}{asset.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression pour l'allocation */}
                <div className="mt-3">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${asset.allocation}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
