'use client';

import React, { useState, useEffect } from 'react';
import { BookOpenIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface OrderBookEntry {
  price: string;
  quantity: string;
  total: string;
}

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [spread, setSpread] = useState<number>(0);
  const [spreadPercent, setSpreadPercent] = useState<number>(0);

  // Générer des données de carnet d'ordres simulées
  const generateOrderBook = (basePrice: number) => {
    const newBids: OrderBookEntry[] = [];
    const newAsks: OrderBookEntry[] = [];
    
    let runningBidTotal = 0;
    let runningAskTotal = 0;

    // Générer les offres d'achat (bids) - prix décroissants
    for (let i = 0; i < 15; i++) {
      const price = basePrice - (i + 1) * (basePrice * 0.001 * (0.5 + Math.random()));
      const quantity = Math.random() * 10 + 0.1;
      runningBidTotal += quantity;
      
      newBids.push({
        price: price.toFixed(2),
        quantity: quantity.toFixed(4),
        total: runningBidTotal.toFixed(4)
      });
    }

    // Générer les offres de vente (asks) - prix croissants
    for (let i = 0; i < 15; i++) {
      const price = basePrice + (i + 1) * (basePrice * 0.001 * (0.5 + Math.random()));
      const quantity = Math.random() * 10 + 0.1;
      runningAskTotal += quantity;
      
      newAsks.push({
        price: price.toFixed(2),
        quantity: quantity.toFixed(4),
        total: runningAskTotal.toFixed(4)
      });
    }

    setBids(newBids);
    setAsks(newAsks.reverse()); // Inverser pour avoir les prix les plus bas en haut

    // Calculer le spread
    if (newBids.length > 0 && newAsks.length > 0) {
      const bestBid = parseFloat(newBids[0].price);
      const bestAsk = parseFloat(newAsks[newAsks.length - 1].price);
      const calculatedSpread = bestAsk - bestBid;
      const calculatedSpreadPercent = (calculatedSpread / bestBid) * 100;
      
      setSpread(calculatedSpread);
      setSpreadPercent(calculatedSpreadPercent);
    }

    setLoading(false);
  };

  const getBasePriceForSymbol = (symbol: string): number => {
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
    return basePrices[symbol] || 100;
  };

  useEffect(() => {
    const basePrice = getBasePriceForSymbol(symbol);
    generateOrderBook(basePrice);

    // Mise à jour toutes les 3 secondes
    const interval = setInterval(() => {
      generateOrderBook(basePrice * (0.95 + Math.random() * 0.1)); // Variation de ±5%
    }, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
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
          <BookOpenIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Carnet d&apos;Ordres
        </h3>
        <div className="text-sm text-gray-400">
          {symbol}
        </div>
      </div>

      {/* En-têtes */}
      <div className="grid grid-cols-3 gap-4 mb-3 text-xs text-gray-400 font-medium">
        <div>Prix (USDT)</div>
        <div className="text-right">Quantité</div>
        <div className="text-right">Total</div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {/* Ordres de vente (Asks) */}
        <div className="space-y-1">
          {asks.slice(0, 8).map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="grid grid-cols-3 gap-4 py-1 px-2 rounded text-sm hover:bg-red-900/20 transition-colors"
            >
              <div className="text-red-400 font-mono">{ask.price}</div>
              <div className="text-right text-white font-mono">{ask.quantity}</div>
              <div className="text-right text-gray-400 font-mono">{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-3 px-2 bg-gray-700/50 rounded-lg my-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Spread:</span>
              <span className="text-white font-mono">{spread.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-cyan-400 font-mono">({spreadPercent.toFixed(3)}%)</span>
              {spreadPercent > 0.1 ? (
                <ArrowUpIcon className="h-4 w-4 text-red-400" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-green-400" />
              )}
            </div>
          </div>
        </div>

        {/* Ordres d'achat (Bids) */}
        <div className="space-y-1">
          {bids.slice(0, 8).map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 gap-4 py-1 px-2 rounded text-sm hover:bg-green-900/20 transition-colors"
            >
              <div className="text-green-400 font-mono">{bid.price}</div>
              <div className="text-right text-white font-mono">{bid.quantity}</div>
              <div className="text-right text-gray-400 font-mono">{bid.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Achats</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Ventes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
