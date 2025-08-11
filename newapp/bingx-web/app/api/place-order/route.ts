import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.BINGX_API_KEY;
const SECRET_KEY = process.env.BINGX_SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, side, type, quantity, price, leverage } = body;

    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const timestamp = Date.now();
    
    // Paramètres de base pour l'ordre
    const params: Record<string, any> = {
      symbol,
      side,
      type,
      quantity,
      timestamp,
    };

    // Ajouter le prix pour les ordres LIMIT
    if (type === 'LIMIT' && price) {
      params.price = price;
    }

    // Ajouter le levier si spécifié
    if (leverage) {
      params.leverage = leverage;
    }

    // Créer la query string
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Créer la signature
    const signature = createSignature(queryString, SECRET_KEY);
    
    // URL complète avec signature
    const url = `${BASE_URL}/openApi/swap/v2/trade/order?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BX-APIKEY': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({
      code: -1,
      msg: 'Failed to place order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
