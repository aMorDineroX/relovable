#!/bin/bash

echo "=== Diagnostic des erreurs Next.js 404 ==="

cd /workspaces/relovable/newapp/bingx-web

echo "1. Nettoyage des caches et fichiers temporaires..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "2. Vérification des fichiers essentiels..."
echo "- package.json:" $([ -f package.json ] && echo "✓" || echo "✗")
echo "- next.config.ts:" $([ -f next.config.ts ] && echo "✓" || echo "✗")
echo "- tailwind.config.ts:" $([ -f tailwind.config.ts ] && echo "✓" || echo "✗")
echo "- tsconfig.json:" $([ -f tsconfig.json ] && echo "✓" || echo "✗")
echo "- app/layout.tsx:" $([ -f app/layout.tsx ] && echo "✓" || echo "✗")
echo "- app/page.tsx:" $([ -f app/page.tsx ] && echo "✓" || echo "✗")
echo "- app/globals.css:" $([ -f app/globals.css ] && echo "✓" || echo "✗")

echo "3. Installation propre des dépendances..."
npm ci

echo "4. Test de build..."
npm run build > build.log 2>&1
if [ $? -eq 0 ]; then
    echo "Build: ✓ Succès"
    echo "5. Démarrage du serveur en mode production..."
    npm start &
    SERVER_PID=$!
    sleep 3
    
    echo "6. Test d'accès..."
    curl -s -I http://localhost:3000 | head -1
    
    kill $SERVER_PID
    echo "Test terminé."
else
    echo "Build: ✗ Échec - voir build.log"
    echo "Erreurs principales:"
    tail -10 build.log
fi

echo "=== Fin du diagnostic ==="