#!/bin/bash

echo "🧪 Test de l'API Place Order Corrigée"
echo "======================================"

BASE_URL="http://localhost:3001"

echo ""
echo "1. Test ordre MARKET BUY:"
curl -X POST "${BASE_URL}/api/test-order" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "BUY", 
    "type": "MARKET",
    "quantity": "0.001",
    "leverage": 10
  }' | jq .

echo ""
echo "2. Test ordre LIMIT SELL:"
curl -X POST "${BASE_URL}/api/test-order" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETHUSDT",
    "side": "SELL",
    "type": "LIMIT", 
    "quantity": "0.01",
    "price": "2500",
    "leverage": 5
  }' | jq .

echo ""
echo "3. Test API réelle (mode debug - sans exécution):"
echo "Si vous voulez tester l'API réelle, changez l'endpoint vers /api/place-order"
echo "⚠️  ATTENTION: L'API réelle exécutera des ordres sur BingX!"

echo ""
echo "✅ Tests terminés. Utilisez le mode test dans l'interface pour vérifier le fonctionnement."