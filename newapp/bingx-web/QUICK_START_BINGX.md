# 🚀 **Quick Start - Intégration BingX en 5 Minutes**

## ⚡ **Démarrage Ultra-Rapide**

### **Étape 1: Configuration (30 secondes)**

Créez le fichier `.env.local` :
```bash
API_KEY=votre_cle_api_bingx
SECRET_KEY=votre_cle_secrete_bingx
```

### **Étape 2: Installation (1 minute)**

```bash
cd newapp/bingx-web
npm install
npm run dev
```

### **Étape 3: Test Immédiat (30 secondes)**

Ouvrez votre navigateur : `http://localhost:3000`

**URLs de test direct :**
- `http://localhost:3000/api/balance` - Balance Perpetual
- `http://localhost:3000/api/positions` - Positions Perpetual
- `http://localhost:3000/api/standard-futures/balance` - Balance Standard
- `http://localhost:3000/api/standard-futures/positions` - Positions Standard

---

## 🎯 **Usage Immédiat**

### **React Hook Simple**

```tsx
import { useState, useEffect } from 'react';

function TradingDashboard() {
  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Charger la balance
    fetch('/api/balance')
      .then(res => res.json())
      .then(data => setBalance(data.data));

    // Charger les positions
    fetch('/api/positions')
      .then(res => res.json())
      .then(data => setPositions(data.data || []));
  }, []);

  return (
    <div>
      <h1>Mon Portfolio BingX</h1>
      
      {balance && (
        <div>
          <h2>Balance: {balance.balance} {balance.asset}</h2>
          <p>Profit: {balance.unrealizedProfit} USDT</p>
        </div>
      )}
      
      <h2>Positions ({positions.length})</h2>
      {positions.map(pos => (
        <div key={pos.positionId}>
          {pos.symbol}: {pos.positionAmt} ({pos.positionSide})
          - PnL: {pos.unrealizedProfit} USDT
        </div>
      ))}
    </div>
  );
}
```

### **API Call Basique**

```typescript
// Récupérer la balance
async function getBalance() {
  const response = await fetch('/api/balance');
  const data = await response.json();
  
  if (data.code === 0) {
    return data.data; // Balance data
  } else {
    throw new Error(data.msg || 'Erreur API');
  }
}

// Récupérer les positions
async function getPositions(symbol?: string) {
  const url = symbol 
    ? `/api/positions?symbol=${symbol}`
    : '/api/positions';
    
  const response = await fetch(url);
  const data = await response.json();
  
  return data.data || [];
}
```

---

## 🛠️ **Dépannage Express**

### **❌ Problème: "API keys not configured"**
**Solution :**
```bash
# Vérifiez votre fichier .env.local
cat .env.local

# Il doit contenir :
API_KEY=votre_vraie_cle
SECRET_KEY=votre_vraie_cle_secrete
```

### **❌ Problème: "Signature verification failed"**
**Solution :**
1. Vérifiez que votre `SECRET_KEY` est correcte
2. Redémarrez le serveur : `npm run dev`
3. Vérifiez l'heure système

### **❌ Problème: "Invalid API-key"**
**Solution :**
1. Vérifiez vos permissions API sur BingX
2. Assurez-vous que les clés sont actives
3. Vérifiez l'IP autorisée (si configurée)

### **❌ Problème: Données vides**
**Solution :**
```javascript
// C'est normal si votre compte est vide !
// Financez votre compte BingX Perpetual Futures
console.log('Compte vide - ajoutez des fonds sur BingX');
```

---

## 🔄 **Switch Perpetual ↔ Standard**

### **Composant Sélecteur Rapide**

```tsx
function AccountSelector() {
  const [accountType, setAccountType] = useState('perpetual');
  const [data, setData] = useState(null);

  const loadData = async (type) => {
    const endpoint = type === 'perpetual' 
      ? '/api/balance' 
      : '/api/standard-futures/balance';
      
    const response = await fetch(endpoint);
    const result = await response.json();
    setData(result.data);
  };

  useEffect(() => {
    loadData(accountType);
  }, [accountType]);

  return (
    <div>
      <select 
        value={accountType} 
        onChange={(e) => setAccountType(e.target.value)}
      >
        <option value="perpetual">Perpetual Futures</option>
        <option value="standard">Standard Futures</option>
      </select>
      
      {data && (
        <div>
          <h3>Balance {accountType}</h3>
          <p>{data.balance} {data.asset}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 **Monitoring Simple**

### **Console Logger**

```typescript
// Ajoutez ça pour debug
function logAPICall(endpoint: string, data: any) {
  console.group(`🔗 API Call: ${endpoint}`);
  console.log('Response:', data);
  console.log('Timestamp:', new Date().toLocaleTimeString());
  console.groupEnd();
}

// Usage
fetch('/api/balance')
  .then(res => res.json())
  .then(data => logAPICall('/api/balance', data));
```

### **Status Checker**

```typescript
async function checkAPIStatus() {
  const endpoints = [
    '/api/balance',
    '/api/positions',
    '/api/standard-futures/balance',
    '/api/standard-futures/positions'
  ];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(endpoint);
      const data = await response.json();
      const time = Date.now() - start;
      
      console.log(`✅ ${endpoint}: ${time}ms`, data.code === 0 ? 'OK' : 'ERROR');
    } catch (error) {
      console.log(`❌ ${endpoint}: FAILED`, error.message);
    }
  }
}

// Exécutez toutes les 30 secondes
setInterval(checkAPIStatus, 30000);
```

---

## 🎨 **UI Components Prêts**

### **Balance Card**

```tsx
function BalanceCard({ accountType = 'perpetual' }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = accountType === 'perpetual' 
      ? '/api/balance' 
      : '/api/standard-futures/balance';
      
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setBalance(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accountType]);

  if (loading) return <div>Chargement...</div>;
  if (!balance) return <div>Aucune donnée</div>;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-bold">
        Balance {accountType === 'perpetual' ? 'Perpetual' : 'Standard'}
      </h3>
      <div className="text-2xl text-green-400">
        {balance.balance} {balance.asset}
      </div>
      <div className="text-sm text-gray-400">
        PnL: {balance.unrealizedProfit} USDT
      </div>
    </div>
  );
}
```

### **Position List**

```tsx
function PositionList({ accountType = 'perpetual' }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const endpoint = accountType === 'perpetual' 
      ? '/api/positions' 
      : '/api/standard-futures/positions';
      
    fetch(endpoint)
      .then(res => res.json())
      .then(data => setPositions(data.data || []));
  }, [accountType]);

  return (
    <div className="space-y-2">
      <h3 className="text-white font-bold">
        Positions {accountType} ({positions.length})
      </h3>
      
      {positions.map(pos => (
        <div key={pos.positionId || pos.symbol} 
             className="bg-gray-700 p-3 rounded">
          <div className="flex justify-between">
            <span className="text-white">{pos.symbol}</span>
            <span className={`${
              parseFloat(pos.unrealizedProfit) >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {pos.unrealizedProfit} USDT
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {pos.positionSide} • {pos.positionAmt} • x{pos.leverage}
          </div>
        </div>
      ))}
      
      {positions.length === 0 && (
        <div className="text-gray-400 text-center p-4">
          Aucune position ouverte
        </div>
      )}
    </div>
  );
}
```

---

## ⚡ **Shortcuts de Développement**

### **Scripts Package.json**

Ajoutez à votre `package.json` :
```json
{
  "scripts": {
    "bingx:test": "node -e \"fetch('http://localhost:3000/api/balance').then(r=>r.json()).then(console.log)\"",
    "bingx:status": "curl -s http://localhost:3000/api/balance | jq .",
    "bingx:perpetual": "curl -s http://localhost:3000/api/positions | jq .",
    "bingx:standard": "curl -s http://localhost:3000/api/standard-futures/balance | jq ."
  }
}
```

### **Commandes Terminal Utiles**

```bash
# Test rapide balance
curl http://localhost:3000/api/balance | jq .data.balance

# Test positions avec symbole
curl "http://localhost:3000/api/positions?symbol=BTC-USDT" | jq .

# Surveiller les logs
npm run dev | grep "BingX"

# Test de tous les endpoints
npm run bingx:test
```

---

## 🎯 **Next Steps**

1. **Testez immédiatement** avec vos vraies clés API
2. **Customisez les composants** selon vos besoins
3. **Ajoutez des alertes** pour vos seuils de profit/perte
4. **Intégrez TradingView** pour les graphiques
5. **Implémentez le trading** (placement d'ordres)

---

**🚀 Vous êtes opérationnel en moins de 5 minutes !**

**Prochaine étape :** Ouvrez `http://localhost:3000` et voyez vos vraies données BingX s'afficher ! 🎉