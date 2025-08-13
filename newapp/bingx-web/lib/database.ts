import { neon } from '@neondatabase/serverless';

// Initialiser la connexion à la base de données Neon
const sql = neon(process.env.DATABASE_URL!);

export default sql;
