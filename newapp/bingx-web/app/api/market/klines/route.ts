import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://open-api.bingx.com';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') || 'BTC-USDT';
    const interval = url.searchParams.get('interval') || '1h';
    const limit = url.searchParams.get('limit') || '100';
    const startTime = url.searchParams.get('startTime');
    const endTime = url.searchParams.get('endTime');

    let endpoint = `${BASE_URL}/openApi/swap/v2/quote/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    if (startTime) endpoint += `&startTime=${startTime}`;
    if (endTime) endpoint += `&endTime=${endTime}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to fetch klines',
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
    console.error('Klines Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
