import { NextRequest, NextResponse } from 'next/server';

// Simuler des données de performance (en production, ceci viendrait d'une base de données)
interface PerformanceStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  dailyReturns: Array<{
    date: string;
    return: number;
    cumulative: number;
  }>;
  monthlyStats: Array<{
    month: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
  tradingPairs: Array<{
    symbol: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
}

// Fonction pour générer des données de performance réalistes
function generatePerformanceData(): PerformanceStats {
  const symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'DOT-USDT', 'LINK-USDT'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
  
  // Générer les retours quotidiens sur 30 jours
  const dailyReturns = [];
  let cumulativeReturn = 0;
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Générer un retour quotidien réaliste (-5% à +5%)
    const dailyReturn = (Math.random() - 0.5) * 0.1;
    cumulativeReturn += dailyReturn;
    
    dailyReturns.push({
      date: date.toISOString().split('T')[0],
      return: dailyReturn,
      cumulative: cumulativeReturn
    });
  }
  
  // Générer les statistiques mensuelles
  const monthlyStats = months.map((month, index) => ({
    month,
    trades: Math.floor(Math.random() * 50) + 20,
    pnl: (Math.random() - 0.4) * 5000, // Biais positif léger
    winRate: Math.random() * 0.3 + 0.4 // 40-70%
  }));
  
  // Générer les statistiques par paire
  const tradingPairs = symbols.map(symbol => ({
    symbol,
    trades: Math.floor(Math.random() * 30) + 10,
    pnl: (Math.random() - 0.3) * 2000,
    winRate: Math.random() * 0.4 + 0.3
  }));
  
  // Calculer les métriques globales
  const totalTrades = tradingPairs.reduce((sum, pair) => sum + pair.trades, 0);
  const totalPnL = tradingPairs.reduce((sum, pair) => sum + pair.pnl, 0);
  const winningTrades = tradingPairs.reduce((sum, pair) => sum + (pair.trades * pair.winRate), 0);
  const winRate = winningTrades / totalTrades;
  
  // Calculer les autres métriques
  const wins = dailyReturns.filter(d => d.return > 0);
  const losses = dailyReturns.filter(d => d.return < 0);
  
  const averageWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w.return, 0) / wins.length : 0;
  const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, l) => sum + l.return, 0) / losses.length) : 0;
  
  const profitFactor = averageLoss > 0 ? (averageWin * wins.length) / (averageLoss * losses.length) : 0;
  
  // Calculer le drawdown maximum
  let peak = 0;
  let maxDrawdown = 0;
  dailyReturns.forEach(day => {
    if (day.cumulative > peak) {
      peak = day.cumulative;
    }
    const drawdown = peak - day.cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  // Calculer le ratio de Sharpe (simplifié)
  const returns = dailyReturns.map(d => d.return);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  const sharpeRatio = volatility > 0 ? (avgReturn / volatility) * Math.sqrt(252) : 0; // Annualisé
  
  return {
    totalTrades,
    winRate,
    totalPnL,
    maxDrawdown,
    averageWin,
    averageLoss,
    profitFactor,
    sharpeRatio,
    dailyReturns,
    monthlyStats,
    tradingPairs
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Générer les données de performance
    const performanceData = generatePerformanceData();
    
    // Ajouter des métriques calculées
    const response = {
      success: true,
      data: {
        ...performanceData,
        period,
        calculatedAt: new Date().toISOString(),
        riskMetrics: {
          volatility: Math.sqrt(
            performanceData.dailyReturns.reduce((sum, day) => {
              const avgReturn = performanceData.dailyReturns.reduce((s, d) => s + d.return, 0) / performanceData.dailyReturns.length;
              return sum + Math.pow(day.return - avgReturn, 2);
            }, 0) / performanceData.dailyReturns.length
          ),
          sortino: calculateSortino(performanceData.dailyReturns),
          calmar: performanceData.maxDrawdown > 0 ? (performanceData.totalPnL / performanceData.maxDrawdown) : 0,
          informationRatio: calculateInformationRatio(performanceData.dailyReturns)
        },
        currentStreak: calculateCurrentStreak(performanceData.dailyReturns),
        bestDay: Math.max(...performanceData.dailyReturns.map(d => d.return)),
        worstDay: Math.min(...performanceData.dailyReturns.map(d => d.return)),
        tradingDays: performanceData.dailyReturns.filter(d => d.return !== 0).length
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de performance:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques de performance',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Fonctions utilitaires pour calculer les métriques avancées
function calculateSortino(returns: Array<{ return: number }>): number {
  const avgReturn = returns.reduce((sum, r) => sum + r.return, 0) / returns.length;
  const downside = returns.filter(r => r.return < 0);
  
  if (downside.length === 0) return 0;
  
  const downsideVariance = downside.reduce((sum, r) => sum + Math.pow(r.return, 2), 0) / downside.length;
  const downsideDeviation = Math.sqrt(downsideVariance);
  
  return downsideDeviation > 0 ? (avgReturn / downsideDeviation) * Math.sqrt(252) : 0;
}

function calculateInformationRatio(returns: Array<{ return: number }>): number {
  // Ratio d'information simplifié (excès de rendement par rapport à un benchmark)
  const benchmark = 0.0001; // 0.01% par jour comme benchmark
  const excessReturns = returns.map(r => r.return - benchmark);
  const avgExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
  
  const trackingError = Math.sqrt(
    excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcess, 2), 0) / excessReturns.length
  );
  
  return trackingError > 0 ? avgExcess / trackingError : 0;
}

function calculateCurrentStreak(returns: Array<{ return: number }>): { type: 'win' | 'loss', count: number } {
  if (returns.length === 0) return { type: 'win', count: 0 };
  
  let currentStreak = 0;
  let streakType: 'win' | 'loss' = 'win';
  
  // Commencer par le dernier jour et remonter
  for (let i = returns.length - 1; i >= 0; i--) {
    const dayReturn = returns[i].return;
    
    if (i === returns.length - 1) {
      // Premier jour (le plus récent)
      streakType = dayReturn >= 0 ? 'win' : 'loss';
      currentStreak = 1;
    } else {
      // Vérifier si la série continue
      const currentIsWin = dayReturn >= 0;
      if ((streakType === 'win' && currentIsWin) || (streakType === 'loss' && !currentIsWin)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { type: streakType, count: currentStreak };
}
