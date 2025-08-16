'use client';

import React, { useState } from 'react';
import EnhancedMarketDataDashboard from '../../components/EnhancedMarketDataDashboard';
import MiniChart from '../../components/MiniChart';
import EnhancedOrderBook from '../../components/EnhancedOrderBook';
import TradeHistory from '../../components/TradeHistory';
import DataSourceToggle from '../../components/DataSourceToggle';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  BellIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USDT');
  const [activeTab, setActiveTab] = useState<'overview' | 'trading' | 'analysis'>('overview');
  const [useMockData, setUseMockData] = useState(false); // Commencer avec vraies données

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'trading', label: 'Trading', icon: BookOpenIcon },
    { id: 'analysis', label: 'Analyse', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Marché Crypto - BingX Pro
              </h1>
              <p className="text-gray-400">
                Plateforme complète de trading avec données temps réel
              </p>
            </div>
            
            {/* Data Source Toggle */}
            <DataSourceToggle 
              useMockData={useMockData}
              onToggle={setUseMockData}
            />
            
            {/* Symbol Selector */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-1">Paire active</div>
              <div className="text-lg font-bold text-white">{selectedSymbol}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Main Dashboard */}
            <div className="mb-6">
              <EnhancedMarketDataDashboard onSymbolSelect={setSelectedSymbol} />
            </div>

            {/* Charts and Quick Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {/* Main Chart */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Graphique Principal - {selectedSymbol}
                  </h3>
                  <MiniChart 
                    symbol={selectedSymbol}
                    type="advanced"
                    height={400}
                    showVolume={true}
                    showIndicators={true}
                  />
                </div>
              </div>

              {/* Quick Panels */}
              <div className="space-y-4">
                {/* Price Summary */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Résumé {selectedSymbol}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h High:</span>
                      <span className="text-green-400">$45,234.67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Low:</span>
                      <span className="text-red-400">$44,123.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume 24h:</span>
                      <span className="text-gray-300">1,234.56 BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Cap:</span>
                      <span className="text-gray-300">$890.12B</span>
                    </div>
                  </div>
                </div>

                {/* Quick Chart Views */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3">Top Cryptos</h4>
                  <div className="space-y-3">
                    <MiniChart 
                      symbol="ETH-USDT"
                      type="simple"
                      height={60}
                      showTitle={true}
                    />
                    <MiniChart 
                      symbol="BNB-USDT"
                      type="simple"
                      height={60}
                      showTitle={true}
                    />
                    <MiniChart 
                      symbol="ADA-USDT"
                      type="simple"
                      height={60}
                      showTitle={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'trading' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Chart */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Graphique Trading - {selectedSymbol}
                </h3>
                <MiniChart 
                  symbol={selectedSymbol}
                  type="advanced"
                  height={500}
                  showVolume={true}
                  showIndicators={true}
                />
              </div>

              {/* Trade History */}
              <TradeHistory 
                symbol={selectedSymbol}
                className="h-96"
                maxTrades={100}
                showVolume={true}
              />
            </div>

            {/* Order Book */}
            <div>
              <EnhancedOrderBook 
                symbol={selectedSymbol}
                className="h-full"
                showSpread={true}
                maxLevels={20}
                precision={2}
              />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <>
            {/* Advanced Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Main Analysis Chart */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                    Analyse Technique Avancée - {selectedSymbol}
                  </h3>
                  <MiniChart 
                    symbol={selectedSymbol}
                    type="advanced"
                    height={400}
                    showVolume={true}
                    showIndicators={true}
                  />
                </div>
              </div>
            </div>

            {/* Technical Indicators Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Moving Averages */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">Moyennes Mobiles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">MA(20):</span>
                    <span className="text-green-400">$44,567.89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MA(50):</span>
                    <span className="text-yellow-400">$43,234.56</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MA(200):</span>
                    <span className="text-red-400">$41,234.56</span>
                  </div>
                  <div className="mt-3 p-2 bg-green-900 rounded text-center">
                    <span className="text-green-400 font-medium">Tendance Haussière</span>
                  </div>
                </div>
              </div>

              {/* RSI & Oscillators */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">Oscillateurs</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">RSI (14):</span>
                      <span className="text-yellow-400">65.34</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">MACD:</span>
                      <span className="text-green-400">+123.45</span>
                    </div>
                    <div className="text-xs text-gray-500">Signal: Achat</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Stoch:</span>
                      <span className="text-blue-400">78.90</span>
                    </div>
                    <div className="text-xs text-gray-500">Surachat</div>
                  </div>
                </div>
              </div>

              {/* Support & Resistance */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">Support & Résistance</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-red-400">
                    <div className="font-medium">Résistances:</div>
                    <div className="ml-2 space-y-1">
                      <div>R3: $46,234.56</div>
                      <div>R2: $45,678.90</div>
                      <div>R1: $45,123.45</div>
                    </div>
                  </div>
                  <div className="my-2 p-2 bg-blue-900 rounded text-center">
                    <span className="text-white font-mono">$44,567.89</span>
                    <div className="text-xs text-blue-400">Prix Actuel</div>
                  </div>
                  <div className="text-green-400">
                    <div className="font-medium">Supports:</div>
                    <div className="ml-2 space-y-1">
                      <div>S1: $44,123.45</div>
                      <div>S2: $43,567.89</div>
                      <div>S3: $42,890.12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Alertes Actives
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-900 p-3 rounded-lg border-l-4 border-blue-400">
                    <div className="text-blue-400 font-medium">BTC {'>'}= $45,000</div>
                    <div className="text-gray-400">Prix cible atteint • Il y a 2 min</div>
                  </div>
                  <div className="bg-yellow-900 p-3 rounded-lg border-l-4 border-yellow-400">
                    <div className="text-yellow-400 font-medium">ETH RSI {'>'}= 70</div>
                    <div className="text-gray-400">Surachat détecté • Il y a 5 min</div>
                  </div>
                  <div className="bg-green-900 p-3 rounded-lg border-l-4 border-green-400">
                    <div className="text-green-400 font-medium">Volume BTC +20%</div>
                    <div className="text-gray-400">Pic de volume • Il y a 8 min</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Analyses Récentes
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="font-medium text-white">Signal Achat - BTC</div>
                    <div className="text-gray-400">Croisement MA20 {'>'}= MA50</div>
                    <div className="text-xs text-blue-400 mt-1">Il y a 15 min</div>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="font-medium text-white">Résistance - ETH</div>
                    <div className="text-gray-400">Test niveau $2,500</div>
                    <div className="text-xs text-blue-400 mt-1">Il y a 30 min</div>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="font-medium text-white">Divergence - BNB</div>
                    <div className="text-gray-400">RSI vs Prix</div>
                    <div className="text-xs text-blue-400 mt-1">Il y a 1h</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
