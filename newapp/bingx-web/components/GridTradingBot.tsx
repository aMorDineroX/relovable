'use client';

import React, { useState, useEffect } from 'react';
import { 
  CubeTransparentIcon, 
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
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface GridBot {
  id: string;
  symbol: string;
  type: 'FUTURES' | 'SPOT' | 'INFINITY';
  status: 'RUNNING' | 'STOPPED' | 'COMPLETED';
  investment: number;
  currentProfit: number;
  roi: number;
  gridsExecuted: number;
  totalGrids: number;
  lowerPrice: number;
  upperPrice: number;
  leverage?: number;
  startTime: number;
  lastUpdate: number;
}

interface GridConfig {
  symbol: string;
  type: 'FUTURES' | 'SPOT' | 'INFINITY';
  lowerPrice: number;
  upperPrice: number;
  gridNumber: number;
  investment: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

type GridTab = 'create' | 'running' | 'history';

export default function GridTradingBot() {
  const [activeTab, setActiveTab] = useState<GridTab>('create');
  const [gridBots, setGridBots] = useState<GridBot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration du nouveau bot
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    symbol: 'BTCUSDT',
    type: 'SPOT',
    lowerPrice: 40000,
    upperPrice: 50000,
    gridNumber: 10,
    investment: 100,
    leverage: 1,
  });

  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [selectedBot, setSelectedBot] = useState<GridBot | null>(null);
  const [showBotDetails, setShowBotDetails] = useState(false);

  // Simuler des données de bots
  useEffect(() => {
    const mockBots: GridBot[] = [
      {
        id: 'bot-001',
        symbol: 'BTCUSDT',
        type: 'SPOT',
        status: 'RUNNING',
        investment: 500,
        currentProfit: 45.32,
        roi: 9.06,
        gridsExecuted: 23,
        totalGrids: 50,
        lowerPrice: 42000,
        upperPrice: 48000,
        startTime: Date.now() - 86400000 * 3, // 3 jours
        lastUpdate: Date.now() - 300000, // 5 min
      },
      {
        id: 'bot-002',
        symbol: 'ETHUSDT',
        type: 'FUTURES',
        status: 'RUNNING',
        investment: 200,
        currentProfit: -8.45,
        roi: -4.23,
        gridsExecuted: 12,
        totalGrids: 30,
        lowerPrice: 2800,
        upperPrice: 3200,
        leverage: 3,
        startTime: Date.now() - 86400000 * 1, // 1 jour
        lastUpdate: Date.now() - 120000, // 2 min
      },
      {
        id: 'bot-003',
        symbol: 'SOLUSDT',
        type: 'INFINITY',
        status: 'COMPLETED',
        investment: 150,
        currentProfit: 12.75,
        roi: 8.5,
        gridsExecuted: 45,
        totalGrids: 45,
        lowerPrice: 180,
        upperPrice: 220,
        startTime: Date.now() - 86400000 * 7, // 7 jours
        lastUpdate: Date.now() - 3600000, // 1 heure
      },
    ];
    setGridBots(mockBots);
  }, []);

  const createGridBot = async () => {
    setIsCreatingBot(true);
    setError(null);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBot: GridBot = {
        id: `bot-${Date.now()}`,
        symbol: gridConfig.symbol,
        type: gridConfig.type,
        status: 'RUNNING',
        investment: gridConfig.investment,
        currentProfit: 0,
        roi: 0,
        gridsExecuted: 0,
        totalGrids: gridConfig.gridNumber,
        lowerPrice: gridConfig.lowerPrice,
        upperPrice: gridConfig.upperPrice,
        leverage: gridConfig.leverage,
        startTime: Date.now(),
        lastUpdate: Date.now(),
      };
      
      setGridBots(prev => [newBot, ...prev]);
      
      // Reset form
      setGridConfig({
        symbol: 'BTCUSDT',
        type: 'SPOT',
        lowerPrice: 40000,
        upperPrice: 50000,
        gridNumber: 10,
        investment: 100,
        leverage: 1,
      });
      
      // Switch to running tab
      setActiveTab('running');
      
      alert('✅ Grid Bot créé avec succès !');
    } catch (err) {
      setError('Erreur lors de la création du bot');
    } finally {
      setIsCreatingBot(false);
    }
  };

  const stopBot = async (botId: string) => {
    try {
      setGridBots(prev => prev.map(bot => 
        bot.id === botId ? { ...bot, status: 'STOPPED' as const } : bot
      ));
      alert('🛑 Bot arrêté avec succès');
    } catch (err) {
      alert('Erreur lors de l\'arrêt du bot');
    }
  };

  const deleteBot = async (botId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bot ?')) {
      setGridBots(prev => prev.filter(bot => bot.id !== botId));
      alert('🗑️ Bot supprimé');
    }
  };

  const runningBots = gridBots.filter(bot => bot.status === 'RUNNING');
  const completedBots = gridBots.filter(bot => bot.status === 'COMPLETED' || bot.status === 'STOPPED');
  const totalProfit = gridBots.reduce((sum, bot) => sum + bot.currentProfit, 0);
  const totalInvestment = gridBots.reduce((sum, bot) => sum + bot.investment, 0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CubeTransparentIcon className="h-8 w-8 text-cyan-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Grid Trading Bot</h2>
            <p className="text-gray-400 text-sm">Trading automatisé 24/7 • Capture d'opportunités d'arbitrage</p>
          </div>
        </div>
        
        {/* Métriques globales */}
        <div className="flex gap-4">
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyan-400">{runningBots.length}</div>
            <div className="text-xs text-gray-400">Bots Actifs</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Profit Total (USDT)</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{totalInvestment.toFixed(0)}</div>
            <div className="text-xs text-gray-400">Investissement Total</div>
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
          icon={<PlayIcon className="h-5 w-5" />}
          label="En Cours"
          count={runningBots.length}
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={<ClockIcon className="h-5 w-5" />}
          label="Historique"
          count={completedBots.length}
        />
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration du bot */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-2 text-cyan-400" />
                Configuration du Bot
              </h3>

              {/* Symbole */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbole de Trading
                </label>
                <input
                  type="text"
                  value={gridConfig.symbol}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="BTCUSDT"
                />
              </div>

              {/* Type de Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de Grid
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SPOT', 'FUTURES', 'INFINITY'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setGridConfig(prev => ({ ...prev, type }))}
                      className={`py-3 px-4 rounded-lg transition-all ${
                        gridConfig.type === type
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{type}</div>
                      <div className="text-xs opacity-75">
                        {type === 'SPOT' ? 'Comptant' : 
                         type === 'FUTURES' ? 'Futures' : 'Infini'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix de la grille */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix Minimum (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gridConfig.lowerPrice}
                    onChange={(e) => setGridConfig(prev => ({ ...prev, lowerPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix Maximum (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gridConfig.upperPrice}
                    onChange={(e) => setGridConfig(prev => ({ ...prev, upperPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Nombre de grilles */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de Grilles: {gridConfig.gridNumber}
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={gridConfig.gridNumber}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, gridNumber: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5 grilles</span>
                  <span>50 grilles</span>
                  <span>100 grilles</span>
                </div>
              </div>

              {/* Investissement */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investissement (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gridConfig.investment}
                  onChange={(e) => setGridConfig(prev => ({ ...prev, investment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                {/* Boutons de montant rapide */}
                <div className="flex space-x-2 mt-2">
                  {[50, 100, 250, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setGridConfig(prev => ({ ...prev, investment: amount }))}
                      className="flex-1 py-2 px-3 bg-gray-600 hover:bg-gray-500 text-xs rounded transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levier (pour Futures) */}
              {gridConfig.type === 'FUTURES' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Levier: {gridConfig.leverage}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={gridConfig.leverage}
                    onChange={(e) => setGridConfig(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1x</span>
                    <span>10x</span>
                    <span>20x</span>
                  </div>
                </div>
              )}
            </div>

            {/* Aperçu et statistiques */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-cyan-400" />
                Aperçu du Bot
              </h3>

              {/* Simulation de performance */}
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-white">Estimation de Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Écart de prix par grille:</span>
                    <span className="text-white font-mono">
                      {((gridConfig.upperPrice - gridConfig.lowerPrice) / gridConfig.gridNumber).toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit estimé par cycle:</span>
                    <span className="text-green-400 font-mono">
                      {(((gridConfig.upperPrice - gridConfig.lowerPrice) / gridConfig.gridNumber) * 0.001 * gridConfig.gridNumber).toFixed(2)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ROI estimé par mois:</span>
                    <span className="text-cyan-400 font-mono">
                      {(((gridConfig.upperPrice - gridConfig.lowerPrice) / gridConfig.lowerPrice) * 30 * 0.1).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risque:</span>
                    <span className={`font-medium ${
                      gridConfig.type === 'SPOT' ? 'text-green-400' :
                      gridConfig.type === 'FUTURES' ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {gridConfig.type === 'SPOT' ? 'Faible' :
                       gridConfig.type === 'FUTURES' ? 'Moyen' : 'Élevé'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Configuration avancée */}
              <div className="bg-gray-700/50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-white flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Paramètres Avancés
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stop Loss (optionnel)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={gridConfig.stopLoss || ''}
                      onChange={(e) => setGridConfig(prev => ({ 
                        ...prev, 
                        stopLoss: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Prix de stop loss"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Take Profit (optionnel)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={gridConfig.takeProfit || ''}
                      onChange={(e) => setGridConfig(prev => ({ 
                        ...prev, 
                        takeProfit: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Prix de take profit"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de création */}
              <button
                onClick={createGridBot}
                disabled={isCreatingBot || !gridConfig.symbol || gridConfig.investment <= 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isCreatingBot ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                    Création du Bot...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Créer le Grid Bot
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
              Bots en Cours d'Exécution ({runningBots.length})
            </h3>
            <button
              onClick={() => setLoading(!loading)}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {runningBots.length === 0 ? (
            <div className="text-center py-12">
              <CubeTransparentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun bot en cours d'exécution</p>
              <p className="text-gray-500 text-sm">Créez votre premier Grid Bot pour commencer !</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Créer un Bot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {runningBots.map(bot => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onStop={() => stopBot(bot.id)}
                  onView={() => {
                    setSelectedBot(bot);
                    setShowBotDetails(true);
                  }}
                  onDelete={() => deleteBot(bot.id)}
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
              Historique des Bots ({completedBots.length})
            </h3>
          </div>

          {completedBots.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun historique disponible</p>
              <p className="text-gray-500 text-sm">Les bots complétés apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedBots.map(bot => (
                <div key={bot.id} className="bg-gray-700/50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{bot.symbol}</div>
                      <div className="text-sm text-gray-400">{bot.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">P&L</div>
                      <div className={`text-lg font-semibold ${bot.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bot.currentProfit.toFixed(2)} USDT
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">ROI</div>
                      <div className={`text-lg font-semibold ${bot.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {bot.roi.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Durée</div>
                      <div className="text-white">
                        {Math.round((Date.now() - bot.startTime) / (1000 * 60 * 60 * 24))} jours
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de détails du bot */}
      {showBotDetails && selectedBot && (
        <BotDetailsModal
          bot={selectedBot}
          onClose={() => setShowBotDetails(false)}
        />
      )}
    </div>
  );
}

// Composant TabButton
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

// Composant BotCard
function BotCard({ bot, onStop, onView, onDelete }: {
  bot: GridBot;
  onStop: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const progressPercentage = (bot.gridsExecuted / bot.totalGrids) * 100;
  const runningTime = Math.round((Date.now() - bot.startTime) / (1000 * 60 * 60));

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:border-cyan-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{bot.symbol}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="capitalize">{bot.type.toLowerCase()}</span>
            {bot.leverage && <span>• {bot.leverage}x Levier</span>}
            <span>• {runningTime}h actif</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">ACTIF</span>
        </div>
      </div>

      {/* Métriques du bot */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400">P&L Actuel</div>
          <div className={`text-xl font-bold ${bot.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {bot.currentProfit.toFixed(2)} USDT
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">ROI</div>
          <div className={`text-xl font-bold ${bot.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {bot.roi.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Progression des grilles */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Grilles Exécutées</span>
          <span>{bot.gridsExecuted}/{bot.totalGrids}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Plage de prix */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <div className="text-gray-400">Prix Min</div>
          <div className="text-white font-mono">{bot.lowerPrice.toLocaleString()} USDT</div>
        </div>
        <div>
          <div className="text-gray-400">Prix Max</div>
          <div className="text-white font-mono">{bot.upperPrice.toLocaleString()} USDT</div>
        </div>
      </div>

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
          onClick={onStop}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <StopIcon className="h-4 w-4 mr-1" />
          Arrêter
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Composant BotDetailsModal
function BotDetailsModal({ bot, onClose }: {
  bot: GridBot;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Détails du Bot - {bot.symbol}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Profit/Perte</div>
              <div className={`text-2xl font-bold ${bot.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {bot.currentProfit.toFixed(2)} USDT
              </div>
              <div className="text-gray-500 text-sm">
                ROI: {bot.roi.toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Grilles Exécutées</div>
              <div className="text-2xl font-bold text-white">
                {bot.gridsExecuted}/{bot.totalGrids}
              </div>
              <div className="text-gray-500 text-sm">
                {((bot.gridsExecuted / bot.totalGrids) * 100).toFixed(1)}% complété
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Temps d'Activité</div>
              <div className="text-2xl font-bold text-white">
                {Math.round((Date.now() - bot.startTime) / (1000 * 60 * 60))}h
              </div>
              <div className="text-gray-500 text-sm">
                Depuis {new Date(bot.startTime).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Type</div>
                <div className="text-white font-semibold">{bot.type}</div>
              </div>
              <div>
                <div className="text-gray-400">Investissement</div>
                <div className="text-white font-semibold">{bot.investment} USDT</div>
              </div>
              <div>
                <div className="text-gray-400">Prix Min</div>
                <div className="text-white font-semibold">{bot.lowerPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400">Prix Max</div>
                <div className="text-white font-semibold">{bot.upperPrice.toLocaleString()}</div>
              </div>
              {bot.leverage && (
                <div>
                  <div className="text-gray-400">Levier</div>
                  <div className="text-white font-semibold">{bot.leverage}x</div>
                </div>
              )}
            </div>
          </div>

          {/* Simulated trading history */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Activité Récente</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Array.from({ length: Math.min(bot.gridsExecuted, 10) }, (_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                  <div>
                    <div className="text-white text-sm">
                      {i % 2 === 0 ? 'Achat' : 'Vente'} Grid #{bot.gridsExecuted - i}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(Date.now() - i * 1800000).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">
                      {(bot.lowerPrice + (bot.upperPrice - bot.lowerPrice) * Math.random()).toFixed(2)} USDT
                    </div>
                    <div className={`text-xs ${i % 3 === 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {i % 3 === 0 ? `+${(Math.random() * 2).toFixed(2)} USDT` : 'En attente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}