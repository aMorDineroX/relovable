import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function GET() {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, SECRET_KEY);

    // Endpoint pour Standard Futures Positions
    const url = `${BASE_URL}/openApi/futures/v1/allPositions?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('BingX Standard Futures Positions Response:', {
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

    return NextResponse.json({
      success: true,
      data: data.data,
      source: 'standard-futures'
    });

  } catch (error) {
    console.error('Error fetching Standard Futures positions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'standard-futures'
    }, { status: 500 });
  }
}