# 🔧 **Guide de Dépannage BingX - Solutions Complètes**

## 🚨 **Problèmes Courants et Solutions**

### **❌ Erreur: "API keys not configured"**

#### **Symptômes :**
- Réponse : `{ "error": "API keys not configured" }`
- Status code : 500

#### **Causes :**
1. Fichier `.env.local` absent ou mal placé
2. Variables d'environnement non définies
3. Nom des variables incorrect

#### **Solutions :**

**1. Vérifier le fichier .env.local**
```bash
# Le fichier doit être dans le dossier racine de l'app
ls -la newapp/bingx-web/.env.local

# Vérifier le contenu
cat newapp/bingx-web/.env.local
```

**2. Format correct du .env.local**
```env
API_KEY=votre_cle_api_bingx_ici
SECRET_KEY=votre_cle_secrete_bingx_ici
```

**3. Redémarrer le serveur**
```bash
# Arrêter le serveur (Ctrl+C) puis
npm run dev
```

**4. Vérifier en JavaScript**
```javascript
// Dans la console navigateur
fetch('/api/test-config')
  .then(r => r.json())
  .then(console.log);
```

---

### **❌ Erreur: "Signature verification failed"**

#### **Symptômes :**
- Code BingX : `-1022`
- Message : `"Signature verification failed"`

#### **Causes :**
1. `SECRET_KEY` incorrecte
2. Problème de génération de signature
3. Décalage d'horloge système

#### **Solutions :**

**1. Vérifier la SECRET_KEY**
```javascript
// Test de génération de signature
const crypto = require('crypto');
const testParams = "timestamp=1640995200000";
const signature = crypto.createHmac('sha256', process.env.SECRET_KEY)
  .update(testParams).digest('hex');
console.log('Signature test:', signature);
```

**2. Synchroniser l'heure système**
```bash
# Linux/Mac
sudo ntpdate -s time.nist.gov

# Windows
w32tm /resync
```

**3. Tester avec timestamp fixe**
```javascript
// Dans votre code de test
const timestamp = 1640995200000; // Timestamp fixe pour test
```

---

### **❌ Erreur: "Invalid API-key, IP, or permissions"**

#### **Symptômes :**
- Code BingX : `-2015`
- Accès refusé

#### **Solutions :**

**1. Vérifier les permissions API**
Dans votre compte BingX :
- ✅ **Enable Reading** : OUI
- ✅ **Enable Futures** : OUI  
- ❌ **Enable Withdrawals** : NON (sécurité)

**2. Vérifier la restriction IP**
```bash
# Récupérer votre IP publique
curl ifconfig.me

# Si vous utilisez des restrictions IP, ajoutez cette IP dans BingX
```

**3. Régénérer les clés API**
- Allez dans BingX > API Management
- Supprimez l'ancienne clé
- Créez une nouvelle paire API/SECRET
- Mettez à jour votre `.env.local`

---

### **❌ Problème: Données vides ou compte vide**

#### **Symptômes :**
```json
{
  "code": 0,
  "msg": "Success",
  "data": []
}
```

#### **C'est Normal Si :**
1. Votre compte BingX n'a pas de fonds
2. Vous n'avez pas de positions ouvertes
3. Vous regardez le mauvais type de compte

#### **Solutions :**

**1. Vérifier le solde de compte**
```javascript
// Vérifier les deux types de comptes
Promise.all([
  fetch('/api/balance').then(r => r.json()),
  fetch('/api/standard-futures/balance').then(r => r.json())
]).then(([perpetual, standard]) => {
  console.log('Perpetual:', perpetual.data);
  console.log('Standard:', standard.data);
});
```

**2. Financer le compte**
- Connectez-vous à BingX
- Transférez des fonds vers "Futures" ou "Perpetual"
- Attendez quelques minutes

**3. Tester avec un ordre simulé**
```bash
# Créer une position de test très petite
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTC-USDT","side":"BUY","quantity":"0.001"}'
```

---

### **❌ Erreur: "Timestamp outside recv window"**

#### **Symptômes :**
- Code BingX : `-1021`
- Problème de synchronisation temporelle

#### **Solutions :**

**1. Utiliser timestamp serveur BingX**
```javascript
// Récupérer d'abord l'heure serveur
const serverTime = await fetch('/api/server/time')
  .then(r => r.json());

// Utiliser ce timestamp
const timestamp = serverTime.serverTime;
```

**2. Augmenter la fenêtre de réception**
```javascript
// Ajouter un buffer de temps
const timestamp = Date.now() - 1000; // 1 seconde de buffer
```

---

## 🔍 **Outils de Debug**

### **1. Script de Diagnostic Complet**

```javascript
// debug-bingx.js
async function diagnoseBingX() {
  console.log('🔍 Diagnostic BingX complet...\n');
  
  // 1. Vérifier configuration
  console.log('1. Configuration:');
  console.log('API_KEY présente:', !!process.env.API_KEY);
  console.log('SECRET_KEY présente:', !!process.env.SECRET_KEY);
  console.log('');
  
  // 2. Test connectivité
  console.log('2. Test de connectivité:');
  try {
    const start = Date.now();
    const response = await fetch('http://localhost:3000/api/server/time');
    const data = await response.json();
    console.log('✅ Serveur accessible:', Date.now() - start, 'ms');
    console.log('Heure serveur:', new Date(data.serverTime));
  } catch (error) {
    console.log('❌ Problème serveur:', error.message);
  }
  console.log('');
  
  // 3. Test endpoints
  const endpoints = [
    '/api/balance',
    '/api/positions', 
    '/api/standard-futures/balance',
    '/api/standard-futures/positions'
  ];
  
  console.log('3. Test des endpoints:');
  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();
      const time = Date.now() - start;
      
      if (response.ok && data.code === 0) {
        console.log(`✅ ${endpoint}: ${time}ms - ${Array.isArray(data.data) ? data.data.length : 'OK'} items`);
      } else {
        console.log(`⚠️ ${endpoint}: ${time}ms - ${data.error || data.msg}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Diagnostic terminé!');
}

// Exécuter
diagnoseBingX();
```

### **2. Monitor en Temps Réel**

```javascript
// monitor-api.js
class BingXMonitor {
  constructor() {
    this.stats = {
      calls: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }
  
  async monitor() {
    setInterval(async () => {
      const start = Date.now();
      
      try {
        const response = await fetch('/api/balance');
        const data = await response.json();
        const time = Date.now() - start;
        
        this.stats.calls++;
        this.stats.avgResponseTime = 
          (this.stats.avgResponseTime * (this.stats.calls - 1) + time) / this.stats.calls;
        
        if (data.code !== 0) {
          this.stats.errors++;
          console.log(`❌ Error ${data.code}: ${data.msg}`);
        } else {
          console.log(`✅ ${time}ms - Balance: ${data.data.balance} ${data.data.asset}`);
        }
        
      } catch (error) {
        this.stats.errors++;
        console.log(`❌ Network error: ${error.message}`);
      }
      
      // Afficher stats toutes les 10 calls
      if (this.stats.calls % 10 === 0) {
        console.log(`📊 Stats: ${this.stats.calls} calls, ${this.stats.errors} errors, ${this.stats.avgResponseTime.toFixed(0)}ms avg`);
      }
      
    }, 5000); // Toutes les 5 secondes
  }
}

const monitor = new BingXMonitor();
monitor.monitor();
```

---

## 🛡️ **Sécurité et Bonnes Pratiques**

### **Protection des Clés API**

**❌ À ne JAMAIS faire :**
```javascript
// NE JAMAIS faire ça !
const API_KEY = "votre_cle_en_dur_dans_le_code"; // DANGER !
```

**✅ Bonnes pratiques :**
```javascript
// Toujours utiliser les variables d'environnement
const API_KEY = process.env.API_KEY;

// Vérifier la présence
if (!API_KEY) {
  throw new Error('API_KEY manquante');
}

// Masquer dans les logs
console.log('API Key:', API_KEY.substring(0, 8) + '...');
```

### **Validation des Réponses**

```javascript
function validateBingXResponse(data) {
  // Vérifier la structure de base
  if (typeof data !== 'object' || data === null) {
    throw new Error('Réponse invalide: pas un objet');
  }
  
  // Vérifier le code de succès
  if (data.code !== 0) {
    throw new Error(`Erreur BingX ${data.code}: ${data.msg || 'Inconnue'}`);
  }
  
  // Vérifier la présence des données
  if (!data.hasOwnProperty('data')) {
    throw new Error('Réponse invalide: propriété data manquante');
  }
  
  return data.data;
}

// Usage
try {
  const response = await fetch('/api/balance');
  const data = await response.json();
  const balance = validateBingXResponse(data);
  console.log('Balance validée:', balance);
} catch (error) {
  console.error('Erreur validation:', error.message);
}
```

---

## 📞 **Support et Ressources**

### **Logs Utiles**

```bash
# Logs du serveur Next.js
npm run dev | tee bingx-logs.txt

# Logs des erreurs uniquement
npm run dev 2>&1 | grep -i error

# Logs des calls API
npm run dev 2>&1 | grep -i "bingx\|api"
```

### **Commandes de Diagnostic**

```bash
# Vérifier la configuration
echo "API_KEY: ${API_KEY:0:8}..."
echo "SECRET_KEY: ${SECRET_KEY:0:8}..."

# Test de connectivité réseau
ping -c 3 open-api.bingx.com

# Test des ports locaux
netstat -tulpn | grep :3000
```

### **Checklist de Vérification**

**Avant de demander de l'aide :**

- [ ] Fichier `.env.local` présent et correct
- [ ] Clés API valides sur BingX
- [ ] Permissions API activées (Reading + Futures)
- [ ] Serveur de développement démarré (`npm run dev`)
- [ ] Aucune restriction IP problématique
- [ ] Heure système synchronisée
- [ ] Fonds présents sur le compte BingX
- [ ] Tests basiques passent (`curl /api/balance`)

---

## 🆘 **En Cas de Problème Persistant**

### **1. Reset Complet**

```bash
# Arrêter le serveur
# Ctrl+C

# Nettoyer le cache
rm -rf .next
rm -rf node_modules

# Réinstaller
npm install

# Redémarrer
npm run dev
```

### **2. Mode Debug Avancé**

```javascript
// Ajouter dans votre .env.local
DEBUG=true
BINGX_LOG_LEVEL=verbose

// Activer logs détaillés
export NODE_ENV=development
```

### **3. Test Environnement Minimal**

```javascript
// test-minimal.js
const crypto = require('crypto');

// Test signature basique
const testData = "timestamp=1640995200000";
const signature = crypto.createHmac('sha256', 'test_secret')
  .update(testData).digest('hex');

console.log('Test signature:', signature);

// Test fetch basique
fetch('https://open-api.bingx.com/openApi/swap/v2/quote/ticker')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

**🎯 La plupart des problèmes sont résolus en suivant ce guide !**

**Si votre problème persiste :** Consultez les logs complets et utilisez les outils de diagnostic fournis. 🛠️