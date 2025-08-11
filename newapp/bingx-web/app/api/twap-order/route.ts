import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

// Placer un ordre TWAP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      side,
      quantity,
      duration, // Durée en minutes
      intervalTime, // Intervalle entre les ordres en secondes
      priceType = 'MARKET' // MARKET ou LIMIT
    } = body;

    const timestamp = Date.now();
    const params = {
      symbol,
      side,
      quantity,
      duration,
      intervalTime,
      priceType,
      timestamp
    };

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/twap/order`, {
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
        error: data.msg || 'Failed to place TWAP order',
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
    console.error('TWAP Order Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}

// Récupérer les ordres TWAP ouverts
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');

    const timestamp = Date.now();
    const params: any = { timestamp };
    
    if (symbol) {
      params.symbol = symbol;
    }

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/twap/openOrders?${queryString}&signature=${signature}`, {
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to fetch TWAP orders',
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
    console.error('TWAP Orders Fetch Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
