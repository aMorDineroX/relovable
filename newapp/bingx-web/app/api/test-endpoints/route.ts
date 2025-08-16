import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tester les endpoints Perpetual Futures
    const perpetualBalance = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/balance`);
    const perpetualPositions = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/positions`);

    // Tester les endpoints Standard Futures
    const standardBalance = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/standard-futures/balance`);
    const standardPositions = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/standard-futures/positions`);

    const results = {
      perpetual: {
        balance: {
          status: perpetualBalance.status,
          data: perpetualBalance.ok ? await perpetualBalance.json() : 'Error'
        },
        positions: {
          status: perpetualPositions.status,
          data: perpetualPositions.ok ? await perpetualPositions.json() : 'Error'
        }
      },
      standard: {
        balance: {
          status: standardBalance.status,
          data: standardBalance.ok ? await standardBalance.json() : 'Error'
        },
        positions: {
          status: standardPositions.status,
          data: standardPositions.ok ? await standardPositions.json() : 'Error'
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Test des endpoints BingX Perpetual vs Standard Futures',
      results
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}