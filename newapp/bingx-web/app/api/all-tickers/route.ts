import { NextRequest, NextResponse } from 'next/server';
import { bingxService } from '../../../lib/bingx-service';

export async function GET(request: NextRequest) {
  try {
    const tickers = await bingxService.getAllTickers();
    const convertedTickers = tickers.map(ticker => 
      bingxService.convertTickerToInternal(ticker)
    );
    
    return NextResponse.json({ data: convertedTickers });
  } catch (error) {
    console.error('Error in all-tickers API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all tickers data' }, 
      { status: 500 }
    );
  }
}
