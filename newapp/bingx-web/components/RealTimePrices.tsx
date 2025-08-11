'use client';

import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import MiniChart from './MiniChart';

interface PriceData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  high: string;
  low: string;
  chartData: number[];
}

interface RealTimePricesProps {
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
}

const POPULAR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT'];

export default function RealTimePrices({ selectedSymbol, onSymbolSelect }: RealTimePricesProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceAnimations, setPriceAnimations] = useState<{ [key: string]: 'up' | 'down' | null }>({});

  const basePrices: { [key: string]: number } = {
    'BTCUSDT': 43500,
    'ETHUSDT': 2650,
    'SOLUSDT': 98,
    'ADAUSDT': 0.45,
    'BNBUSDT': 315,
    'XRPUSDT': 0.62,
    'DOGEUSDT': 0.08,
    'AVAXUSDT': 27,
  };

  // Simuler des données de prix en temps réel
  const generateMockPrice = (symbol: string, basePrice: number, existingChartData?: number[]): PriceData => {
    const change = (Math.random() - 0.5) * 0.1; // Changement de ±5%
    const priceChange = basePrice * change;
    const newPrice = basePrice + priceChange;
    const changePercent = (change * 100);
    
    // Générer ou mettre à jour les données de graphique
    let chartData = existingChartData || [];
    chartData.push(newPrice);
    if (chartData.length > 20) {
      chartData = chartData.slice(-20); // Garder seulement les 20 derniers points
    }
    
    return {
      symbol,
      price: newPrice.toFixed(2),
      priceChange: priceChange.toFixed(2),
      priceChangePercent: changePercent.toFixed(2),
      volume: (Math.random() * 1000000 + 100000).toFixed(0),
      high: (newPrice * (1 + Math.random() * 0.05)).toFixed(2),
      low: (newPrice * (1 - Math.random() * 0.05)).toFixed(2),
      chartData: chartData
    };
  };

  useEffect(() => {
    const updatePrices = () => {
      const newPrices = POPULAR_SYMBOLS.map((symbol, index) => {
        const existingPrice = prices[index];
        const existingChartData = existingPrice?.chartData;
        return generateMockPrice(symbol, basePrices[symbol] || 100, existingChartData);
      });
      
      // Détecter les changements de prix pour les animations
      const newAnimations: { [key: string]: 'up' | 'down' | null } = {};
      newPrices.forEach((newPrice, index) => {
        const oldPrice = prices[index];
        if (oldPrice) {
          const oldPriceValue = parseFloat(oldPrice.price);
          const newPriceValue = parseFloat(newPrice.price);
          if (newPriceValue > oldPriceValue) {
            newAnimations[newPrice.symbol] = 'up';
          } else if (newPriceValue < oldPriceValue) {
            newAnimations[newPrice.symbol] = 'down';
          }
        }
      });
      
      setPriceAnimations(newAnimations);
      setPrices(newPrices);
      setLoading(false);
      
      // Nettoyer les animations après 500ms
      setTimeout(() => {
        setPriceAnimations({});
      }, 500);
    };

    // Mise à jour initiale
    updatePrices();

    // Mise à jour toutes les 2 secondes
    const interval = setInterval(updatePrices, 2000);

    return () => clearInterval(interval);
  }, []); // Dépendance vide pour éviter les boucles infinies

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <CurrencyDollarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Prix en Temps Réel
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {prices.map((price) => {
          const isPositive = parseFloat(price.priceChangePercent) >= 0;
          const isSelected = selectedSymbol === price.symbol;
          const animation = priceAnimations[price.symbol];
          
          return (
            <div
              key={price.symbol}
              onClick={() => onSymbolSelect?.(price.symbol)}
              className={`p-3 rounded-lg transition-all cursor-pointer card-hover ${
                isSelected 
                  ? 'bg-cyan-600/20 border border-cyan-500' 
                  : 'bg-gray-700/50 hover:bg-gray-700/80'
              } ${animation === 'up' ? 'price-up' : animation === 'down' ? 'price-down' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{price.symbol.replace('USDT', '')}</span>
                    <span className="text-xs text-gray-400">USDT</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Vol: {parseFloat(price.volume).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Mini graphique */}
                  <div className="hidden sm:block">
                    <MiniChart 
                      data={price.chartData} 
                      color={isPositive ? '#22c55e' : '#ef4444'}
                      width={50}
                      height={20}
                    />
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold text-white">
                      ${price.price}
                    </div>
                    <div className={`flex items-center text-sm ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {price.priceChangePercent}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>H: ${price.high}</span>
                <span>L: ${price.low}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
