# 🚀 **Guide Complet d'Intégration API BingX**

## 📋 **Table des Matières**

1. [Configuration Initiale](#configuration-initiale)
2. [Authentification et Sécurité](#authentification-et-sécurité)
3. [Perpetual Futures](#perpetual-futures)
4. [Standard Futures](#standard-futures)
5. [Exemples d'Implémentation](#exemples-dimplémentation)
6. [Gestion des Erreurs](#gestion-des-erreurs)
7. [Debugging et Dépannage](#debugging-et-dépannage)

---

## 🔧 **Configuration Initiale**

### **1. Prérequis**

Avant de commencer, assurez-vous d'avoir :
- Un compte BingX vérifié
- Des clés API créées avec les permissions appropriées
- Node.js et npm installés
- Les dépendances requises

### **2. Installation des Dépendances**

```bash
npm install axios crypto-js dotenv
```

### **3. Configuration des Variables d'Environnement**

Créez un fichier `.env.local` à la racine de votre projet :

```env
# Clés API BingX
API_KEY=votre_cle_api_bingx
SECRET_KEY=votre_cle_secrete_bingx

# Configuration API
BASE_URL=https://open-api.bingx.com
```

### **4. Permissions API Requises**

Dans votre compte BingX, configurez vos clés API avec les permissions suivantes :

#### **Permissions Minimales :**
- ✅ **Read** : Lecture des soldes et positions
- ✅ **Futures Trading** : Accès aux données futures

#### **Permissions Optionnelles (pour trading) :**
- 🔄 **Trade** : Placement d'ordres
- 🔄 **Withdraw** : Retraits (non recommandé pour une app)

---

## 🔐 **Authentification et Sécurité**

### **Principe de l'Authentification BingX**

BingX utilise une signature HMAC SHA256 pour authentifier toutes les requêtes API.

### **Implémentation de la Signature**

```typescript
import crypto from 'crypto';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
}

// Alternative avec crypto-js
import CryptoJS from 'crypto-js';

function sign(queryString: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(queryString, secretKey)
    .toString(CryptoJS.enc.Hex);
}
```

### **Headers Standards**

```typescript
const headers = {
  'X-BX-APIKEY': process.env.API_KEY,
  'Content-Type': 'application/json'
};
```

### **Structure d'une Requête Authentifiée**

```typescript
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = createSignature(queryString, SECRET_KEY);

const url = `${BASE_URL}/endpoint?${queryString}&signature=${signature}`;

const response = await fetch(url, {
  method: 'GET',
  headers: headers
});
```

---

## 🔄 **Perpetual Futures**

### **Vue d'Ensemble**

Les Perpetual Futures sont des contrats sans date d'expiration qui suivent le prix spot avec un mécanisme de financement.

**Caractéristiques :**
- Pas de date d'expiration
- Financement toutes les 8 heures
- API stable et bien documentée
- Endpoints : `/openApi/swap/v2/...`

### **1. Balance du Compte Perpetual**

#### **Endpoint :**
```
GET /openApi/swap/v2/user/balance
```

#### **Implémentation :**
```typescript
// app/api/balance/route.ts
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
  const queryString = `timestamp=${Date.now()}`;
  const signature = sign(queryString, SECRET_KEY);
  const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.get(finalUrl, { 
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("BingX API Error (Balance):", error);
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}
```

#### **Réponse Attendue :**
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

### **2. Positions Perpetual**

#### **Endpoint :**
```
GET /openApi/swap/v2/user/positions
```

#### **Implémentation :**
```typescript
// app/api/positions/route.ts
export async function GET(request: Request) {
  if (!API_KEY || !SECRET_KEY) {
    return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  const endpoint = '/openApi/swap/v2/user/positions';
  const params: { [key: string]: string } = {};
  
  if (symbol) {
    params.symbol = symbol;
  }

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
  } catch (error) {
    console.error("BingX API Error (Positions):", error);
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}
```

#### **Réponse Attendue :**
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

## 📅 **Standard Futures**

### **Vue d'Ensemble**

Les Standard Futures sont des contrats avec dates d'expiration spécifiques.

**Caractéristiques :**
- Date d'expiration définie
- Pas de frais de financement
- API disponible mais moins utilisée
- Endpoints : `/openApi/futures/v1/...`

### **1. Balance du Compte Standard**

#### **Endpoint :**
```
GET /openApi/futures/v1/balance
```

#### **Implémentation :**
```typescript
// app/api/standard-futures/balance/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = 'https://open-api.bingx.com';

function createSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function GET() {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, SECRET_KEY);

    const url = `${BASE_URL}/openApi/futures/v1/balance?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.msg || 'Unknown error'}`);
    }

    if (data.code !== 0) {
      throw new Error(`BingX API error! code: ${data.code}, message: ${data.msg || 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      source: 'standard-futures'
    });

  } catch (error) {
    console.error('Error fetching Standard Futures balance:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'standard-futures'
    }, { status: 500 });
  }
}
```

### **2. Positions Standard Futures**

#### **Endpoint :**
```
GET /openApi/futures/v1/allPositions
```

#### **Implémentation :**
```typescript
// app/api/standard-futures/positions/route.ts
export async function GET() {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('API keys not configured');
    }

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString, SECRET_KEY);

    const url = `${BASE_URL}/openApi/futures/v1/allPositions?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.msg || 'Unknown error'}`);
    }

    if (data.code !== 0) {
      throw new Error(`BingX API error! code: ${data.code}, message: ${data.msg || 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      source: 'standard-futures'
    });

  } catch (error) {
    console.error('Error fetching Standard Futures positions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'standard-futures'
    }, { status: 500 });
  }
}
```

---

## 💻 **Exemples d'Implémentation**

### **1. Composant React avec Sélecteur de Type de Compte**

```tsx
// components/AccountTypeSelector.tsx
import { useState } from 'react';

type AccountType = 'perpetual' | 'standard';

interface AccountTypeSelectorProps {
  accountType: AccountType;
  onAccountTypeChange: (type: AccountType) => void;
}

export default function AccountTypeSelector({ 
  accountType, 
  onAccountTypeChange 
}: AccountTypeSelectorProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Type de Compte Futures</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            accountType === 'perpetual' ? 'bg-blue-400' : 'bg-orange-400'
          }`}></div>
          <span className="text-sm text-gray-300">
            {accountType === 'perpetual' ? 'Perpetual' : 'Standard'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAccountTypeChange('perpetual')}
          className={`p-3 rounded-lg border transition-all ${
            accountType === 'perpetual'
              ? 'bg-blue-500/20 border-blue-400 text-blue-100'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <div className="text-left">
            <div className="font-medium text-sm">Perpetual Futures</div>
            <div className="text-xs opacity-70 mt-1">
              Contrats sans expiration
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onAccountTypeChange('standard')}
          className={`p-3 rounded-lg border transition-all ${
            accountType === 'standard'
              ? 'bg-orange-500/20 border-orange-400 text-orange-100'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <div className="text-left">
            <div className="font-medium text-sm">Standard Futures</div>
            <div className="text-xs opacity-70 mt-1">
              Contrats avec expiration
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-black/20 rounded-lg">
        <div className="text-xs text-gray-300">
          <div className="font-medium mb-1">Endpoints utilisés :</div>
          <div className="font-mono text-xs">
            {accountType === 'perpetual' 
              ? '/openApi/swap/v2/...' 
              : '/openApi/futures/v1/...'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **2. Hook React pour Données BingX**

```tsx
// hooks/useBingXData.ts
import { useState, useEffect } from 'react';

type AccountType = 'perpetual' | 'standard';

interface BalanceData {
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
}

interface PositionData {
  symbol: string;
  positionSide: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unrealizedProfit: string;
  percentage: string;
  leverage: string;
}

export function useBingXData(accountType: AccountType) {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = accountType === 'perpetual' 
        ? '/api/balance' 
        : '/api/standard-futures/balance';
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch balance');
      }
      
      setBalance(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = accountType === 'perpetual' 
        ? '/api/positions' 
        : '/api/standard-futures/positions';
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch positions');
      }
      
      setPositions(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchPositions();
  }, [accountType]);

  return {
    balance,
    positions,
    loading,
    error,
    refetch: () => {
      fetchBalance();
      fetchPositions();
    }
  };
}
```

---

## ⚠️ **Gestion des Erreurs**

### **Types d'Erreurs Communes**

#### **1. Erreurs de Configuration**
```typescript
// Vérification des clés API
if (!API_KEY || !SECRET_KEY) {
  return NextResponse.json({ 
    error: 'API keys not configured',
    code: 'CONFIG_ERROR'
  }, { status: 500 });
}
```

#### **2. Erreurs d'Authentification**
```typescript
// Erreur de signature invalide
{
  "code": -1022,
  "msg": "Signature verification failed"
}

// Solution : Vérifier la génération de signature
const queryString = `timestamp=${timestamp}`;
const signature = createSignature(queryString, SECRET_KEY);
```

#### **3. Erreurs de Permissions**
```typescript
// Permissions insuffisantes
{
  "code": -2015,
  "msg": "Invalid API-key, IP, or permissions for action"
}

// Solution : Vérifier les permissions API dans BingX
```

#### **4. Erreurs de Compte Vide**
```typescript
// Compte sans solde
{
  "code": 0,
  "msg": "Success",
  "data": []
}

// Gestion côté client
if (!data.data || data.data.length === 0) {
  return {
    message: "Aucune donnée disponible. Veuillez financer votre compte.",
    isEmpty: true
  };
}
```

---

## 🔍 **Debugging et Dépannage**

### **1. Logs et Debug**

```typescript
// Ajout de logs détaillés
console.log('BingX API Request:', {
  endpoint: url,
  timestamp: timestamp,
  signature: signature.substring(0, 10) + '...',
  headers: headers
});

console.log('BingX API Response:', {
  status: response.status,
  ok: response.ok,
  data: data
});
```

### **2. Test Manuel des Endpoints**

```bash
# Test Perpetual Balance
curl -X GET "https://open-api.bingx.com/openApi/swap/v2/user/balance?timestamp=1640995200000&signature=your_signature" \
  -H "X-BX-APIKEY: your_api_key"

# Test Standard Futures Balance
curl -X GET "https://open-api.bingx.com/openApi/futures/v1/balance?timestamp=1640995200000&signature=your_signature" \
  -H "X-BX-APIKEY: your_api_key"
```

### **3. Validation de Signature**

```typescript
// Utilitaire de test de signature
function testSignature() {
  const testParams = "timestamp=1640995200000";
  const expectedSignature = "expected_signature_here";
  const actualSignature = createSignature(testParams, SECRET_KEY);
  
  console.log('Expected:', expectedSignature);
  console.log('Actual:', actualSignature);
  console.log('Match:', expectedSignature === actualSignature);
}
```

### **4. Monitoring des API Calls**

```typescript
// Middleware pour tracking des calls API
let apiCallCount = 0;
const apiCallLog: string[] = [];

function logApiCall(endpoint: string, status: number) {
  apiCallCount++;
  const logEntry = `${new Date().toISOString()} - ${endpoint} - ${status}`;
  apiCallLog.push(logEntry);
  
  // Garder seulement les 100 derniers logs
  if (apiCallLog.length > 100) {
    apiCallLog.shift();
  }
  
  console.log(`API Call #${apiCallCount}: ${logEntry}`);
}
```

---

## 📊 **Bonnes Pratiques**

### **1. Gestion des Rate Limits**

```typescript
// Implement rate limiting
const RATE_LIMIT_DELAY = 1000; // 1 seconde entre les calls

async function rateLimitedApiCall(apiCall: () => Promise<any>) {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  return await apiCall();
}
```

### **2. Cache des Réponses**

```typescript
// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 30000; // 30 secondes

async function cachedApiCall(key: string, apiCall: () => Promise<any>) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await apiCall();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}
```

### **3. Retry Logic**

```typescript
async function retryApiCall(apiCall: () => Promise<any>, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 🎯 **Points Importants à Retenir**

### **Différences Clés**

| Aspect | Perpetual Futures | Standard Futures |
|--------|------------------|------------------|
| **Endpoints** | `/openApi/swap/v2/...` | `/openApi/futures/v1/...` |
| **Expiration** | Aucune | Date fixe |
| **Financement** | Toutes les 8h | Aucun |
| **Stabilité API** | ✅ Très stable | ⚠️ Moins utilisée |
| **Liquidité** | ✅ Élevée | 🔄 Variable |

### **Recommandations**

1. **Privilégiez Perpetual Futures** pour la plupart des cas d'usage
2. **Vérifiez les permissions** de vos clés API régulièrement
3. **Implémentez un système de fallback** en cas d'erreur API
4. **Monitorez les appels API** pour éviter les rate limits
5. **Testez en sandbox** avant le déploiement en production

---

**🚀 Vous êtes maintenant prêt à intégrer l'API BingX dans votre application !**

Pour toute question ou problème, consultez les logs de votre console et vérifiez vos configurations API.