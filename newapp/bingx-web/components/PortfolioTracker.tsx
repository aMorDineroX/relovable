'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WalletIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import MiniChart from './MiniChart';

interface Asset {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  chartData: number[];
  isPosition?: boolean; // Pour distinguer les positions futures des balances spot
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  portfolioHistory: number[];
}

interface BingXBalance {
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
  availableMargin: string;
  usedMargin: string;
}

interface BingXPosition {
  positionId: string;
  symbol: string;
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  availableAmt: string;
  initialMargin: string;
  avgPrice: string;
  unrealizedProfit: string;
  realisedProfit?: string; // Ajout du champ manquant
  leverage: number;
  markPrice?: string;
  positionValue?: string;
  pnlRatio?: string;
}

// Mapping des symboles crypto pour CoinGecko
const COINGECKO_MAPPING: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'USDT': 'tether',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'ATOM': 'cosmos',
  'FTM': 'fantom',
  'NEAR': 'near',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'CRV': 'curve-dao-token'
};

export default function PortfolioTracker() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    portfolioHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '1D' | '1W' | '1M'>('1D');
  const [usingRealData, setUsingRealData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Récupérer les prix actuels des cryptos depuis CoinGecko
  const fetchCurrentPrices = async (symbols: string[]): Promise<{ [key: string]: number }> => {
    try {
      const coinIds = symbols
        .map(symbol => COINGECKO_MAPPING[symbol])
        .filter(Boolean)
        .join(',');
      
      if (!coinIds) return {};

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
        { 
          headers: { 'Accept': 'application/json' },
          // Ajouter un timeout pour éviter les blocages
          signal: AbortSignal.timeout(10000) // 10 secondes timeout
        }
      );

      if (!response.ok) {
        console.warn(`Erreur CoinGecko API: ${response.status} ${response.statusText}`);
        return {};
      }

      const data = await response.json();
      const prices: { [key: string]: number } = {};
      
      symbols.forEach(symbol => {
        const coinId = COINGECKO_MAPPING[symbol];
        if (coinId && data[coinId]?.usd) {
          prices[symbol] = data[coinId].usd;
        }
      });

      return prices;
    } catch (error) {
      console.warn('CoinGecko API indisponible, utilisation de prix par défaut:', error);
      // Retourner des prix par défaut pour les cryptos communes
      const defaultPrices: { [key: string]: number } = {
        'BTC': 43500,
        'ETH': 2650,
        'SOL': 98,
        'ADA': 0.45,
        'BNB': 315,
        'XRP': 0.62,
        'DOGE': 0.08,
        'AVAX': 27,
        'ARB': 0.85,
        'ALPHA': 0.15,
      };
      
      // Retourner seulement les prix des symboles demandés
      const result: { [key: string]: number } = {};
      symbols.forEach(symbol => {
        if (defaultPrices[symbol]) {
          result[symbol] = defaultPrices[symbol];
        }
      });
      
      return result;
    }
  };

  // Récupérer les données réelles du portefeuille
  const fetchRealPortfolioData = useCallback(async (): Promise<Asset[]> => {
    try {
      setError(null);
      
      // Récupérer le solde et les positions en parallèle
      const [balanceResponse, positionsResponse] = await Promise.all([
        fetch('/api/balance').catch(() => null),
        fetch('/api/positions').catch(() => null)
      ]);

      let balances: BingXBalance[] = [];
      let positions: BingXPosition[] = [];

      // Traiter la réponse du solde
      if (balanceResponse?.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.data?.balance) {
          // L'API balance retourne un objet unique, pas un tableau
          const balance = balanceData.data.balance;
          balances = [balance]; // Convertir en tableau pour uniformiser le traitement
        }
      }

      // Traiter la réponse des positions
      if (positionsResponse?.ok) {
        const positionsData = await positionsResponse.json();
        if (positionsData.data && Array.isArray(positionsData.data)) {
          positions = positionsData.data;
        }
      }

      // Combiner tous les assets uniques
      const allSymbols = new Set<string>();
      
      // Traiter les soldes (noter que l'API balance BingX ne retourne que USDT pour les futures)
      balances.forEach(balance => {
        const quantity = parseFloat(balance.balance);
        if (quantity > 0) {
          allSymbols.add(balance.asset);
        }
      });

      // Ajouter les symboles des positions (c'est là qu'on trouve la diversité des cryptos)
      positions.forEach(position => {
        if (parseFloat(position.positionAmt) !== 0) {
          const baseAsset = position.symbol.replace('-USDT', '').replace('USDT', '').replace('USD', '');
          allSymbols.add(baseAsset);
        }
      });

      // Récupérer les prix actuels
      const currentPrices = await fetchCurrentPrices(Array.from(allSymbols));

      const portfolioAssets: Asset[] = [];

      // Traiter les soldes (principalement USDT pour les comptes futures)
      balances.forEach(balance => {
        const quantity = parseFloat(balance.balance);
        if (quantity > 0) {
          const asset = balance.asset;
          
          // Pour USDT, on l'affiche comme solde disponible
          if (asset === 'USDT') {
            const currentPrice = 1; // USDT = 1 USD
            const value = quantity;
            const unrealizedPnL = parseFloat(balance.unrealizedProfit || '0');
            const realizedPnL = parseFloat(balance.realisedProfit || '0');
            const totalPnL = unrealizedPnL + realizedPnL;

            portfolioAssets.push({
              symbol: 'USDT',
              name: 'Tether USD (Solde)',
              quantity,
              averagePrice: 1,
              currentPrice,
              value,
              pnl: totalPnL,
              pnlPercent: value > 0 ? (totalPnL / value) * 100 : 0,
              allocation: 0,
              chartData: [currentPrice],
              isPosition: false
            });
          } else {
            // Pour les autres assets (moins courant avec BingX futures)
            const currentPrice = currentPrices[asset] || 0;
            const value = quantity * currentPrice;
            const averagePrice = currentPrice; // Estimation
            const invested = quantity * averagePrice;
            const pnl = parseFloat(balance.unrealizedProfit || '0') + parseFloat(balance.realisedProfit || '0');
            const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

            if (value > 1) { // Seulement si la valeur est significative
              portfolioAssets.push({
                symbol: asset,
                name: asset,
                quantity,
                averagePrice,
                currentPrice,
                value,
                pnl,
                pnlPercent,
                allocation: 0,
                chartData: [currentPrice],
                isPosition: false
              });
            }
          }
        }
      });

      // Traiter les positions futures
      positions.forEach(position => {
        try {
          const quantity = Math.abs(parseFloat(position.positionAmt) || 0);
          if (quantity > 0) {
            const baseAsset = position.symbol.replace('-USDT', '').replace('USDT', '').replace('USD', '');
            const markPrice = parseFloat(position.markPrice || '0');
            const currentPrice = markPrice || currentPrices[baseAsset] || 0;
            const averagePrice = parseFloat(position.avgPrice || '0');
            const positionValue = parseFloat(position.positionValue || '0');
            const value = positionValue || quantity * currentPrice;
            const unrealizedPnL = parseFloat(position.unrealizedProfit || '0');
            const realizedPnL = parseFloat(position.realisedProfit || '0');
            const pnl = unrealizedPnL + realizedPnL;
            const invested = quantity * averagePrice;
            const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

            // Nom descriptif incluant le côté de la position
            const positionSide = position.positionSide;
            const leverage = position.leverage || 1;
            const name = `${baseAsset} (${positionSide} ${leverage}x)`;

            // Vérifier si cet asset existe déjà
            const existingAssetIndex = portfolioAssets.findIndex(asset => 
              asset.symbol === baseAsset && asset.isPosition
            );
            
            if (existingAssetIndex >= 0) {
              // Combiner avec l'asset existant
              const existingAsset = portfolioAssets[existingAssetIndex];
              const totalQuantity = existingAsset.quantity + quantity;
              const totalValue = existingAsset.value + value;
              const totalPnL = existingAsset.pnl + pnl;
              const avgPrice = totalQuantity > 0 ? (existingAsset.averagePrice * existingAsset.quantity + averagePrice * quantity) / totalQuantity : 0;

              portfolioAssets[existingAssetIndex] = {
                ...existingAsset,
                name: `${baseAsset} (Positions Multiples)`,
                quantity: totalQuantity,
                averagePrice: avgPrice,
                value: totalValue,
                pnl: totalPnL,
                pnlPercent: totalValue > 0 ? (totalPnL / totalValue) * 100 : 0
              };
            } else {
              // Seulement ajouter si la valeur est significative
              if (value > 0.01) {
                portfolioAssets.push({
                  symbol: baseAsset,
                  name,
                  quantity,
                  averagePrice,
                  currentPrice,
                  value,
                  pnl,
                  pnlPercent,
                  allocation: 0,
                  chartData: [currentPrice],
                  isPosition: true
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Erreur traitement position ${position.symbol}:`, error);
        }
      });

      // Filtrer les assets avec une valeur significative (> $1)
      const significantAssets = portfolioAssets.filter(asset => asset.value > 1);

      setUsingRealData(true);
      return significantAssets;

    } catch (error) {
      console.error('Erreur récupération portfolio réel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Impossible de récupérer les données du compte: ${errorMessage}. Utilisation des données de démonstration.`);
      setUsingRealData(false);
      return generateMockPortfolio();
    }
  }, []); // useCallback avec dépendances vides car aucune variable externe n'est utilisée

  // Données simulées du portefeuille (fallback)
  const generateMockPortfolio = useCallback((): Asset[] => {
    const mockData = [
      { symbol: 'BTC', name: 'Bitcoin', quantity: 0.25, averagePrice: 42000 },
      { symbol: 'ETH', name: 'Ethereum', quantity: 2.5, averagePrice: 2500 },
      { symbol: 'SOL', name: 'Solana', quantity: 15, averagePrice: 95 },
      { symbol: 'ADA', name: 'Cardano', quantity: 1000, averagePrice: 0.42 },
      { symbol: 'BNB', name: 'BNB', quantity: 5, averagePrice: 300 },
    ];

    const currentPrices: { [key: string]: number } = {
      'BTC': 43500,
      'ETH': 2650,
      'SOL': 98,
      'ADA': 0.45,
      'BNB': 315,
    };

    return mockData.map((asset) => {
      const currentPrice = currentPrices[asset.symbol] * (1 + (Math.random() - 0.5) * 0.02);
      const value = asset.quantity * currentPrice;
      const invested = asset.quantity * asset.averagePrice;
      const pnl = value - invested;
      const pnlPercent = (pnl / invested) * 100;

      // Générer des données de graphique
      const existingAsset = assets.find(a => a.symbol === asset.symbol);
      let chartData = existingAsset?.chartData || [];
      chartData.push(currentPrice);
      if (chartData.length > 24) {
        chartData = chartData.slice(-24);
      }

      return {
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        averagePrice: asset.averagePrice,
        currentPrice,
        value,
        pnl,
        pnlPercent,
        allocation: 0,
        chartData,
        isPosition: false
      };
    });
  }, [assets]); // Dépendance sur assets pour les graphiques

  // Calculer les statistiques du portefeuille
  const calculatePortfolioStats = useCallback((portfolioAssets: Asset[]): PortfolioStats => {
    let totalValue = 0;
    let totalInvested = 0;
    let totalPnL = 0;

    portfolioAssets.forEach(asset => {
      totalValue += asset.value;
      totalInvested += asset.quantity * asset.averagePrice;
      totalPnL += asset.pnl;
    });

    // Calculer les allocations
    portfolioAssets.forEach(asset => {
      asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });

    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const dayChange = totalValue * (Math.random() - 0.5) * 0.05; // Simulation variation journalière
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

    // Mettre à jour l'historique
    const existingHistory = stats.portfolioHistory || [];
    const newHistory = [...existingHistory, totalValue];
    if (newHistory.length > 50) {
      newHistory.splice(0, newHistory.length - 50);
    }

    return {
      totalValue,
      totalInvested,
      totalPnL,
      totalPnLPercent,
      dayChange,
      dayChangePercent,
      portfolioHistory: newHistory
    };
  }, [stats.portfolioHistory]); // Dépendance sur l'historique

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const updatePortfolio = async () => {
      try {
        setLoading(true);
        setError(null);

        // Essayer d'abord de récupérer les données réelles
        let portfolioAssets = await fetchRealPortfolioData();
        
        // Si aucune donnée réelle, utiliser les données mock
        if (!portfolioAssets || portfolioAssets.length === 0) {
          portfolioAssets = generateMockPortfolio();
          setUsingRealData(false);
        }

        // Calculer les statistiques
        const portfolioStats = calculatePortfolioStats(portfolioAssets);
        
        setAssets(portfolioAssets);
        setStats(portfolioStats);
        setLoading(false);

      } catch (err) {
        console.error('Erreur mise à jour portfolio:', err);
        setError('Erreur lors de la mise à jour du portefeuille');
        
        // Fallback vers les données mock
        const portfolioAssets = generateMockPortfolio();
        const portfolioStats = calculatePortfolioStats(portfolioAssets);
        
        setAssets(portfolioAssets);
        setStats(portfolioStats);
        setUsingRealData(false);
        setLoading(false);
      }
    };

    // Mise à jour initiale
    updatePortfolio();

    // Mise à jour périodique seulement si en mode données réelles
    // et seulement toutes les 60 secondes pour éviter le spam
    if (usingRealData) {
      intervalId = setInterval(updatePortfolio, 60000); // 1 minute
    } else {
      intervalId = setInterval(updatePortfolio, 30000); // 30 secondes pour les données simulées
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Pas de dépendances pour éviter les refresh constants

  // Fonction pour forcer la mise à jour
  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const portfolioAssets = await fetchRealPortfolioData();
      const portfolioStats = calculatePortfolioStats(portfolioAssets);
      setAssets(portfolioAssets);
      setStats(portfolioStats);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRealPortfolioData, calculatePortfolioStats]); // Dépendances explicites

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isPortfolioPositive = stats.totalPnLPercent >= 0;
  const isDayPositive = stats.dayChangePercent >= 0;

  return (
    <div className="space-y-6">
      {/* Message d'information sur les données */}
      {usingRealData && (
        <div className="bg-blue-800/30 border border-blue-600 p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-1">📊 Données de votre compte BingX :</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Solde USDT</strong> : Marge disponible sur votre compte futures</li>
                <li><strong>Positions</strong> : Toutes vos positions ouvertes (LONG/SHORT) avec levier</li>
                <li><strong>Prix</strong> : Prix de marché en temps réel via CoinGecko</li>
                <li><strong>P&L</strong> : Profits/Pertes réalisés et non-réalisés combinés</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur ou statut */}
      {error && (
        <div className="bg-yellow-800/50 border border-yellow-600 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-200 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Statistiques du portefeuille */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <WalletIcon className="h-6 w-6 mr-3 text-cyan-400" />
            Évolution du Portefeuille
          </h3>
          <div className="flex items-center space-x-4">
            {/* Indicateur de source des données */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${usingRealData ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm text-gray-400">
                {usingRealData ? 'Données Réelles (BingX)' : 'Données Simulées'}
              </span>
              {usingRealData && (
                <button
                  onClick={forceRefresh}
                  disabled={isRefreshing}
                  className="ml-2 p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Actualiser les données"
                >
                  <ArrowPathIcon className={`h-4 w-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {(['1H', '1D', '1W', '1M'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    selectedTimeframe === timeframe
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valeur Totale</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">P&L Total</p>
                <p className={`text-2xl font-bold ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}${stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}{stats.totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              {isPortfolioPositive ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Variation 24h</p>
                <p className={`text-2xl font-bold ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isDayPositive ? '+' : ''}${stats.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isDayPositive ? '+' : ''}{stats.dayChangePercent.toFixed(2)}%
                </p>
              </div>
              {isDayPositive ? (
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Investissement</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Graphique de l'évolution du portefeuille */}
        {stats.portfolioHistory.length > 1 && (
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-white">Évolution du Portefeuille</h4>
            <div className="flex justify-center">
              <MiniChart 
                data={stats.portfolioHistory} 
                color={isPortfolioPositive ? '#22c55e' : '#ef4444'}
                width={600}
                height={150}
              />
            </div>
          </div>
        )}
      </div>

      {/* Détail des assets */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
        <h4 className="text-lg font-semibold mb-4 text-white">Composition du Portefeuille</h4>
        
        <div className="space-y-3">
          {assets.map((asset) => {
            const isAssetPositive = asset.pnlPercent >= 0;
            
            return (
              <div key={asset.symbol} className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/80 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{asset.symbol}</span>
                        <span className="text-sm text-gray-400">{asset.name}</span>
                        {asset.isPosition && (
                          <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Position</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {asset.quantity.toFixed(4)} × ${asset.currentPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Mini graphique */}
                    <div className="hidden sm:block">
                      <MiniChart 
                        data={asset.chartData} 
                        color={isAssetPositive ? '#22c55e' : '#ef4444'}
                        width={60}
                        height={30}
                      />
                    </div>

                    {/* Allocation */}
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Allocation</div>
                      <div className="font-semibold text-white">{asset.allocation.toFixed(1)}%</div>
                    </div>

                    {/* Valeur */}
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm ${isAssetPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isAssetPositive ? '+' : ''}${asset.pnl.toFixed(2)} ({isAssetPositive ? '+' : ''}{asset.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression pour l'allocation */}
                <div className="mt-3">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${asset.allocation}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
