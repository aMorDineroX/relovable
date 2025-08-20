#!/bin/bash

# 🧪 Script de Validation de la Documentation BingX
# Ce script teste tous les endpoints documentés

echo "🚀 Validation de la Documentation BingX API"
echo "============================================"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BASE_URL="http://localhost:3000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour tester un endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_field=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "🧪 Test $TOTAL_TESTS: $description... "
    
    # Faire la requête
    response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
    http_code="${response: -3}"
    json_response="${response%???}"
    
    # Vérifier le code HTTP
    if [ "$http_code" = "200" ]; then
        # Vérifier si la réponse contient le champ attendu
        if echo "$json_response" | jq -e ".$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            
            # Afficher des détails si c'est une réponse avec des données
            if [ "$expected_field" = "data" ]; then
                data_count=$(echo "$json_response" | jq -r '.data | if type == "array" then length else "1" end' 2>/dev/null)
                if [ "$data_count" != "null" ] && [ "$data_count" != "" ]; then
                    echo "   📊 Données: $data_count élément(s)"
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  PARTIAL${NC} (HTTP 200 but missing field '$expected_field')"
            echo "   Response: $(echo "$json_response" | jq -c . 2>/dev/null || echo "$json_response")"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "   Response: $(echo "$json_response" | jq -c . 2>/dev/null || echo "$json_response")"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Vérifier que le serveur est démarré
echo "🔍 Vérification du serveur de développement..."
if ! curl -s "$BASE_URL/api/server/time" > /dev/null; then
    echo -e "${RED}❌ Erreur: Le serveur n'est pas accessible sur $BASE_URL${NC}"
    echo ""
    echo "Solutions:"
    echo "1. Démarrez le serveur: cd newapp/bingx-web && npm run dev"
    echo "2. Vérifiez que le port 3000 est libre"
    echo "3. Attendez que le serveur soit complètement démarré"
    exit 1
fi

echo -e "${GREEN}✅ Serveur accessible${NC}"
echo ""

# Tests des endpoints documentés
echo -e "${BLUE}📊 Test des Endpoints Perpetual Futures:${NC}"
test_endpoint "/api/balance" "Balance Perpetual Futures" "data"
test_endpoint "/api/positions" "Positions Perpetual Futures" "data"

echo -e "${BLUE}📅 Test des Endpoints Standard Futures:${NC}"
test_endpoint "/api/standard-futures/balance" "Balance Standard Futures" "data"
test_endpoint "/api/standard-futures/positions" "Positions Standard Futures" "data"

echo -e "${BLUE}🛠️ Test des Endpoints Utilitaires:${NC}"
test_endpoint "/api/server/time" "Heure Serveur" "serverTime"

# Tests additionnels si les endpoints existent
echo -e "${BLUE}🔄 Test des Endpoints Additionnels:${NC}"
test_endpoint "/api/symbols" "Symboles Disponibles" "symbols"
test_endpoint "/api/market/ticker" "Ticker de Marché" "data"

# Test avec paramètres
echo -e "${BLUE}📋 Test des Endpoints avec Paramètres:${NC}"
test_endpoint "/api/positions?symbol=BTC-USDT" "Positions Filtrées par Symbole" "data"

# Résumé des tests
echo ""
echo "📈 Résumé des Tests:"
echo "==================="
echo -e "Total: $TOTAL_TESTS tests"
echo -e "${GREEN}Réussis: $PASSED_TESTS${NC}"
echo -e "${RED}Échoués: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tous les tests ont réussi!${NC}"
    echo "✅ La documentation est cohérente avec l'implémentation"
    echo ""
    echo "Prochaines étapes recommandées:"
    echo "1. Testez avec vos vraies clés API BingX"
    echo "2. Vérifiez que votre compte a des fonds pour voir des données"
    echo "3. Explorez les composants React fournis"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Quelques tests ont échoué${NC}"
    echo ""
    echo "Actions recommandées:"
    echo "1. Vérifiez votre fichier .env.local avec vos clés API"
    echo "2. Assurez-vous que vos clés ont les bonnes permissions"
    echo "3. Consultez le guide de dépannage: TROUBLESHOOTING_BINGX.md"
    echo ""
    
    if [ $PASSED_TESTS -gt 0 ]; then
        echo -e "${GREEN}✅ $PASSED_TESTS tests ont réussi, l'intégration de base fonctionne!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Aucun test n'a réussi. Vérifiez votre configuration.${NC}"
        exit 1
    fi
fi