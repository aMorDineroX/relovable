import { NextRequest, NextResponse } from 'next/server';
import { DataSyncService } from '../../../lib/data-sync';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// Configuration BingX
const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

// Fonction pour créer la signature
function createSignature(query: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(query, secretKey).toString();
}

// Fonction pour faire des requêtes authentifiées à BingX
async function bingxRequest(endpoint: string, params: any = {}) {
  try {
    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString()
    }).toString();
    
    const signature = createSignature(queryString, SECRET_KEY);
    const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
    
    const response = await axios.get(finalUrl, {
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Erreur BingX API (${endpoint}):`, error.response?.data || error.message);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { syncTypes = ['all'] } = await request.json();
    
    console.log('🔄 Début de synchronisation des données BingX vers la base de données...');
    
    const apiData: any = {};
    
    // Récupérer les données selon les types demandés
    if (syncTypes.includes('all') || syncTypes.includes('balance')) {
      console.log('📊 Récupération des données de balance...');
      const balanceResponse = await bingxRequest('/openApi/swap/v2/user/balance');
      if (balanceResponse?.data?.balance) {
        apiData.balance = balanceResponse.data.balance;
      }
    }
    
    if (syncTypes.includes('all') || syncTypes.includes('positions')) {
      console.log('📈 Récupération des positions...');
      const positionsResponse = await bingxRequest('/openApi/swap/v2/user/positions');
      if (positionsResponse?.data) {
        apiData.positions = Array.isArray(positionsResponse.data) ? positionsResponse.data : [positionsResponse.data];
      }
    }
    
    if (syncTypes.includes('all') || syncTypes.includes('orders')) {
      console.log('📋 Récupération des ordres...');
      const ordersResponse = await bingxRequest('/openApi/swap/v2/trade/allOrders', { 
        limit: 100 
      });
      if (ordersResponse?.data?.orders) {
        apiData.orders = ordersResponse.data.orders;
      }
    }
    
    if (syncTypes.includes('all') || syncTypes.includes('market')) {
      console.log('💹 Récupération des données de marché...');
      // Récupérer les données pour les principales paires
      const symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'SOL-USDT'];
      apiData.market = [];
      
      for (const symbol of symbols) {
        const tickerResponse = await bingxRequest('/openApi/swap/v2/quote/ticker', { symbol });
        if (tickerResponse?.data) {
          apiData.market.push({
            ...tickerResponse.data,
            symbol
          });
        }
      }
    }
    
    // Synchroniser avec la base de données
    console.log('💾 Synchronisation avec la base de données...');
    const results = await DataSyncService.fullSync(apiData);
    
    const summary = {
      syncTypes,
      timestamp: new Date().toISOString(),
      results: {
        positions: results.positions.length,
        orders: results.orders.length,
        portfolio: results.portfolio.length,
        market: results.market.length
      },
      data: results
    };
    
    console.log('✅ Synchronisation terminée:', summary.results);
    
    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée avec succès',
      ...summary
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la synchronisation'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de synchronisation des données BingX',
    endpoints: {
      'POST /api/sync': 'Synchronise les données BingX avec la base de données',
    },
    parameters: {
      syncTypes: 'Array - Types de données à synchroniser: ["all", "balance", "positions", "orders", "market"]'
    },
    example: {
      syncTypes: ['balance', 'positions']
    }
  });
}
