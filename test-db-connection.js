const { neon } = require('@neondatabase/serverless');

// Test de connexion à la base de données
async function testDatabaseConnection() {
    try {
        // Charger les variables d'environnement depuis le fichier .env.local
        const fs = require('fs');
        const path = require('path');
        
        const envPath = path.join(__dirname, 'newapp/bingx-web/.env.local');
        
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envLines = envContent.split('\n');
            
            envLines.forEach(line => {
                if (line.includes('DATABASE_URL')) {
                    const [key, value] = line.split('=');
                    process.env[key] = value.replace(/'/g, '');
                }
            });
        }
        
        console.log('🔍 Test de connexion à la base de données...');
        console.log('📍 URL de base:', process.env.DATABASE_URL ? 'Trouvée' : 'Non trouvée');
        
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL non définie dans les variables d\'environnement');
        }
        
        // Initialiser la connexion
        const sql = neon(process.env.DATABASE_URL);
        
        // Test simple : récupérer la version de PostgreSQL
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
            console.log('⚠️  Aucune table trouvée - la base est vide');
        }
        
        // Test d'une requête sur une table si elle existe
        const positionsTable = tables.find(t => t.table_name === 'positions');
        if (positionsTable) {
            console.log('\n📈 Test de la table positions...');
            const positionsCount = await sql`SELECT COUNT(*) as count FROM positions`;
            console.log(`✅ Nombre de positions: ${positionsCount[0].count}`);
        }
        
        console.log('\n🎉 Tous les tests de connexion ont réussi !');
        
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:');
        console.error('📋 Détails:', error.message);
        
        if (error.message.includes('connect')) {
            console.error('🔧 Vérifiez que:');
            console.error('   - L\'URL de base de données est correcte');
            console.error('   - Le serveur de base de données est accessible');
            console.error('   - Les credentials sont valides');
        }
        
        return false;
    }
    
    return true;
}

// Exécuter le test
testDatabaseConnection()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Erreur inattendue:', error);
        process.exit(1);
    });
