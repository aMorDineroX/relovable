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
  const limit = searchParams.get('limit') || '100';
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');

  try {
    // 1. Récupérer l'historique des ordres
    const ordersEndpoint = '/openApi/swap/v2/trade/allOrders';
    const timestamp = Date.now().toString();
    
    const ordersParams: { [key: string]: string } = { 
      timestamp,
      limit 
    };
    
    if (symbol) ordersParams.symbol = symbol;
    if (startTime) ordersParams.startTime = startTime;
    if (endTime) ordersParams.endTime = endTime;
    
    const sortedKeys = Object.keys(ordersParams).sort();
    const ordersQueryString = sortedKeys.map(key => `${key}=${ordersParams[key]}`).join('&');
    const ordersSignature = sign(ordersQueryString, SECRET_KEY);
    
    const ordersUrl = `${BASE_URL}${ordersEndpoint}?${ordersQueryString}&signature=${ordersSignature}`;
    
    const ordersResponse = await axios.get(ordersUrl, {
      headers: { 'X-BX-APIKEY': API_KEY }
    });

    // 2. Récupérer l'historique des positions fermées
    const positionHistoryEndpoint = '/openApi/swap/v1/trade/positionHistory';
    const positionParams: { [key: string]: string } = { 
      timestamp: Date.now().toString(),
      limit: '50'
    };
    
    if (symbol) positionParams.symbol = symbol;
    
    const positionSortedKeys = Object.keys(positionParams).sort();
    const positionQueryString = positionSortedKeys.map(key => `${key}=${positionParams[key]}`).join('&');
    const positionSignature = sign(positionQueryString, SECRET_KEY);
    
    const positionUrl = `${BASE_URL}${positionHistoryEndpoint}?${positionQueryString}&signature=${positionSignature}`;
    
    let positionHistoryData = null;
    try {
      const positionResponse = await axios.get(positionUrl, {
        headers: { 'X-BX-APIKEY': API_KEY }
      });
      positionHistoryData = positionResponse.data;
    } catch (positionError) {
      console.warn('Position history not available:', positionError);
    }

    // 3. Traiter et enrichir les données des ordres
    const ordersData = ordersResponse.data?.data || [];
    const enrichedOrders = ordersData.map((order: any) => {
      const price = parseFloat(order.price || '0');
      const executedQty = parseFloat(order.executedQty || '0');
      const origQty = parseFloat(order.origQty || '0');
      const commission = parseFloat(order.commission || '0');
      
      const fillRate = origQty > 0 ? (executedQty / origQty) * 100 : 0;
      const totalValue = price * executedQty;
      const isFullyFilled = order.status === 'FILLED';
      const isPartiallyFilled = executedQty > 0 && executedQty < origQty;
      
      // Calculer la date lisible
      const orderTime = new Date(parseInt(order.time));
      const updateTime = order.updateTime ? new Date(parseInt(order.updateTime)) : orderTime;
      
      return {
        ...order,
        fillRate: fillRate.toFixed(2),
        totalValue: totalValue.toFixed(2),
        commission: commission.toFixed(6),
        isFullyFilled,
        isPartiallyFilled,
        orderDate: orderTime.toISOString(),
        updateDate: updateTime.toISOString(),
        executionTime: updateTime.getTime() - orderTime.getTime(), // en ms
        priceImpact: order.type === 'MARKET' && price > 0 ? 
          'N/A (Market Order)' : 'N/A'
      };
    });

    // 4. Traiter l'historique des positions
    const positionHistory = positionHistoryData?.data || [];
    const enrichedPositions = positionHistory.map((position: any) => {
      const entryPrice = parseFloat(position.avgPrice || '0');
      const closePrice = parseFloat(position.closePrice || '0');
      const quantity = parseFloat(position.positionAmt || '0');
      const realizedPnl = parseFloat(position.realizedProfit || '0');
      
      const priceChange = entryPrice > 0 ? 
        ((closePrice - entryPrice) / entryPrice) * 100 : 0;
      
      const holdingTime = position.closeTime && position.openTime ? 
        parseInt(position.closeTime) - parseInt(position.openTime) : 0;
      
      const roi = position.initialMargin ? 
        (realizedPnl / parseFloat(position.initialMargin)) * 100 : 0;
      
      return {
        ...position,
        priceChange: priceChange.toFixed(2),
        holdingTimeMs: holdingTime,
        holdingTimeHours: (holdingTime / (1000 * 60 * 60)).toFixed(2),
        roi: roi.toFixed(2),
        openDate: position.openTime ? new Date(parseInt(position.openTime)).toISOString() : null,
        closeDate: position.closeTime ? new Date(parseInt(position.closeTime)).toISOString() : null
      };
    });

    // 5. Calculer des statistiques d'analyse
    const totalOrders = enrichedOrders.length;
    const filledOrders = enrichedOrders.filter((o: any) => o.isFullyFilled);
    const partialOrders = enrichedOrders.filter((o: any) => o.isPartiallyFilled);
    const cancelledOrders = enrichedOrders.filter((o: any) => o.status === 'CANCELLED');
    
    const totalCommission = enrichedOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.commission || '0'), 0);
    
    const totalVolume = enrichedOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.totalValue || '0'), 0);
    
    // Statistiques des positions fermées
    const profitablePositions = enrichedPositions.filter((p: any) => 
      parseFloat(p.realizedProfit || '0') > 0);
    const losingPositions = enrichedPositions.filter((p: any) => 
      parseFloat(p.realizedProfit || '0') < 0);
    
    const totalRealizedPnl = enrichedPositions.reduce((sum: number, pos: any) => 
      sum + parseFloat(pos.realizedProfit || '0'), 0);
    
    const averageHoldingTime = enrichedPositions.length > 0 ? 
      enrichedPositions.reduce((sum: number, pos: any) => 
        sum + (pos.holdingTimeMs || 0), 0) / enrichedPositions.length : 0;
    
    const winRate = enrichedPositions.length > 0 ? 
      (profitablePositions.length / enrichedPositions.length) * 100 : 0;

    // 6. Analyse par symbole
    const symbolStats = enrichedOrders.reduce((acc: any, order: any) => {
      const symbol = order.symbol;
      if (!acc[symbol]) {
        acc[symbol] = {
          orders: 0,
          volume: 0,
          commission: 0,
          avgFillRate: 0
        };
      }
      
      acc[symbol].orders += 1;
      acc[symbol].volume += parseFloat(order.totalValue || '0');
      acc[symbol].commission += parseFloat(order.commission || '0');
      acc[symbol].avgFillRate += parseFloat(order.fillRate || '0');
      
      return acc;
    }, {});
    
    // Finaliser les moyennes
    Object.keys(symbolStats).forEach(symbol => {
      symbolStats[symbol].avgFillRate = 
        (symbolStats[symbol].avgFillRate / symbolStats[symbol].orders).toFixed(2);
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: {
          data: enrichedOrders,
          summary: {
            total: totalOrders,
            filled: filledOrders.length,
            partial: partialOrders.length,
            cancelled: cancelledOrders.length,
            fillRate: totalOrders > 0 ? ((filledOrders.length / totalOrders) * 100).toFixed(2) : '0',
            totalCommission: totalCommission.toFixed(6),
            totalVolume: totalVolume.toFixed(2)
          }
        },
        positions: {
          data: enrichedPositions,
          summary: {
            total: enrichedPositions.length,
            profitable: profitablePositions.length,
            losing: losingPositions.length,
            winRate: winRate.toFixed(2),
            totalRealizedPnl: totalRealizedPnl.toFixed(2),
            averageHoldingTimeHours: (averageHoldingTime / (1000 * 60 * 60)).toFixed(2)
          }
        },
        symbolStats,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BingX API Error (Trading History):", error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'No details available'
    }, { status: 500 });
  }
}
