# 📖 **Référence API BingX - Documentation Complète**

## 🎯 **Vue d'Ensemble**

Cette documentation couvre tous les endpoints BingX disponibles dans cette application, avec des exemples concrets et des structures de données détaillées.

---

## 🔐 **Base de l'Authentification**

### **Configuration Standard**

```typescript
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

// Headers obligatoires pour toutes les requêtes
const headers = {
  'X-BX-APIKEY': API_KEY,
  'Content-Type': 'application/json'
};
```

### **Génération de Signature**

```typescript
import crypto from 'crypto';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
}

// Utilisation
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = createSignature(queryString, SECRET_KEY);
```

---

## 🔄 **PERPETUAL FUTURES API**

### **1. Balance du Compte**

#### **Endpoint**
```
GET /openApi/swap/v2/user/balance
```

#### **URL Local**
```
GET /api/balance
```

#### **Paramètres**
- `timestamp` (requis) : Timestamp Unix en millisecondes
- `signature` (requis) : Signature HMAC SHA256

#### **Exemple de Requête**
```typescript
const response = await fetch('/api/balance');
const data = await response.json();
```

#### **Réponse Succès**
```json
{
  "code": 0,
  "msg": "Success",
  "data": {
    "userId": "123456789",
    "asset": "USDT",
    "balance": "1000.50000000",
    "equity": "1025.75000000",
    "unrealizedProfit": "25.25000000",
    "realisedProfit": "150.00000000",
    "availableMargin": "800.25000000",
    "usedMargin": "225.50000000"
  }
}
```

#### **Structure des Données**
```typescript
interface PerpetualBalance {
  userId: string;
  asset: string;           // Devise de base (ex: "USDT")
  balance: string;         // Solde total
  equity: string;          // Équité (solde + profit non réalisé)
  unrealizedProfit: string; // Profit non réalisé
  realisedProfit: string;  // Profit réalisé
  availableMargin: string; // Marge disponible
  usedMargin: string;      // Marge utilisée
}
```

### **2. Positions Ouvertes**

#### **Endpoint**
```
GET /openApi/swap/v2/user/positions
```

#### **URL Local**
```
GET /api/positions
GET /api/positions?symbol=BTC-USDT
```

#### **Paramètres de Query**
- `symbol` (optionnel) : Filtre par symbole spécifique
- `timestamp` (requis) : Timestamp Unix
- `signature` (requis) : Signature HMAC

#### **Exemple de Requête**
```typescript
// Toutes les positions
const allPositions = await fetch('/api/positions');

// Position spécifique
const btcPosition = await fetch('/api/positions?symbol=BTC-USDT');
```

#### **Réponse Succès**
```json
{
  "code": 0,
  "msg": "Success",
  "data": [
    {
      "symbol": "BTC-USDT",
      "positionId": "123456789",
      "positionSide": "LONG",
      "positionAmt": "0.5",
      "entryPrice": "45000.00",
      "markPrice": "46000.00",
      "unrealizedProfit": "500.00",
      "percentage": "2.22",
      "leverage": "10",
      "isolated": false,
      "notionalValue": "23000.00",
      "marginType": "cross"
    }
  ]
}
```

#### **Structure des Données**
```typescript
interface PerpetualPosition {
  symbol: string;           // Symbole de trading
  positionId: string;       // ID unique de la position
  positionSide: 'LONG' | 'SHORT'; // Direction de la position
  positionAmt: string;      // Quantité de la position
  entryPrice: string;       // Prix d'entrée moyen
  markPrice: string;        // Prix de marque actuel
  unrealizedProfit: string; // Profit non réalisé
  percentage: string;       // Pourcentage de gain/perte
  leverage: string;         // Levier utilisé
  isolated: boolean;        // Mode de marge (isolé ou croisé)
  notionalValue?: string;   // Valeur notionnelle
  marginType?: 'cross' | 'isolated'; // Type de marge
}
```

---

## 📅 **STANDARD FUTURES API**

### **1. Balance du Compte Standard**

#### **Endpoint**
```
GET /openApi/futures/v1/balance
```

#### **URL Local**
```
GET /api/standard-futures/balance
```

#### **Exemple de Requête**
```typescript
const response = await fetch('/api/standard-futures/balance');
const data = await response.json();
```

#### **Réponse Succès**
```json
{
  "success": true,
  "source": "standard-futures",
  "data": {
    "asset": "USDT",
    "balance": "500.00000000",
    "equity": "485.25000000",
    "unrealizedProfit": "-14.75000000",
    "realisedProfit": "75.00000000",
    "availableMargin": "400.00000000",
    "usedMargin": "100.00000000"
  }
}
```

#### **Structure des Données**
```typescript
interface StandardFuturesBalance {
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
  availableMargin: string;
  usedMargin: string;
}

interface StandardFuturesResponse {
  success: boolean;
  source: 'standard-futures';
  data: StandardFuturesBalance;
}
```

### **2. Positions Standard Futures**

#### **Endpoint**
```
GET /openApi/futures/v1/allPositions
```

#### **URL Local**
```
GET /api/standard-futures/positions
```

#### **Exemple de Requête**
```typescript
const response = await fetch('/api/standard-futures/positions');
const data = await response.json();
```

#### **Réponse Succès**
```json
{
  "success": true,
  "source": "standard-futures",
  "data": [
    {
      "symbol": "BTCM24",
      "positionSide": "LONG",
      "positionAmt": "0.3",
      "entryPrice": "44000.00",
      "markPrice": "45500.00",
      "unrealizedProfit": "450.00",
      "percentage": "1.02",
      "leverage": "5",
      "isolated": false,
      "expiryDate": "2024-03-29T08:00:00.000Z"
    }
  ]
}
```

#### **Structure des Données**
```typescript
interface StandardFuturesPosition {
  symbol: string;           // Symbole avec expiration (ex: BTCM24)
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unrealizedProfit: string;
  percentage: string;
  leverage: string;
  isolated: boolean;
  expiryDate?: string;      // Date d'expiration du contrat
}
```

---

## 📊 **ENDPOINTS ADDITIONNELS**

### **1. Informations du Serveur**

#### **URL Local**
```
GET /api/server/time
```

#### **Description**
Récupère l'heure exacte du serveur BingX pour synchronisation.

#### **Réponse**
```json
{
  "serverTime": 1640995200000
}
```

### **2. Symboles Disponibles**

#### **URL Local**
```
GET /api/symbols
```

#### **Description**
Liste tous les symboles de trading disponibles.

#### **Réponse**
```json
{
  "symbols": [
    {
      "symbol": "BTC-USDT",
      "status": "TRADING",
      "baseAsset": "BTC",
      "quoteAsset": "USDT",
      "pricePrecision": 2,
      "quantityPrecision": 6
    }
  ]
}
```

### **3. Données de Marché**

#### **Ticker 24h**
```
GET /api/ticker?symbol=BTC-USDT
```

#### **Profondeur du Marché**
```
GET /api/depth?symbol=BTC-USDT&limit=20
```

#### **Données OHLC**
```
GET /api/klines?symbol=BTC-USDT&interval=1h&limit=100
```

---

## 🛠️ **EXEMPLES D'UTILISATION AVANCÉE**

### **1. Comparaison Perpetual vs Standard**

```typescript
async function compareAccounts() {
  try {
    const [perpetualBalance, standardBalance] = await Promise.all([
      fetch('/api/balance').then(r => r.json()),
      fetch('/api/standard-futures/balance').then(r => r.json())
    ]);

    console.log('Perpetual Balance:', perpetualBalance.data);
    console.log('Standard Balance:', standardBalance.data);

    const totalEquity = 
      parseFloat(perpetualBalance.data.equity) + 
      parseFloat(standardBalance.data.equity);

    return {
      perpetual: perpetualBalance.data,
      standard: standardBalance.data,
      totalEquity: totalEquity.toFixed(2)
    };
  } catch (error) {
    console.error('Error comparing accounts:', error);
    throw error;
  }
}
```

### **2. Monitoring des Positions**

```typescript
interface PositionSummary {
  totalPositions: number;
  totalUnrealizedPnL: number;
  longPositions: number;
  shortPositions: number;
  symbols: string[];
}

async function getPositionSummary(accountType: 'perpetual' | 'standard'): Promise<PositionSummary> {
  const endpoint = accountType === 'perpetual' 
    ? '/api/positions' 
    : '/api/standard-futures/positions';

  const response = await fetch(endpoint);
  const data = await response.json();
  
  const positions = data.data || [];
  
  return {
    totalPositions: positions.length,
    totalUnrealizedPnL: positions.reduce((sum: number, pos: any) => 
      sum + parseFloat(pos.unrealizedProfit), 0),
    longPositions: positions.filter((pos: any) => pos.positionSide === 'LONG').length,
    shortPositions: positions.filter((pos: any) => pos.positionSide === 'SHORT').length,
    symbols: [...new Set(positions.map((pos: any) => pos.symbol))]
  };
}
```

### **3. Alertes et Notifications**

```typescript
interface PriceAlert {
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

class BingXAlertSystem {
  private alerts: PriceAlert[] = [];
  
  addAlert(alert: PriceAlert) {
    this.alerts.push(alert);
  }
  
  async checkAlerts() {
    for (const alert of this.alerts.filter(a => a.isActive)) {
      try {
        const response = await fetch(`/api/ticker?symbol=${alert.symbol}`);
        const data = await response.json();
        const currentPrice = parseFloat(data.price);
        
        const shouldTrigger = alert.condition === 'above' 
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;
          
        if (shouldTrigger) {
          this.triggerAlert(alert, currentPrice);
          alert.isActive = false; // Désactiver après déclenchement
        }
      } catch (error) {
        console.error(`Error checking alert for ${alert.symbol}:`, error);
      }
    }
  }
  
  private triggerAlert(alert: PriceAlert, currentPrice: number) {
    console.log(`🚨 ALERTE PRIX: ${alert.symbol} a atteint ${currentPrice} (cible: ${alert.targetPrice})`);
    
    // Notification navigateur si supportée
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Alerte Prix BingX`, {
        body: `${alert.symbol}: ${currentPrice} USDT`,
        icon: '/favicon.ico'
      });
    }
  }
}
```

---

## ⚠️ **GESTION D'ERREURS DÉTAILLÉE**

### **Codes d'Erreur BingX Communs**

| Code | Message | Description | Solution |
|------|---------|-------------|----------|
| `-1022` | Signature verification failed | Signature invalide | Vérifier la génération de signature |
| `-2015` | Invalid API-key | Clé API invalide | Vérifier la clé API et permissions |
| `-1021` | Timestamp outside recv window | Timestamp incorrect | Synchroniser l'heure système |
| `80012` | Insufficient margin | Marge insuffisante | Ajouter des fonds au compte |

### **Gestionnaire d'Erreurs Centralisé**

```typescript
interface BingXError {
  code: number;
  message: string;
  type: 'CONFIG' | 'AUTH' | 'API' | 'NETWORK';
}

function handleBingXError(error: any): BingXError {
  // Erreur de configuration
  if (error.message?.includes('API keys not configured')) {
    return {
      code: -9999,
      message: 'Clés API non configurées. Vérifiez votre fichier .env.local',
      type: 'CONFIG'
    };
  }
  
  // Erreur d'authentification
  if (error.response?.data?.code === -1022) {
    return {
      code: -1022,
      message: 'Échec de vérification de signature. Vérifiez votre SECRET_KEY',
      type: 'AUTH'
    };
  }
  
  // Erreur API BingX
  if (error.response?.data?.code) {
    return {
      code: error.response.data.code,
      message: error.response.data.msg || 'Erreur API BingX',
      type: 'API'
    };
  }
  
  // Erreur réseau
  return {
    code: -9998,
    message: 'Erreur de connexion réseau',
    type: 'NETWORK'
  };
}
```

---

## 📈 **MÉTRIQUES ET MONITORING**

### **Tableau de Bord des Métriques**

```typescript
interface APIMetrics {
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  lastError: string | null;
  endpointStats: Record<string, {
    calls: number;
    errors: number;
    avgResponseTime: number;
  }>;
}

class BingXMetricsCollector {
  private metrics: APIMetrics = {
    totalCalls: 0,
    successRate: 0,
    averageResponseTime: 0,
    lastError: null,
    endpointStats: {}
  };
  
  recordAPICall(endpoint: string, success: boolean, responseTime: number, error?: string) {
    this.metrics.totalCalls++;
    
    if (!this.metrics.endpointStats[endpoint]) {
      this.metrics.endpointStats[endpoint] = {
        calls: 0,
        errors: 0,
        avgResponseTime: 0
      };
    }
    
    const endpointStat = this.metrics.endpointStats[endpoint];
    endpointStat.calls++;
    
    if (!success) {
      endpointStat.errors++;
      this.metrics.lastError = error || 'Unknown error';
    }
    
    // Mise à jour temps de réponse moyen
    endpointStat.avgResponseTime = 
      (endpointStat.avgResponseTime * (endpointStat.calls - 1) + responseTime) / endpointStat.calls;
    
    // Calcul taux de succès global
    const totalErrors = Object.values(this.metrics.endpointStats)
      .reduce((sum, stat) => sum + stat.errors, 0);
    this.metrics.successRate = ((this.metrics.totalCalls - totalErrors) / this.metrics.totalCalls) * 100;
  }
  
  getMetrics(): APIMetrics {
    return { ...this.metrics };
  }
  
  resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      successRate: 0,
      averageResponseTime: 0,
      lastError: null,
      endpointStats: {}
    };
  }
}
```

---

## 🔧 **OUTILS DE DÉVELOPPEMENT**

### **Script de Test des Endpoints**

```bash
#!/bin/bash
# test-all-endpoints.sh

echo "🧪 Test de tous les endpoints BingX..."

# Test Perpetual Futures
echo "📊 Test Perpetual Balance..."
curl -s http://localhost:3000/api/balance | jq .

echo "📊 Test Perpetual Positions..."
curl -s http://localhost:3000/api/positions | jq .

# Test Standard Futures
echo "📅 Test Standard Balance..."
curl -s http://localhost:3000/api/standard-futures/balance | jq .

echo "📅 Test Standard Positions..."
curl -s http://localhost:3000/api/standard-futures/positions | jq .

# Test Utilitaires
echo "⏰ Test Server Time..."
curl -s http://localhost:3000/api/server/time | jq .

echo "📋 Test Symbols..."
curl -s http://localhost:3000/api/symbols | jq .

echo "✅ Tests terminés!"
```

### **Validation des Configurations**

```typescript
// scripts/validate-config.ts
async function validateBingXConfig() {
  const requiredEnvVars = ['API_KEY', 'SECRET_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars);
    process.exit(1);
  }
  
  console.log('✅ Configuration validée');
  
  // Test de connectivité
  try {
    const response = await fetch('http://localhost:3000/api/server/time');
    const data = await response.json();
    console.log('✅ Connectivité API validée:', data);
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error);
  }
}

validateBingXConfig();
```

---

**🎯 Cette documentation vous donne tous les outils nécessaires pour maîtriser l'API BingX dans votre application !**