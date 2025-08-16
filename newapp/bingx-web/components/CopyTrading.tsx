'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  StarIcon, 
  TrophyIcon, 
  ChartBarIcon, 
  EyeIcon,
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserMinusIcon,
  CalendarIcon,
  ChartPieIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface Trader {
  id: string;
  nickname: string;
  avatar: string;
  verified: boolean;
  roi30d: number;
  roi7d: number;
  totalFollowers: number;
  totalProfit: number;
  winRate: number;
  maxDrawdown: number;
  tradingDays: number;
  avgPositionTime: number;
  riskScore: number;
  rating: number;
  tags: string[];
  preferredSymbols: string[];
  lastActive: number;
  copyingFee: number;
  minCopyAmount: number;
}

interface CopyPosition {
  id: string;
  traderId: string;
  traderName: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  copiedAmount: number;
  unrealizedPnl: number;
  roi: number;
  openTime: number;
  leverage: number;
}

interface Following {
  traderId: string;
  traderName: string;
  copyAmount: number;
  copyRatio: number;
  autoFollow: boolean;
  maxPositions: number;
  stopLoss: number;
  takeProfit: number;
  startDate: number;
  totalCopied: number;
  currentPnl: number;
  status: 'ACTIVE' | 'PAUSED';
}

type CopyTab = 'discover' | 'following' | 'positions' | 'history';

export default function CopyTrading() {
  const [activeTab, setActiveTab] = useState<CopyTab>('discover');
  const [traders, setTraders] = useState<Trader[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [copyPositions, setCopyPositions] = useState<CopyPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'roi30d' | 'followers' | 'winRate' | 'rating'>('roi30d');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Modal states
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [followConfig, setFollowConfig] = useState({
    copyAmount: 100,
    copyRatio: 1,
    maxPositions: 5,
    stopLoss: 10,
    takeProfit: 20,
    autoFollow: true,
  });

  // Simuler des données de traders
  useEffect(() => {
    const mockTraders: Trader[] = [
      {
        id: 'trader-001',
        nickname: 'CryptoKing_777',
        avatar: '👑',
        verified: true,
        roi30d: 45.8,
        roi7d: 12.3,
        totalFollowers: 1284,
        totalProfit: 89456.32,
        winRate: 78.5,
        maxDrawdown: 12.4,
        tradingDays: 156,
        avgPositionTime: 4.2,
        riskScore: 65,
        rating: 4.8,
        tags: ['Scalping', 'BTC', 'High Frequency'],
        preferredSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
        lastActive: Date.now() - 300000, // 5 min
        copyingFee: 15,
        minCopyAmount: 50,
      },
      {
        id: 'trader-002',
        nickname: 'SwingMaster_Pro',
        avatar: '📈',
        verified: true,
        roi30d: 32.4,
        roi7d: 8.7,
        totalFollowers: 856,
        totalProfit: 67892.45,
        winRate: 85.2,
        maxDrawdown: 8.9,
        tradingDays: 234,
        avgPositionTime: 18.5,
        riskScore: 45,
        rating: 4.6,
        tags: ['Swing Trading', 'Technical Analysis', 'Conservative'],
        preferredSymbols: ['ETHUSDT', 'ADAUSDT', 'DOTUSDT'],
        lastActive: Date.now() - 900000, // 15 min
        copyingFee: 10,
        minCopyAmount: 100,
      },
      {
        id: 'trader-003',
        nickname: 'AltcoinHunter',
        avatar: '🎯',
        verified: false,
        roi30d: 67.9,
        roi7d: 23.1,
        totalFollowers: 432,
        totalProfit: 45632.18,
        winRate: 72.3,
        maxDrawdown: 18.7,
        tradingDays: 89,
        avgPositionTime: 2.8,
        riskScore: 85,
        rating: 4.3,
        tags: ['Altcoins', 'High Risk', 'Momentum'],
        preferredSymbols: ['SOLUSDT', 'AVAXUSDT', 'MATICUSDT'],
        lastActive: Date.now() - 1800000, // 30 min
        copyingFee: 20,
        minCopyAmount: 25,
      },
    ];
    setTraders(mockTraders);

    // Mock following data
    const mockFollowing: Following[] = [
      {
        traderId: 'trader-001',
        traderName: 'CryptoKing_777',
        copyAmount: 500,
        copyRatio: 1,
        autoFollow: true,
        maxPositions: 5,
        stopLoss: 10,
        takeProfit: 20,
        startDate: Date.now() - 86400000 * 7,
        totalCopied: 2450,
        currentPnl: 156.78,
        status: 'ACTIVE',
      },
    ];
    setFollowing(mockFollowing);

    // Mock copy positions
    const mockPositions: CopyPosition[] = [
      {
        id: 'pos-001',
        traderId: 'trader-001',
        traderName: 'CryptoKing_777',
        symbol: 'BTCUSDT',
        side: 'LONG',
        entryPrice: 43250,
        currentPrice: 43850,
        quantity: 0.023,
        copiedAmount: 100,
        unrealizedPnl: 13.80,
        roi: 13.8,
        openTime: Date.now() - 3600000,
        leverage: 10,
      },
      {
        id: 'pos-002',
        traderId: 'trader-001',
        traderName: 'CryptoKing_777',
        symbol: 'ETHUSDT',
        side: 'SHORT',
        entryPrice: 2685,
        currentPrice: 2692,
        quantity: 0.186,
        copiedAmount: 50,
        unrealizedPnl: -2.60,
        roi: -5.2,
        openTime: Date.now() - 1800000,
        leverage: 5,
      },
    ];
    setCopyPositions(mockPositions);
  }, []);

  const followTrader = async (trader: Trader) => {
    try {
      const newFollowing: Following = {
        traderId: trader.id,
        traderName: trader.nickname,
        copyAmount: followConfig.copyAmount,
        copyRatio: followConfig.copyRatio,
        autoFollow: followConfig.autoFollow,
        maxPositions: followConfig.maxPositions,
        stopLoss: followConfig.stopLoss,
        takeProfit: followConfig.takeProfit,
        startDate: Date.now(),
        totalCopied: 0,
        currentPnl: 0,
        status: 'ACTIVE',
      };

      setFollowing(prev => [...prev, newFollowing]);
      setShowFollowModal(false);
      setSelectedTrader(null);
      
      alert(`✅ Vous suivez maintenant ${trader.nickname} !`);
    } catch (err) {
      alert('Erreur lors du suivi du trader');
    }
  };

  const unfollowTrader = async (traderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir arrêter de suivre ce trader ?')) {
      setFollowing(prev => prev.filter(f => f.traderId !== traderId));
      alert('🚫 Trader retiré de votre liste de suivi');
    }
  };

  const pauseFollowing = async (traderId: string) => {
    setFollowing(prev => prev.map(f => 
      f.traderId === traderId ? { ...f, status: 'PAUSED' as const } : f
    ));
    alert('⏸️ Suivi mis en pause');
  };

  const resumeFollowing = async (traderId: string) => {
    setFollowing(prev => prev.map(f => 
      f.traderId === traderId ? { ...f, status: 'ACTIVE' as const } : f
    ));
    alert('▶️ Suivi réactivé');
  };

  // Filtrer et trier les traders
  const filteredTraders = traders
    .filter(trader => {
      const matchesSearch = trader.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trader.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRisk = riskFilter === 'all' || 
                         (riskFilter === 'low' && trader.riskScore <= 40) ||
                         (riskFilter === 'medium' && trader.riskScore > 40 && trader.riskScore <= 70) ||
                         (riskFilter === 'high' && trader.riskScore > 70);
      
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'roi30d':
          return b.roi30d - a.roi30d;
        case 'followers':
          return b.totalFollowers - a.totalFollowers;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const totalCopyPnl = copyPositions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  const totalFollowingPnl = following.reduce((sum, f) => sum + f.currentPnl, 0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UsersIcon className="h-8 w-8 text-cyan-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Copy Trading</h2>
            <p className="text-gray-400 text-sm">Suivez les meilleurs traders • Copiez leurs stratégies • Générez des profits</p>
          </div>
        </div>
        
        {/* Métriques globales */}
        <div className="flex gap-4">
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyan-400">{following.length}</div>
            <div className="text-xs text-gray-400">Traders Suivis</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className={`text-2xl font-bold ${totalFollowingPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalFollowingPnl.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">P&L Total (USDT)</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{copyPositions.length}</div>
            <div className="text-xs text-gray-400">Positions Copiées</div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="flex space-x-1 bg-gray-700/50 rounded-lg p-1 mb-6">
        <TabButton
          active={activeTab === 'discover'}
          onClick={() => setActiveTab('discover')}
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          label="Découvrir"
          count={traders.length}
        />
        <TabButton
          active={activeTab === 'following'}
          onClick={() => setActiveTab('following')}
          icon={<UserPlusIcon className="h-5 w-5" />}
          label="Mes Suivis"
          count={following.length}
        />
        <TabButton
          active={activeTab === 'positions'}
          onClick={() => setActiveTab('positions')}
          icon={<ChartBarIcon className="h-5 w-5" />}
          label="Positions"
          count={copyPositions.length}
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={<CalendarIcon className="h-5 w-5" />}
          label="Historique"
          count={0}
        />
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un trader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent w-full"
                />
              </div>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="roi30d">ROI 30j</option>
              <option value="followers">Followers</option>
              <option value="winRate">Taux de réussite</option>
              <option value="rating">Note</option>
            </select>
            
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">Tous les risques</option>
              <option value="low">🔒 Faible risque</option>
              <option value="medium">⚖️ Risque modéré</option>
              <option value="high">🚀 Haut risque</option>
            </select>
          </div>

          {/* Liste des traders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTraders.map(trader => (
              <TraderCard
                key={trader.id}
                trader={trader}
                isFollowing={following.some(f => f.traderId === trader.id)}
                onFollow={() => {
                  setSelectedTrader(trader);
                  setShowFollowModal(true);
                }}
                onUnfollow={() => unfollowTrader(trader.id)}
              />
            ))}
          </div>

          {filteredTraders.length === 0 && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun trader trouvé</p>
              <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Traders Suivis ({following.length})
            </h3>
            <button
              onClick={() => setLoading(!loading)}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {following.length === 0 ? (
            <div className="text-center py-12">
              <UserPlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun trader suivi</p>
              <p className="text-gray-500 text-sm">Découvrez des traders pour commencer à copier leurs stratégies</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Découvrir des Traders
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map(follow => {
                const trader = traders.find(t => t.id === follow.traderId);
                return (
                  <FollowingCard
                    key={follow.traderId}
                    following={follow}
                    trader={trader}
                    onPause={() => pauseFollowing(follow.traderId)}
                    onResume={() => resumeFollowing(follow.traderId)}
                    onUnfollow={() => unfollowTrader(follow.traderId)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'positions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">
              Positions Copiées ({copyPositions.length})
            </h3>
            <div className="text-right">
              <div className="text-sm text-gray-400">P&L Total</div>
              <div className={`text-xl font-bold ${totalCopyPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalCopyPnl.toFixed(2)} USDT
              </div>
            </div>
          </div>

          {copyPositions.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune position copiée</p>
              <p className="text-gray-500 text-sm">Les positions ouvertes par vos traders suivis apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-3">Trader</th>
                    <th className="p-3">Symbole</th>
                    <th className="p-3">Direction</th>
                    <th className="p-3">Prix d'Entrée</th>
                    <th className="p-3">Prix Actuel</th>
                    <th className="p-3">Quantité</th>
                    <th className="p-3">P&L</th>
                    <th className="p-3">ROI</th>
                    <th className="p-3">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {copyPositions.map(position => (
                    <tr key={position.id} className="border-b border-gray-800 hover:bg-gray-700/50">
                      <td className="p-3">
                        <div className="font-semibold text-white">{position.traderName}</div>
                        <div className="text-xs text-gray-400">{position.leverage}x Levier</div>
                      </td>
                      <td className="p-3 font-semibold text-cyan-400">{position.symbol}</td>
                      <td className={`p-3 font-bold ${position.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                        {position.side}
                      </td>
                      <td className="p-3 font-mono">{position.entryPrice.toFixed(2)}</td>
                      <td className="p-3 font-mono">{position.currentPrice.toFixed(2)}</td>
                      <td className="p-3 font-mono">{position.quantity.toFixed(4)}</td>
                      <td className={`p-3 font-semibold ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.unrealizedPnl.toFixed(2)} USDT
                      </td>
                      <td className={`p-3 font-semibold ${position.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.roi.toFixed(2)}%
                      </td>
                      <td className="p-3 text-gray-400">
                        {Math.round((Date.now() - position.openTime) / (1000 * 60))} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Historique en développement</p>
          <p className="text-gray-500 text-sm">L'historique des positions fermées sera bientôt disponible</p>
        </div>
      )}

      {/* Modal de suivi */}
      {showFollowModal && selectedTrader && (
        <FollowModal
          trader={selectedTrader}
          config={followConfig}
          onConfigChange={setFollowConfig}
          onConfirm={() => followTrader(selectedTrader)}
          onCancel={() => {
            setShowFollowModal(false);
            setSelectedTrader(null);
          }}
        />
      )}
    </div>
  );
}

// Composant TabButton (réutilisé)
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

// Composant TraderCard
function TraderCard({ trader, isFollowing, onFollow, onUnfollow }: {
  trader: Trader;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}) {
  const riskColor = trader.riskScore <= 40 ? 'text-green-400' : 
                   trader.riskScore <= 70 ? 'text-yellow-400' : 'text-red-400';
  
  const isOnline = (Date.now() - trader.lastActive) < 600000; // 10 min

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:border-cyan-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="text-4xl mr-3">{trader.avatar}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-white">{trader.nickname}</h4>
              {trader.verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {isOnline && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{trader.totalFollowers.toLocaleString()} followers</span>
              <span>•</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(trader.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                  />
                ))}
                <span className="ml-1">{trader.rating}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Frais de copie</div>
          <div className="text-white font-semibold">{trader.copyingFee}%</div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">ROI 30j</div>
          <div className={`text-xl font-bold ${trader.roi30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trader.roi30d.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Taux de réussite</div>
          <div className="text-xl font-bold text-white">
            {trader.winRate.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">Max Drawdown</div>
          <div className="text-xl font-bold text-red-400">
            -{trader.maxDrawdown.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Niveau de risque */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Niveau de Risque</span>
          <span className={riskColor}>{trader.riskScore}/100</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              trader.riskScore <= 40 ? 'bg-green-500' :
              trader.riskScore <= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${trader.riskScore}%` }}
          ></div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {trader.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Cryptos préférées */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Cryptos préférées:</div>
        <div className="flex gap-2">
          {trader.preferredSymbols.slice(0, 3).map(symbol => (
            <span key={symbol} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-600">
              {symbol.replace('USDT', '')}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          Profil
        </button>
        {isFollowing ? (
          <button
            onClick={onUnfollow}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <UserMinusIcon className="h-4 w-4 mr-1" />
            Ne plus suivre
          </button>
        ) : (
          <button
            onClick={onFollow}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlusIcon className="h-4 w-4 mr-1" />
            Suivre
          </button>
        )}
      </div>
    </div>
  );
}

// Composant FollowingCard
function FollowingCard({ following, trader, onPause, onResume, onUnfollow }: {
  following: Following;
  trader?: Trader;
  onPause: () => void;
  onResume: () => void;
  onUnfollow: () => void;
}) {
  const daysSinceStart = Math.round((Date.now() - following.startDate) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{following.traderName}</h4>
          <div className="text-sm text-gray-400">
            Suivi depuis {daysSinceStart} jour{daysSinceStart > 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${following.status === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
          <span className={`text-sm font-medium ${following.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
            {following.status === 'ACTIVE' ? 'ACTIF' : 'PAUSE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-400">Montant de Copie</div>
          <div className="text-white font-semibold">{following.copyAmount} USDT</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Ratio de Copie</div>
          <div className="text-white font-semibold">{following.copyRatio}x</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">P&L Actuel</div>
          <div className={`font-semibold ${following.currentPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {following.currentPnl.toFixed(2)} USDT
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Total Copié</div>
          <div className="text-white font-semibold">{following.totalCopied} USDT</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
          Paramètres
        </button>
        {following.status === 'ACTIVE' ? (
          <button
            onClick={onPause}
            className="flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            ▶️ Reprendre
          </button>
        )}
        <button
          onClick={onUnfollow}
          className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <UserMinusIcon className="h-4 w-4 mr-1" />
          Arrêter
        </button>
      </div>
    </div>
  );
}

// Composant FollowModal
function FollowModal({ trader, config, onConfigChange, onConfirm, onCancel }: {
  trader: Trader;
  config: any;
  onConfigChange: (config: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-2xl font-bold text-white">Suivre {trader.nickname}</h3>
          <p className="text-gray-400">Configurez vos paramètres de copie</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Montant de copie */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Montant de Copie (USDT)
            </label>
            <input
              type="number"
              min={trader.minCopyAmount}
              value={config.copyAmount}
              onChange={(e) => onConfigChange({ ...config, copyAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum: {trader.minCopyAmount} USDT</p>
          </div>

          {/* Ratio de copie */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ratio de Copie: {config.copyRatio}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={config.copyRatio}
              onChange={(e) => onConfigChange({ ...config, copyRatio: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.1x</span>
              <span>1x</span>
              <span>5x</span>
            </div>
          </div>

          {/* Paramètres de protection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stop Loss (%)
              </label>
              <input
                type="number"
                value={config.stopLoss}
                onChange={(e) => onConfigChange({ ...config, stopLoss: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Take Profit (%)
              </label>
              <input
                type="number"
                value={config.takeProfit}
                onChange={(e) => onConfigChange({ ...config, takeProfit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Options avancées */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Positions Maximum Simultanées
            </label>
            <select
              value={config.maxPositions}
              onChange={(e) => onConfigChange({ ...config, maxPositions: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              {[1, 3, 5, 10, 20].map(num => (
                <option key={num} value={num}>{num} position{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Auto-follow */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoFollow"
              checked={config.autoFollow}
              onChange={(e) => onConfigChange({ ...config, autoFollow: e.target.checked })}
              className="mr-3 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="autoFollow" className="text-sm text-gray-300">
              Copier automatiquement toutes les nouvelles positions
            </label>
          </div>

          {/* Résumé des coûts */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">Résumé des Coûts</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Frais de copie ({trader.copyingFee}%):</span>
                <span className="text-white">{(config.copyAmount * trader.copyingFee / 100).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Montant effectif:</span>
                <span className="text-cyan-400">{(config.copyAmount * (1 - trader.copyingFee / 100)).toFixed(2)} USDT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Commencer à Suivre
          </button>
        </div>
      </div>
    </div>
  );
}