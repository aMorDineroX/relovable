import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock des réponses BingX avec MSW v2
export const handlers = [
  // Balance API Mock
  http.get('/api/balance', () => {
    return HttpResponse.json({
      success: true,
      data: {
        asset: 'USDT',
        balance: '1000.50000000',
        equity: '1025.75000000',
        unrealizedProfit: '25.25000000',
        realisedProfit: '150.00000000',
        availableMargin: '800.25000000',
        usedMargin: '225.50000000'
      }
    });
  }),

  // Positions API Mock
  http.get('/api/positions', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          positionId: '123456',
          symbol: 'BTC-USDT',
          positionSide: 'LONG',
          positionAmt: '0.5',
          avgPrice: '45000.00',
          markPrice: '46000.00',
          unrealizedProfit: '500.00',
          leverage: 10,
          isolated: false,
          percentage: '2.22'
        },
        {
          positionId: '789012',
          symbol: 'ETH-USDT',
          positionSide: 'SHORT',
          positionAmt: '-2.0',
          avgPrice: '2650.00',
          markPrice: '2600.00',
          unrealizedProfit: '100.00',
          leverage: 5,
          isolated: true,
          percentage: '1.89'
        }
      ]
    });
  }),

  // Standard Futures Balance Mock
  http.get('/api/standard-futures/balance', () => {
    return HttpResponse.json({
      success: true,
      data: {
        asset: 'USDT',
        balance: '500.25000000',
        equity: '485.50000000',
        unrealizedProfit: '-14.75000000',
        realisedProfit: '75.00000000',
        availableMargin: '400.00000000',
        usedMargin: '85.50000000'
      },
      source: 'standard-futures'
    });
  }),

  // Standard Futures Positions Mock
  http.get('/api/standard-futures/positions', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          positionId: '345678',
          symbol: 'BTC0329',
          positionSide: 'LONG',
          positionAmt: '0.25',
          avgPrice: '44500.00',
          markPrice: '45200.00',
          unrealizedProfit: '175.00',
          leverage: 8,
          isolated: false
        }
      ],
      source: 'standard-futures'
    });
  }),

  // Market Ticker Mock
  http.get('/api/market/ticker', ({ request }) => {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');
    
    return HttpResponse.json({
      success: true,
      data: {
        symbol: symbol || 'BTC-USDT',
        lastPrice: '46250.50',
        priceChange: '1250.75',
        priceChangePercent: '2.78',
        highPrice: '47000.00',
        lowPrice: '44500.00',
        volume: '125674.50',
        quoteVolume: '5800000000',
        openPrice: '45000.00',
        bidPrice: '46249.50',
        askPrice: '46251.00',
        count: 12567
      }
    });
  }),

  // Orders History Mock
  http.get('/api/orders/history', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          orderId: '111222333',
          symbol: 'BTC-USDT',
          side: 'BUY',
          type: 'LIMIT',
          quantity: '0.5',
          price: '45000.00',
          status: 'FILLED',
          executedQty: '0.5',
          avgPrice: '44998.50',
          time: Date.now() - 86400000,
          commission: '22.50',
          pnl: '22499.25',
          timeFormatted: new Date(Date.now() - 86400000).toLocaleString('fr-FR'),
          commissionPercent: '0.1000'
        }
      ],
      summary: {
        totalOrders: 1,
        filledOrders: 1,
        canceledOrders: 0,
        totalVolume: '0.50',
        totalCommission: '22.50'
      }
    });
  }),

  // Commission Rates Mock
  http.get('/api/trading/commission-rates', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          symbol: 'BTC-USDT',
          makerCommissionRate: '0.0002',
          takerCommissionRate: '0.0004',
          makerRatePercent: '0.0200%',
          takerRatePercent: '0.0400%',
          spread: '0.0200%',
          savingsPercent: '50.00%',
          projections: {
            '1K': { maker: '0.20', taker: '0.40' },
            '10K': { maker: '2.00', taker: '4.00' },
            '100K': { maker: '20.00', taker: '40.00' }
          }
        }
      ],
      summary: {
        totalPairs: 1,
        averageMakerRate: '0.0200%',
        averageTakerRate: '0.0400%',
        averageSpread: '0.0200%'
      }
    });
  }),

  // Position History Mock
  http.get('/api/trading/position-history', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          symbol: 'BTC-USDT',
          positionSide: 'LONG',
          avgPrice: '44000.00',
          closeAvgPrice: '45000.00',
          positionAmt: '0.5',
          realisedProfit: '500.00',
          commission: '10.00',
          netPnl: '490.00',
          roi: '2.22%',
          invested: '22000.00',
          durationFormatted: '2.5 heures',
          openTimeFormatted: new Date(Date.now() - 9000000).toLocaleString('fr-FR'),
          closeTimeFormatted: new Date(Date.now() - 1000000).toLocaleString('fr-FR'),
          isWin: true,
          performanceScore: 'good'
        }
      ],
      performance: {
        totalTrades: 10,
        winningTrades: 7,
        losingTrades: 3,
        winRate: '70.0%',
        totalPnl: '1250.00',
        overallROI: '15.5%',
        profitFactor: '2.35',
        averageWin: '245.50',
        averageLoss: '-125.75',
        tradingAdvice: {
          performance: 'Good',
          suggestion: 'Continue your strategy'
        }
      }
    });
  }),

  // Account Info Mock
  http.get('/api/account/info', () => {
    return HttpResponse.json({
      success: true,
      data: {
        asset: 'USDT',
        balance: '1000.50',
        equity: '1025.75',
        marginRatio: '22.50',
        freeMarginRatio: '77.50',
        pnlRatio: '2.55',
        leverageUsed: '2.85',
        accountStatus: {
          canTrade: true,
          marginLevel: 'healthy',
          hasOpenPositions: true
        }
      }
    });
  }),

  // Test Endpoints Mock
  http.get('/api/test-endpoints', () => {
    return HttpResponse.json({
      success: true,
      message: 'Test des endpoints BingX Perpetual vs Standard Futures',
      results: {
        perpetual: {
          balance: { status: 200, data: { success: true } },
          positions: { status: 200, data: { success: true } }
        },
        standard: {
          balance: { status: 200, data: { success: true } },
          positions: { status: 200, data: { success: true } }
        }
      }
    });
  }),

  // Error cases
  http.get('/api/balance-error', () => {
    return HttpResponse.json({
      success: false,
      error: 'API keys not configured'
    }, { status: 500 });
  }),

  http.get('/api/bingx-error', () => {
    return HttpResponse.json({
      code: -1001,
      msg: 'Invalid API key'
    }, { status: 400 });
  })
];

export const server = setupServer(...handlers);