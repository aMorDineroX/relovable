import { NextResponse } from 'next/server';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function POST(request: Request) {
  if (!API_KEY || !SECRET_KEY) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { symbol, positionSide, quantity } = body;

  if (!symbol || !positionSide) {
    return NextResponse.json({ error: 'Symbol and positionSide are required' }, { status: 400 });
  }

  const endpoint = '/openApi/swap/v2/trade/closePosition';
  
  const params: { [key: string]: string } = {
    symbol,
    positionSide,
    timestamp: Date.now().toString(),
  };

  if (quantity) {
    params.quantity = quantity;
  }

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  const signature = sign(queryString, SECRET_KEY);

  const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.post(finalUrl, {}, { 
        headers: {
            'X-BX-APIKEY': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BingX API Error (Close Position):", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
