import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://open-api.bingx.com';

// Récupérer les données de ticker 24h pour tous les symboles
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');

    let endpoint = `${BASE_URL}/openApi/swap/v2/quote/ticker`;
    if (symbol) {
      endpoint += `?symbol=${symbol}`;
    }

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to fetch market ticker',
        code: data.code
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
      code: data.code || 0,
      msg: data.msg || 'Success'
    });

  } catch (error) {
    console.error('Market Ticker Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
