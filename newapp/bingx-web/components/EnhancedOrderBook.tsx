import React, { useState, useEffect, useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';

interface OrderBookProps {
  symbol?: string;
  className?: string;
  showSpread?: boolean;
  maxLevels?: number;
  precision?: number;
}

interface OrderBookLevel {
  price: string;
  size: string;
  total: string;
  percentage: number;
}

const OrderBook: React.FC<OrderBookProps> = ({
  symbol = 'BTC-USDT',
  className = '',
  showSpread = true,
  maxLevels = 15,
  precision = 2
}) => {
  const { depth, loading, error, fetchDepth } = useMarketData({ symbol });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Calculer les totaux cumulés et pourcentages
  const processedData = useMemo(() => {
    if (!depth) return { bids: [], asks: [] };

    const processBids = (bids: [string, string][]) => {
      let cumulativeTotal = 0;
      const maxTotal = bids.reduce((sum, [, size]) => sum + parseFloat(size), 0);
      
      return bids.slice(0, maxLevels).map(([price, size]) => {
        cumulativeTotal += parseFloat(size);
        return {
          price: parseFloat(price).toFixed(precision),
          size: parseFloat(size).toFixed(4),
          total: cumulativeTotal.toFixed(4),
          percentage: (cumulativeTotal / maxTotal) * 100
        };
      });
    };

    const processAsks = (asks: [string, string][]) => {
      let cumulativeTotal = 0;
      const maxTotal = asks.reduce((sum, [, size]) => sum + parseFloat(size), 0);
      
      return asks.slice(0, maxLevels).map(([price, size]) => {
        cumulativeTotal += parseFloat(size);
        return {
          price: parseFloat(price).toFixed(precision),
          size: parseFloat(size).toFixed(4),
          total: cumulativeTotal.toFixed(4),
          percentage: (cumulativeTotal / maxTotal) * 100
        };
      });
    };

    return {
      bids: processBids(depth.bids),
      asks: processAsks(depth.asks.reverse()) // Reverse pour afficher du plus bas au plus haut
    };
  }, [depth, maxLevels, precision]);

  // Calculer le spread
  const spread = useMemo(() => {
    if (!depth || depth.bids.length === 0 || depth.asks.length === 0) return null;
    
    const bestBid = parseFloat(depth.bids[0][0]);
    const bestAsk = parseFloat(depth.asks[0][0]);
    const spreadValue = bestAsk - bestBid;
    const spreadPercent = (spreadValue / bestBid) * 100;
    
    return {
      value: spreadValue.toFixed(precision),
      percent: spreadPercent.toFixed(4)
    };
  }, [depth, precision]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDepth(symbol);
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchDepth, symbol]);

  if (loading.depth) {
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

  const OrderBookLevel: React.FC<{
    level: OrderBookLevel;
    type: 'bid' | 'ask';
    isSelected: boolean;
    onClick: () => void;
  }> = ({ level, type, isSelected, onClick }) => (
    <div
      className={`
        relative flex justify-between items-center py-1 px-2 text-xs cursor-pointer
        ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'}
        transition-colors duration-150
      `}
      onClick={onClick}
    >
      {/* Barre de volume en arrière-plan */}
      <div
        className={`
          absolute inset-0 opacity-20
          ${type === 'bid' ? 'bg-green-400' : 'bg-red-400'}
        `}
        style={{ width: `${level.percentage}%` }}
      />
      
      <span className={type === 'bid' ? 'text-green-400' : 'text-red-400'}>
        {level.price}
      </span>
      <span className="text-gray-300">{level.size}</span>
      <span className="text-gray-500 text-xs">{level.total}</span>
    </div>
  );

  return (
    <div className={`bg-gray-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Carnet d'ordres</h3>
          <div className="text-sm text-gray-400">
            {symbol}
          </div>
        </div>
        
        {/* Table headers */}
        <div className="flex justify-between text-xs text-gray-500 mt-3 px-2">
          <span>Prix</span>
          <span>Taille</span>
          <span>Total</span>
        </div>
      </div>

      <div className="p-2">
        {/* Asks (Vendeurs) */}
        <div className="mb-2">
          {processedData.asks.map((level, index) => (
            <OrderBookLevel
              key={`ask-${level.price}`}
              level={level}
              type="ask"
              isSelected={selectedLevel === `ask-${level.price}`}
              onClick={() => setSelectedLevel(
                selectedLevel === `ask-${level.price}` ? null : `ask-${level.price}`
              )}
            />
          ))}
        </div>

        {/* Spread */}
        {showSpread && spread && (
          <div className="bg-gray-800 rounded p-2 my-2 text-center">
            <div className="text-xs text-gray-400">Spread</div>
            <div className="text-sm font-mono">
              <span className="text-white">{spread.value}</span>
              <span className="text-gray-500 ml-2">({spread.percent}%)</span>
            </div>
          </div>
        )}

        {/* Bids (Acheteurs) */}
        <div>
          {processedData.bids.map((level, index) => (
            <OrderBookLevel
              key={`bid-${level.price}`}
              level={level}
              type="bid"
              isSelected={selectedLevel === `bid-${level.price}`}
              onClick={() => setSelectedLevel(
                selectedLevel === `bid-${level.price}` ? null : `bid-${level.price}`
              )}
            />
          ))}
        </div>
      </div>

      {/* Footer avec informations */}
      {selectedLevel && (
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Prix sélectionné: <span className="text-white font-mono">{selectedLevel.split('-')[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBook;
