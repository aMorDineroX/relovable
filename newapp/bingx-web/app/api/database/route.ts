import { NextRequest, NextResponse } from 'next/server';
import { 
  getPositions, 
  getOrders, 
  getPortfolio, 
  getLatestMarketData, 
  getActivityLogs 
} from '../../../lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const symbol = searchParams.get('symbol');
    
    const data: any = {};
    
    if (type === 'all' || type === 'positions') {
      data.positions = await getPositions();
    }
    
    if (type === 'all' || type === 'orders') {
      data.orders = await getOrders(limit);
    }
    
    if (type === 'all' || type === 'portfolio') {
      data.portfolio = await getPortfolio();
    }
    
    if (type === 'all' || type === 'market') {
      data.market = await getLatestMarketData(symbol || undefined);
    }
    
    if (type === 'all' || type === 'logs') {
      data.logs = await getActivityLogs(limit);
    }
    
    // Calculer quelques statistiques
    const stats = {
      totalPositions: data.positions?.length || 0,
      totalOrders: data.orders?.length || 0,
      portfolioAssets: data.portfolio?.length || 0,
      marketDataPoints: data.market?.length || 0,
      lastUpdate: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      type,
      stats,
      data
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des données'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type de données à supprimer requis'
      }, { status: 400 });
    }
    
    // Pour des raisons de sécurité, on ne permet que la suppression des logs
    if (type === 'logs') {
      const { cleanOldData } = await import('../../../lib/db-utils');
      await cleanOldData(7); // Supprimer les données de plus de 7 jours
      
      return NextResponse.json({
        success: true,
        message: 'Données anciennes supprimées avec succès'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Type de suppression non autorisé'
    }, { status: 403 });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la suppression'
    }, { status: 500 });
  }
}
