import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  FireIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface EnhancedPosition {
  positionId: string;
  symbol: string;
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  avgPrice: string;
  markPrice: string;
  unrealizedProfit: string;
  leverage: number;
  initialMargin: string;
  
  // Données enrichies
  positionValue: string;
  pnlPercentage: string;
  roe: string;
  priceChange: string;
  liquidationPrice: string;
  liquidationDistance: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
  
  marketData: {
    currentPrice: string;
    priceChange24h: string;
    volume24h: string;
    highPrice24h: string;
    lowPrice24h: string;
    fundingRate: string | null;
    nextFundingTime: string | null;
    estimatedFundingCost: string;
  };
  
  lastUpdated: string;
}

interface PositionsSummary {
  totalPositions: number;
  totalUnrealizedPnL: string;
  totalPositionValue: string;
  averageROE: string;
  riskDistribution: { [key: string]: number };
  longPositions: number;
  shortPositions: number;
}

const EnhancedPositionsView: React.FC = () => {
  const [positions, setPositions] = useState<EnhancedPosition[]>([]);
  const [summary, setSummary] = useState<PositionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'symbol' | 'pnl' | 'risk' | 'size'>('pnl');
  const [filterRisk, setFilterRisk] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const fetchEnhancedPositions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/positions/enhanced');
      const result = await response.json();
      
      if (result.success) {
        setPositions(result.data.positions);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des positions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur fetching enhanced positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnhancedPositions();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchEnhancedPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  const sortedPositions = [...positions].sort((a, b) => {
    switch (sortBy) {
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'pnl':
        return parseFloat(b.unrealizedProfit) - parseFloat(a.unrealizedProfit);
      case 'risk':
        const riskOrder = { 'critical': 3, 'warning': 2, 'healthy': 1 };
        return riskOrder[b.healthStatus] - riskOrder[a.healthStatus];
      case 'size':
        return parseFloat(b.positionValue) - parseFloat(a.positionValue);
      default:
        return 0;
    }
  });

  const filteredPositions = sortedPositions.filter(pos => 
    filterRisk === 'all' || pos.healthStatus === filterRisk
  );

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-4 w-4" />;
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'critical': return <FireIcon className="h-4 w-4" />;
      default: return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Chargement des positions enrichies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl">
        <div className="flex items-center text-red-400 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
          <span className="font-semibold">Erreur</span>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={fetchEnhancedPositions}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec résumé */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Positions Détaillées</h2>
          <button
            onClick={fetchEnhancedPositions}
            className="flex items-center px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{summary.totalPositions}</p>
              <p className="text-sm text-gray-400">Positions Totales</p>
              <p className="text-xs text-cyan-400">{summary.longPositions}L / {summary.shortPositions}S</p>
            </div>
            
            <div className="text-center">
              <p className={`text-2xl font-bold ${parseFloat(summary.totalUnrealizedPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(summary.totalUnrealizedPnL) >= 0 ? '+' : ''}${parseFloat(summary.totalUnrealizedPnL).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">PnL Total</p>
              <p className="text-xs text-cyan-400">ROE: {summary.averageROE}%</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-white">${parseFloat(summary.totalPositionValue).toFixed(0)}</p>
              <p className="text-sm text-gray-400">Valeur Totale</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-1">
                {summary.riskDistribution.healthy && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-400/10 text-green-400">
                    {summary.riskDistribution.healthy} saines
                  </span>
                )}
                {summary.riskDistribution.warning && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-400/10 text-yellow-400">
                    {summary.riskDistribution.warning} attention
                  </span>
                )}
                {summary.riskDistribution.critical && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-400/10 text-red-400">
                    {summary.riskDistribution.critical} critiques
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">Répartition Risques</p>
            </div>
          </div>
        )}
      </div>

      {/* Contrôles de tri et filtrage */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="pnl">PnL</option>
            <option value="symbol">Symbole</option>
            <option value="risk">Risque</option>
            <option value="size">Taille</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Filtrer:</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as any)}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">Toutes</option>
            <option value="healthy">Saines</option>
            <option value="warning">Attention</option>
            <option value="critical">Critiques</option>
          </select>
        </div>
      </div>

      {/* Liste des positions */}
      <div className="space-y-4">
        {filteredPositions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucune position trouvée avec les filtres sélectionnés
          </div>
        ) : (
          filteredPositions.map((position) => (
            <div
              key={position.positionId}
              className={`bg-gray-800 rounded-xl p-6 border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-750 ${
                position.healthStatus === 'critical' ? 'border-red-400' :
                position.healthStatus === 'warning' ? 'border-yellow-400' : 'border-green-400'
              } ${selectedPosition === position.positionId ? 'ring-2 ring-cyan-400' : ''}`}
              onClick={() => setSelectedPosition(
                selectedPosition === position.positionId ? null : position.positionId
              )}
            >
              {/* Header de la position */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-white">{position.symbol}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    position.positionSide === 'LONG' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {position.positionSide}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getHealthColor(position.healthStatus)}`}>
                    {getHealthIcon(position.healthStatus)}
                    <span className="ml-1">{position.healthStatus}</span>
                  </span>
                  <span className="text-sm text-gray-400">{position.leverage}x</span>
                </div>
                
                <div className="text-right">
                  <p className={`text-xl font-bold ${parseFloat(position.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(position.unrealizedProfit) >= 0 ? '+' : ''}${parseFloat(position.unrealizedProfit).toFixed(2)}
                  </p>
                  <p className={`text-sm ${parseFloat(position.pnlPercentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(position.pnlPercentage) >= 0 ? '+' : ''}{position.pnlPercentage}% 
                    <span className="ml-1 text-gray-400">ROE: {position.roe}%</span>
                  </p>
                </div>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Taille</p>
                  <p className="text-white font-semibold">{parseFloat(position.positionAmt).toFixed(6)}</p>
                  <p className="text-xs text-cyan-400">${position.positionValue}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Prix d'entrée</p>
                  <p className="text-white font-semibold">${parseFloat(position.avgPrice).toFixed(4)}</p>
                  <p className={`text-xs ${parseFloat(position.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(position.priceChange) >= 0 ? '+' : ''}{position.priceChange}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Prix actuel</p>
                  <p className="text-white font-semibold">${parseFloat(position.marketData.currentPrice).toFixed(4)}</p>
                  <p className={`text-xs ${parseFloat(position.marketData.priceChange24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    24h: {parseFloat(position.marketData.priceChange24h) >= 0 ? '+' : ''}{parseFloat(position.marketData.priceChange24h).toFixed(2)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Liquidation</p>
                  <p className="text-red-400 font-semibold">${parseFloat(position.liquidationPrice).toFixed(4)}</p>
                  <p className={`text-xs ${parseFloat(position.liquidationDistance) > 20 ? 'text-green-400' : 
                    parseFloat(position.liquidationDistance) > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {position.liquidationDistance}% distance
                  </p>
                </div>
              </div>

              {/* Détails étendus (si sélectionné) */}
              {selectedPosition === position.positionId && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Données de marché */}
                    <div>
                      <h4 className="text-md font-semibold text-cyan-400 mb-3">Données de Marché</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">High 24h:</span>
                          <span className="text-green-400">${parseFloat(position.marketData.highPrice24h).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Low 24h:</span>
                          <span className="text-red-400">${parseFloat(position.marketData.lowPrice24h).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume 24h:</span>
                          <span className="text-white">${parseFloat(position.marketData.volume24h).toLocaleString()}</span>
                        </div>
                        {position.marketData.fundingRate && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Taux financement:</span>
                              <span className={`${parseFloat(position.marketData.fundingRate) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {parseFloat(position.marketData.fundingRate) >= 0 ? '+' : ''}{position.marketData.fundingRate}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Coût estimé:</span>
                              <span className={`${parseFloat(position.marketData.estimatedFundingCost) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                ${position.marketData.estimatedFundingCost}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Métriques de risque */}
                    <div>
                      <h4 className="text-md font-semibold text-orange-400 mb-3">Analyse de Risque</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Marge initiale:</span>
                          <span className="text-white">${parseFloat(position.initialMargin).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valeur entrée:</span>
                          <span className="text-cyan-400">${position.entryValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valeur actuelle:</span>
                          <span className="text-white">${position.positionValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Statut risque:</span>
                          <span className={getHealthColor(position.healthStatus).split(' ')[0]}>
                            {position.healthStatus === 'healthy' ? 'Saine' :
                             position.healthStatus === 'warning' ? 'Attention' : 'Critique'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Barre de progression risque liquidation */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Distance liquidation</span>
                          <span className={parseFloat(position.liquidationDistance) > 20 ? 'text-green-400' : 
                            parseFloat(position.liquidationDistance) > 10 ? 'text-yellow-400' : 'text-red-400'}>
                            {position.liquidationDistance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              parseFloat(position.liquidationDistance) > 20 ? 'bg-green-400' :
                              parseFloat(position.liquidationDistance) > 10 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(parseFloat(position.liquidationDistance), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                      Dernière MAJ: {new Date(position.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedPositionsView;
