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

// Mapping des symboles BingX vers CoinGecko
const COINGECKO_MAPPING: { [key: string]: string } = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum',
  'SOLUSDT': 'solana',
  'ADAUSDT': 'cardano',
  'BNBUSDT': 'binancecoin',
  'XRPUSDT': 'ripple',
  'DOGEUSDT': 'dogecoin',
  'AVAXUSDT': 'avalanche-2'
};

export default function RealTimePrices({ selectedSymbol, onSymbolSelect }: RealTimePricesProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceAnimations, setPriceAnimations] = useState<{ [key: string]: 'up' | 'down' | null }>({});
  const [previousPrices, setPreviousPrices] = useState<{ [key: string]: number }>({});
  const [usingRealData, setUsingRealData] = useState(true);

  // Récupérer les prix réels depuis CoinGecko
  const fetchRealPrices = async (): Promise<PriceData[]> => {
    try {
      const coinIds = Object.values(COINGECKO_MAPPING).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur API CoinGecko');
      }

      const data = await response.json();
      
      const pricesData: PriceData[] = POPULAR_SYMBOLS.map(symbol => {
        const coinId = COINGECKO_MAPPING[symbol];
        const coinData = data[coinId];
        
        if (!coinData) {
          // Fallback avec des données de base si la crypto n'est pas trouvée
          return generateFallbackPrice(symbol);
        }

        const price = coinData.usd;
        const priceChange24h = coinData.usd_24h_change || 0;
        const volume24h = coinData.usd_24h_vol || 0;
        
        // Calculer les prix haut/bas basés sur le changement 24h
        const high = price * (1 + Math.abs(priceChange24h) / 200); // Estimation
        const low = price * (1 - Math.abs(priceChange24h) / 200);  // Estimation
        
        // Mettre à jour les données de graphique
        const existingPrice = prices.find(p => p.symbol === symbol);
        let chartData = existingPrice?.chartData || [];
        chartData.push(price);
        if (chartData.length > 20) {
          chartData = chartData.slice(-20);
        }

        return {
          symbol,
          price: price.toFixed(2),
          priceChange: (price * priceChange24h / 100).toFixed(2),
          priceChangePercent: priceChange24h.toFixed(2),
          volume: volume24h.toFixed(0),
          high: high.toFixed(2),
          low: low.toFixed(2),
          chartData: chartData
        };
      });

      setUsingRealData(true);
      return pricesData;
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error);
      setUsingRealData(false);
      // Fallback vers des données simulées en cas d'erreur
      return POPULAR_SYMBOLS.map(symbol => generateFallbackPrice(symbol));
    }
  };

  // Générer des données de fallback
  const generateFallbackPrice = (symbol: string): PriceData => {
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

    const basePrice = basePrices[symbol] || 100;
    const change = (Math.random() - 0.5) * 0.05; // ±2.5%
    const price = basePrice * (1 + change);
    const changePercent = change * 100;
    
    // Conserver les données de graphique existantes
    const existingPrice = prices.find(p => p.symbol === symbol);
    let chartData = existingPrice?.chartData || [];
    chartData.push(price);
    if (chartData.length > 20) {
      chartData = chartData.slice(-20);
    }
    
    return {
      symbol,
      price: price.toFixed(2),
      priceChange: (price * change).toFixed(2),
      priceChangePercent: changePercent.toFixed(2),
      volume: (Math.random() * 1000000 + 100000).toFixed(0),
      high: (price * 1.05).toFixed(2),
      low: (price * 0.95).toFixed(2),
      chartData: chartData
    };
  };

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newPrices = await fetchRealPrices();
        
        // Détecter les changements de prix pour les animations
        const newAnimations: { [key: string]: 'up' | 'down' | null } = {};
        newPrices.forEach((newPrice) => {
          const oldPrice = previousPrices[newPrice.symbol];
          if (oldPrice) {
            const newPriceValue = parseFloat(newPrice.price);
            if (newPriceValue > oldPrice) {
              newAnimations[newPrice.symbol] = 'up';
            } else if (newPriceValue < oldPrice) {
              newAnimations[newPrice.symbol] = 'down';
            }
          }
        });
        
        // Mettre à jour les prix précédents pour la prochaine comparaison
        const newPreviousPrices: { [key: string]: number } = {};
        newPrices.forEach(price => {
          newPreviousPrices[price.symbol] = parseFloat(price.price);
        });
        setPreviousPrices(newPreviousPrices);
        
        setPriceAnimations(newAnimations);
        setPrices(newPrices);
        setLoading(false);
        setError(null);
        
        // Nettoyer les animations après 500ms
        setTimeout(() => {
          setPriceAnimations({});
        }, 500);
      } catch (err) {
        console.error('Erreur lors de la mise à jour des prix:', err);
        setError('Erreur lors de la récupération des prix');
        setLoading(false);
      }
    };

    // Mise à jour initiale
    updatePrices();

    // Mise à jour toutes les 30 secondes (pour éviter les limites de l'API)
    const interval = setInterval(updatePrices, 30000);

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
          <div className={`w-2 h-2 rounded-full animate-pulse ${usingRealData ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-sm text-gray-400">
            {usingRealData ? 'Live (CoinGecko)' : 'Simulé'}
          </span>
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
