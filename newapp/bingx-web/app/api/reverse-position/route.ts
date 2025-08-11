import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY!;
const SECRET_KEY = process.env.SECRET_KEY!;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol } = body;

    const timestamp = Date.now();
    const params = {
      symbol,
      timestamp
    };

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');

    const signature = sign(queryString, SECRET_KEY);

    const response = await fetch(`${BASE_URL}/openApi/swap/v1/trade/oneClickReverse`, {
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
        error: data.msg || 'Failed to reverse position',
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
    console.error('Reverse Position Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
