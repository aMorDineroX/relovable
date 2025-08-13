-- Mise à jour du schéma pour ajouter les contraintes uniques manquantes
-- Exécutez ce script pour corriger les contraintes

-- Ajouter une contrainte unique pour les positions (symbol, position_side)
ALTER TABLE positions 
ADD CONSTRAINT unique_position_symbol_side 
UNIQUE (symbol, position_side);

-- Ajouter une contrainte unique pour le portefeuille (asset)
ALTER TABLE portfolio 
ADD CONSTRAINT unique_portfolio_asset 
UNIQUE (asset);

-- Afficher les contraintes créées
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'UNIQUE'
  AND tc.table_name IN ('positions', 'portfolio', 'orders')
ORDER BY tc.table_name, tc.constraint_name;
