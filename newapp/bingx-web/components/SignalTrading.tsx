'use client';

import React, { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  PlayIcon, 
  StopIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  LinkIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Signal {
  id: string;
  name: string;
  type: 'SIMPLE' | 'STRATEGY';
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  symbol: string;
  webhook: string;
  position: 'LONG' | 'SHORT' | 'BOTH';
  riskLevel: number;
  signalsReceived: number;
  signalsExecuted: number;
  totalProfit: number;
  roi: number;
  createdAt: number;
  lastSignal?: number;
  errors: number;
}

interface SignalConfig {
  name: string;
  type: 'SIMPLE' | 'STRATEGY';
  symbol: string;
  position: 'LONG' | 'SHORT' | 'BOTH';
  riskLevel: number;
  quantity: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  maxDailySignals: number;
}

type SignalTab = 'create' | 'running' | 'history';

export default function SignalTrading() {
  const [activeTab, setActiveTab] = useState<SignalTab>('create');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration du nouveau signal
  const [signalConfig, setSignalConfig] = useState<SignalConfig>({
    name: 'Mon Signal BTC',
    type: 'SIMPLE',
    symbol: 'BTCUSDT',
    position: 'BOTH',
    riskLevel: 50,
    quantity: 0.01,
    leverage: 1,
    maxDailySignals: 10,
  });

  const [isCreatingSignal, setIsCreatingSignal] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showSignalDetails, setShowSignalDetails] = useState(false);
  const [generatedWebhook, setGeneratedWebhook] = useState<string>('');

  // Simuler des données de signaux
  useEffect(() => {
    const mockSignals: Signal[] = [
      {
        id: 'signal-001',
        name: 'TradingView BTC Signals',
        type: 'STRATEGY',
        status: 'ACTIVE',
        symbol: 'BTCUSDT',
        webhook: 'https://api.bingx.com/webhook/abc123',
        position: 'BOTH',
        riskLevel: 70,
        signalsReceived: 45,
        signalsExecuted: 42,
        totalProfit: 156.32,
        roi: 12.4,
        createdAt: Date.now() - 86400000 * 7, // 7 jours
        lastSignal: Date.now() - 1800000, // 30 min
        errors: 3,
      },
      {
        id: 'signal-002',
        name: 'ETH Momentum Strategy',
        type: 'SIMPLE',
        status: 'ACTIVE',
        symbol: 'ETHUSDT',
        webhook: 'https://api.bingx.com/webhook/def456',
        position: 'LONG',
        riskLevel: 50,
        signalsReceived: 23,
        signalsExecuted: 23,
        totalProfit: -12.45,
        roi: -2.1,
        createdAt: Date.now() - 86400000 * 3, // 3 jours
        lastSignal: Date.now() - 3600000, // 1 heure
        errors: 0,
      },
      {
        id: 'signal-003',
        name: 'SOL Scalping Bot',
        type: 'STRATEGY',
        status: 'PAUSED',
        symbol: 'SOLUSDT',
        webhook: 'https://api.bingx.com/webhook/ghi789',
        position: 'BOTH',
        riskLevel: 80,
        signalsReceived: 78,
        signalsExecuted: 65,
        totalProfit: 89.67,
        roi: 7.8,
        createdAt: Date.now() - 86400000 * 5, // 5 jours
        lastSignal: Date.now() - 7200000, // 2 heures
        errors: 13,
      },
    ];
    setSignals(mockSignals);
  }, []);

  const generateWebhook = () => {
    const webhookId = Math.random().toString(36).substr(2, 9);
    const webhook = `https://api.bingx.com/webhook/signal/${webhookId}`;
    setGeneratedWebhook(webhook);
    return webhook;
  };

  const createSignal = async () => {
    setIsCreatingSignal(true);
    setError(null);
    
    try {
      // Générer un webhook unique
      const webhook = generateWebhook();
      
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSignal: Signal = {
        id: `signal-${Date.now()}`,
        name: signalConfig.name,
        type: signalConfig.type,
        status: 'ACTIVE',
        symbol: signalConfig.symbol,
        webhook: webhook,
        position: signalConfig.position,
        riskLevel: signalConfig.riskLevel,
        signalsReceived: 0,
        signalsExecuted: 0,
        totalProfit: 0,
        roi: 0,
        createdAt: Date.now(),
        errors: 0,
      };
      
      setSignals(prev => [newSignal, ...prev]);
      
      // Reset form
      setSignalConfig({
        name: 'Mon Signal BTC',
        type: 'SIMPLE',
        symbol: 'BTCUSDT',
        position: 'BOTH',
        riskLevel: 50,
        quantity: 0.01,
        leverage: 1,
        maxDailySignals: 10,
      });
      
      // Switch to running tab
      setActiveTab('running');
      
      alert('✅ Signal Trading créé avec succès !\n🔗 Webhook: ' + webhook);
    } catch (err) {
      setError('Erreur lors de la création du signal');
    } finally {
      setIsCreatingSignal(false);
    }
  };

  const pauseSignal = async (signalId: string) => {
    try {
      setSignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, status: 'PAUSED' as const } : signal
      ));
      alert('⏸️ Signal mis en pause');
    } catch (err) {
      alert('Erreur lors de la mise en pause');
    }
  };

  const resumeSignal = async (signalId: string) => {
    try {
      setSignals(prev => prev.map(signal => 
        signal.id === signalId ? { ...signal, status: 'ACTIVE' as const } : signal
      ));
      alert('▶️ Signal réactivé');
    } catch (err) {
      alert('Erreur lors de la réactivation');
    }
  };

  const deleteSignal = async (signalId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce signal ?')) {
      setSignals(prev => prev.filter(signal => signal.id !== signalId));
      alert('🗑️ Signal supprimé');
    }
  };

  const copyWebhook = (webhook: string) => {
    navigator.clipboard.writeText(webhook);
    alert('📋 Webhook copié dans le presse-papiers !');
  };

  const activeSignals = signals.filter(signal => signal.status === 'ACTIVE');
  const pausedSignals = signals.filter(signal => signal.status === 'PAUSED');
  const totalProfit = signals.reduce((sum, signal) => sum + signal.totalProfit, 0);
  const totalSignalsReceived = signals.reduce((sum, signal) => sum + signal.signalsReceived, 0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <WifiIcon className="h-8 w-8 text-cyan-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Signal Trading</h2>
            <p className="text-gray-400 text-sm">Intégration TradingView • Exécution automatique • Webhooks</p>
          </div>
        </div>
        
        {/* Métriques globales */}
        <div className="flex gap-4">
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{activeSignals.length}</div>
            <div className="text-xs text-gray-400">Signaux Actifs</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Profit Total (USDT)</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyan-400">{totalSignalsReceived}</div>
            <div className="text-xs text-gray-400">Signaux Reçus</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
          <p><strong>Erreur:</strong> {error}</p>
        </div>
      )}

      {/* Navigation des onglets */}
      <div className="flex space-x-1 bg-gray-700/50 rounded-lg p-1 mb-6">
        <TabButton
          active={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
          icon={<PlusIcon className="h-5 w-5" />}
          label="Créer"
          count={undefined}
        />
        <TabButton
          active={activeTab === 'running'}
          onClick={() => setActiveTab('running')}
          icon={<BoltIcon className="h-5 w-5" />}
          label="Actifs"
          count={activeSignals.length}
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={<ClockIcon className="h-5 w-5" />}
          label="Historique"
          count={pausedSignals.length}
        />
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration du signal */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-2 text-cyan-400" />
                Configuration du Signal
              </h3>

              {/* Nom du signal */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du Signal
                </label>
                <input
                  type="text"
                  value={signalConfig.name}
                  onChange={(e) => setSignalConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Mon Signal BTC"
                />
              </div>

              {/* Type de signal */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de Signal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['SIMPLE', 'STRATEGY'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSignalConfig(prev => ({ ...prev, type }))}
                      className={`py-3 px-4 rounded-lg transition-all ${
                        signalConfig.type === type
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{type}</div>
                      <div className="text-xs opacity-75">
                        {type === 'SIMPLE' ? 'Paramètres fixes' : 'Variables flexibles'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symbole */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbole de Trading
                </label>
                <input
                  type="text"
                  value={signalConfig.symbol}
                  onChange={(e) => setSignalConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="BTCUSDT"
                />
                {/* Boutons de symboles populaires */}
                <div className="flex space-x-2 mt-2">
                  {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT'].map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => setSignalConfig(prev => ({ ...prev, symbol }))}
                      className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 text-xs rounded transition-colors"
                    >
                      {symbol.replace('USDT', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LONG', 'SHORT', 'BOTH'] as const).map(position => (
                    <button
                      key={position}
                      onClick={() => setSignalConfig(prev => ({ ...prev, position }))}
                      className={`py-3 px-4 rounded-lg transition-all ${
                        signalConfig.position === position
                          ? position === 'LONG' ? 'bg-green-600 text-white' :
                            position === 'SHORT' ? 'bg-red-600 text-white' :
                            'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {position === 'LONG' ? '📈 Long' :
                         position === 'SHORT' ? '📉 Short' : '🔄 Les Deux'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Niveau de risque */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Niveau de Risque: {signalConfig.riskLevel}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={signalConfig.riskLevel}
                  onChange={(e) => setSignalConfig(prev => ({ ...prev, riskLevel: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>🔒 Conservateur (10%)</span>
                  <span>⚖️ Modéré (50%)</span>
                  <span>🚀 Agressif (100%)</span>
                </div>
              </div>

              {/* Paramètres de trading */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantité par Signal
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={signalConfig.quantity}
                    onChange={(e) => setSignalConfig(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Levier
                  </label>
                  <select
                    value={signalConfig.leverage}
                    onChange={(e) => setSignalConfig(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    {[1, 2, 3, 5, 10, 20, 50].map(lev => (
                      <option key={lev} value={lev}>{lev}x</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Limites */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Signaux Maximum par Jour
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={signalConfig.maxDailySignals}
                  onChange={(e) => setSignalConfig(prev => ({ ...prev, maxDailySignals: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Guide et webhook */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <LinkIcon className="h-6 w-6 mr-2 text-cyan-400" />
                Configuration TradingView
              </h3>

              {/* Guide d'intégration */}
              <div className="bg-blue-900/30 border border-blue-600 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                  <BoltIcon className="h-5 w-5 mr-2" />
                  Guide d'Intégration Rapide
                </h4>
                <div className="space-y-3 text-sm text-blue-200">
                  <div className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <div>
                      <strong>Créez votre signal</strong> en cliquant sur "Créer Signal" ci-dessous
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <div>
                      <strong>Copiez l'URL du Webhook</strong> générée automatiquement
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <div>
                      <strong>Dans TradingView</strong>, créez une alerte et collez l'URL dans le champ "Webhook URL"
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    <div>
                      <strong>Configurez le message</strong> de l'alerte selon vos besoins
                    </div>
                  </div>
                </div>
              </div>

              {/* Exemple de configuration TradingView */}
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Exemple de Message d'Alerte TradingView
                </h4>
                <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm text-green-400">
                  <div className="text-gray-400 mb-2">// Message Simple:</div>
                  <code>
                    {`{
  "action": "{{strategy.order.action}}",
  "symbol": "${signalConfig.symbol}",
  "quantity": "${signalConfig.quantity}",
  "price": "{{close}}"
}`}
                  </code>
                  
                  <div className="text-gray-400 mb-2 mt-4">// Message Stratégie:</div>
                  <code>
                    {`{
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "quantity": "{{strategy.order.contracts}}",
  "price": "{{strategy.order.price}}",
  "stop_loss": "{{strategy.order.sl}}",
  "take_profit": "{{strategy.order.tp}}"
}`}
                  </code>
                </div>
              </div>

              {/* Paramètres avancés */}
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Paramètres de Protection (Optionnel)
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stop Loss (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={signalConfig.stopLoss || ''}
                      onChange={(e) => setSignalConfig(prev => ({ 
                        ...prev, 
                        stopLoss: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ex: 2.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Take Profit (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={signalConfig.takeProfit || ''}
                      onChange={(e) => setSignalConfig(prev => ({ 
                        ...prev, 
                        takeProfit: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Ex: 5.0"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de création */}
              <button
                onClick={createSignal}
                disabled={isCreatingSignal || !signalConfig.name || !signalConfig.symbol}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isCreatingSignal ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                    Création du Signal...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <WifiIcon className="h-5 w-5 mr-2" />
                    Créer le Signal Trading
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'running' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Signaux Actifs ({activeSignals.length})
            </h3>
            <button
              onClick={() => setLoading(!loading)}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {activeSignals.length === 0 ? (
            <div className="text-center py-12">
              <WifiIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun signal actif</p>
              <p className="text-gray-500 text-sm">Créez votre premier Signal Trading pour commencer !</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Créer un Signal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSignals.map(signal => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onPause={() => pauseSignal(signal.id)}
                  onView={() => {
                    setSelectedSignal(signal);
                    setShowSignalDetails(true);
                  }}
                  onDelete={() => deleteSignal(signal.id)}
                  onCopyWebhook={() => copyWebhook(signal.webhook)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Signaux Inactifs ({pausedSignals.length})
            </h3>
          </div>

          {pausedSignals.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun signal en pause</p>
              <p className="text-gray-500 text-sm">Les signaux mis en pause apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pausedSignals.map(signal => (
                <div key={signal.id} className="bg-gray-700/50 p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <div className="text-lg font-semibold text-white">{signal.name}</div>
                        <div className="text-sm text-gray-400">{signal.symbol} • {signal.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">P&L Total</div>
                        <div className={`text-lg font-semibold ${signal.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {signal.totalProfit.toFixed(2)} USDT
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Signaux Exécutés</div>
                        <div className="text-white">
                          {signal.signalsExecuted}/{signal.signalsReceived}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">ROI</div>
                        <div className={`text-lg font-semibold ${signal.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {signal.roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => resumeSignal(signal.id)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSignal(signal.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de détails du signal */}
      {showSignalDetails && selectedSignal && (
        <SignalDetailsModal
          signal={selectedSignal}
          onClose={() => setShowSignalDetails(false)}
          onCopyWebhook={() => copyWebhook(selectedSignal.webhook)}
        />
      )}
    </div>
  );
}

// Composant TabButton (réutilisé du Grid Trading)
function TabButton({ active, onClick, icon, label, count }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-cyan-600 text-white shadow-lg' 
          : 'text-gray-300 hover:text-white hover:bg-gray-600'
      }`}
    >
      {icon}
      <span className="ml-2 font-medium">{label}</span>
      {count !== undefined && (
        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
          active ? 'bg-white/20' : 'bg-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Composant SignalCard
function SignalCard({ signal, onPause, onView, onDelete, onCopyWebhook }: {
  signal: Signal;
  onPause: () => void;
  onView: () => void;
  onDelete: () => void;
  onCopyWebhook: () => void;
}) {
  const successRate = signal.signalsReceived > 0 ? (signal.signalsExecuted / signal.signalsReceived) * 100 : 0;
  const timeSinceLastSignal = signal.lastSignal ? Math.round((Date.now() - signal.lastSignal) / (1000 * 60)) : null;

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:border-cyan-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{signal.name}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{signal.symbol}</span>
            <span>• {signal.type}</span>
            <span>• {signal.position}</span>
            {timeSinceLastSignal && (
              <span>• Dernier signal: {timeSinceLastSignal}min</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">ACTIF</span>
        </div>
      </div>

      {/* Métriques du signal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400">P&L Total</div>
          <div className={`text-xl font-bold ${signal.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.totalProfit.toFixed(2)} USDT
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">ROI</div>
          <div className={`text-xl font-bold ${signal.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.roi.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Statistiques des signaux */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Taux de Succès</span>
          <span>{signal.signalsExecuted}/{signal.signalsReceived} ({successRate.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Webhook */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded">
        <div className="text-xs text-gray-400 mb-1">Webhook URL:</div>
        <div className="flex items-center gap-2">
          <code className="text-xs text-green-400 flex-1 truncate">
            {signal.webhook}
          </code>
          <button
            onClick={onCopyWebhook}
            className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
          >
            <LinkIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Alertes d'erreur */}
      {signal.errors > 0 && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <div className="flex items-center text-yellow-400 text-sm">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            {signal.errors} erreur(s) détectée(s)
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          Détails
        </button>
        <button
          onClick={onPause}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <StopIcon className="h-4 w-4 mr-1" />
          Pause
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Composant SignalDetailsModal
function SignalDetailsModal({ signal, onClose, onCopyWebhook }: {
  signal: Signal;
  onClose: () => void;
  onCopyWebhook: () => void;
}) {
  // Simuler des signaux récents
  const recentSignals = Array.from({ length: Math.min(signal.signalsReceived, 10) }, (_, i) => ({
    id: i,
    timestamp: Date.now() - i * 1800000, // 30 min intervals
    action: ['BUY', 'SELL'][Math.floor(Math.random() * 2)],
    price: 43000 + Math.random() * 2000,
    quantity: 0.01 + Math.random() * 0.05,
    status: ['EXECUTED', 'FAILED', 'PENDING'][Math.floor(Math.random() * 3)],
    profit: (Math.random() - 0.5) * 20,
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Détails du Signal - {signal.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Métriques de performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Profit/Perte</div>
              <div className={`text-2xl font-bold ${signal.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {signal.totalProfit.toFixed(2)} USDT
              </div>
              <div className="text-gray-500 text-sm">
                ROI: {signal.roi.toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Signaux Exécutés</div>
              <div className="text-2xl font-bold text-white">
                {signal.signalsExecuted}/{signal.signalsReceived}
              </div>
              <div className="text-gray-500 text-sm">
                {signal.signalsReceived > 0 ? ((signal.signalsExecuted / signal.signalsReceived) * 100).toFixed(1) : 0}% de succès
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Niveau de Risque</div>
              <div className="text-2xl font-bold text-cyan-400">
                {signal.riskLevel}%
              </div>
              <div className="text-gray-500 text-sm">
                {signal.riskLevel < 30 ? 'Conservateur' : 
                 signal.riskLevel < 70 ? 'Modéré' : 'Agressif'}
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Erreurs</div>
              <div className={`text-2xl font-bold ${signal.errors === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {signal.errors}
              </div>
              <div className="text-gray-500 text-sm">
                {signal.errors === 0 ? 'Aucune erreur' : 'Erreurs détectées'}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Symbole</div>
                <div className="text-white font-semibold">{signal.symbol}</div>
              </div>
              <div>
                <div className="text-gray-400">Type</div>
                <div className="text-white font-semibold">{signal.type}</div>
              </div>
              <div>
                <div className="text-gray-400">Position</div>
                <div className="text-white font-semibold">{signal.position}</div>
              </div>
              <div>
                <div className="text-gray-400">Créé le</div>
                <div className="text-white font-semibold">{new Date(signal.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Webhook */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Webhook URL</h4>
              <button
                onClick={onCopyWebhook}
                className="flex items-center px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Copier
              </button>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <code className="text-green-400 text-sm break-all">
                {signal.webhook}
              </code>
            </div>
          </div>

          {/* Historique des signaux récents */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Signaux Récents</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentSignals.length > 0 ? recentSignals.map(recentSignal => (
                <div key={recentSignal.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${recentSignal.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {recentSignal.action}
                      </span>
                      <span className="text-white text-sm">
                        {recentSignal.quantity.toFixed(3)} {signal.symbol}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        recentSignal.status === 'EXECUTED' ? 'bg-green-900 text-green-300' :
                        recentSignal.status === 'FAILED' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {recentSignal.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(recentSignal.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">
                      {recentSignal.price.toFixed(2)} USDT
                    </div>
                    {recentSignal.status === 'EXECUTED' && (
                      <div className={`text-xs ${recentSignal.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {recentSignal.profit >= 0 ? '+' : ''}{recentSignal.profit.toFixed(2)} USDT
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-4">Aucun signal reçu pour le moment</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}