import { NextResponse } from 'next/server';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function GET(request: Request) {
  if (!API_KEY || !SECRET_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'API keys not configured' 
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  try {
    // 1. Récupérer les positions standards
    const positionsEndpoint = '/openApi/swap/v2/user/positions';
    const timestamp = Date.now().toString();
    
    const positionsParams: { [key: string]: string } = { timestamp };
    if (symbol) positionsParams.symbol = symbol;
    
    const sortedKeys = Object.keys(positionsParams).sort();
    const positionsQueryString = sortedKeys.map(key => `${key}=${positionsParams[key]}`).join('&');
    const positionsSignature = sign(positionsQueryString, SECRET_KEY);
    
    const positionsUrl = `${BASE_URL}${positionsEndpoint}?${positionsQueryString}&signature=${positionsSignature}`;
    
    const positionsResponse = await axios.get(positionsUrl, {
      headers: { 'X-BX-APIKEY': API_KEY }
    });

    // 2. Récupérer les données de marché pour enrichir les positions
    const marketDataPromises: Promise<any>[] = [];
    const positions = positionsResponse.data?.data || [];

    // Pour chaque position, récupérer des données de marché
    for (const position of positions) {
      if (position.symbol) {
        // Prix de marché
        const tickerPromise = axios.get(`${BASE_URL}/openApi/swap/v2/market/ticker?symbol=${position.symbol}`)
          .catch(() => null);
        
        // Taux de financement
        const fundingPromise = axios.get(`${BASE_URL}/openApi/swap/v2/market/fundingRate?symbol=${position.symbol}&limit=1`)
          .catch(() => null);
          
        marketDataPromises.push(
          Promise.all([tickerPromise, fundingPromise]).then(([ticker, funding]) => ({
            symbol: position.symbol,
            ticker: ticker?.data,
            funding: funding?.data
          }))
        );
      }
    }

    const marketData = await Promise.all(marketDataPromises);
    const marketDataMap = marketData.reduce((acc, data) => {
      if (data.symbol) {
        acc[data.symbol] = data;
      }
      return acc;
    }, {} as any);

    // 3. Enrichir les positions avec des calculs avancés
    const enrichedPositions = positions.map((position: any) => {
      const symbol = position.symbol;
      const positionAmt = parseFloat(position.positionAmt || '0');
      const avgPrice = parseFloat(position.avgPrice || '0');
      const markPrice = parseFloat(position.markPrice || avgPrice);
      const unrealizedProfit = parseFloat(position.unrealizedProfit || '0');
      const initialMargin = parseFloat(position.initialMargin || '0');
      const leverage = parseInt(position.leverage || '1');
      
      // Données de marché
      const marketInfo = marketDataMap[symbol];
      const ticker = marketInfo?.ticker?.data;
      const funding = marketInfo?.funding?.data?.[0];
      
      // Calculs avancés
      const positionValue = Math.abs(positionAmt * markPrice);
      const pnlPercentage = initialMargin > 0 ? (unrealizedProfit / initialMargin) * 100 : 0;
      const entryValue = Math.abs(positionAmt * avgPrice);
      const priceChange = avgPrice > 0 ? ((markPrice - avgPrice) / avgPrice) * 100 : 0;
      
      // ROE (Return on Equity) calculé correctement
      const roe = initialMargin > 0 ? (unrealizedProfit / initialMargin) * 100 : 0;
      
      // Calcul de liquidation approximatif (simplifié)
      const maintenanceMarginRate = 0.005; // 0.5% typical
      const liquidationBuffer = position.positionSide === 'LONG' ? 
        avgPrice * (1 - (1/leverage) + maintenanceMarginRate) :
        avgPrice * (1 + (1/leverage) - maintenanceMarginRate);
      
      // Distance à la liquidation
      const liquidationDistance = markPrice > 0 ? 
        Math.abs((markPrice - liquidationBuffer) / markPrice) * 100 : 0;
      
      // Statut de la position
      const healthStatus = liquidationDistance > 20 ? 'healthy' : 
                          liquidationDistance > 10 ? 'warning' : 'critical';
      
      // Coût de financement estimé (si applicable)
      const fundingRate = funding ? parseFloat(funding.fundingRate || '0') : 0;
      const fundingCost = positionValue * fundingRate;
      
      return {
        ...position,
        
        // Métriques calculées
        positionValue: positionValue.toFixed(2),
        pnlPercentage: pnlPercentage.toFixed(2),
        roe: roe.toFixed(2),
        priceChange: priceChange.toFixed(2),
        entryValue: entryValue.toFixed(2),
        
        // Informations de risque
        liquidationPrice: liquidationBuffer.toFixed(4),
        liquidationDistance: liquidationDistance.toFixed(2),
        healthStatus,
        
        // Données de marché enrichies
        marketData: {
          currentPrice: markPrice.toFixed(4),
          priceChange24h: ticker?.priceChangePercent || '0',
          volume24h: ticker?.volume || '0',
          highPrice24h: ticker?.highPrice || '0',
          lowPrice24h: ticker?.lowPrice || '0',
          fundingRate: fundingRate ? (fundingRate * 100).toFixed(4) : null,
          nextFundingTime: funding?.fundingTime || null,
          estimatedFundingCost: fundingCost.toFixed(4)
        },
        
        // Timestamps
        lastUpdated: new Date().toISOString(),
        dataAge: Date.now() - parseInt(timestamp)
      };
    });

    // 4. Calculer des statistiques globales
    const totalPositions = enrichedPositions.length;
    const totalUnrealizedPnL = enrichedPositions.reduce((sum: number, pos: any) => 
      sum + parseFloat(pos.unrealizedProfit || '0'), 0);
    const totalPositionValue = enrichedPositions.reduce((sum: number, pos: any) => 
      sum + parseFloat(pos.positionValue || '0'), 0);
    const totalInitialMargin = enrichedPositions.reduce((sum: number, pos: any) => 
      sum + parseFloat(pos.initialMargin || '0'), 0);
    
    const averageROE = totalInitialMargin > 0 ? 
      (totalUnrealizedPnL / totalInitialMargin) * 100 : 0;
    
    const riskLevels = enrichedPositions.reduce((acc: any, pos: any) => {
      acc[pos.healthStatus] = (acc[pos.healthStatus] || 0) + 1;
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        positions: enrichedPositions,
        summary: {
          totalPositions,
          totalUnrealizedPnL: totalUnrealizedPnL.toFixed(2),
          totalPositionValue: totalPositionValue.toFixed(2),
          totalInitialMargin: totalInitialMargin.toFixed(2),
          averageROE: averageROE.toFixed(2),
          riskDistribution: riskLevels,
          longPositions: enrichedPositions.filter((p: any) => p.positionSide === 'LONG').length,
          shortPositions: enrichedPositions.filter((p: any) => p.positionSide === 'SHORT').length
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BingX API Error (Enhanced Positions):", error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'No details available'
    }, { status: 500 });
  }
}
