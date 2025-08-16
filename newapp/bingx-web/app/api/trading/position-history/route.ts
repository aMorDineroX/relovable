import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function GET(request: Request) {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || '';
    const startTime = searchParams.get('startTime') || '';
    const endTime = searchParams.get('endTime') || '';
    const limit = searchParams.get('limit') || '100';

    const timestamp = Date.now();
    
    // Construire les paramètres
    const params: Record<string, string> = {
      timestamp: timestamp.toString()
    };

    if (symbol) params.symbol = symbol;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (limit) params.limit = limit;

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signature = createSignature(queryString, SECRET_KEY);

    // Endpoint pour l'historique des positions
    const url = `${BASE_URL}/openApi/swap/v1/trade/positionHistory?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('BingX Position History Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.msg || 'Unknown error'}`);
    }

    if (data.code !== 0) {
      throw new Error(`BingX API error! code: ${data.code}, message: ${data.msg || 'Unknown error'}`);
    }

    // Enrichir les données avec des calculs de performance
    const enrichedPositions = data.data.map((position: any) => {
      const entryPrice = parseFloat(position.avgPrice || '0');
      const exitPrice = parseFloat(position.closeAvgPrice || '0');
      const quantity = parseFloat(position.positionAmt || '0');
      const realizedPnl = parseFloat(position.realisedProfit || '0');
      const commission = parseFloat(position.commission || '0');
      const netPnl = realizedPnl - commission;
      
      // Calcul du ROI
      const invested = Math.abs(quantity * entryPrice);
      const roi = invested > 0 ? (netPnl / invested) * 100 : 0;
      
      // Durée de la position
      const openTime = new Date(position.openTime || 0);
      const closeTime = new Date(position.closeTime || 0);
      const duration = closeTime.getTime() - openTime.getTime();
      const durationHours = duration / (1000 * 60 * 60);
      const durationDays = durationHours / 24;

      return {
        ...position,
        // Métriques calculées
        netPnl: netPnl.toFixed(2),
        roi: roi.toFixed(2) + '%',
        invested: invested.toFixed(2),
        priceChange: entryPrice > 0 ? (((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2) + '%' : '0%',
        
        // Durée
        durationHours: durationHours.toFixed(1),
        durationDays: durationDays.toFixed(2),
        durationFormatted: durationDays >= 1 
          ? `${durationDays.toFixed(1)} jours`
          : `${durationHours.toFixed(1)} heures`,
        
        // Frais en pourcentage
        commissionPercent: invested > 0 ? ((commission / invested) * 100).toFixed(3) + '%' : '0%',
        
        // Classification
        isWin: netPnl > 0,
        isLoss: netPnl < 0,
        isBreakeven: Math.abs(netPnl) < 0.01,
        
        // Dates formatées
        openTimeFormatted: openTime.toLocaleString('fr-FR'),
        closeTimeFormatted: closeTime.toLocaleString('fr-FR'),
        
        // Performance relative
        performanceScore: roi > 10 ? 'excellent' : roi > 5 ? 'good' : roi > 0 ? 'positive' : roi > -5 ? 'poor' : 'bad'
      };
    });

    // Calculer des statistiques de performance
    const wins = enrichedPositions.filter((p: any) => p.isWin);
    const losses = enrichedPositions.filter((p: any) => p.isLoss);
    const totalTrades = enrichedPositions.length;
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    
    const totalPnl = enrichedPositions.reduce((sum: number, p: any) => sum + parseFloat(p.netPnl), 0);
    const totalCommission = enrichedPositions.reduce((sum: number, p: any) => sum + parseFloat(p.commission || '0'), 0);
    const totalInvested = enrichedPositions.reduce((sum: number, p: any) => sum + parseFloat(p.invested), 0);
    
    const avgWin = wins.length > 0 ? wins.reduce((sum: number, p: any) => sum + parseFloat(p.netPnl), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum: number, p: any) => sum + parseFloat(p.netPnl), 0) / losses.length : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : avgWin > 0 ? 999 : 0;

    return NextResponse.json({
      success: true,
      data: enrichedPositions,
      total: totalTrades,
      performance: {
        totalTrades,
        winningTrades: wins.length,
        losingTrades: losses.length,
        winRate: winRate.toFixed(1) + '%',
        totalPnl: totalPnl.toFixed(2),
        totalCommission: totalCommission.toFixed(2),
        netProfit: (totalPnl - totalCommission).toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        overallROI: totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) + '%' : '0%',
        averageWin: avgWin.toFixed(2),
        averageLoss: avgLoss.toFixed(2),
        profitFactor: profitFactor.toFixed(2),
        bestTrade: enrichedPositions.reduce((best: any, current: any) => 
          parseFloat(current.netPnl) > parseFloat(best?.netPnl || '-999999') ? current : best, null),
        worstTrade: enrichedPositions.reduce((worst: any, current: any) => 
          parseFloat(current.netPnl) < parseFloat(worst?.netPnl || '999999') ? current : worst, null),
        tradingAdvice: {
          performance: winRate >= 60 ? 'Excellent' : winRate >= 50 ? 'Good' : winRate >= 40 ? 'Average' : 'Needs Improvement',
          suggestion: profitFactor >= 2 ? 'Continue your strategy' : profitFactor >= 1 ? 'Optimize entry/exit points' : 'Review and adjust strategy'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching position history:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}