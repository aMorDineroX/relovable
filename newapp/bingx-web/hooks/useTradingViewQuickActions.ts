'use client';

import { useTradingView } from '../components/TradingViewProvider';

export interface TradingViewQuickActions {
  openBTC: () => void;
  openETH: () => void;
  openSymbol: (symbol: string) => void;
  openWithInterval: (symbol: string, interval: string) => void;
  toggleTheme: () => void;
  switchToSidebar: () => void;
  switchToBottom: () => void;
  switchToFloating: () => void;
}

export const useTradingViewQuickActions = (): TradingViewQuickActions => {
  const {
    showWidget,
    setSymbol,
    setInterval,
    setTheme,
    setPosition,
    theme,
  } = useTradingView();

  const openBTC = () => {
    setSymbol('BINANCE:BTCUSDT');
    showWidget();
  };

  const openETH = () => {
    setSymbol('BINANCE:ETHUSDT');
    showWidget();
  };

  const openSymbol = (symbol: string) => {
    setSymbol(symbol.includes(':') ? symbol : `BINANCE:${symbol}`);
    showWidget();
  };

  const openWithInterval = (symbol: string, interval: string) => {
    setSymbol(symbol.includes(':') ? symbol : `BINANCE:${symbol}`);
    setInterval(interval);
    showWidget();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const switchToSidebar = () => {
    setPosition('sidebar');
    showWidget();
  };

  const switchToBottom = () => {
    setPosition('bottom');
    showWidget();
  };

  const switchToFloating = () => {
    setPosition('floating');
    showWidget();
  };

  return {
    openBTC,
    openETH,
    openSymbol,
    openWithInterval,
    toggleTheme,
    switchToSidebar,
    switchToBottom,
    switchToFloating,
  };
};

export default useTradingViewQuickActions;