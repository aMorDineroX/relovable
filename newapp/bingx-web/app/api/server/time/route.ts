import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://open-api.bingx.com';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/server/time`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.msg || 'Failed to fetch server time',
        code: data.code
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        serverTime: data.serverTime || Date.now(),
        timezone: 'UTC',
        localTime: new Date().toISOString()
      },
      code: data.code || 0,
      msg: data.msg || 'Success'
    });

  } catch (error) {
    console.error('Server Time Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: -1
    }, { status: 500 });
  }
}
