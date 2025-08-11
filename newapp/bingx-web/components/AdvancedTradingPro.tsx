import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface AdvancedTradingProps {
  symbol: string;
  onOrderUpdate?: (data: any) => void;
}

interface TWAPOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  duration: number; // minutes
  intervalTime: number; // seconds
  priceType: 'MARKET' | 'LIMIT';
  price?: string;
}

interface MarginAdjustment {
  symbol: string;
  positionSide: 'LONG' | 'SHORT';
  amount: string;
  type: 1 | 2; // 1: Add, 2: Reduce
}

const AdvancedTrading: React.FC<AdvancedTradingProps> = ({ symbol, onOrderUpdate }) => {
  const [activeTab, setActiveTab] = useState<'twap' | 'margin' | 'advanced' | 'history'>('twap');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // États TWAP
  const [twapOrder, setTwapOrder] = useState<TWAPOrder>({
    symbol: symbol,
    side: 'BUY',
    quantity: '',
    duration: 60, // 1 heure par défaut
    intervalTime: 300, // 5 minutes par défaut
    priceType: 'MARKET'
  });
  const [twapOrders, setTwapOrders] = useState<any[]>([]);

  // États Margin
  const [marginAdjustment, setMarginAdjustment] = useState<MarginAdjustment>({
    symbol: symbol,
    positionSide: 'LONG',
    amount: '',
    type: 1
  });

  // États Advanced Order
  const [advancedOrder, setAdvancedOrder] = useState({
    symbol: symbol,
    side: 'BUY' as 'BUY' | 'SELL',
    type: 'LIMIT' as string,
    quantity: '',
    price: '',
    stopLoss: '',
    takeProfit: '',
    timeInForce: 'GTC',
    reduceOnly: false,
    closePosition: false,
    stopGuaranteed: false
  });

  // Historique
  const [positionHistory, setPositionHistory] = useState<any[]>([]);
  const [commissionRates, setCommissionRates] = useState<any>(null);

  useEffect(() => {
    setTwapOrder(prev => ({ ...prev, symbol }));
    setMarginAdjustment(prev => ({ ...prev, symbol }));
    setAdvancedOrder(prev => ({ ...prev, symbol }));
  }, [symbol]);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Fonctions TWAP
  const placeTWAPOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/twap-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(twapOrder)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Ordre TWAP placé avec succès !');
        setTwapOrder(prev => ({ ...prev, quantity: '', price: '' }));
        fetchTWAPOrders();
        onOrderUpdate?.(data.data);
      } else {
        showMessage('error', data.error || 'Erreur lors du placement de l\'ordre TWAP');
      }
    } catch (error) {
      showMessage('error', `Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTWAPOrders = async () => {
    try {
      const response = await fetch(`/api/twap-order?symbol=${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        setTwapOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching TWAP orders:', error);
    }
  };

  // Fonctions Margin
  const adjustMargin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/position-margin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marginAdjustment)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Marge ajustée avec succès !');
        setMarginAdjustment(prev => ({ ...prev, amount: '' }));
      } else {
        showMessage('error', data.error || 'Erreur lors de l\'ajustement de la marge');
      }
    } catch (error) {
      showMessage('error', `Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction Reverse Position
  const reversePosition = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reverse-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Position inversée avec succès !');
        onOrderUpdate?.(data.data);
      } else {
        showMessage('error', data.error || 'Erreur lors de l\'inversion de la position');
      }
    } catch (error) {
      showMessage('error', `Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions Advanced Order
  const placeAdvancedOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        ...advancedOrder,
        // Nettoyer les champs vides
        stopLoss: advancedOrder.stopLoss || undefined,
        takeProfit: advancedOrder.takeProfit || undefined,
        price: advancedOrder.type === 'MARKET' ? undefined : advancedOrder.price
      };

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.code === 0) {
        showMessage('success', 'Ordre avancé placé avec succès !');
        setAdvancedOrder(prev => ({ 
          ...prev, 
          quantity: '', 
          price: '', 
          stopLoss: '', 
          takeProfit: '' 
        }));
        onOrderUpdate?.(data.data);
      } else {
        showMessage('error', data.msg || 'Erreur lors du placement de l\'ordre');
      }
    } catch (error) {
      showMessage('error', `Erreur: ${error instanceof Error ? error.message : 'Inconnu'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions History
  const fetchPositionHistory = async () => {
    try {
      const response = await fetch(`/api/position-history?symbol=${symbol}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setPositionHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching position history:', error);
    }
  };

  const fetchCommissionRates = async () => {
    try {
      const response = await fetch(`/api/commission-rate?symbol=${symbol}`);
      const data = await response.json();
      
      if (data.success) {
        setCommissionRates(data.data);
      }
    } catch (error) {
      console.error('Error fetching commission rates:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'twap') {
      fetchTWAPOrders();
    } else if (activeTab === 'history') {
      fetchPositionHistory();
      fetchCommissionRates();
    }
  }, [activeTab, symbol]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-cyan-400" />
          Trading Avancé - {symbol}
        </h3>
        
        <button
          onClick={reversePosition}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Inverser Position
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
           <ClockIcon className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {/* Onglets */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 mb-6">
        {[
          { id: 'twap', label: '⏱️ TWAP Orders', icon: ClockIcon },
          { id: 'margin', label: '💰 Gestion Marge', icon: CurrencyDollarIcon },
          { id: 'advanced', label: '⚙️ Ordres Avancés', icon: ChartBarIcon },
          { id: 'history', label: '📊 Historique', icon: ChartBarIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'twap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nouveau TWAP Order */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-200">Nouvel Ordre TWAP</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Côté</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTwapOrder(prev => ({ ...prev, side: 'BUY' }))}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        twapOrder.side === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Acheter
                    </button>
                    <button
                      onClick={() => setTwapOrder(prev => ({ ...prev, side: 'SELL' }))}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        twapOrder.side === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Vendre
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Type de Prix</label>
                  <select
                    value={twapOrder.priceType}
                    onChange={(e) => setTwapOrder(prev => ({ ...prev, priceType: e.target.value as 'MARKET' | 'LIMIT' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Quantité Totale</label>
                <input
                  type="number"
                  step="0.001"
                  value={twapOrder.quantity}
                  onChange={(e) => setTwapOrder(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="0.000"
                />
              </div>

              {twapOrder.priceType === 'LIMIT' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Prix Limite</label>
                  <input
                    type="number"
                    step="0.01"
                    value={twapOrder.price || ''}
                    onChange={(e) => setTwapOrder(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Durée (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={twapOrder.duration}
                    onChange={(e) => setTwapOrder(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Intervalle (secondes)</label>
                  <input
                    type="number"
                    min="30"
                    value={twapOrder.intervalTime}
                    onChange={(e) => setTwapOrder(prev => ({ ...prev, intervalTime: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                onClick={placeTWAPOrder}
                disabled={loading || !twapOrder.quantity}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placement...' : 'Placer Ordre TWAP'}
              </button>
            </div>

            {/* Liste des TWAP Orders */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-200">Ordres TWAP Actifs</h4>
              
              {twapOrders.length > 0 ? (
                <div className="space-y-2">
                  {twapOrders.map((order, index) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{order.symbol}</p>
                          <p className={`text-sm ${order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                            {order.side} {order.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Durée: {order.duration}min</p>
                          <p className="text-sm text-gray-400">Intervalle: {order.intervalTime}s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Aucun ordre TWAP actif</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'margin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-200">Ajuster la Marge</h4>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Côté de la Position</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMarginAdjustment(prev => ({ ...prev, positionSide: 'LONG' }))}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      marginAdjustment.positionSide === 'LONG' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    LONG
                  </button>
                  <button
                    onClick={() => setMarginAdjustment(prev => ({ ...prev, positionSide: 'SHORT' }))}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      marginAdjustment.positionSide === 'SHORT' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    SHORT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Action</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMarginAdjustment(prev => ({ ...prev, type: 1 }))}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      marginAdjustment.type === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setMarginAdjustment(prev => ({ ...prev, type: 2 }))}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      marginAdjustment.type === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Réduire
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Montant (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={marginAdjustment.amount}
                  onChange={(e) => setMarginAdjustment(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="0.00"
                />
              </div>

              <button
                onClick={adjustMargin}
                disabled={loading || !marginAdjustment.amount}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ajustement...' : 'Ajuster la Marge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-200">Ordre Avancé avec Stop Loss / Take Profit</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Côté</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAdvancedOrder(prev => ({ ...prev, side: 'BUY' }))}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        advancedOrder.side === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Acheter
                    </button>
                    <button
                      onClick={() => setAdvancedOrder(prev => ({ ...prev, side: 'SELL' }))}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        advancedOrder.side === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Vendre
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Type d'Ordre</label>
                  <select
                    value={advancedOrder.type}
                    onChange={(e) => setAdvancedOrder(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="STOP">Stop</option>
                    <option value="TAKE_PROFIT">Take Profit</option>
                    <option value="TRAILING_TP_SL">Trailing Stop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Quantité</label>
                  <input
                    type="number"
                    step="0.001"
                    value={advancedOrder.quantity}
                    onChange={(e) => setAdvancedOrder(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="0.000"
                  />
                </div>

                {advancedOrder.type !== 'MARKET' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Prix</label>
                    <input
                      type="number"
                      step="0.01"
                      value={advancedOrder.price}
                      onChange={(e) => setAdvancedOrder(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Stop Loss (optionnel)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={advancedOrder.stopLoss}
                    onChange={(e) => setAdvancedOrder(prev => ({ ...prev, stopLoss: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Take Profit (optionnel)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={advancedOrder.takeProfit}
                    onChange={(e) => setAdvancedOrder(prev => ({ ...prev, takeProfit: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedOrder.reduceOnly}
                      onChange={(e) => setAdvancedOrder(prev => ({ ...prev, reduceOnly: e.target.checked }))}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">Reduce Only</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedOrder.closePosition}
                      onChange={(e) => setAdvancedOrder(prev => ({ ...prev, closePosition: e.target.checked }))}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">Close Position</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedOrder.stopGuaranteed}
                      onChange={(e) => setAdvancedOrder(prev => ({ ...prev, stopGuaranteed: e.target.checked }))}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">Stop Garanti</span>
                  </label>
                </div>
              </div>

              <button
                onClick={placeAdvancedOrder}
                disabled={loading || !advancedOrder.quantity}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placement...' : 'Placer Ordre Avancé'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Rates */}
            {commissionRates && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">Frais de Trading</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maker Fee:</span>
                    <span className="text-white">{(parseFloat(commissionRates.makerFeeRate || '0') * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taker Fee:</span>
                    <span className="text-white">{(parseFloat(commissionRates.takerFeeRate || '0') * 100).toFixed(4)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Position History */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">Historique des Positions</h4>
              {positionHistory.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {positionHistory.slice(0, 10).map((position, index) => (
                    <div key={index} className="bg-gray-600/50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{position.symbol}</p>
                          <p className={`text-sm ${position.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            P&L: {parseFloat(position.realizedPnl || '0').toFixed(2)} USDT
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          {new Date(position.updateTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Aucun historique disponible</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTrading;
