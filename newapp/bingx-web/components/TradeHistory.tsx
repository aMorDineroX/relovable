import React, { useState, useEffect, useMemo } from 'react';
import { useMarketData, MarketTrade } from '../hooks/useMarketData';
import { ArrowUpIcon, ArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TradeHistoryProps {
  symbol?: string;
  className?: string;
  maxTrades?: number;
  showVolume?: boolean;
  autoScroll?: boolean;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({
  symbol = 'BTC-USDT',
  className = '',
  maxTrades = 50,
  showVolume = true,
  autoScroll = true
}) => {
  const { trades, loading, error, fetchTrades } = useMarketData({ symbol });
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  // Filtrer et limiter les trades
  const filteredTrades = useMemo(() => {
    let filtered = trades;
    
    if (filter === 'buy') {
      filtered = trades.filter(trade => !trade.isBuyerMaker);
    } else if (filter === 'sell') {
      filtered = trades.filter(trade => trade.isBuyerMaker);
    }
    
    return filtered.slice(0, maxTrades);
  }, [trades, filter, maxTrades]);

  // Statistiques des trades
  const tradeStats = useMemo(() => {
    if (trades.length === 0) return null;

    const buyTrades = trades.filter(t => !t.isBuyerMaker);
    const sellTrades = trades.filter(t => t.isBuyerMaker);
    
    const totalVolume = trades.reduce((sum, trade) => sum + parseFloat(trade.qty), 0);
    const buyVolume = buyTrades.reduce((sum, trade) => sum + parseFloat(trade.qty), 0);
    const sellVolume = sellTrades.reduce((sum, trade) => sum + parseFloat(trade.qty), 0);
    
    const avgPrice = trades.reduce((sum, trade) => sum + parseFloat(trade.price), 0) / trades.length;
    
    return {
      total: trades.length,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalVolume: totalVolume.toFixed(4),
      buyVolume: buyVolume.toFixed(4),
      sellVolume: sellVolume.toFixed(4),
      avgPrice: avgPrice.toFixed(2),
      buyPercentage: (buyTrades.length / trades.length) * 100,
      sellPercentage: (sellTrades.length / trades.length) * 100
    };
  }, [trades]);

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format price with direction indicator
  const formatPrice = (price: string, isBuy: boolean) => {
    return (
      <span className={`flex items-center ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
        {isBuy ? (
          <ArrowUpIcon className="w-3 h-3 mr-1" />
        ) : (
          <ArrowDownIcon className="w-3 h-3 mr-1" />
        )}
        {parseFloat(price).toFixed(2)}
      </span>
    );
  };

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrades(symbol);
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchTrades, symbol]);

  if (loading.trades) {
    return (
      <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Historique des trades</h3>
          <div className="text-sm text-gray-400">{symbol}</div>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2">
          {(['all', 'buy', 'sell'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`
                px-3 py-1 rounded text-xs font-medium transition-colors
                ${filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {filterType === 'all' ? 'Tous' : filterType === 'buy' ? 'Achats' : 'Ventes'}
            </button>
          ))}
        </div>

        {/* Statistiques */}
        {tradeStats && (
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-400">Total trades</div>
              <div className="text-white font-mono">{tradeStats.total}</div>
            </div>
            <div>
              <div className="text-gray-400">Volume total</div>
              <div className="text-white font-mono">{tradeStats.totalVolume}</div>
            </div>
            <div>
              <div className="text-gray-400">Achats/Ventes</div>
              <div className="flex space-x-2">
                <span className="text-green-400">{tradeStats.buyCount}</span>
                <span className="text-gray-500">/</span>
                <span className="text-red-400">{tradeStats.sellCount}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-400">Prix moyen</div>
              <div className="text-white font-mono">{tradeStats.avgPrice}</div>
            </div>
          </div>
        )}
      </div>

      {/* Table headers */}
      <div className="flex justify-between text-xs text-gray-500 p-2 border-b border-gray-800">
        <span className="flex items-center">
          <ClockIcon className="w-3 h-3 mr-1" />
          Heure
        </span>
        <span>Prix</span>
        {showVolume && <span>Quantité</span>}
        <span>Type</span>
      </div>

      {/* Trades list */}
      <div className="max-h-96 overflow-y-auto">
        {filteredTrades.map((trade) => (
          <div
            key={trade.id}
            className={`
              flex justify-between items-center py-2 px-2 text-xs cursor-pointer
              ${selectedTrade === trade.id ? 'bg-gray-700' : 'hover:bg-gray-800'}
              transition-colors duration-150 border-b border-gray-800
            `}
            onClick={() => setSelectedTrade(
              selectedTrade === trade.id ? null : trade.id
            )}
          >
            <span className="text-gray-400 font-mono">
              {formatTime(trade.time)}
            </span>
            
            <span className="font-mono">
              {formatPrice(trade.price, !trade.isBuyerMaker)}
            </span>
            
            {showVolume && (
              <span className="text-gray-300 font-mono">
                {parseFloat(trade.qty).toFixed(4)}
              </span>
            )}
            
            <span className={`
              px-2 py-1 rounded text-xs font-medium
              ${!trade.isBuyerMaker 
                ? 'bg-green-900 text-green-400' 
                : 'bg-red-900 text-red-400'
              }
            `}>
              {!trade.isBuyerMaker ? 'A' : 'V'}
            </span>
          </div>
        ))}
      </div>

      {/* Footer avec informations du trade sélectionné */}
      {selectedTrade && (
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          {(() => {
            const trade = trades.find(t => t.id === selectedTrade);
            if (!trade) return null;
            
            const tradeValue = parseFloat(trade.price) * parseFloat(trade.qty);
            
            return (
              <div className="text-xs">
                <div className="text-gray-400 mb-1">Détails du trade</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">ID: </span>
                    <span className="text-white font-mono">{trade.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valeur: </span>
                    <span className="text-white font-mono">{tradeValue.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Indicateur de mise à jour en temps réel */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default TradeHistory;
