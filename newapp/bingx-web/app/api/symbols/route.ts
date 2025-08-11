import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Données simulées pour les symboles populaires
    const mockSymbols = [
      {
        symbol: 'BTC-USDT',
        status: 'TRADING',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '100000.00',
        tickSize: '0.01',
        minQty: '0.0001',
        maxQty: '1000.0',
        stepSize: '0.0001'
      },
      {
        symbol: 'ETH-USDT',
        status: 'TRADING',
        baseAsset: 'ETH',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '10000.00',
        tickSize: '0.01',
        minQty: '0.001',
        maxQty: '1000.0',
        stepSize: '0.001'
      },
      {
        symbol: 'BNB-USDT',
        status: 'TRADING',
        baseAsset: 'BNB',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '1000.00',
        tickSize: '0.01',
        minQty: '0.01',
        maxQty: '1000.0',
        stepSize: '0.01'
      },
      {
        symbol: 'SOL-USDT',
        status: 'TRADING',
        baseAsset: 'SOL',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '500.00',
        tickSize: '0.01',
        minQty: '0.1',
        maxQty: '1000.0',
        stepSize: '0.1'
      },
      {
        symbol: 'ADA-USDT',
        status: 'TRADING',
        baseAsset: 'ADA',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 4,
        minPrice: '0.0001',
        maxPrice: '5.0000',
        tickSize: '0.0001',
        minQty: '1.0',
        maxQty: '100000.0',
        stepSize: '1.0'
      },
      {
        symbol: 'XRP-USDT',
        status: 'TRADING',
        baseAsset: 'XRP',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 4,
        minPrice: '0.0001',
        maxPrice: '3.0000',
        tickSize: '0.0001',
        minQty: '1.0',
        maxQty: '100000.0',
        stepSize: '1.0'
      },
      {
        symbol: 'DOGE-USDT',
        status: 'TRADING',
        baseAsset: 'DOGE',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 5,
        minPrice: '0.00001',
        maxPrice: '1.00000',
        tickSize: '0.00001',
        minQty: '10.0',
        maxQty: '1000000.0',
        stepSize: '10.0'
      },
      {
        symbol: 'AVAX-USDT',
        status: 'TRADING',
        baseAsset: 'AVAX',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '200.00',
        tickSize: '0.01',
        minQty: '0.1',
        maxQty: '1000.0',
        stepSize: '0.1'
      },
      {
        symbol: 'MATIC-USDT',
        status: 'TRADING',
        baseAsset: 'MATIC',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 4,
        minPrice: '0.0001',
        maxPrice: '5.0000',
        tickSize: '0.0001',
        minQty: '1.0',
        maxQty: '100000.0',
        stepSize: '1.0'
      },
      {
        symbol: 'DOT-USDT',
        status: 'TRADING',
        baseAsset: 'DOT',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 3,
        minPrice: '0.001',
        maxPrice: '100.000',
        tickSize: '0.001',
        minQty: '0.1',
        maxQty: '10000.0',
        stepSize: '0.1'
      },
      {
        symbol: 'LINK-USDT',
        status: 'TRADING',
        baseAsset: 'LINK',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 3,
        minPrice: '0.001',
        maxPrice: '100.000',
        tickSize: '0.001',
        minQty: '0.1',
        maxQty: '10000.0',
        stepSize: '0.1'
      },
      {
        symbol: 'UNI-USDT',
        status: 'TRADING',
        baseAsset: 'UNI',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 3,
        minPrice: '0.001',
        maxPrice: '50.000',
        tickSize: '0.001',
        minQty: '0.1',
        maxQty: '10000.0',
        stepSize: '0.1'
      },
      {
        symbol: 'LTC-USDT',
        status: 'TRADING',
        baseAsset: 'LTC',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '500.00',
        tickSize: '0.01',
        minQty: '0.01',
        maxQty: '1000.0',
        stepSize: '0.01'
      },
      {
        symbol: 'BCH-USDT',
        status: 'TRADING',
        baseAsset: 'BCH',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 2,
        minPrice: '0.01',
        maxPrice: '1000.00',
        tickSize: '0.01',
        minQty: '0.01',
        maxQty: '1000.0',
        stepSize: '0.01'
      },
      {
        symbol: 'ATOM-USDT',
        status: 'TRADING',
        baseAsset: 'ATOM',
        quoteAsset: 'USDT',
        baseAssetPrecision: 8,
        quotePrecision: 3,
        minPrice: '0.001',
        maxPrice: '50.000',
        tickSize: '0.001',
        minQty: '0.1',
        maxQty: '10000.0',
        stepSize: '0.1'
      }
    ];

    // Tentative d'appel à l'API réelle (optionnel)
    try {
      const response = await fetch('https://open-api.bingx.com/openApi/swap/v2/quote/contracts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.code === 0 && data.data && data.data.length > 0) {
          // Si l'API réelle fonctionne, l'utiliser
          const symbols = data.data.slice(0, 50).map((contract: any) => ({
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
            msg: 'Success - Real data',
            data: symbols
          });
        }
      }
    } catch (apiError) {
      console.log('API externe non disponible, utilisation des données simulées');
    }

    // Utiliser les données simulées par défaut
    return NextResponse.json({
      code: 0,
      msg: 'Success - Mock data',
      data: mockSymbols
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
