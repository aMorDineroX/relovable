export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Test de diagnostic BingX
      </h1>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">État du serveur</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-medium text-green-800">✓ Next.js</h3>
            <p className="text-green-600">Serveur démarré</p>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="font-medium text-blue-800">✓ React</h3>
            <p className="text-blue-600">Composants chargés</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <h3 className="font-medium text-purple-800">✓ Tailwind</h3>
            <p className="text-purple-600">Styles appliqués</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <h3 className="font-medium text-yellow-800">⚠ API</h3>
            <p className="text-yellow-600">À tester</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Étapes suivantes:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Tester les assets statiques</li>
            <li>Vérifier les routes API</li>
            <li>Activer les composants complets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}