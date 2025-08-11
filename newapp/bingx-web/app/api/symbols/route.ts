import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://open-api.bingx.com/openApi/swap/v2/quote/contracts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to fetch symbols');
    }

    // Filtrer et formater les symboles
    const symbols = data.data.map((contract: {
      symbol: string;
      status: string;
      asset: string;
      currency: string;
      pricePrecision: number;
      sizePrecision: number;
      tickSize: string;
      maxPrice: string;
      minTradeNum: string;
      maxTradeNum: string;
      stepSize: string;
    }) => ({
      symbol: contract.symbol,
      status: contract.status,
      baseAsset: contract.asset,
      quoteAsset: contract.currency,
      baseAssetPrecision: contract.pricePrecision,
      quotePrecision: contract.sizePrecision,
      minPrice: contract.tickSize,
      maxPrice: contract.maxPrice,
      tickSize: contract.tickSize,
      minQty: contract.minTradeNum,
      maxQty: contract.maxTradeNum,
      stepSize: contract.stepSize
    }));

    return NextResponse.json({
      code: 0,
      msg: '',
      data: symbols
    });

  } catch (error) {
    console.error('Error fetching symbols:', error);
    return NextResponse.json({
      code: -1,
      msg: 'Failed to fetch symbols',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
