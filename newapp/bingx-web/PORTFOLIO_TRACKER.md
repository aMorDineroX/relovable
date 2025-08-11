# Gestionnaire de Portefeuille - Documentation

## Vue d'ensemble

Le composant `PortfolioTracker` ajoute un onglet complet pour suivre l'évolution du portefeuille de trading avec des statistiques avancées, des graphiques temps réel et une analyse détaillée des performances.

## Fonctionnalités Principales

### 📊 Statistiques du Portefeuille
- **Valeur Totale** : Valeur actuelle de tous les actifs du portefeuille
- **P&L Total** : Profit/Perte total avec pourcentage
- **Variation 24h** : Changement de valeur dans les dernières 24 heures
- **Investissement Initial** : Montant total investi

### 📈 Graphique d'Évolution
- **Historique du portefeuille** : Graphique en temps réel de l'évolution de la valeur
- **Mini-graphiques par actif** : Tendances individuelles pour chaque crypto
- **Sélection de période** : 1H, 1D, 1W, 1M

### 🎯 Composition du Portefeuille
- **Allocation par actif** : Pourcentage et valeur de chaque position
- **P&L par position** : Performance individuelle de chaque crypto
- **Barres de progression** : Visualisation de l'allocation
- **Données en temps réel** : Mise à jour toutes les 5 secondes

## Structure des Données

### Asset (Actif)
```typescript
interface Asset {
  symbol: string;        // Symbole (BTC, ETH, etc.)
  name: string;          // Nom complet
  quantity: number;      // Quantité détenue
  averagePrice: number;  // Prix d'achat moyen
  currentPrice: number;  // Prix actuel
  value: number;         // Valeur totale
  pnl: number;          // Profit/Perte en valeur
  pnlPercent: number;    // Profit/Perte en pourcentage
  allocation: number;    // Allocation du portefeuille (%)
  chartData: number[];   // Données pour mini-graphique
}
```

### PortfolioStats (Statistiques)
```typescript
interface PortfolioStats {
  totalValue: number;         // Valeur totale
  totalInvested: number;      // Montant investi
  totalPnL: number;          // P&L total
  totalPnLPercent: number;    // P&L en pourcentage
  dayChange: number;          // Changement 24h
  dayChangePercent: number;   // Changement 24h en %
  portfolioHistory: number[]; // Historique des valeurs
}
```

## Portefeuille Simulé

Le composant utilise un portefeuille simulé avec 5 cryptomonnaies populaires :

1. **Bitcoin (BTC)** : 0.25 BTC @ $42,000 moyenne
2. **Ethereum (ETH)** : 2.5 ETH @ $2,500 moyenne
3. **Solana (SOL)** : 15 SOL @ $95 moyenne
4. **Cardano (ADA)** : 1,000 ADA @ $0.42 moyenne
5. **BNB** : 5 BNB @ $300 moyenne

## Fonctionnalités Avancées

### 🎨 Interface Utilisateur
- **Design responsive** : Optimisé pour tous les écrans
- **Animations fluides** : Transitions et effets visuels
- **Code couleur** : Vert pour gains, rouge pour pertes
- **Cartes interactives** : Hover effects et animations

### 📊 Visualisations
- **Mini-graphiques SVG** : Tendances de prix pour chaque actif
- **Graphique principal** : Évolution du portefeuille dans le temps
- **Barres de progression** : Allocation visuelle des actifs
- **Indicateurs colorés** : Status visuels des performances

### ⚡ Temps Réel
- **Mise à jour automatique** : Toutes les 5 secondes
- **Prix simulés** : Variations réalistes (±1%)
- **Historique dynamique** : Garde 50 points de données
- **État de chargement** : Animations pendant le chargement

## Calculs et Métriques

### Allocation des Actifs
```typescript
asset.allocation = (asset.value / totalValue) * 100
```

### Profit/Perte
```typescript
const pnl = currentValue - investedValue
const pnlPercent = (pnl / investedValue) * 100
```

### Variation Journalière
```typescript
const dayChange = totalValue * (Math.random() - 0.5) * 0.05 // ±2.5%
```

## Intégration

### Ajout à la Page Principale
```typescript
// Import du composant
import PortfolioTracker from '../components/PortfolioTracker';

// Ajout de l'onglet
type Tab = 'positions' | 'orders' | 'market' | 'trading' | 'portfolio';

// Rendu conditionnel
{activeTab === 'portfolio' && (
  <PortfolioTracker />
)}
```

### CSS et Styling
Le composant utilise :
- **Tailwind CSS** : Classes utilitaires pour le styling
- **Backdrop blur** : Effets de flou moderne
- **Grid responsive** : Mise en page adaptative
- **Animations CSS** : Transitions fluides

## Personnalisation

### Modification du Portefeuille
Pour changer les actifs du portefeuille, modifiez `mockPortfolio` :
```typescript
const mockPortfolio = [
  { symbol: 'BTC', name: 'Bitcoin', quantity: 0.25, averagePrice: 42000 },
  // Ajoutez vos actifs ici
];
```

### Ajustement des Prix
Pour modifier les prix actuels, changez `currentPrices` :
```typescript
const currentPrices: { [key: string]: number } = {
  'BTC': 43500,
  // Vos prix ici
};
```

## Performance et Optimisation

- **Mises à jour optimisées** : Évite les re-renders inutiles
- **Données en cache** : Historique maintenu en mémoire
- **Calculs efficaces** : Algorithmes optimisés
- **Gestion mémoire** : Limitation des points de données

## Technologies Utilisées

- **React 18** : Hooks et functional components
- **TypeScript** : Typage strict
- **Heroicons** : Icônes modernes
- **Tailwind CSS** : Styling utilitaire
- **MiniChart** : Graphiques SVG personnalisés

## Améliorations Futures

1. **Connexion API réelle** : Intégration avec des données live
2. **Historique persistant** : Sauvegarde en base de données
3. **Alertes personnalisées** : Notifications de seuils
4. **Export de données** : CSV, PDF, Excel
5. **Analyse technique** : Indicateurs avancés
6. **Comparaison de benchmarks** : Performance vs market

Cette implémentation fournit une base solide pour un gestionnaire de portefeuille professionnel avec toutes les fonctionnalités essentielles pour suivre et analyser les performances de trading.
