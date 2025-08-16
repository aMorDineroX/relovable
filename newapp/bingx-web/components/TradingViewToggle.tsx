'use client';

import React from 'react';
import { useTradingView } from './TradingViewProvider';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const TradingViewToggle: React.FC = () => {
  const { isVisible, toggleWidget } = useTradingView();

  return (
    <button
      onClick={toggleWidget}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
        isVisible
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
      }`}
      title={isVisible ? 'Fermer TradingView' : 'Ouvrir TradingView'}
    >
      <ChartBarIcon className="h-6 w-6" />
    </button>
  );
};

export default TradingViewToggle;