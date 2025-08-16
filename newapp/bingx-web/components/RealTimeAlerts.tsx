import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'MARGIN_LOW' | 'PNL_TARGET' | 'FUNDING_RATE';
  condition: string;
  currentValue: string;
  targetValue: string;
  triggered: boolean;
  createdAt: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RealTimeAlertsProps {
  accountType: 'perpetual' | 'standard';
}

export default function RealTimeAlerts({ accountType }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC-USDT',
    type: 'PRICE_ABOVE' as Alert['type'],
    targetValue: ''
  });

  useEffect(() => {
    // Simuler des alertes pour la démonstration
    const mockAlerts: Alert[] = [
      {
        id: '1',
        symbol: 'BTC-USDT',
        type: 'PRICE_ABOVE',
        condition: 'Prix > 47000',
        currentValue: '46250.50',
        targetValue: '47000.00',
        triggered: false,
        createdAt: new Date().toISOString(),
        message: 'BTC approche de votre prix cible',
        priority: 'medium'
      },
      {
        id: '2',
        symbol: 'ETH-USDT',
        type: 'MARGIN_LOW',
        condition: 'Marge < 20%',
        currentValue: '15.5%',
        targetValue: '20%',
        triggered: true,
        createdAt: new Date().toISOString(),
        message: 'Attention: Marge faible détectée',
        priority: 'high'
      },
      {
        id: '3',
        symbol: 'SOL-USDT',
        type: 'PNL_TARGET',
        condition: 'P&L > +500',
        currentValue: '+485.75',
        targetValue: '+500.00',
        triggered: false,
        createdAt: new Date().toISOString(),
        message: 'Objectif de profit bientôt atteint',
        priority: 'low'
      }
    ];

    setAlerts(mockAlerts);
    setActiveAlerts(mockAlerts.filter(alert => alert.triggered));

    // Simuler des mises à jour en temps réel
    const interval = setInterval(() => {
      checkAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkAlerts = () => {
    // Simuler la vérification des conditions d'alerte
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        if (!alert.triggered && Math.random() > 0.9) {
          // Simuler le déclenchement d'une alerte
          const triggeredAlert = { ...alert, triggered: true };
          setActiveAlerts(prev => [...prev, triggeredAlert]);
          return triggeredAlert;
        }
        return alert;
      })
    );
  };

  const createAlert = () => {
    if (!newAlert.targetValue) return;

    const alert: Alert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      type: newAlert.type,
      condition: `${newAlert.type.replace('_', ' ')} ${newAlert.targetValue}`,
      currentValue: '0',
      targetValue: newAlert.targetValue,
      triggered: false,
      createdAt: new Date().toISOString(),
      message: `Alerte créée pour ${newAlert.symbol}`,
      priority: 'medium'
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: 'BTC-USDT', type: 'PRICE_ABOVE', targetValue: '' });
    setShowCreateAlert(false);
  };

  const dismissAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/20 text-red-100';
      case 'high': return 'border-orange-500 bg-orange-500/20 text-orange-100';
      case 'medium': return 'border-yellow-500 bg-yellow-500/20 text-yellow-100';
      case 'low': return 'border-blue-500 bg-blue-500/20 text-blue-100';
      default: return 'border-gray-500 bg-gray-500/20 text-gray-100';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'MARGIN_LOW': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'PNL_TARGET': return <CheckCircleIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BellIcon className="w-6 h-6" />
            Alertes en Temps Réel
            {activeAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400 rounded-lg text-blue-100 hover:bg-blue-500/30 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle Alerte
          </button>
        </div>

        {/* Alertes actives */}
        {activeAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">🔔 Alertes Déclenchées</h3>
            <div className="space-y-2">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(alert.type)}
                    <div>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm opacity-75">
                        {alert.symbol} - {alert.condition}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de création d'alerte */}
        {showCreateAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-white mb-4">Créer une Nouvelle Alerte</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Symbole</label>
                  <select
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="BTC-USDT">BTC-USDT</option>
                    <option value="ETH-USDT">ETH-USDT</option>
                    <option value="SOL-USDT">SOL-USDT</option>
                    <option value="ADA-USDT">ADA-USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Type d'Alerte</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as Alert['type'] }))}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="PRICE_ABOVE">Prix au-dessus de</option>
                    <option value="PRICE_BELOW">Prix en-dessous de</option>
                    <option value="MARGIN_LOW">Marge faible</option>
                    <option value="PNL_TARGET">Objectif P&L</option>
                    <option value="FUNDING_RATE">Taux de financement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Valeur Cible</label>
                  <input
                    type="number"
                    value={newAlert.targetValue}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="Ex: 47000"
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={createAlert}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste de toutes les alertes */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Toutes les Alertes</h3>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                alert.triggered 
                  ? getPriorityColor(alert.priority)
                  : 'border-white/20 bg-white/5 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {getTypeIcon(alert.type)}
                <div>
                  <div className="font-medium">
                    {alert.symbol} - {alert.condition}
                  </div>
                  <div className="text-sm opacity-75">
                    Valeur actuelle: {alert.currentValue}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.triggered ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {alert.triggered ? 'Déclenchée' : 'En attente'}
                </span>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}