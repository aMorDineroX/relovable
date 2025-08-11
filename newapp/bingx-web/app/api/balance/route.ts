import { NextResponse } from 'next/server';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function GET() {
  if (!API_KEY || !SECRET_KEY) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
  }

  const endpoint = '/openApi/swap/v2/user/balance';
  
  const params: { [key: string]: string } = {
    // No parameters for this endpoint besides timestamp
  };

  const sortedKeys = Object.keys(params).sort();
  let queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  if (queryString) {
    queryString += '&';
  }
  queryString += `timestamp=${Date.now()}`;
  
  const signature = sign(queryString, SECRET_KEY);

  const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.get(finalUrl, { 
        headers: {
            'X-BX-APIKEY': API_KEY
        }
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("BingX API Error (Balance):", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
