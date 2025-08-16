import React, { useState } from 'react';

interface AccountTypeSelectorProps {
  accountType: 'perpetual' | 'standard';
  onAccountTypeChange: (type: 'perpetual' | 'standard') => void;
}

export default function AccountTypeSelector({ accountType, onAccountTypeChange }: AccountTypeSelectorProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Type de Compte Futures</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${accountType === 'perpetual' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
          <span className="text-sm text-gray-300">
            {accountType === 'perpetual' ? 'Perpetual' : 'Standard'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAccountTypeChange('perpetual')}
          className={`p-3 rounded-lg border transition-all ${
            accountType === 'perpetual'
              ? 'bg-blue-500/20 border-blue-400 text-blue-100'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <div className="text-left">
            <div className="font-medium text-sm">Perpetual Futures</div>
            <div className="text-xs opacity-70 mt-1">
              Contrats sans expiration
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onAccountTypeChange('standard')}
          className={`p-3 rounded-lg border transition-all ${
            accountType === 'standard'
              ? 'bg-orange-500/20 border-orange-400 text-orange-100'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <div className="text-left">
            <div className="font-medium text-sm">Standard Futures</div>
            <div className="text-xs opacity-70 mt-1">
              Contrats avec expiration
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-black/20 rounded-lg">
        <div className="text-xs text-gray-300">
          <div className="font-medium mb-1">Endpoints utilisés :</div>
          <div className="font-mono text-xs">
            {accountType === 'perpetual' 
              ? '/openApi/swap/v2/...' 
              : '/openApi/futures/v1/...'
            }
          </div>
        </div>
      </div>
    </div>
  );
}