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
    const limit = searchParams.get('limit') || '500';

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

    // Endpoint pour l'historique des ordres
    const url = `${BASE_URL}/openApi/swap/v2/user/allOrders?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('BingX Orders History Response:', {
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

    // Enrichir les données avec des calculs
    const enrichedOrders = data.data.map((order: any) => ({
      ...order,
      // Calculer le P&L pour les ordres fermés
      pnl: order.status === 'FILLED' && order.executedQty && order.avgPrice 
        ? (parseFloat(order.executedQty) * parseFloat(order.avgPrice || order.price)).toFixed(2)
        : '0.00',
      // Formater les dates
      timeFormatted: new Date(order.time).toLocaleString('fr-FR'),
      updateTimeFormatted: order.updateTime ? new Date(order.updateTime).toLocaleString('fr-FR') : null,
      // Calculer les frais en %
      commissionPercent: order.executedQty && order.commission 
        ? ((parseFloat(order.commission) / (parseFloat(order.executedQty) * parseFloat(order.avgPrice || order.price))) * 100).toFixed(4)
        : '0.0000'
    }));

    return NextResponse.json({
      success: true,
      data: enrichedOrders,
      total: enrichedOrders.length,
      summary: {
        totalOrders: enrichedOrders.length,
        filledOrders: enrichedOrders.filter((o: any) => o.status === 'FILLED').length,
        canceledOrders: enrichedOrders.filter((o: any) => o.status === 'CANCELED').length,
        totalVolume: enrichedOrders
          .filter((o: any) => o.status === 'FILLED')
          .reduce((sum: number, o: any) => sum + parseFloat(o.executedQty || '0'), 0)
          .toFixed(2),
        totalCommission: enrichedOrders
          .reduce((sum: number, o: any) => sum + parseFloat(o.commission || '0'), 0)
          .toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error fetching orders history:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}