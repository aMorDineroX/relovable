import { NextResponse } from 'next/server';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function GET() {
  if (!API_KEY || !SECRET_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'API keys not configured' 
    }, { status: 500 });
  }

  try {
    // Récupérer les informations de compte
    const accountEndpoint = '/openApi/swap/v2/user/balance';
    const timestamp = Date.now().toString();
    const queryString = `timestamp=${timestamp}`;
    const signature = sign(queryString, SECRET_KEY);
    
    const accountUrl = `${BASE_URL}${accountEndpoint}?${queryString}&signature=${signature}`;
    
    const accountResponse = await axios.get(accountUrl, {
      headers: { 'X-BX-APIKEY': API_KEY }
    });

    // Récupérer les informations de compte étendu (API v1 pour plus de détails)
    const extendedEndpoint = '/openApi/swap/v1/user/balance';
    const extendedQueryString = `timestamp=${Date.now()}`;
    const extendedSignature = sign(extendedQueryString, SECRET_KEY);
    
    const extendedUrl = `${BASE_URL}${extendedEndpoint}?${extendedQueryString}&signature=${extendedSignature}`;
    
    let extendedData = null;
    try {
      const extendedResponse = await axios.get(extendedUrl, {
        headers: { 'X-BX-APIKEY': API_KEY }
      });
      extendedData = extendedResponse.data;
    } catch (extendedError) {
      console.warn('Extended account data not available:', extendedError);
    }

    // Enrichir les données avec des calculs
    const accountData = accountResponse.data;
    
    if (accountData && accountData.code === 0 && accountData.data) {
      const balance = accountData.data;
      
      // Calculer des métriques additionnelles
      const totalEquity = parseFloat(balance.equity || '0');
      const totalBalance = parseFloat(balance.balance || '0');
      const unrealizedPnL = parseFloat(balance.unrealizedProfit || '0');
      const usedMargin = parseFloat(balance.usedMargin || '0');
      const availableMargin = parseFloat(balance.availableMargin || '0');
      
      const marginRatio = totalEquity > 0 ? (usedMargin / totalEquity) * 100 : 0;
      const freeMarginRatio = totalEquity > 0 ? (availableMargin / totalEquity) * 100 : 0;
      const pnlRatio = totalBalance > 0 ? (unrealizedPnL / totalBalance) * 100 : 0;
      
      const enrichedData = {
        ...balance,
        // Métriques calculées
        marginRatio: marginRatio.toFixed(2),
        freeMarginRatio: freeMarginRatio.toFixed(2),
        pnlRatio: pnlRatio.toFixed(2),
        leverageUsed: usedMargin > 0 && availableMargin > 0 ? 
          ((usedMargin + availableMargin) / availableMargin).toFixed(2) : '1.00',
        
        // Statut du compte
        accountStatus: {
          canTrade: usedMargin < availableMargin * 0.9, // Moins de 90% utilisé
          marginLevel: marginRatio < 80 ? 'healthy' : marginRatio < 95 ? 'warning' : 'critical',
          hasOpenPositions: usedMargin > 0
        },
        
        // Données étendues si disponibles
        extended: extendedData,
        
        // Timestamp pour le cache
        lastUpdated: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: enrichedData
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No account data received',
      rawData: accountData
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BingX API Error (Account Info):", error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'No details available'
    }, { status: 500 });
  }
}
