import { NextRequest, NextResponse } from 'next/server';
import { bingxService } from '../../../lib/bingx-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const ticker = await bingxService.getTicker(symbol);
    const convertedTicker = bingxService.convertTickerToInternal(ticker);
    
    return NextResponse.json({ data: convertedTicker });
  } catch (error) {
    console.error('Error in ticker API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' }, 
      { status: 500 }
    );
  }
}
