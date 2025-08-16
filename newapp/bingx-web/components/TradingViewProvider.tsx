'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TradingViewContextType {
  isVisible: boolean;
  symbol: string;
  theme: 'light' | 'dark';
  interval: string;
  showWidget: () => void;
  hideWidget: () => void;
  toggleWidget: () => void;
  setSymbol: (symbol: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setInterval: (interval: string) => void;
  position: 'floating' | 'sidebar' | 'bottom';
  setPosition: (position: 'floating' | 'sidebar' | 'bottom') => void;
  size: 'small' | 'medium' | 'large';
  setSize: (size: 'small' | 'medium' | 'large') => void;
}

const TradingViewContext = createContext<TradingViewContextType | undefined>(undefined);

export const useTradingView = () => {
  const context = useContext(TradingViewContext);
  if (!context) {
    throw new Error('useTradingView doit être utilisé dans un TradingViewProvider');
  }
  return context;
};

interface TradingViewProviderProps {
  children: ReactNode;
}

export const TradingViewProvider: React.FC<TradingViewProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [interval, setInterval] = useState('1D');
  const [position, setPosition] = useState<'floating' | 'sidebar' | 'bottom'>('floating');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  const showWidget = () => setIsVisible(true);
  const hideWidget = () => setIsVisible(false);
  const toggleWidget = () => setIsVisible(!isVisible);

  const value: TradingViewContextType = {
    isVisible,
    symbol,
    theme,
    interval,
    position,
    size,
    showWidget,
    hideWidget,
    toggleWidget,
    setSymbol,
    setTheme,
    setInterval,
    setPosition,
    setSize,
  };

  return (
    <TradingViewContext.Provider value={value}>
      {children}
    </TradingViewContext.Provider>
  );
};