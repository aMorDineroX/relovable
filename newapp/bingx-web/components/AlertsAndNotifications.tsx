import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'price' | 'pnl' | 'funding' | 'volume';
  symbol: string;
  condition: 'above' | 'below' | 'equals';
  value: number;
  currentValue?: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: number;
  message?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  alertId?: string;
}

const AlertsAndNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Formulaire de création d'alerte
  const [newAlert, setNewAlert] = useState({
    type: 'price' as Alert['type'],
    symbol: 'BTC-USDT',
    condition: 'above' as Alert['condition'],
    value: 0
  });

  // Charger les alertes depuis le localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem('bingx-alerts');
    const savedNotifications = localStorage.getItem('bingx-notifications');
    
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Sauvegarder les alertes
  useEffect(() => {
    localStorage.setItem('bingx-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Sauvegarder les notifications
  useEffect(() => {
    localStorage.setItem('bingx-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Vérifier les alertes périodiquement
  useEffect(() => {
    const checkAlerts = async () => {
      for (const alert of alerts.filter(a => a.isActive && !a.triggered)) {
        try {
          let currentValue = 0;
          
          if (alert.type === 'price') {
            const response = await fetch(`/api/market/ticker?symbol=${alert.symbol}`);
            const data = await response.json();
            if (data.success) {
              currentValue = parseFloat(data.data.lastPrice);
            }
          } else if (alert.type === 'funding') {
            const response = await fetch(`/api/market/funding-rate?symbol=${alert.symbol}&limit=1`);
            const data = await response.json();
            if (data.success && data.data.length > 0) {
              currentValue = parseFloat(data.data[0].fundingRate) * 100;
            }
          }
          
          // Vérifier si l'alerte doit être déclenchée
          let shouldTrigger = false;
          if (alert.condition === 'above' && currentValue > alert.value) shouldTrigger = true;
          if (alert.condition === 'below' && currentValue < alert.value) shouldTrigger = true;
          if (alert.condition === 'equals' && Math.abs(currentValue - alert.value) < (alert.value * 0.001)) shouldTrigger = true;
          
          if (shouldTrigger) {
            // Déclencher l'alerte
            setAlerts(prev => prev.map(a => 
              a.id === alert.id 
                ? { ...a, triggered: true, currentValue }
                : a
            ));
            
            // Créer une notification
            const notification: Notification = {
              id: Date.now().toString(),
              type: 'warning',
              title: `Alerte ${alert.type.toUpperCase()} - ${alert.symbol}`,
              message: `${alert.symbol} est ${alert.condition === 'above' ? 'au-dessus de' : 
                                        alert.condition === 'below' ? 'en-dessous de' : 'égal à'} ${alert.value}${alert.type === 'price' ? '$' : '%'}. Valeur actuelle: ${currentValue.toFixed(4)}${alert.type === 'price' ? '$' : '%'}`,
              timestamp: Date.now(),
              read: false,
              alertId: alert.id
            };
            
            setNotifications(prev => [notification, ...prev]);
            
            // Notification browser si permission accordée
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
              });
            }
          } else {
            // Mettre à jour la valeur actuelle
            setAlerts(prev => prev.map(a => 
              a.id === alert.id ? { ...a, currentValue } : a
            ));
          }
        } catch (error) {
          console.error('Erreur vérification alerte:', error);
        }
      }
    };

    const interval = setInterval(checkAlerts, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, [alerts]);

  // Demander permission pour les notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const createAlert = () => {
    if (!newAlert.symbol || !newAlert.value) return;
    
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      triggered: false,
      createdAt: Date.now()
    };
    
    setAlerts(prev => [...prev, alert]);
    setNewAlert({ type: 'price', symbol: 'BTC-USDT', condition: 'above', value: 0 });
    setShowCreateAlert(false);
    
    // Notification de confirmation
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      title: 'Alerte créée',
      message: `Alerte ${newAlert.type} pour ${newAlert.symbol} créée avec succès`,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive, triggered: false } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeAlertsCount = alerts.filter(a => a.isActive).length;

  const getAlertStatusColor = (alert: Alert) => {
    if (alert.triggered) return 'text-red-400';
    if (alert.isActive) return 'text-green-400';
    return 'text-gray-400';
  };

  const getAlertStatusText = (alert: Alert) => {
    if (alert.triggered) return 'Déclenchée';
    if (alert.isActive) return 'Active';
    return 'Inactive';
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Bouton Notifications */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications & Alertes</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowCreateAlert(true)}
                className="flex items-center gap-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Nouvelle Alerte
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{activeAlertsCount} alertes actives</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Section Alertes */}
            <div className="p-4 border-b border-gray-700">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CogIcon className="h-4 w-4" />
                Mes Alertes
              </h4>
              
              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{alert.symbol}</p>
                          <p className="text-xs text-gray-400">
                            {alert.type === 'price' ? 'Prix' : 'Financement'} {alert.condition} {alert.value}{alert.type === 'price' ? '$' : '%'}
                          </p>
                          {alert.currentValue && (
                            <p className="text-xs text-cyan-400">
                              Actuel: {alert.currentValue.toFixed(4)}{alert.type === 'price' ? '$' : '%'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getAlertStatusColor(alert)}`}>
                            {getAlertStatusText(alert)}
                          </span>
                          <button
                            onClick={() => toggleAlert(alert.id)}
                            className={`w-6 h-3 rounded-full transition-colors ${
                              alert.isActive ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${
                              alert.isActive ? 'translate-x-3' : 'translate-x-0.5'
                            } translate-y-0.5`} />
                          </button>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Aucune alerte configurée</p>
              )}
            </div>

            {/* Section Notifications */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Notifications récentes</h4>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Effacer tout
                  </button>
                )}
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 10).map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read ? 'bg-gray-700/30' : 'bg-gray-700/70'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Aucune notification</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'alerte */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Créer une Alerte</h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Type d'alerte</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as Alert['type'] }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="price">Prix</option>
                  <option value="funding">Taux de financement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Symbole</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="BTC-USDT"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as Alert['condition'] }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="above">Au-dessus de</option>
                  <option value="below">En-dessous de</option>
                  <option value="equals">Égal à</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Valeur {newAlert.type === 'price' ? '($)' : '(%)'}
                </label>
                <input
                  type="number"
                  step={newAlert.type === 'price' ? '0.01' : '0.001'}
                  value={newAlert.value || ''}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder={newAlert.type === 'price' ? '45000.00' : '0.01'}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createAlert}
                  disabled={!newAlert.symbol || !newAlert.value}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsAndNotifications;
