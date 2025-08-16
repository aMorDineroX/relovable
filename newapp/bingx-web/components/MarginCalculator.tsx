'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, ScaleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface MarginInfo {
  asset: string;
  balance: string;
  availableMargin: string;
  usedMargin: string;
  unrealizedProfit: string;
}

const MarginCalculator: React.FC = () => {
  const [marginInfo, setMarginInfo] = useState<MarginInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarginInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/balance');
      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.msg || 'Failed to fetch balance');
      }
      setMarginInfo(data.data.balance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarginInfo();
  }, []);

  const availableMargin = parseFloat(marginInfo?.availableMargin || '0');
  const usedMargin = parseFloat(marginInfo?.usedMargin || '0');
  const totalMargin = availableMargin + usedMargin;
  const usedMarginPercentage = totalMargin > 0 ? (usedMargin / totalMargin) * 100 : 0;
  
  // S'assurer que les valeurs sont valides
  const safeUsedMarginPercentage = isNaN(usedMarginPercentage) ? 0 : Math.min(Math.max(usedMarginPercentage, 0), 100);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <ScaleIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Calculateur de Marge
        </h3>
        <button onClick={fetchMarginInfo} disabled={loading} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p>Chargement des données de marge...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 text-red-300 p-3 rounded-lg">
          <p>Erreur: {error}</p>
        </div>
      )}

      {marginInfo && !error && (
        <div className="space-y-4">
          {/* Barre de progression de la marge */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Marge Utilisée</span>
                <span className="font-semibold">{safeUsedMarginPercentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    safeUsedMarginPercentage > 80 ? 'bg-red-500' : safeUsedMarginPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${safeUsedMarginPercentage}%` }}
                ></div>
              </div>
            </div>          {/* Détails de la marge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <InfoItem title="Marge Disponible" value={`${isNaN(availableMargin) ? '0.00' : availableMargin.toFixed(2)} USDT`} color="text-green-400" />
            <InfoItem title="Marge Utilisée" value={`${isNaN(usedMargin) ? '0.00' : usedMargin.toFixed(2)} USDT`} color="text-red-400" />
            <InfoItem title="Balance Totale" value={`${isNaN(parseFloat(marginInfo.balance)) ? '0.00' : parseFloat(marginInfo.balance).toFixed(2)} USDT`} />
            <InfoItem title="P/L Non Réalisé" value={`${isNaN(parseFloat(marginInfo.unrealizedProfit)) ? '0.00' : parseFloat(marginInfo.unrealizedProfit).toFixed(2)} USDT`} color={parseFloat(marginInfo.unrealizedProfit) >= 0 ? 'text-green-400' : 'text-red-400'} />
          </div>

          {/* Conseils */}
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-xs text-gray-400">
            <p>
              💡 **Conseil**: Gardez votre marge utilisée en dessous de 50% pour éviter les liquidations.
              Si votre marge disponible est faible, envisagez de réduire la taille de vos positions ou d'ajouter des fonds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ title, value, color = 'text-white' }: { title: string; value: string; color?: string }) => (
  <div className="bg-gray-700/50 p-3 rounded-lg">
    <p className="text-gray-400">{title}</p>
    <p className={`font-semibold text-lg ${color}`}>{value}</p>
  </div>
);

export default MarginCalculator;