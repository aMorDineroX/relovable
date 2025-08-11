import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

// Modifier la marge d'une position isolée
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      positionSide,
      amount,
      type, // 1: Ajouter, 2: Réduire
      positionId
    } = body;

    const timestamp = Date.now();
    const params = {
      symbol,
      positionSide,
      amount,
      type,
      timestamp,
      ...(positionId && { positionId })
    };

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/trade/positionMargin`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...params,
        signature
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to modify position margin',
        code: data.code
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      code: data.code,
      msg: data.msg
    });

  } catch (error) {
    console.error('Position Margin Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}

// Récupérer l'historique des modifications de marge
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');
    const startTime = url.searchParams.get('startTime');
    const endTime = url.searchParams.get('endTime');
    const limit = url.searchParams.get('limit') || '100';

    const timestamp = Date.now();
    const params: any = { timestamp, limit };
    
    if (symbol) params.symbol = symbol;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/positionMargin/history?${queryString}&signature=${signature}`, {
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to fetch margin history',
        code: data.code
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data || [],
      code: data.code,
      msg: data.msg
    });

  } catch (error) {
    console.error('Margin History Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
