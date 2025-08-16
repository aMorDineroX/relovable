# 🔄 **Guide : Perpetual vs Standard Futures BingX**

## 🎯 **Problème Résolu**

Ton application affichait uniquement les données de ton compte **Perpetual Futures**, mais tu voulais accéder aux données de ton compte **Standard Futures**.

## 📊 **Différences entre les Types de Comptes**

### **1. Perpetual Futures (Ancienne Configuration)**
- **Endpoints** : `/openApi/swap/v2/...`
- **Description** : Contrats perpétuels sans date d'expiration
- **Avantages** : 
  - Pas de gestion d'expiration
  - Plus simple pour le trading à long terme
  - Financement toutes les 8 heures

### **2. Standard Futures (Nouvelle Configuration)**
- **Endpoints** : `/openApi/futures/v1/...`
- **Description** : Contrats avec dates d'expiration spécifiques
- **Avantages** :
  - Pas de frais de financement
  - Prix plus proche du spot à l'expiration
  - Stratégies d'arbitrage possible

## 🔧 **Nouveaux Endpoints Ajoutés**

### **Balance Standard Futures**
```
GET /api/standard-futures/balance
```
- Utilise `/openApi/futures/v1/balance`
- Retourne le solde de ton compte Standard Futures

### **Positions Standard Futures**
```
GET /api/standard-futures/positions
```
- Utilise `/openApi/futures/v1/allPositions`
- Retourne toutes tes positions Standard Futures

## 🎨 **Interface Utilisateur**

### **Sélecteur de Type de Compte**
Un nouveau composant `AccountTypeSelector` a été ajouté qui permet de :
- Basculer entre Perpetual et Standard Futures
- Voir les endpoints utilisés en temps réel
- Indication visuelle du type de compte actif

## 🧪 **Comment Tester**

### **1. Test Direct des Endpoints**
```bash
# Tester l'endpoint de test comparatif
curl http://localhost:3000/api/test-endpoints
```

### **2. Interface Utilisateur**
1. Va sur la page du Portfolio Tracker
2. Tu verras maintenant un sélecteur en haut
3. Clique sur "Standard Futures" pour voir tes données Standard
4. Clique sur "Perpetual Futures" pour revenir aux données perpétuelles

## 📋 **Structure des Données**

### **Perpetual Futures Response**
```json
{
  "source": "perpetual",
  "data": {
    "asset": "USDT",
    "balance": "1000.00",
    "equity": "1025.50",
    "unrealizedProfit": "25.50"
  }
}
```

### **Standard Futures Response**
```json
{
  "source": "standard-futures",
  "data": {
    "asset": "USDT", 
    "balance": "500.00",
    "equity": "485.25",
    "unrealizedProfit": "-14.75"
  }
}
```

## 🔍 **Debugging**

### **Si tes données Standard Futures n'apparaissent pas :**

1. **Vérifier les permissions API**
   - Assure-toi que tes clés API ont accès aux Standard Futures
   - Vérifie dans ton tableau de bord BingX

2. **Check les logs**
   ```bash
   # Dans la console du navigateur
   console.log('Standard Futures Data')
   ```

3. **Tester manuellement**
   ```bash
   curl "https://open-api.bingx.com/openApi/futures/v1/balance?timestamp=..." \
     -H "X-BX-APIKEY: YOUR_API_KEY"
   ```

## ⚠️ **Points Importants**

1. **Comptes Séparés** : Les comptes Perpetual et Standard sont complètement séparés
2. **Balances Différentes** : Tu peux avoir des soldes différents sur chaque compte
3. **Transferts** : Tu peux transférer des fonds entre les comptes via l'interface BingX
4. **Permissions** : Assure-toi que tes clés API ont accès aux deux types de comptes

## 🚀 **Prochaines Étapes**

1. **Teste les nouveaux endpoints** avec tes vraies clés API
2. **Vérifie tes permissions** dans l'interface BingX
3. **Compare les données** entre les deux types de comptes
4. **Utilise le sélecteur** pour basculer facilement

---

**Note** : Cette fonctionnalité te permet maintenant d'avoir une vue complète de tes activités de trading sur BingX, que ce soit en Perpetual ou Standard Futures !