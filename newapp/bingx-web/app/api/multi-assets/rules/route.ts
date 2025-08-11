import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function GET(request: NextRequest) {
  try {
    const timestamp = Date.now();
    const params = { timestamp };

    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/trade/queryMultiAssetsRules?${queryString}&signature=${signature}`, {
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to query multi-assets rules',
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
    console.error('Multi-Assets Rules Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
