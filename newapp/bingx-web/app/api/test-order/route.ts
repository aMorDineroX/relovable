import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Test order request:', body);
    
    // Validation des paramètres
    const { symbol, side, type, quantity, price, leverage } = body;
    
    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json({
        code: -1,
        msg: 'Paramètres manquants',
        error: 'Les paramètres symbol, side, type et quantity sont obligatoires'
      }, { status: 400 });
    }
    
    // Simuler une réponse réussie
    const mockResponse = {
      code: 0,
      msg: 'SUCCESS',
      debugInfo: 'Ceci est un test - aucun ordre réel n\'a été passé',
      data: {
        orderId: Date.now().toString(),
        symbol,
        side,
        type,
        quantity,
        price: price || 'MARKET',
        leverage: leverage || 1,
        status: 'NEW',
        clientOrderId: `test_${Date.now()}`,
        time: Date.now()
      }
    };
    
    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('Test order error:', error);
    return NextResponse.json({
      code: -1,
      msg: 'Test order failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test Place Order API',
    status: 'active',
    usage: 'POST with { symbol, side, type, quantity, price?, leverage? }',
    example: {
      symbol: 'BTC-USDT',
      side: 'BUY',
      type: 'MARKET',
      quantity: '0.001',
      leverage: 10
    }
  });
}