import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  XMarkIcon,
  BellIcon,
  EyeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface UserSettings {
  // Préférences d'affichage
  theme: 'dark' | 'light' | 'auto';
  language: 'fr' | 'en' | 'es' | 'zh';
  currency: 'USD' | 'EUR' | 'BTC' | 'ETH';
  
  // Préférences de trading
  defaultLeverage: number;
  defaultOrderType: 'MARKET' | 'LIMIT' | 'STOP' | 'TAKE_PROFIT';
  confirmOrders: boolean;
  showPnLPercentage: boolean;
  
  // Préférences de notifications
  enableNotifications: boolean;
  enableSounds: boolean;
  notificationTypes: {
    orders: boolean;
    positions: boolean;
    alerts: boolean;
    funding: boolean;
  };
  
  // Préférences d'affichage des données
  refreshInterval: number; // en secondes
  showAdvancedMetrics: boolean;
  autoRefresh: boolean;
  
  // Préférences de sécurité
  requireConfirmation: boolean;
  sessionTimeout: number; // en minutes
  
  // Préférences de graphiques
  defaultTimeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  chartType: 'candlestick' | 'line' | 'area';
  showVolume: boolean;
  showIndicators: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'fr',
  currency: 'USD',
  defaultLeverage: 10,
  defaultOrderType: 'LIMIT',
  confirmOrders: true,
  showPnLPercentage: true,
  enableNotifications: true,
  enableSounds: false,
  notificationTypes: {
    orders: true,
    positions: true,
    alerts: true,
    funding: false
  },
  refreshInterval: 30,
  showAdvancedMetrics: false,
  autoRefresh: true,
  requireConfirmation: true,
  sessionTimeout: 30,
  defaultTimeframe: '1h',
  chartType: 'candlestick',
  showVolume: true,
  showIndicators: false
};

const UserSettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'trading' | 'notifications' | 'display' | 'security'>('general');

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bingx-user-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = () => {
    localStorage.setItem('bingx-user-settings', JSON.stringify(settings));
    setHasChanges(false);
    
    // Appliquer les paramètres immédiatement
    if (settings.enableNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Réinitialiser aux paramètres par défaut
  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // Mettre à jour un paramètre
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Mettre à jour un type de notification
  const updateNotificationType = (type: keyof UserSettings['notificationTypes'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: value
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: CogIcon },
    { id: 'trading', label: 'Trading', icon: ChartBarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'display', label: 'Affichage', icon: EyeIcon },
    { id: 'security', label: 'Sécurité', icon: CheckIcon }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-300 hover:text-white transition-colors"
        title="Paramètres"
      >
        <CogIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Paramètres</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-700/50 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-cyan-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Paramètres généraux</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Thème</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value as UserSettings['theme'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="dark">Sombre</option>
                      <option value="light">Clair</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Langue</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value as UserSettings['language'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Devise de référence</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value as UserSettings['currency'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="BTC">BTC (₿)</option>
                      <option value="ETH">ETH (Ξ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Intervalle de rafraîchissement (secondes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={settings.refreshInterval}
                      onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Rafraîchissement automatique</span>
                  <button
                    onClick={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.autoRefresh ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                    } translate-y-0.5`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'trading' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Paramètres de trading</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Levier par défaut</label>
                    <input
                      type="number"
                      min="1"
                      max="125"
                      value={settings.defaultLeverage}
                      onChange={(e) => updateSetting('defaultLeverage', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type d'ordre par défaut</label>
                    <select
                      value={settings.defaultOrderType}
                      onChange={(e) => updateSetting('defaultOrderType', e.target.value as UserSettings['defaultOrderType'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="MARKET">Marché</option>
                      <option value="LIMIT">Limite</option>
                      <option value="STOP">Stop</option>
                      <option value="TAKE_PROFIT">Take Profit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe par défaut</label>
                    <select
                      value={settings.defaultTimeframe}
                      onChange={(e) => updateSetting('defaultTimeframe', e.target.value as UserSettings['defaultTimeframe'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="1m">1 minute</option>
                      <option value="5m">5 minutes</option>
                      <option value="15m">15 minutes</option>
                      <option value="1h">1 heure</option>
                      <option value="4h">4 heures</option>
                      <option value="1d">1 jour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type de graphique</label>
                    <select
                      value={settings.chartType}
                      onChange={(e) => updateSetting('chartType', e.target.value as UserSettings['chartType'])}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="candlestick">Chandeliers</option>
                      <option value="line">Ligne</option>
                      <option value="area">Zone</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Confirmer les ordres</span>
                    <button
                      onClick={() => updateSetting('confirmOrders', !settings.confirmOrders)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.confirmOrders ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.confirmOrders ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Afficher PnL en pourcentage</span>
                    <button
                      onClick={() => updateSetting('showPnLPercentage', !settings.showPnLPercentage)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showPnLPercentage ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showPnLPercentage ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Afficher le volume</span>
                    <button
                      onClick={() => updateSetting('showVolume', !settings.showVolume)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showVolume ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showVolume ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Afficher les indicateurs</span>
                    <button
                      onClick={() => updateSetting('showIndicators', !settings.showIndicators)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showIndicators ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showIndicators ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Activer les notifications</span>
                    <button
                      onClick={() => updateSetting('enableNotifications', !settings.enableNotifications)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.enableNotifications ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Sons de notification</span>
                    <button
                      onClick={() => updateSetting('enableSounds', !settings.enableSounds)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.enableSounds ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.enableSounds ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium mb-4">Types de notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Ordres exécutés</span>
                      <button
                        onClick={() => updateNotificationType('orders', !settings.notificationTypes.orders)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.notificationTypes.orders ? 'bg-cyan-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings.notificationTypes.orders ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Changements de positions</span>
                      <button
                        onClick={() => updateNotificationType('positions', !settings.notificationTypes.positions)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.notificationTypes.positions ? 'bg-cyan-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings.notificationTypes.positions ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Alertes de prix</span>
                      <button
                        onClick={() => updateNotificationType('alerts', !settings.notificationTypes.alerts)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.notificationTypes.alerts ? 'bg-cyan-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings.notificationTypes.alerts ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Taux de financement</span>
                      <button
                        onClick={() => updateNotificationType('funding', !settings.notificationTypes.funding)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings.notificationTypes.funding ? 'bg-cyan-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings.notificationTypes.funding ? 'translate-x-6' : 'translate-x-0.5'
                        } translate-y-0.5`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Préférences d'affichage</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Afficher les métriques avancées</span>
                    <button
                      onClick={() => updateSetting('showAdvancedMetrics', !settings.showAdvancedMetrics)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showAdvancedMetrics ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showAdvancedMetrics ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Sécurité</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Demander confirmation pour les actions sensibles</span>
                    <button
                      onClick={() => updateSetting('requireConfirmation', !settings.requireConfirmation)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.requireConfirmation ? 'bg-cyan-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.requireConfirmation ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex justify-between items-center">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Réinitialiser
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPanel;
