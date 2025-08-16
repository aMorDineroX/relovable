import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function GET(request: Request) {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || '';
    
    const timestamp = Date.now();
    
    // Construire les paramètres
    const params: Record<string, string> = {
      timestamp: timestamp.toString()
    };

    if (symbol) params.symbol = symbol;

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signature = createSignature(queryString, SECRET_KEY);

    // Endpoint pour les taux de commission
    const url = `${BASE_URL}/openApi/swap/v1/user/commissionRate?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('BingX Commission Rates Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.msg || 'Unknown error'}`);
    }

    if (data.code !== 0) {
      throw new Error(`BingX API error! code: ${data.code}, message: ${data.msg || 'Unknown error'}`);
    }

    // Enrichir les données avec des calculs et des projections
    const enrichedData = data.data.map((rate: any) => {
      const makerRate = parseFloat(rate.makerCommissionRate) * 100;
      const takerRate = parseFloat(rate.takerCommissionRate) * 100;
      
      return {
        ...rate,
        // Taux en pourcentage
        makerRatePercent: makerRate.toFixed(4) + '%',
        takerRatePercent: takerRate.toFixed(4) + '%',
        
        // Spread entre maker et taker
        spread: ((takerRate - makerRate)).toFixed(4) + '%',
        
        // Économies potentielles en tant que maker
        savingsPercent: takerRate > 0 ? (((takerRate - makerRate) / takerRate) * 100).toFixed(2) + '%' : '0%',
        
        // Projections de frais pour différents volumes
        projections: {
          '1K': {
            maker: (1000 * makerRate / 100).toFixed(2),
            taker: (1000 * takerRate / 100).toFixed(2)
          },
          '10K': {
            maker: (10000 * makerRate / 100).toFixed(2),
            taker: (10000 * takerRate / 100).toFixed(2)
          },
          '100K': {
            maker: (100000 * makerRate / 100).toFixed(2),
            taker: (100000 * takerRate / 100).toFixed(2)
          }
        }
      };
    });

    // Calculer des statistiques globales
    const avgMakerRate = enrichedData.reduce((sum: number, r: any) => 
      sum + parseFloat(r.makerCommissionRate), 0) / enrichedData.length;
    const avgTakerRate = enrichedData.reduce((sum: number, r: any) => 
      sum + parseFloat(r.takerCommissionRate), 0) / enrichedData.length;

    return NextResponse.json({
      success: true,
      data: enrichedData,
      summary: {
        totalPairs: enrichedData.length,
        averageMakerRate: (avgMakerRate * 100).toFixed(4) + '%',
        averageTakerRate: (avgTakerRate * 100).toFixed(4) + '%',
        averageSpread: ((avgTakerRate - avgMakerRate) * 100).toFixed(4) + '%',
        recommendations: {
          preferMakerOrders: 'Utilisez des ordres LIMIT pour bénéficier des taux maker plus bas',
          volumeDiscount: 'Augmentez votre volume de trading pour obtenir des réductions',
          bestStrategy: avgTakerRate > avgMakerRate * 1.5 
            ? 'Privilégiez les ordres maker pour économiser sur les frais'
            : 'L\'écart maker/taker est faible, la stratégie de trading prime'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching commission rates:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}