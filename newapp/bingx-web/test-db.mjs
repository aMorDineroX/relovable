import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

// Test de connexion à la base de données
async function testDatabaseConnection() {
    try {
        console.log('🔍 Test de connexion à la base de données...');
        console.log('📍 URL de base:', process.env.DATABASE_URL ? 'Configurée ✅' : 'Non trouvée ❌');
        
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL non définie dans les variables d\'environnement');
        }
        
        // Initialiser la connexion
        const sql = neon(process.env.DATABASE_URL);
        
        // Test simple : récupérer la version de PostgreSQL
        console.log('🚀 Tentative de connexion...');
        const result = await sql`SELECT version()`;
        console.log('✅ Connexion réussie !');
        console.log('📊 Version PostgreSQL:', result[0].version.split(' ')[0]);
        
        // Test des tables existantes
        console.log('\n🗂️  Vérification des tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        if (tables.length > 0) {
            console.log('✅ Tables trouvées:');
            tables.forEach(table => {
                console.log(`   - ${table.table_name}`);
            });
        } else {
            console.log('⚠️  Aucune table trouvée - la base de données est vide');
            console.log('💡 Vous devrez peut-être exécuter le script schema.sql pour créer les tables');
        }
        
        // Test d'une requête sur une table si elle existe
        const positionsTable = tables.find(t => t.table_name === 'positions');
        if (positionsTable) {
            console.log('\n📈 Test de la table positions...');
            const positionsCount = await sql`SELECT COUNT(*) as count FROM positions`;
            console.log(`✅ Nombre de positions enregistrées: ${positionsCount[0].count}`);
        }
        
        const ordersTable = tables.find(t => t.table_name === 'orders');
        if (ordersTable) {
            console.log('\n📋 Test de la table orders...');
            const ordersCount = await sql`SELECT COUNT(*) as count FROM orders`;
            console.log(`✅ Nombre d'ordres enregistrés: ${ordersCount[0].count}`);
        }
        
        const portfolioTable = tables.find(t => t.table_name === 'portfolio');
        if (portfolioTable) {
            console.log('\n💰 Test de la table portfolio...');
            const portfolioCount = await sql`SELECT COUNT(*) as count FROM portfolio`;
            console.log(`✅ Nombre d'actifs dans le portefeuille: ${portfolioCount[0].count}`);
        }
        
        console.log('\n🎉 Tous les tests de connexion ont réussi !');
        console.log('🔧 La base de données est prête à être utilisée.');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Erreur de connexion à la base de données:');
        console.error('📋 Détails:', error.message);
        
        if (error.message.includes('connect') || error.message.includes('timeout')) {
            console.error('\n🔧 Suggestions de dépannage:');
            console.error('   1. Vérifiez que l\'URL de base de données est correcte');
            console.error('   2. Vérifiez que le serveur Neon est accessible');
            console.error('   3. Vérifiez que les credentials sont valides');
            console.error('   4. Vérifiez votre connexion internet');
        } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
            console.error('\n🔒 Problème SSL détecté:');
            console.error('   - Vérifiez les paramètres SSL dans l\'URL de connexion');
        }
        
        return false;
    }
}

// Exécuter le test
console.log('🧪 Démarrage du test de connexion à la base de données BingX...\n');

testDatabaseConnection()
    .then(success => {
        if (success) {
            console.log('\n🟢 Statut: Base de données connectée et fonctionnelle');
        } else {
            console.log('\n🔴 Statut: Problème de connexion détecté');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Erreur inattendue:', error);
        console.log('\n🔴 Statut: Erreur critique');
        process.exit(1);
    });
