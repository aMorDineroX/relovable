import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const API_KEY = process.env.API_KEY;
  const SECRET_KEY = process.env.SECRET_KEY;
  
  return NextResponse.json({
    api_key_configured: !!API_KEY,
    secret_key_configured: !!SECRET_KEY,
    api_key_length: API_KEY?.length || 0,
    secret_key_length: SECRET_KEY?.length || 0
  });
}
