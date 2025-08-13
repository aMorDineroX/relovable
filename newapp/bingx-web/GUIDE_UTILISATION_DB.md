# 🗄️ Guide d'utilisation de la base de données BingX

Ce guide vous explique comment commencer à utiliser toutes les fonctionnalités de base de données de votre application de trading BingX.

## 🚀 Démarrage rapide

### 1. Importer les fonctions nécessaires

```javascript
import {
  savePosition,
  getPositions,
  saveOrder,
  getOrders,
  savePortfolioAsset,
  getPortfolio,
  saveMarketData,
  getLatestMarketData,
  logActivity
} from '../lib/db-utils.js';
```

### 2. Exécuter l'exemple complet

```bash
cd /workspaces/relovable/newapp/bingx-web
node examples/database-usage.js
```

## 📊 Fonctionnalités principales

### 🎯 1. Gestion des positions

```javascript
// Créer/Mettre à jour une position
const position = await savePosition({
  symbol: 'BTCUSDT',
  position_side: 'LONG',
  size: 0.5,
  entry_price: 45000.00,
  mark_price: 45200.00,
  unrealized_pnl: 100.00,
  leverage: 20
});

// Récupérer toutes les positions
const positions = await getPositions();

// Supprimer une position
await deletePosition('BTCUSDT', 'LONG');
```

### 📈 2. Gestion des ordres

```javascript
// Sauvegarder un ordre
const ordre = await saveOrder({
  order_id: 'ORD_123456',
  symbol: 'BTCUSDT',
  side: 'BUY',
  type: 'LIMIT',
  quantity: 0.1,
  price: 44500.00,
  status: 'PENDING'
});

// Récupérer les ordres récents
const ordres = await getOrders(50);

// Récupérer les ordres d'un symbole
const ordresBTC = await getOrdersBySymbol('BTCUSDT', 20);
```

### 💰 3. Suivi du portefeuille

```javascript
// Mettre à jour un actif du portefeuille
const actif = await savePortfolioAsset({
  asset: 'BTC',
  free: 0.02,
  locked: 0.005,
  total: 0.025,
  usd_value: 1125.00,
  percentage: 45.0
});

// Récupérer le portefeuille complet
const portefeuille = await getPortfolio();
```

### 📊 4. Données de marché

```javascript
// Sauvegarder des données de marché
const donnees = await saveMarketData({
  symbol: 'BTCUSDT',
  price: 45200.00,
  change_24h: 2.35,
  volume_24h: 25000000,
  funding_rate: 0.0001
});

// Récupérer les dernières données
const dernieresDonnees = await getLatestMarketData('BTCUSDT');
```

### 📝 5. Système de logs

```javascript
// Enregistrer une activité
await logActivity('POSITION_OPENED', 'Position LONG ouverte', {
  symbol: 'BTCUSDT',
  size: 0.5
});

// Récupérer les logs récents
const logs = await getActivityLogs(100);
```

## 🔄 Intégration dans vos composants React

### Exemple d'utilisation dans un composant

```typescript
// components/TradingDashboard.tsx
import { useEffect, useState } from 'react';
import { getPositions, getPortfolio, getLatestMarketData } from '../lib/db-utils';

export default function TradingDashboard() {
  const [positions, setPositions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // Charger les données au montage du composant
    loadDashboardData();
    
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [positionsData, portfolioData, marketDataResult] = await Promise.all([
        getPositions(),
        getPortfolio(),
        getLatestMarketData()
      ]);
      
      setPositions(positionsData);
      setPortfolio(portfolioData);
      setMarketData(marketDataResult);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  return (
    <div className="trading-dashboard">
      {/* Vos composants d'affichage */}
    </div>
  );
}
```

## 🔄 Synchronisation avec l'API BingX

### Exemple de synchronisation automatique

```javascript
// lib/data-sync.ts
import { savePosition, saveOrder, saveMarketData, logActivity } from './db-utils';

export async function syncPositionsFromAPI() {
  try {
    // Récupérer les positions depuis l'API BingX
    const response = await fetch('/api/bingx/positions');
    const positions = await response.json();
    
    // Sauvegarder chaque position en base
    for (const position of positions) {
      await savePosition({
        symbol: position.symbol,
        position_side: position.positionSide,
        size: parseFloat(position.positionAmt),
        entry_price: parseFloat(position.entryPrice),
        mark_price: parseFloat(position.markPrice),
        unrealized_pnl: parseFloat(position.unRealizedProfit),
        percentage: parseFloat(position.percentage)
      });
    }
    
    await logActivity('SYNC_POSITIONS', `${positions.length} positions synchronisées`);
    
  } catch (error) {
    console.error('Erreur sync positions:', error);
    await logActivity('SYNC_ERROR', 'Erreur synchronisation positions', { error: error.message });
  }
}
```

## ⚡ Bonnes pratiques

### 1. Gestion des erreurs
```javascript
try {
  await savePosition(positionData);
} catch (error) {
  console.error('Erreur sauvegarde position:', error);
  // Gérer l'erreur appropriée (notification utilisateur, retry, etc.)
}
```

### 2. Transactions pour plusieurs opérations
```javascript
// Pour des opérations liées, utilisez des transactions
import sql from '../lib/database';

await sql.begin(async (sql) => {
  await saveOrder(orderData);
  await savePosition(positionData);
  await logActivity('TRADE_EXECUTED', 'Trade complet exécuté');
});
```

### 3. Optimisation des requêtes
```javascript
// Récupérer uniquement les données nécessaires
const recentOrders = await getOrders(10); // Limiter à 10 résultats
const btcOrders = await getOrdersBySymbol('BTCUSDT', 5); // Filtrer par symbole
```

## 🛠️ Maintenance et nettoyage

### Nettoyage automatique des anciennes données
```javascript
import { cleanOldData } from '../lib/db-utils';

// Nettoyer les données de plus de 30 jours
await cleanOldData(30);
```

### Surveillance des performances
```javascript
// Ajouter des logs de performance
const startTime = Date.now();
await getPositions();
const duration = Date.now() - startTime;

if (duration > 1000) {
  await logActivity('SLOW_QUERY', `Requête lente détectée: ${duration}ms`);
}
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion** : Vérifiez le `DATABASE_URL` dans `.env.local`
2. **Contraintes uniques** : Les positions sont uniques par `(symbol, position_side)`
3. **Types de données** : Utilisez `parseFloat()` pour les valeurs numériques

### Tests de connectivité
```bash
# Tester la connexion
node -e "
import('./lib/database.js').then(({default: sql}) => 
  sql\`SELECT 1\`.then(() => console.log('✅ DB OK'))
)"
```

## 📚 Ressources supplémentaires

- [Documentation Neon](https://neon.tech/docs)
- [API BingX](https://bingx-api.github.io/docs)
- [Schéma de base de données](./database/schema.sql)

---

✨ **Votre base de données est maintenant prête à alimenter votre application de trading !**
