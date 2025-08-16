#!/bin/bash

echo "🔍 Test des endpoints BingX Standard Futures"
echo "============================================="

# Attendre que l'application soit prête
echo "⏳ Attente du démarrage de l'application..."
sleep 5

echo ""
echo "📊 Test Balance Standard Futures:"
echo "curl -s http://localhost:3001/api/standard-futures/balance"
curl -s http://localhost:3001/api/standard-futures/balance | jq . || echo "❌ Erreur endpoint balance"

echo ""
echo "📈 Test Positions Standard Futures:"
echo "curl -s http://localhost:3001/api/standard-futures/positions"
curl -s http://localhost:3001/api/standard-futures/positions | jq . || echo "❌ Erreur endpoint positions"

echo ""
echo "🔄 Test Perpetual Futures (comparaison):"
echo "curl -s http://localhost:3001/api/balance"
curl -s http://localhost:3001/api/balance | jq . || echo "❌ Erreur endpoint perpetual balance"

echo ""
echo "✅ Tests terminés"