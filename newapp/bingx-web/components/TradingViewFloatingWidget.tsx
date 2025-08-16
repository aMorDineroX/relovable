'use client';

import React, { useState } from 'react';
import { useTradingView } from './TradingViewProvider';
import TradingViewWidget from './TradingViewWidget';
import {
  ChartBarIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

const TradingViewFloatingWidget: React.FC = () => {
  const {
    isVisible,
    symbol,
    theme,
    interval,
    position,
    size,
    hideWidget,
    setSymbol,
    setTheme,
    setInterval,
    setPosition,
    setSize,
  } = useTradingView();

  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { width: '400px', height: '300px' };
      case 'medium':
        return { width: '600px', height: '400px' };
      case 'large':
        return { width: '800px', height: '600px' };
      default:
        return { width: '600px', height: '400px' };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'floating':
        return 'fixed bottom-4 right-4 z-50';
      case 'sidebar':
        return 'fixed top-16 right-0 h-[calc(100vh-4rem)] z-40 border-l border-gray-200 dark:border-gray-700';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-700';
      default:
        return 'fixed bottom-4 right-4 z-50';
    }
  };

  const containerSize = getSizeClasses();
  const positionClasses = getPositionClasses();

  const popularSymbols = [
    'BINANCE:BTCUSDT',
    'BINANCE:ETHUSDT',
    'BINANCE:BNBUSDT',
    'BINANCE:ADAUSDT',
    'BINANCE:SOLUSDT',
    'BINANCE:XRPUSDT',
    'BINANCE:DOGEUSDT',
    'BINANCE:AVAXUSDT',
  ];

  const intervals = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '30', label: '30m' },
    { value: '60', label: '1h' },
    { value: '240', label: '4h' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
  ];

  return (
    <div
      className={`${positionClasses} bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
      style={{
        width: position === 'bottom' ? '100%' : containerSize.width,
        height: isMinimized ? '60px' : (position === 'sidebar' ? '100%' : containerSize.height),
        maxWidth: position === 'bottom' ? '100vw' : 'none',
      }}
    >
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            Graphique TradingView
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {symbol.replace('BINANCE:', '')}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Bouton thème */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Changer le thème"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <MoonIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Bouton minimiser */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isMinimized ? "Agrandir" : "Réduire"}
          >
            {isMinimized ? (
              <ArrowsPointingOutIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ArrowsPointingInIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Bouton paramètres */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Paramètres"
          >
            <Cog6ToothIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Bouton fermer */}
          <button
            onClick={hideWidget}
            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            title="Fermer"
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Panneau de paramètres */}
      {showSettings && !isMinimized && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sélection du symbole */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symbole
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {popularSymbols.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym.replace('BINANCE:', '')}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de l'intervalle */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intervalle
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {intervals.map((int) => (
                  <option key={int.value} value={int.value}>
                    {int.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection de la position */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as 'floating' | 'sidebar' | 'bottom')}
                className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="floating">Flottant</option>
                <option value="sidebar">Barre latérale</option>
                <option value="bottom">En bas</option>
              </select>
            </div>
          </div>

          {/* Sélection de la taille (uniquement pour flottant) */}
          {position === 'floating' && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Taille
              </label>
              <div className="flex space-x-2">
                {['small', 'medium', 'large'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s as 'small' | 'medium' | 'large')}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      size === s
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {s === 'small' ? 'Petit' : s === 'medium' ? 'Moyen' : 'Grand'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Widget TradingView */}
      {!isMinimized && (
        <div className="flex-1">
          <TradingViewWidget
            symbol={symbol}
            theme={theme}
            interval={interval}
            width="100%"
            height={position === 'sidebar' ? '100%' : containerSize.height - (showSettings ? 140 : 60)}
            autosize={position !== 'floating'}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};

export default TradingViewFloatingWidget;