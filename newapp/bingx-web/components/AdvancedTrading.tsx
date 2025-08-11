'use client';

import React, { useState } from 'react';
import { 
  CogIcon, 
  ShieldCheckIcon, 
  CalculatorIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface AdvancedTradingProps {
  symbol: string;
  onOrderUpdate: (orderData: any) => void;
}

interface StopLoss {
  enabled: boolean;
  type: 'percentage' | 'price';
  value: string;
}

interface TakeProfit {
  enabled: boolean;
  type: 'percentage' | 'price';
  value: string;
}

interface RiskManagement {
  maxRisk: string; // Pourcentage du capital
  positionSize: string; // Calculé automatiquement
  riskReward: string; // Ratio risque/récompense
}

export default function AdvancedTrading({ symbol, onOrderUpdate }: AdvancedTradingProps) {
  const [stopLoss, setStopLoss] = useState<StopLoss>({
    enabled: false,
    type: 'percentage',
    value: '2'
  });

  const [takeProfit, setTakeProfit] = useState<TakeProfit>({
    enabled: false,
    type: 'percentage',
    value: '4'
  });

  const [riskManagement, setRiskManagement] = useState<RiskManagement>({
    maxRisk: '1',
    positionSize: '0',
    riskReward: '1:2'
  });

  const [trailingStop, setTrailingStop] = useState({
    enabled: false,
    distance: '1',
    step: '0.5'
  });

  const [orderTiming, setOrderTiming] = useState({
    timeInForce: 'GTC', // Good Till Cancelled
    postOnly: false,
    reduceOnly: false,
    closeOnTrigger: false
  });

  const [showRiskCalculator, setShowRiskCalculator] = useState(false);

  // Calculateur de position
  const calculatePositionSize = (entryPrice: number, stopLossPrice: number, riskAmount: number): number => {
    if (entryPrice <= 0 || stopLossPrice <= 0 || riskAmount <= 0) return 0;
    
    const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
    return riskAmount / riskPerUnit;
  };

  // Calculateur de P&L potentiel
  const calculatePnL = (entryPrice: number, exitPrice: number, quantity: number): number => {
    return (exitPrice - entryPrice) * quantity;
  };

  const handleStopLossChange = (field: keyof StopLoss, value: any) => {
    const newStopLoss = { ...stopLoss, [field]: value };
    setStopLoss(newStopLoss);
    onOrderUpdate({ stopLoss: newStopLoss });
  };

  const handleTakeProfitChange = (field: keyof TakeProfit, value: any) => {
    const newTakeProfit = { ...takeProfit, [field]: value };
    setTakeProfit(newTakeProfit);
    onOrderUpdate({ takeProfit: newTakeProfit });
  };

  return (
    <div className="space-y-6">
      {/* Section Stop Loss */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-400" />
            Stop Loss
          </h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={stopLoss.enabled}
              onChange={(e) => handleStopLossChange('enabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
            />
            <span className="text-sm text-gray-300">Activer</span>
          </label>
        </div>

        {stopLoss.enabled && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => handleStopLossChange('type', 'percentage')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  stopLoss.type === 'percentage'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Pourcentage
              </button>
              <button
                onClick={() => handleStopLossChange('type', 'price')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  stopLoss.type === 'price'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Prix fixe
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {stopLoss.type === 'percentage' ? 'Pourcentage de perte (%)' : 'Prix de stop (USDT)'}
              </label>
              <input
                type="number"
                step={stopLoss.type === 'percentage' ? '0.1' : '0.01'}
                value={stopLoss.value}
                onChange={(e) => handleStopLossChange('value', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-400"
                placeholder={stopLoss.type === 'percentage' ? '2.0' : '43000.00'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Take Profit */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-400" />
            Take Profit
          </h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={takeProfit.enabled}
              onChange={(e) => handleTakeProfitChange('enabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-300">Activer</span>
          </label>
        </div>

        {takeProfit.enabled && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => handleTakeProfitChange('type', 'percentage')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  takeProfit.type === 'percentage'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Pourcentage
              </button>
              <button
                onClick={() => handleTakeProfitChange('type', 'price')}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  takeProfit.type === 'price'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Prix fixe
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {takeProfit.type === 'percentage' ? 'Pourcentage de profit (%)' : 'Prix de prise de bénéfice (USDT)'}
              </label>
              <input
                type="number"
                step={takeProfit.type === 'percentage' ? '0.1' : '0.01'}
                value={takeProfit.value}
                onChange={(e) => handleTakeProfitChange('value', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder={takeProfit.type === 'percentage' ? '4.0' : '45000.00'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Trailing Stop */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-yellow-400" />
            Trailing Stop
          </h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={trailingStop.enabled}
              onChange={(e) => setTrailingStop(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-300">Activer</span>
          </label>
        </div>

        {trailingStop.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Distance de suivi (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={trailingStop.distance}
                onChange={(e) => setTrailingStop(prev => ({ ...prev, distance: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                placeholder="1.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pas de mise à jour (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={trailingStop.step}
                onChange={(e) => setTrailingStop(prev => ({ ...prev, step: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                placeholder="0.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Gestion des Risques */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2 text-cyan-400" />
            Gestion des Risques
          </h3>
          <button
            onClick={() => setShowRiskCalculator(!showRiskCalculator)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risque maximum par trade (% du capital)
            </label>
            <input
              type="number"
              step="0.1"
              value={riskManagement.maxRisk}
              onChange={(e) => setRiskManagement(prev => ({ ...prev, maxRisk: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              placeholder="1.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Taille de position calculée
              </label>
              <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                {riskManagement.positionSize || '0.0000'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ratio Risque/Récompense
              </label>
              <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
                {riskManagement.riskReward}
              </div>
            </div>
          </div>

          {showRiskCalculator && (
            <div className="mt-4 p-4 bg-cyan-900/20 border border-cyan-700 rounded-lg">
              <h4 className="text-sm font-semibold text-cyan-400 mb-3">Calculateur de Risque</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Capital total:</span>
                  <div className="text-white font-mono">$10,000</div>
                </div>
                <div>
                  <span className="text-gray-400">Risque par trade:</span>
                  <div className="text-white font-mono">${(parseFloat(riskManagement.maxRisk) * 100).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Perte maximum:</span>
                  <div className="text-red-400 font-mono">-${(parseFloat(riskManagement.maxRisk) * 100).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Profit potentiel:</span>
                  <div className="text-green-400 font-mono">+${(parseFloat(riskManagement.maxRisk) * 200).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Options d'Ordre */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2 text-purple-400" />
          Options d&apos;Ordre
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time in Force
            </label>
            <select
              value={orderTiming.timeInForce}
              onChange={(e) => setOrderTiming(prev => ({ ...prev, timeInForce: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option value="GTC">Good Till Cancelled (GTC)</option>
              <option value="IOC">Immediate or Cancel (IOC)</option>
              <option value="FOK">Fill or Kill (FOK)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orderTiming.postOnly}
                onChange={(e) => setOrderTiming(prev => ({ ...prev, postOnly: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Post Only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orderTiming.reduceOnly}
                onChange={(e) => setOrderTiming(prev => ({ ...prev, reduceOnly: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Reduce Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Avertissements */}
      <div className="bg-amber-900/20 border border-amber-700 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-300">
            <p className="font-semibold mb-1">Avertissement de Risque</p>
            <p>
              Le trading de cryptomonnaies présente des risques élevés. Utilisez ces outils avancés uniquement 
              si vous comprenez parfaitement leur fonctionnement. Ne tradez jamais plus que ce que vous pouvez 
              vous permettre de perdre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
