import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      symbol, 
      side, 
      type, 
      quantity, 
      price, 
      leverage,
      // Nouveaux paramètres avancés
      stopLoss,
      takeProfit,
      timeInForce = 'GTC',
      clientOrderId,
      closePosition,
      activationPrice,
      stopGuaranteed,
      priceType,
      workingType,
      reduceOnly
    } = body;

    console.log('Order request received:', { symbol, side, type, quantity, price, leverage });

    if (!API_KEY || !SECRET_KEY) {
      console.error('API keys not configured');
      throw new Error('API keys not configured');
    }

    // Validation des paramètres obligatoires
    if (!symbol || !side || !type || !quantity) {
      throw new Error('Paramètres obligatoires manquants: symbol, side, type, quantity');
    }

    // Validation du symbole (format BingX)
    if (!symbol) {
      throw new Error('Symbole manquant');
    }

    // Convertir le symbole au format BingX
    const bingxSymbol = convertToBingXSymbol(symbol);

    console.log('Symbol conversion:', { original: symbol, converted: bingxSymbol });

    const timestamp = Date.now();
    
    // Paramètres de base pour l'ordre
    const params: Record<string, any> = {
      symbol: bingxSymbol,
      side: side.toUpperCase(),
      type: type.toUpperCase(),
      quantity: parseFloat(quantity).toString(),
      timestamp,
      timeInForce,
      positionSide: side.toUpperCase() === 'BUY' ? 'LONG' : 'SHORT', // Obligatoire pour BingX futures
      recvWindow: 5000 // Fenêtre de validité de la requête
    };

    // Ajouter le prix pour les ordres LIMIT
    if (type.toUpperCase() === 'LIMIT' && price) {
      params.price = parseFloat(price).toString();
    }

    // Pour les ordres MARKET, on peut ajouter quoteOrderQty au lieu de quantity si nécessaire
    if (type.toUpperCase() === 'MARKET') {
      // Garder quantity comme paramètre principal
      params.quantity = parseFloat(quantity).toString();
    }

    // Définir le levier avant de passer l'ordre
    if (leverage && leverage > 1) {
      try {
        await setLeverage(bingxSymbol, leverage);
      } catch (leverageError) {
        console.warn('Warning: Could not set leverage:', leverageError);
        // Continue without throwing error as leverage might already be set
      }
    }

    // Nouveaux paramètres avancés
    if (stopLoss) {
      params.stopPrice = parseFloat(stopLoss).toString();
    }

    if (takeProfit) {
      params.takeProfitPrice = parseFloat(takeProfit).toString();
    }

    if (clientOrderId) {
      params.clientOrderId = clientOrderId.toLowerCase(); // BingX convertit automatiquement en minuscules
    }

    if (closePosition !== undefined) {
      params.closePosition = closePosition.toString();
    }

    if (activationPrice) {
      params.activationPrice = parseFloat(activationPrice).toString();
    }

    if (stopGuaranteed) {
      params.stopGuaranteed = stopGuaranteed; // true, cutfee
    }

    if (priceType) {
      params.priceType = priceType; // MARK_PRICE, CONTRACT_PRICE, INDEX_PRICE
    }

    if (workingType) {
      params.workingType = workingType;
    }

    if (reduceOnly !== undefined) {
      params.reduceOnly = reduceOnly.toString();
    }

    console.log('Order parameters:', params);

    // Créer la query string
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    console.log('Query string:', queryString);

    // Créer la signature
    const signature = createSignature(queryString, SECRET_KEY);
    
    // URL complète avec signature
    const url = `${BASE_URL}/openApi/swap/v2/trade/order`;

    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-BX-APIKEY': API_KEY,
      },
      body: `${queryString}&signature=${signature}`
    });

    const data = await response.json();
    
    // Log détaillé pour le débogage
    console.log('BingX API Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.msg || 'Unknown error'}`);
    }

    // Vérifier le code de réponse BingX
    if (data.code !== 0) {
      // Gestion d'erreur spécifique pour marge insuffisante
      if (data.code === 80001) {
        throw new Error(`Marge insuffisante (code: ${data.code}). Message: ${data.msg}`);
      }
      throw new Error(`BingX API error! code: ${data.code}, message: ${data.msg || 'Unknown error'}`);
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error placing order:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('Marge insuffisante') ? 400 : 500;

    return NextResponse.json({
      code: -1,
      msg: 'Failed to place order',
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: statusCode });
  }
}

// Fonction utilitaire pour définir le levier
async function setLeverage(symbol: string, leverage: number) {
  const timestamp = Date.now();
  const params: Record<string, string | number> = {
    symbol,
    leverage: leverage.toString(),
    side: 'LONG', // Par défaut
    timestamp,
    recvWindow: 5000
  };

  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signature = createSignature(queryString, SECRET_KEY!);
  const url = `${BASE_URL}/openApi/swap/v2/trade/leverage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-BX-APIKEY': API_KEY!,
    },
    body: `${queryString}&signature=${signature}`
  });

  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`Failed to set leverage: ${data.msg}`);
  }

  return data;
}

// Fonction pour convertir et valider le symbole BingX
function convertToBingXSymbol(symbol: string): string {
  // Symboles populaires et leurs équivalents BingX
  const symbolMap: Record<string, string> = {
    'BTCUSDT': 'BTC-USDT',
    'ETHUSDT': 'ETH-USDT',
    'BNBUSDT': 'BNB-USDT',
    'ADAUSDT': 'ADA-USDT',
    'SOLUSDT': 'SOL-USDT',
    'XRPUSDT': 'XRP-USDT',
    'DOGEUSDT': 'DOGE-USDT',
    'AVAXUSDT': 'AVAX-USDT',
    'DOTUSDT': 'DOT-USDT',
    'MATICUSDT': 'MATIC-USDT'
  };

  // Si le symbole est déjà au bon format
  if (symbol.includes('-')) {
    return symbol;
  }

  // Utiliser le mapping si disponible
  if (symbolMap[symbol.toUpperCase()]) {
    return symbolMap[symbol.toUpperCase()];
  }

  // Conversion automatique pour les autres
  if (symbol.endsWith('USDT')) {
    return symbol.replace(/USDT$/, '-USDT');
  }
  
  if (symbol.endsWith('BUSD')) {
    return symbol.replace(/BUSD$/, '-BUSD');
  }

  // Par défaut, ajouter -USDT si pas de quote asset
  return `${symbol}-USDT`;
}
