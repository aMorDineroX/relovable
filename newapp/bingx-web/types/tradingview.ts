// Types TypeScript pour l'intégration TradingView

export interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  className?: string;
  interval?: string;
  timezone?: string;
  style?: 'bars' | 'candles' | 'line' | 'area' | 'heiken ashi' | 'hollow candles' | 'baseline';
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
  autosize?: boolean;
}

export interface TradingViewContextType {
  isVisible: boolean;
  symbol: string;
  theme: 'light' | 'dark';
  interval: string;
  position: 'floating' | 'sidebar' | 'bottom';
  size: 'small' | 'medium' | 'large';
  showWidget: () => void;
  hideWidget: () => void;
  toggleWidget: () => void;
  setSymbol: (symbol: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setInterval: (interval: string) => void;
  setPosition: (position: 'floating' | 'sidebar' | 'bottom') => void;
  setSize: (size: 'small' | 'medium' | 'large') => void;
}

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

declare global {
  interface Window {
    TradingView: any;
  }
}