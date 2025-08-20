import { NextResponse } from 'next/server';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

export async function GET(request: Request) {
  console.log('📞 API /standard/balance appelée');
  
  if (!API_KEY || !SECRET_KEY) {
    console.log('❌ Clés API manquantes');
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
  }

  // Endpoint pour Standard Futures balance
  const endpoint = '/openApi/contract/v1/balance';
  
  const params: { [key: string]: string } = {
    timestamp: Date.now().toString(),
  };

  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  const signature = sign(queryString, SECRET_KEY);

  const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
  
  console.log('🌐 URL finale Standard Futures Balance:', finalUrl.replace(/signature=[^&]*/, 'signature=***'));

  try {
    console.log('📡 Envoi de la requête Standard Futures Balance...');
    const response = await axios.get(finalUrl, { 
        headers: {
            'X-BX-APIKEY': API_KEY
        }
    });
    
    console.log('✅ Réponse Standard Futures Balance reçue:', response.status);
    console.log('📦 Données Standard Futures Balance:', JSON.stringify(response.data, null, 2));
    
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Erreur BingX API (Standard Futures Balance):", error);
    
    if (axios.isAxiosError(error)) {
      console.error("📊 Status:", error.response?.status);
      console.error("📋 Data:", error.response?.data);
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      type: 'standard_futures_balance'
    }, { status: 500 });
  }
}