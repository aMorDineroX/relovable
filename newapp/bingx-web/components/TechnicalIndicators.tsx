'use client';

import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SignalIcon } from '@heroicons/react/24/outline';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  description: string;
}

interface TechnicalIndicatorsProps {
  symbol: string;
}

export default function TechnicalIndicators({ symbol }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallSignal, setOverallSignal] = useState<'BUY' | 'SELL' | 'NEUTRAL'>('NEUTRAL');

  // Générer des indicateurs techniques simulés
  const generateIndicators = (): TechnicalIndicator[] => {
    // RSI (Relative Strength Index)
    const rsi = 30 + Math.random() * 40; // Entre 30 et 70
    const rsiSignal = rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'NEUTRAL';

    // MACD
    const macd = (Math.random() - 0.5) * 10;
    const macdSignal = macd > 0 ? 'BUY' : macd < 0 ? 'SELL' : 'NEUTRAL';

    // Stochastic
    const stoch = Math.random() * 100;
    const stochSignal = stoch < 20 ? 'BUY' : stoch > 80 ? 'SELL' : 'NEUTRAL';

    // Bollinger Bands
    const bbPosition = Math.random(); // Position entre les bandes
    const bbSignal = bbPosition < 0.2 ? 'BUY' : bbPosition > 0.8 ? 'SELL' : 'NEUTRAL';

    // Moving Average Convergence
    const maSignal = Math.random() > 0.5 ? 'BUY' : 'SELL';

    // Williams %R
    const williamsR = -Math.random() * 100;
    const williamsSignal = williamsR < -80 ? 'BUY' : williamsR > -20 ? 'SELL' : 'NEUTRAL';

    // Commodity Channel Index
    const cci = (Math.random() - 0.5) * 400; // Entre -200 et 200
    const cciSignal = cci < -100 ? 'BUY' : cci > 100 ? 'SELL' : 'NEUTRAL';

    return [
      {
        name: 'RSI (14)',
        value: rsi,
        signal: rsiSignal,
        description: rsi < 30 ? 'Survente' : rsi > 70 ? 'Surachat' : 'Neutre'
      },
      {
        name: 'MACD',
        value: macd,
        signal: macdSignal,
        description: macd > 0 ? 'Signal haussier' : 'Signal baissier'
      },
      {
        name: 'Stochastic',
        value: stoch,
        signal: stochSignal,
        description: stoch < 20 ? 'Survente' : stoch > 80 ? 'Surachat' : 'Neutre'
      },
      {
        name: 'Bollinger Bands',
        value: bbPosition * 100,
        signal: bbSignal,
        description: bbPosition < 0.2 ? 'Proche bande basse' : bbPosition > 0.8 ? 'Proche bande haute' : 'Entre les bandes'
      },
      {
        name: 'MA Signal',
        value: Math.random() * 100,
        signal: maSignal,
        description: maSignal === 'BUY' ? 'Prix au-dessus MA' : 'Prix en-dessous MA'
      },
      {
        name: 'Williams %R',
        value: williamsR,
        signal: williamsSignal,
        description: williamsR < -80 ? 'Survente' : williamsR > -20 ? 'Surachat' : 'Neutre'
      },
      {
        name: 'CCI',
        value: cci,
        signal: cciSignal,
        description: cci < -100 ? 'Survente' : cci > 100 ? 'Surachat' : 'Neutre'
      }
    ];
  };

  const calculateOverallSignal = (indicators: TechnicalIndicator[]): 'BUY' | 'SELL' | 'NEUTRAL' => {
    const buySignals = indicators.filter(ind => ind.signal === 'BUY').length;
    const sellSignals = indicators.filter(ind => ind.signal === 'SELL').length;
    
    if (buySignals > sellSignals + 1) return 'BUY';
    if (sellSignals > buySignals + 1) return 'SELL';
    return 'NEUTRAL';
  };

  useEffect(() => {
    const updateIndicators = () => {
      const newIndicators = generateIndicators();
      setIndicators(newIndicators);
      setOverallSignal(calculateOverallSignal(newIndicators));
      setLoading(false);
    };

    // Mise à jour initiale
    updateIndicators();

    // Mise à jour toutes les 5 secondes
    const interval = setInterval(updateIndicators, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <ArrowTrendingUpIcon className="h-4 w-4" />;
      case 'SELL': return <ArrowTrendingDownIcon className="h-4 w-4" />;
      default: return <SignalIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Indicateurs Techniques
        </h3>
        <div className="text-sm text-gray-400">
          {symbol}
        </div>
      </div>

      {/* Signal global */}
      <div className={`p-4 rounded-lg mb-6 border-2 ${
        overallSignal === 'BUY' ? 'bg-green-900/20 border-green-500' :
        overallSignal === 'SELL' ? 'bg-red-900/20 border-red-500' :
        'bg-yellow-900/20 border-yellow-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Signal Global</div>
            <div className={`text-xl font-bold flex items-center space-x-2 ${getSignalColor(overallSignal)}`}>
              {getSignalIcon(overallSignal)}
              <span>{overallSignal}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Consensus</div>
            <div className="text-lg font-semibold text-white">
              {indicators.filter(ind => ind.signal === overallSignal).length}/{indicators.length}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des indicateurs */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-white">{indicator.name}</span>
                <div className={`flex items-center space-x-1 ${getSignalColor(indicator.signal)}`}>
                  {getSignalIcon(indicator.signal)}
                  <span className="text-sm font-medium">{indicator.signal}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-white">
                  {indicator.value.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {indicator.description}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-gray-400">Achat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-gray-400">Vente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-400">Neutre</span>
          </div>
        </div>
      </div>
    </div>
  );
}
