'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface TradingAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'price' | 'signal';
  title: string;
  message: string;
  timestamp: Date;
  symbol?: string;
  price?: number;
  read: boolean;
}

interface TradingAlertsProps {
  alerts?: TradingAlert[];
  onDismiss?: (id: string) => void;
}

export default function TradingAlerts({ alerts: initialAlerts, onDismiss }: TradingAlertsProps) {
  const [alerts, setAlerts] = useState<TradingAlert[]>(
    initialAlerts || [
      {
        id: '1',
        type: 'success',
        title: 'Ordre Exécuté',
        message: 'Votre ordre d\'achat de 0.1 BTC à 43,500$ a été exécuté avec succès.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        symbol: 'BTCUSDT',
        price: 43500,
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Stop Loss Approché',
        message: 'Le prix de ETH s\'approche de votre stop loss à 2,600$.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        symbol: 'ETHUSDT',
        price: 2610,
        read: false
      },
      {
        id: '3',
        type: 'signal',
        title: 'Signal d\'Achat - RSI',
        message: 'RSI de SOL montre une condition de survente (28). Signal d\'achat potentiel.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        symbol: 'SOLUSDT',
        read: true
      },
      {
        id: '4',
        type: 'price',
        title: 'Alerte de Prix',
        message: 'ADA a atteint votre prix cible de 0.45$.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        symbol: 'ADAUSDT',
        price: 0.45,
        read: true
      }
    ]
  );
  const [isOpen, setIsOpen] = useState(false);

  // Générer des alertes aléatoirement
  useEffect(() => {
    const generateRandomAlert = () => {
      const alertTypes: TradingAlert['type'][] = ['success', 'warning', 'signal', 'price', 'info'];
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT'];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

      const alertMessages: Record<TradingAlert['type'], { title: string; message: string }[]> = {
        success: [
          { title: 'Ordre Exécuté', message: `Ordre ${randomSymbol} exécuté avec succès.` },
          { title: 'Take Profit Atteint', message: `Take profit sur ${randomSymbol} déclenché.` }
        ],
        warning: [
          { title: 'Stop Loss Approché', message: `Prix de ${randomSymbol} s'approche du stop loss.` },
          { title: 'Marge Faible', message: 'Votre marge disponible est faible.' }
        ],
        signal: [
          { title: 'Signal Technique', message: `Signal d'achat détecté sur ${randomSymbol}.` },
          { title: 'Breakout Détecté', message: `${randomSymbol} a cassé sa résistance.` }
        ],
        price: [
          { title: 'Alerte de Prix', message: `${randomSymbol} a atteint votre prix cible.` }
        ],
        info: [
          { title: 'Mise à Jour', message: 'Nouvelles données de marché disponibles.' }
        ],
        error: [
          { title: 'Erreur', message: 'Erreur lors de l\'exécution de l\'ordre.' }
        ]
      };

      const possibleMessages = alertMessages[randomType];
      const randomMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

      const newAlert: TradingAlert = {
        id: Date.now().toString(),
        type: randomType,
        title: randomMessage.title,
        message: randomMessage.message,
        timestamp: new Date(),
        symbol: randomSymbol,
        read: false
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Garder max 20 alertes
    };

    // Générer une alerte toutes les 30-60 secondes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance
        generateRandomAlert();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: TradingAlert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
      case 'price':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-purple-400" />;
      case 'signal':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-cyan-400" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAlertColor = (type: TradingAlert['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'error':
        return 'border-red-500 bg-red-900/20';
      case 'info':
        return 'border-blue-500 bg-blue-900/20';
      case 'price':
        return 'border-purple-500 bg-purple-900/20';
      case 'signal':
        return 'border-cyan-500 bg-cyan-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    onDismiss?.(id);
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bouton des alertes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <BellIcon className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des alertes */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Alertes Trading
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {unreadCount} non lues
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune alerte pour le moment</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      getAlertColor(alert.type)
                    } ${!alert.read ? 'border-l-4' : 'border-l border-opacity-50'}`}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-semibold ${
                              !alert.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {alert.title}
                              {alert.symbol && (
                                <span className="ml-2 text-xs text-cyan-400">
                                  {alert.symbol}
                                </span>
                              )}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss(alert.id);
                              }}
                              className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                          <p className={`text-xs mt-1 ${
                            !alert.read ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                            {alert.price && (
                              <span className="text-xs font-mono text-gray-400">
                                ${alert.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => setAlerts([])}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
              >
                Effacer toutes les alertes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
