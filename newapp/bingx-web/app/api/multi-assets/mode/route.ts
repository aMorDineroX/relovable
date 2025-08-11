import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

// Basculer le mode multi-assets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { multiAssetsMode } = body;

    const timestamp = Date.now();
    const params = {
      multiAssetsMode,
      timestamp
    };

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/trade/switchMultiAssetsMode`, {
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
        error: data.msg || 'Failed to switch multi-assets mode',
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
    console.error('Multi-Assets Mode Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}

// Récupérer le statut du mode multi-assets
export async function GET(request: NextRequest) {
  try {
    const timestamp = Date.now();
    const params = { timestamp };

    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/trade/queryMultiAssetsMode?${queryString}&signature=${signature}`, {
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to query multi-assets mode',
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
    console.error('Multi-Assets Mode Query Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
