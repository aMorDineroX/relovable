'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChartBarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Interface pour le composant simple (rétrocompatibilité)
interface SimpleMiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

// Interface pour le composant avancé
interface AdvancedMiniChartProps {
  symbol: string;
  height?: number;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  showControls?: boolean;
  className?: string;
  advanced?: true;
}

type MiniChartProps = SimpleMiniChartProps | AdvancedMiniChartProps;

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Composant simple pour rétrocompatibilité
function SimpleMiniChart({ data, color = '#22c55e', width = 60, height = 20 }: SimpleMiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  // Créer les points du path SVG
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Composant avancé
function AdvancedMiniChart({
  symbol,
  height = 300,
  timeframe = '15m',
  showControls = true,
  className = ''
}: AdvancedMiniChartProps) {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('line');
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [showVolume, setShowVolume] = useState(false);

  // Générer des données simulées
  const generateMockData = (periods: number = 50) => {
    const basePrice = 45000;
    const data: CandlestickData[] = [];
    let currentPrice = basePrice;

    for (let i = 0; i < periods; i++) {
      const timestamp = Date.now() - (periods - i) * 15 * 60 * 1000;
      
      const open = currentPrice;
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility * open;
      const close = open + change;
      
      const high = Math.max(open, close) + Math.random() * 0.01 * open;
      const low = Math.min(open, close) - Math.random() * 0.01 * open;
      const volume = Math.random() * 100 + 50;

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });

      currentPrice = close;
    }

    return data;
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [symbol, selectedTimeframe]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = latest && previous ? latest.close - previous.close : 0;
    const changePercent = previous ? (change / previous.close) * 100 : 0;

    const high24h = Math.max(...data.slice(-24).map(d => d.high));
    const low24h = Math.min(...data.slice(-24).map(d => d.low));
    const volume24h = data.slice(-24).reduce((sum, d) => sum + d.volume, 0);

    return {
      currentPrice: latest?.close || 0,
      change,
      changePercent,
      high24h,
      low24h,
      volume24h
    };
  }, [data]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    if (data.length === 0) return { prices: [], volumes: [], timestamps: [] };

    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));

    return { prices, volumes, timestamps };
  }, [data]);

  // Calculer les coordonnées pour le graphique SVG
  const getSVGPath = () => {
    if (chartData.prices.length === 0) return '';

    const minPrice = Math.min(...chartData.prices);
    const maxPrice = Math.max(...chartData.prices);
    const priceRange = maxPrice - minPrice;
    const width = 100;
    const chartHeight = height - 60;

    if (priceRange === 0) return '';

    const points = chartData.prices.map((price, index) => {
      const x = (index / (chartData.prices.length - 1)) * width;
      const y = ((maxPrice - price) / priceRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return `M ${points.replace(/,/g, ' L ').substring(2)}`;
  };

  const getAreaPath = () => {
    const linePath = getSVGPath();
    if (!linePath) return '';

    const width = 100;
    const chartHeight = height - 60;

    return `${linePath} L ${width},${chartHeight} L 0,${chartHeight} Z`;
  };

  const formatPrice = (price: number) => 
    price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className={`bg-gray-700/50 rounded-lg p-4 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-700/50 rounded-lg p-4 ${className}`}>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-5 w-5 text-cyan-400" />
          <div>
            <h4 className="font-semibold text-white">{symbol}</h4>
            {stats && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white font-mono">
                  ${formatPrice(stats.currentPrice)}
                </span>
                <span className={`flex items-center gap-1 ${
                  stats.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats.change >= 0 ? 
                    <ArrowTrendingUpIcon className="h-3 w-3" /> :
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  }
                  {stats.changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>

            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
            >
              <option value="line">Ligne</option>
              <option value="area">Zone</option>
              <option value="candlestick">Chandeliers</option>
            </select>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                showVolume 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-600 text-gray-400 hover:text-white'
              }`}
            >
              Vol
            </button>
          </div>
        )}
      </div>

      {/* Graphique */}
      <div className="relative" style={{ height: height - 80 }}>
        {chartData.prices.length > 0 ? (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 100 ${height - 60}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Grille */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {chartType === 'area' && (
              <path
                d={getAreaPath()}
                fill="url(#areaGradient)"
                stroke="none"
              />
            )}

            {(chartType === 'line' || chartType === 'area') && (
              <path
                d={getSVGPath()}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {chartType === 'candlestick' && data.map((candle, index) => {
              const minPrice = Math.min(...chartData.prices);
              const maxPrice = Math.max(...chartData.prices);
              const priceRange = maxPrice - minPrice;
              const x = (index / (data.length - 1)) * 100;
              const candleWidth = 80 / data.length;

              if (priceRange === 0) return null;

              const openY = ((maxPrice - candle.open) / priceRange) * (height - 60);
              const closeY = ((maxPrice - candle.close) / priceRange) * (height - 60);
              const highY = ((maxPrice - candle.high) / priceRange) * (height - 60);
              const lowY = ((maxPrice - candle.low) / priceRange) * (height - 60);

              const isGreen = candle.close > candle.open;
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.abs(openY - closeY);

              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isGreen ? '#10b981' : '#ef4444'}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={Math.max(bodyHeight, 1)}
                    fill={isGreen ? '#10b981' : '#ef4444'}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Aucune donnée disponible
          </div>
        )}

        {/* Volume chart si activé */}
        {showVolume && chartData.volumes.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-800/50 rounded">
            <svg width="100%" height="100%" viewBox="0 0 100 16" preserveAspectRatio="none">
              {chartData.volumes.map((volume, index) => {
                const maxVolume = Math.max(...chartData.volumes);
                const height = (volume / maxVolume) * 16;
                const x = (index / (chartData.volumes.length - 1)) * 100;
                const barWidth = 100 / chartData.volumes.length * 0.8;

                return (
                  <rect
                    key={index}
                    x={x - barWidth / 2}
                    y={16 - height}
                    width={barWidth}
                    height={height}
                    fill="#9ca3af"
                    opacity="0.6"
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Statistiques du bas */}
      {stats && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600 text-xs">
          <div className="text-gray-400">
            <span>H: </span>
            <span className="text-green-400">${formatPrice(stats.high24h)}</span>
          </div>
          <div className="text-gray-400">
            <span>L: </span>
            <span className="text-red-400">${formatPrice(stats.low24h)}</span>
          </div>
          <div className="text-gray-400">
            <span>Vol: </span>
            <span className="text-cyan-400">{stats.volume24h.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant principal avec détection automatique du type
export default function MiniChart(props: MiniChartProps) {
  // Détection du type de props pour le composant approprié
  if ('advanced' in props && props.advanced) {
    return <AdvancedMiniChart {...props} />;
  }
  
  if ('symbol' in props) {
    return <AdvancedMiniChart {...props} />;
  }
  
  return <SimpleMiniChart {...props} />;
}
