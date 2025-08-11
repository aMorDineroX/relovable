'use client';

import React, { useState, useEffect } from 'react';
import { CalculatorIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface RiskCalculatorProps {
  symbol: string;
  currentPrice: number;
}

interface RiskCalculation {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: number;
  maxLoss: number;
}

export default function RiskCalculator({ symbol, currentPrice }: RiskCalculatorProps) {
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(2);
  const [entryPrice, setEntryPrice] = useState(currentPrice);
  const [stopLoss, setStopLoss] = useState(currentPrice * 0.98);
  const [takeProfit, setTakeProfit] = useState(currentPrice * 1.04);
  const [calculation, setCalculation] = useState<RiskCalculation | null>(null);
  const [leverage, setLeverage] = useState(1);

  useEffect(() => {
    setEntryPrice(currentPrice);
    setStopLoss(currentPrice * 0.98);
    setTakeProfit(currentPrice * 1.04);
  }, [currentPrice]);

  useEffect(() => {
    calculateRisk();
  }, [accountBalance, riskPercentage, entryPrice, stopLoss, takeProfit, leverage]);

  const calculateRisk = () => {
    if (entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) return;

    const riskAmount = (accountBalance * riskPercentage) / 100;
    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    const profitPerUnit = Math.abs(takeProfit - entryPrice);
    
    if (riskPerUnit <= 0) return;

    const positionSize = riskAmount / riskPerUnit;
    const potentialProfit = positionSize * profitPerUnit;
    const riskRewardRatio = profitPerUnit / riskPerUnit;
    const maxLoss = positionSize * riskPerUnit;

    setCalculation({
      entryPrice,
      stopLoss,
      takeProfit,
      positionSize,
      riskAmount,
      potentialProfit,
      riskRewardRatio,
      maxLoss
    });
  };

  const getPositionType = () => {
    return takeProfit > entryPrice ? 'LONG' : 'SHORT';
  };

  const getRiskLevel = () => {
    if (riskPercentage <= 1) return { level: 'Conservateur', color: 'text-green-400' };
    if (riskPercentage <= 3) return { level: 'Modéré', color: 'text-yellow-400' };
    return { level: 'Agressif', color: 'text-red-400' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Calculateur de Risque
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Niveau:</span>
          <span className={`text-sm font-semibold ${riskLevel.color}`}>
            {riskLevel.level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paramètres d'entrée */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-300 border-b border-gray-600 pb-2">
            Paramètres
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capital total ($)
            </label>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risque par trade (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="mt-1 text-xs text-gray-400">
              Montant risqué: ${((accountBalance * riskPercentage) / 100).toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prix d&apos;entrée ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stop Loss ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Take Profit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Levier: {leverage}x
            </label>
            <input
              type="range"
              min="1"
              max="125"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Résultats */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-300 border-b border-gray-600 pb-2">
            Calculs
          </h4>

          {calculation ? (
            <div className="space-y-4">
              {/* Type de position */}
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type de position:</span>
                  <span className={`font-semibold ${
                    getPositionType() === 'LONG' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {getPositionType()}
                  </span>
                </div>
              </div>

              {/* Taille de position */}
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taille de position:</span>
                  <span className="text-white font-mono">
                    {calculation.positionSize.toFixed(4)} {symbol.replace('USDT', '')}
                  </span>
                </div>
              </div>

              {/* Valeur de la position */}
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Valeur position:</span>
                  <span className="text-white font-mono">
                    ${(calculation.positionSize * entryPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Perte maximum */}
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-red-300">Perte maximum:</span>
                  <span className="text-red-400 font-mono">
                    -${calculation.maxLoss.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Profit potentiel */}
              <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-300">Profit potentiel:</span>
                  <span className="text-green-400 font-mono">
                    +${calculation.potentialProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Ratio Risk/Reward */}
              <div className="p-3 bg-cyan-900/20 border border-cyan-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-300">Ratio R/R:</span>
                  <span className="text-cyan-400 font-mono">
                    1:{calculation.riskRewardRatio.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Distance en pourcentage */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-700/50 rounded">
                  <div className="text-gray-400">Distance SL:</div>
                  <div className="text-red-400 font-mono">
                    {(((entryPrice - stopLoss) / entryPrice) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="p-2 bg-gray-700/50 rounded">
                  <div className="text-gray-400">Distance TP:</div>
                  <div className="text-green-400 font-mono">
                    {(((takeProfit - entryPrice) / entryPrice) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <InformationCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Remplissez les paramètres pour voir les calculs</p>
            </div>
          )}
        </div>
      </div>

      {/* Avertissements */}
      {calculation && calculation.riskRewardRatio < 1.5 && (
        <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-300">
              <p className="font-semibold mb-1">Ratio Risk/Reward faible</p>
              <p>
                Un ratio de 1:{calculation.riskRewardRatio.toFixed(2)} est considéré comme faible. 
                Visez un ratio d&apos;au moins 1:2 pour une meilleure gestion des risques.
              </p>
            </div>
          </div>
        </div>
      )}

      {riskPercentage > 5 && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-300">
              <p className="font-semibold mb-1">Risque élevé</p>
              <p>
                Risquer plus de 5% de votre capital par trade est très dangereux. 
                La plupart des traders professionnels ne risquent jamais plus de 1-2%.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
