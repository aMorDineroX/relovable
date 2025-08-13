import { NextRequest, NextResponse } from 'next/server';
import { bingxService } from '../../../lib/bingx-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const depth = await bingxService.getDepth(symbol, limit);
    const convertedDepth = bingxService.convertDepthToInternal(depth);
    
    return NextResponse.json({ data: convertedDepth });
  } catch (error) {
    console.error('Error in depth API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch depth data' }, 
      { status: 500 }
    );
  }
}
