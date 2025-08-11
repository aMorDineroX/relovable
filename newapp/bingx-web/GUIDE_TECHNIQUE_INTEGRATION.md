# 🔧 **Guide Technique d'Intégration BingX**

## 📖 **Comprendre l'API BingX**

### **Endpoints Critiques Utilisés**

#### **1. Balance du Compte** `/openApi/swap/v2/user/balance`
```typescript
// Route: /app/api/balance/route.ts
export async function GET() {
  const queryString = `timestamp=${timestamp}`;
  const signature = sign(queryString, SECRET_KEY);
  
  const response = await fetch(`${BASE_URL}/openApi/swap/v2/user/balance?${queryString}&signature=${signature}`, {
    headers: {
      'X-BX-APIKEY': API_KEY,
      'Content-Type': 'application/json'
    }
  });
}
```

**Réponse attendue :**
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
    "realisedProfit": "150.00000000"
  }
}
```

#### **2. Positions Ouvertes** `/openApi/swap/v2/user/positions`
```typescript
// Route: /app/api/positions/route.ts
export async function GET() {
  const queryString = `timestamp=${timestamp}`;
  const signature = sign(queryString, SECRET_KEY);
  
  const response = await fetch(`${BASE_URL}/openApi/swap/v2/user/positions?${queryString}&signature=${signature}`, {
    headers: {
      'X-BX-APIKEY': API_KEY,
      'Content-Type': 'application/json'
    }
  });
}
```

**Réponse attendue :**
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
      "isolated": false
    }
  ]
}
```

---

## 🔐 **Système d'Authentification**

### **Génération de Signature HMAC SHA256**
```typescript
import CryptoJS from 'crypto-js';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

// Exemple d'utilisation
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = sign(queryString, SECRET_KEY);
```

### **Headers Obligatoires**
```typescript
const headers = {
  'X-BX-APIKEY': process.env.API_KEY,
  'Content-Type': 'application/json'
};
```

### **Construction d'URL Complète**
```typescript
const BASE_URL = 'https://open-api.bingx.com';
const endpoint = '/openApi/swap/v2/user/balance';
const fullUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
```

---

## 📊 **Intégration dans les Composants React**

### **PortfolioTracker.tsx - Données Réelles**
```typescript
const fetchRealPortfolioData = useCallback(async () => {
  try {
    // 1. Récupérer le solde
    const balanceResponse = await fetch('/api/balance');
    const balanceData = await balanceResponse.json();
    
    // 2. Récupérer les positions
    const positionsResponse = await fetch('/api/positions');
    const positionsData = await positionsResponse.json();
    
    // 3. Mapper les données
    if (balanceData.success && positionsData.success) {
      const balance = balanceData.data;
      const positions = positionsData.data;
      
      // Construction des métriques portfolio
      const totalValue = parseFloat(balance.equity || '0');
      const unrealizedPnL = parseFloat(balance.unrealizedProfit || '0');
      const realizedPnL = parseFloat(balance.realisedProfit || '0');
      
      setPortfolioData({
        totalValue,
        totalPnL: unrealizedPnL + realizedPnL,
        unrealizedPnL,
        realizedPnL,
        positions: positions.map(mapPositionData)
      });
    }
  } catch (error) {
    console.error('Erreur récupération données portfolio:', error);
    // Fallback vers données mock
    setPortfolioData(generateMockPortfolioData());
  }
}, []);
```

### **Mapping des Données Positions**
```typescript
const mapPositionData = (position: any) => ({
  symbol: position.symbol?.replace('-USDT', '') || 'BTC',
  value: parseFloat(position.positionAmt || '0') * parseFloat(position.markPrice || '0'),
  pnl: parseFloat(position.unrealizedProfit || '0'),
  percentage: parseFloat(position.percentage || '0'),
  quantity: parseFloat(position.positionAmt || '0'),
  entryPrice: parseFloat(position.entryPrice || '0'),
  currentPrice: parseFloat(position.markPrice || '0'),
  leverage: parseInt(position.leverage || '1'),
  side: position.positionSide || 'LONG'
});
```

---

## 🎯 **Gestion d'État et Performance**

### **Optimisation des Re-renders**
```typescript
// Utilisation de useCallback pour éviter les re-renders inutiles
const fetchRealPortfolioData = useCallback(async () => {
  // Logique de fetch
}, []); // Dépendances vides = fonction stable

// useEffect avec intervalle optimisé
useEffect(() => {
  fetchRealPortfolioData();
  
  const interval = setInterval(() => {
    fetchRealPortfolioData();
  }, 60000); // 60 secondes pour éviter spam API
  
  return () => clearInterval(interval);
}, [fetchRealPortfolioData]);
```

### **Pattern de Fallback Intelligent**
```typescript
const [dataSource, setDataSource] = useState<'real' | 'mock'>('real');

// Tentative données réelles avec fallback automatique
const fetchWithFallback = async () => {
  try {
    const data = await fetchRealData();
    setDataSource('real');
    return data;
  } catch (error) {
    console.warn('API indisponible, utilisation données mock');
    setDataSource('mock');
    return generateMockData();
  }
};
```

---

## 🌐 **Intégration CoinGecko pour Prix Temps Réel**

### **Mapping Symboles**
```typescript
const COINGECKO_MAPPING: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum', 
  'SOL': 'solana',
  'ADA': 'cardano',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2'
};
```

### **Fetch Prix avec Fallback**
```typescript
const fetchCurrentPrices = async (symbols: string[]) => {
  try {
    const coinGeckoIds = symbols.map(s => COINGECKO_MAPPING[s]).filter(Boolean);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd`
    );
    
    if (!response.ok) throw new Error('CoinGecko API error');
    
    const data = await response.json();
    return mapCoinGeckoPrices(data, symbols);
  } catch (error) {
    // Fallback vers prix par défaut
    return DEFAULT_PRICES;
  }
};
```

---

## 🔄 **Gestion des Erreurs et Retry Logic**

### **Retry Automatique avec Backoff**
```typescript
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Backoff exponentiel: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

### **États d'Erreur Explicites**
```typescript
interface APIState {
  loading: boolean;
  error: string | null;
  data: any;
  lastUpdate: Date | null;
}

const [apiState, setApiState] = useState<APIState>({
  loading: false,
  error: null,
  data: null,
  lastUpdate: null
});
```

---

## 📱 **Interface Utilisateur Réactive**

### **Indicateurs de Statut**
```typescript
const StatusIndicator = ({ dataSource }: { dataSource: 'real' | 'mock' }) => (
  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
    dataSource === 'real' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }`}>
    <div className={`w-2 h-2 rounded-full ${
      dataSource === 'real' ? 'bg-green-500' : 'bg-yellow-500'
    }`} />
    {dataSource === 'real' ? 'Données réelles' : 'Mode simulation'}
  </div>
);
```

### **Animations de Changement de Prix**
```typescript
const [priceChangeAnimation, setPriceChangeAnimation] = useState<'up' | 'down' | null>(null);

useEffect(() => {
  if (previousPrice && currentPrice) {
    if (currentPrice > previousPrice) {
      setPriceChangeAnimation('up');
    } else if (currentPrice < previousPrice) {
      setPriceChangeAnimation('down');
    }
    
    // Reset animation après 1 seconde
    const timer = setTimeout(() => setPriceChangeAnimation(null), 1000);
    return () => clearTimeout(timer);
  }
}, [currentPrice, previousPrice]);
```

---

## ⚠️ **Problèmes Courants et Solutions**

### **1. Erreur "Invalid signature"**
```typescript
// ❌ Problème: Mauvaise construction du queryString
const queryString = `symbol=BTC-USDT&timestamp=${timestamp}`;

// ✅ Solution: Ordre alphabétique des paramètres
const params = { symbol: 'BTC-USDT', timestamp };
const queryString = Object.keys(params)
  .sort()
  .map(key => `${key}=${params[key]}`)
  .join('&');
```

### **2. Erreur "React does not recognize prop"**
```typescript
// ❌ Problème: Props HTML obsolètes
<iframe allowTransparency={true} frameBorder="0" scrolling="no" />

// ✅ Solution: Props React valides
<iframe 
  style={{ backgroundColor: 'transparent' }}
  className="border-0 overflow-hidden"
/>
```

### **3. Boucles de Re-render**
```typescript
// ❌ Problème: useEffect sans dépendances appropriées
useEffect(() => {
  fetchData();
}, []); // Fonction fetchData qui change à chaque render

// ✅ Solution: useCallback pour stabiliser la fonction
const fetchData = useCallback(() => {
  // logique fetch
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

---

## 📈 **Monitoring et Logs**

### **Logs Structurés**
```typescript
const logger = {
  api: (endpoint: string, success: boolean, duration: number) => {
    console.log(`[API] ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'} - ${duration}ms`);
  },
  error: (component: string, error: Error) => {
    console.error(`[ERROR] ${component}:`, error.message);
  },
  performance: (action: string, time: number) => {
    console.log(`[PERF] ${action}: ${time}ms`);
  }
};
```

### **Métriques de Performance**
```typescript
const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      logger.performance(name, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      logger.performance(`${name}_ERROR`, end - start);
      throw error;
    }
  };
};
```

---

## 🔧 **Configuration Avancée**

### **Variables d'Environnement**
```bash
# .env.local
API_KEY=your_bingx_api_key
SECRET_KEY=your_bingx_secret_key
NEXT_PUBLIC_COINGECKO_API=https://api.coingecko.com/api/v3
REFRESH_INTERVAL_PORTFOLIO=60000
REFRESH_INTERVAL_PRICES=30000
```

### **Configuration TypeScript**
```typescript
// types/api.ts
export interface BingXBalance {
  userId: string;
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
}

export interface BingXPosition {
  symbol: string;
  positionId: string;
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unrealizedProfit: string;
  percentage: string;
  leverage: string;
  isolated: boolean;
}
```

---

*Ce guide technique couvre tous les aspects de l'intégration BingX dans l'application. Pour des questions spécifiques, référez-vous aux logs de la console ou aux exemples de code dans les composants.*
