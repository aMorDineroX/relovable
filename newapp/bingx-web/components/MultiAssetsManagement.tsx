import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

interface MultiAssetsManagementProps {
  onUpdate?: (data: any) => void;
}

interface MultiAssetsMode {
  multiAssetsMode: boolean;
}

interface MultiAssetsMargin {
  asset: string;
  balance: string;
  borrowed: string;
  interest: string;
  netBalance: string;
  marginLevel: string;
}

const MultiAssetsManagement: React.FC<MultiAssetsManagementProps> = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [multiAssetsMode, setMultiAssetsMode] = useState<MultiAssetsMode>({ multiAssetsMode: false });
  const [multiAssetsMargin, setMultiAssetsMargin] = useState<MultiAssetsMargin[]>([]);
  const [multiAssetsRules, setMultiAssetsRules] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Récupérer le statut du mode multi-assets
  const fetchMultiAssetsMode = async () => {
    try {
      const response = await fetch('/api/multi-assets/mode');
      const data = await response.json();
      
      if (data.success && data.data) {
        // S'assurer que les données ont la bonne structure
        const modeData = {
          multiAssetsMode: Boolean(data.data.multiAssetsMode || data.data)
        };
        setMultiAssetsMode(modeData);
      } else {
        // En cas d'erreur, définir une valeur par défaut
        setMultiAssetsMode({ multiAssetsMode: false });
        showMessage('error', data.error || 'Erreur lors de la récupération du mode multi-assets');
      }
    } catch (error) {
      console.error('Error fetching multi-assets mode:', error);
      // En cas d'erreur, définir une valeur par défaut
      setMultiAssetsMode({ multiAssetsMode: false });
      showMessage('error', 'Impossible de récupérer le statut du mode multi-assets');
    } finally {
      setIsInitialized(true);
    }
  };

  // Basculer le mode multi-assets
  const toggleMultiAssetsMode = async (enable: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/multi-assets/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiAssetsMode: enable })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', `Mode multi-assets ${enable ? 'activé' : 'désactivé'} avec succès !`);
        // S'assurer que les données ont la bonne structure
        const modeData = {
          multiAssetsMode: Boolean(data.data?.multiAssetsMode ?? enable)
        };
        setMultiAssetsMode(modeData);
        onUpdate?.(modeData);
      } else {
        showMessage('error', data.error || 'Erreur lors de la modification du mode');
      }
    } catch (error) {
      showMessage('error', `Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les marges multi-assets
  const fetchMultiAssetsMargin = async () => {
    try {
      const response = await fetch('/api/multi-assets/margin');
      const data = await response.json();
      
      if (data.success) {
        setMultiAssetsMargin(data.data);
      }
    } catch (error) {
      console.error('Error fetching multi-assets margin:', error);
    }
  };

  // Récupérer les règles multi-assets
  const fetchMultiAssetsRules = async () => {
    try {
      const response = await fetch('/api/multi-assets/rules');
      const data = await response.json();
      
      if (data.success) {
        setMultiAssetsRules(data.data);
      }
    } catch (error) {
      console.error('Error fetching multi-assets rules:', error);
    }
  };

  useEffect(() => {
    fetchMultiAssetsMode();
    fetchMultiAssetsMargin();
    fetchMultiAssetsRules();
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <CurrencyDollarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Gestion Multi-Assets
        </h3>
        
        <button
          onClick={() => {
            fetchMultiAssetsMode();
            fetchMultiAssetsMargin();
            fetchMultiAssetsRules();
          }}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' :
          message.type === 'error' ? 'bg-red-900/50 text-red-300 border border-red-700' :
          'bg-blue-900/50 text-blue-300 border border-blue-700'
        }`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> :
           message.type === 'error' ? <ExclamationTriangleIcon className="h-5 w-5" /> :
           <ChartBarIcon className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du Mode Multi-Assets */}
        <div className="space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              Configuration du Mode
            </h4>
            
            {isInitialized ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">Mode Multi-Assets</p>
                    <p className="text-sm text-gray-400">
                      Permet d'utiliser plusieurs devises comme garantie
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${multiAssetsMode?.multiAssetsMode ? 'text-green-400' : 'text-gray-400'}`}>
                      {multiAssetsMode?.multiAssetsMode ? 'Activé' : 'Désactivé'}
                    </span>
                    <button
                      onClick={() => toggleMultiAssetsMode(!multiAssetsMode?.multiAssetsMode)}
                      disabled={loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        multiAssetsMode?.multiAssetsMode ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          multiAssetsMode?.multiAssetsMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {multiAssetsMode?.multiAssetsMode && (
                  <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg">
                    <p className="text-sm text-green-300">
                      ✅ Le mode multi-assets est activé. Vous pouvez utiliser plusieurs devises comme garantie pour vos positions.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-400">Chargement...</p>
              </div>
            )}
          </div>

          {/* Règles Multi-Assets */}
          {multiAssetsRules && (
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">Règles Multi-Assets</h4>
              
              <div className="space-y-3">
                {multiAssetsRules.map((rule: any, index: number) => (
                  <div key={index} className="bg-gray-600/50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-cyan-400">{rule.asset}</p>
                        <p className="text-sm text-gray-400">Ratio de garantie: {(parseFloat(rule.collateralRate) * 100).toFixed(2)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">Discount: {(parseFloat(rule.discountRate) * 100).toFixed(2)}%</p>
                        <p className="text-xs text-gray-400">Index: {rule.index}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Marges Multi-Assets */}
        <div className="space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Marges par Asset</h4>
            
            {multiAssetsMargin.length > 0 ? (
              <div className="space-y-3">
                {multiAssetsMargin.map((margin, index) => (
                  <div key={index} className="bg-gray-600/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-cyan-400 mb-2">{margin.asset}</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Balance:</span>
                            <span className="text-sm text-white">{parseFloat(margin.balance).toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Emprunté:</span>
                            <span className="text-sm text-white">{parseFloat(margin.borrowed).toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Intérêts:</span>
                            <span className="text-sm text-white">{parseFloat(margin.interest).toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          <div>
                            <span className="text-sm text-gray-400">Net Balance:</span>
                            <p className="text-sm font-semibold text-green-400">
                              {parseFloat(margin.netBalance).toFixed(6)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Margin Level:</span>
                            <p className={`text-sm font-semibold ${
                              parseFloat(margin.marginLevel) > 2 ? 'text-green-400' :
                              parseFloat(margin.marginLevel) > 1.5 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {parseFloat(margin.marginLevel).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barre de niveau de marge */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            parseFloat(margin.marginLevel) > 2 ? 'bg-green-500' :
                            parseFloat(margin.marginLevel) > 1.5 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (parseFloat(margin.marginLevel) / 3) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Risque élevé</span>
                        <span>Sécurisé</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune marge multi-assets détectée</p>
                <p className="text-sm">Activez le mode multi-assets pour commencer</p>
              </div>
            )}
          </div>

          {/* Informations importantes */}
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-300 mb-2">ℹ️ Informations importantes</h5>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Le mode multi-assets permet d'utiliser plusieurs devises comme garantie</li>
              <li>• Chaque asset a un ratio de garantie différent</li>
              <li>• Surveillez votre niveau de marge pour éviter les liquidations</li>
              <li>• Les intérêts sont calculés sur les montants empruntés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAssetsManagement;
