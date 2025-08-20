import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test simple sans BingX
    return NextResponse.json({
      success: true,
      message: "API de test fonctionnelle",
      data: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur de test',
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
}