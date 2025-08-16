import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'TradingView Integration Test',
    status: 'success',
    timestamp: new Date().toISOString(),
    features: [
      'Graphique TradingView global accessible sur toutes les pages',
      'Bouton d\'activation flottant en haut à droite',
      'Trois modes d\'affichage: flottant, barre latérale, et en bas',
      'Paramètres personnalisables (symbole, intervalle, thème)',
      'Intégration avec les composants existants',
      'Actions rapides pour ouvrir des cryptomonnaies populaires',
      'Synchronisation automatique avec le thème de l\'application'
    ]
  });
}