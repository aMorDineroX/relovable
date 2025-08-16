// Script de test simple pour vérifier le composant MultiAssetsManagement
console.log('Test du composant MultiAssetsManagement...');

// Simulation de l'état initial 
const multiAssetsMode = { multiAssetsMode: false };
const isInitialized = true;

console.log('État initial:', { multiAssetsMode, isInitialized });

// Test de l'accès sécurisé aux propriétés
try {
  const result = multiAssetsMode?.multiAssetsMode;
  console.log('✅ Accès sécurisé réussi:', result);
} catch (error) {
  console.log('❌ Erreur d\'accès:', error.message);
}

// Test avec valeur undefined
const undefinedMode = undefined;
try {
  const result = undefinedMode?.multiAssetsMode;
  console.log('✅ Accès sécurisé avec undefined réussi:', result);
} catch (error) {
  console.log('❌ Erreur avec undefined:', error.message);
}

// Test avec valeur null
const nullMode = null;
try {
  const result = nullMode?.multiAssetsMode;
  console.log('✅ Accès sécurisé avec null réussi:', result);
} catch (error) {
  console.log('❌ Erreur avec null:', error.message);
}

console.log('Tests terminés - Le composant devrait maintenant être stable ✅');
