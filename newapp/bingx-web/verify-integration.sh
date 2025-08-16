#!/bin/bash

# Script de vérification de l'intégration BingX
echo "🚀 Vérification de l'intégration BingX..."

# Vérifier que les composants existent
echo "📁 Vérification des composants..."
components=(
    "GridTradingBot.tsx"
    "SignalTrading.tsx" 
    "CopyTrading.tsx"
)

for component in "${components[@]}"; do
    if [ -f "components/$component" ]; then
        echo "✅ $component existe"
    else
        echo "❌ $component manquant"
    fi
done

# Vérifier que le dashboard a été mis à jour
echo "🔍 Vérification du dashboard..."
if grep -q "GridTradingBot" app/page.tsx; then
    echo "✅ GridTradingBot intégré"
else
    echo "❌ GridTradingBot non intégré"
fi

if grep -q "SignalTrading" app/page.tsx; then
    echo "✅ SignalTrading intégré"
else
    echo "❌ SignalTrading non intégré" 
fi

if grep -q "CopyTrading" app/page.tsx; then
    echo "✅ CopyTrading intégré"
else
    echo "❌ CopyTrading non intégré"
fi

# Vérifier les types
echo "📝 Vérification des types..."
if grep -q "'bots' | 'signals' | 'copy'" app/page.tsx; then
    echo "✅ Types étendus correctement"
else
    echo "❌ Types non mis à jour"
fi

# Vérifier la compilation
echo "🔨 Vérification de la compilation..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie"
else
    echo "❌ Erreurs de compilation"
fi

echo "🎉 Vérification terminée !"