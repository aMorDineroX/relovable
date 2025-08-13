import { NextRequest, NextResponse } from 'next/server';
import { bingxService } from '../../../lib/bingx-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '500');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const trades = await bingxService.getRecentTrades(symbol, limit);
    const convertedTrades = bingxService.convertTradesToInternal(trades);
    
    return NextResponse.json({ data: convertedTrades });
  } catch (error) {
    console.error('Error in trades API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades data' }, 
      { status: 500 }
    );
  }
}
