'use client';

import React from 'react';
import { useTradingView } from './TradingViewProvider';
import useTradingViewQuickActions from '../hooks/useTradingViewQuickActions';
import { ChartBarIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

const TradingViewIntegrationExample: React.FC = () => {
  const { isVisible } = useTradingView();
  const {
    openBTC,
    openETH,
    openSymbol,
    openWithInterval,
    switchToSidebar,
    switchToBottom,
    switchToFloating,
  } = useTradingViewQuickActions();

  const popularPairs = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'BNBUSDT', name: 'BNB' },
    { symbol: 'ADAUSDT', name: 'Cardano' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'XRPUSDT', name: 'Ripple' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <ChartBarIcon className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Intégration TradingView
        </h2>
        {isVisible && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Actif
          </span>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Accédez rapidement aux graphiques TradingView pour analyser vos cryptomonnaies préférées.
      </p>

      {/* Actions rapides */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Actions rapides
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openBTC}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Ouvrir BTC
            </button>
            <button
              onClick={openETH}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Ouvrir ETH
            </button>
            <button
              onClick={() => openWithInterval('SOLUSDT', '15')}
              className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              SOL 15min
            </button>
          </div>
        </div>

        {/* Paires populaires */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Paires populaires
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {popularPairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => openSymbol(pair.symbol)}
                className="p-2 text-left border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {pair.symbol.replace('USDT', '/USDT')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {pair.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Positions d'affichage */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <CursorArrowRaysIcon className="h-4 w-4 inline mr-1" />
            Positions d'affichage
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={switchToFloating}
              className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Flottant
            </button>
            <button
              onClick={switchToSidebar}
              className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              Barre latérale
            </button>
            <button
              onClick={switchToBottom}
              className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              En bas
            </button>
          </div>
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Guide d'utilisation
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Cliquez sur l'icône flottante en haut à droite pour ouvrir/fermer TradingView</li>
          <li>• Utilisez les boutons ci-dessus pour ouvrir directement un symbole</li>
          <li>• Changez la position d'affichage selon vos préférences</li>
          <li>• Le graphique s'adapte automatiquement au thème de votre application</li>
          <li>• Toutes les modifications sont sauvegardées pendant votre session</li>
        </ul>
      </div>
    </div>
  );
};

export default TradingViewIntegrationExample;