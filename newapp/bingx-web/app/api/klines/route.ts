import { NextRequest, NextResponse } from 'next/server';
import { bingxService } from '../../../lib/bingx-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1m';
    const limit = parseInt(searchParams.get('limit') || '500');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const klineData = await bingxService.getKlineData(symbol, interval, limit);
    
    return NextResponse.json({ data: klineData });
  } catch (error) {
    console.error('Error in klines API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kline data' }, 
      { status: 500 }
    );
  }
}
