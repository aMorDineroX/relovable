'use client';

import { useEffect, useRef, useState } from 'react';

interface TradingViewWidgetProps {
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

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  width = '100%',
  height = 400,
  className = '',
  interval = '1D',
  timezone = 'Etc/UTC',
  style = 'candles',
  locale = 'fr',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  allow_symbol_change = true,
  container_id,
  autosize = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [widgetId] = useState(() => container_id || `tradingview_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Vérifier si le script TradingView est déjà chargé
    if (window.TradingView) {
      setIsScriptLoaded(true);
      return;
    }

    // Charger le script TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Erreur lors du chargement du script TradingView');
    };

    document.head.appendChild(script);

    return () => {
      // Nettoyer le script si le composant est démonté
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !window.TradingView || !containerRef.current) {
      return;
    }

    // Nettoyer le widget précédent si il existe
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.warn('Erreur lors de la suppression du widget précédent:', e);
      }
    }

    // Vider le conteneur
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      // Créer le nouveau widget
      widgetRef.current = new window.TradingView.widget({
        autosize: autosize,
        width: autosize ? undefined : width,
        height: autosize ? undefined : height,
        symbol: symbol,
        interval: interval,
        timezone: timezone,
        theme: theme,
        style: style,
        locale: locale,
        toolbar_bg: toolbar_bg,
        enable_publishing: enable_publishing,
        allow_symbol_change: allow_symbol_change,
        container_id: widgetId,
        // Options avancées
        withdateranges: true,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        save_image: true,
        studies: [
          'MASimple@tv-basicstudies',
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies'
        ],
        show_popup_button: true,
        popup_width: 1000,
        popup_height: 650,
      });
    } catch (error) {
      console.error('Erreur lors de la création du widget TradingView:', error);
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.warn('Erreur lors du nettoyage du widget:', e);
        }
      }
    };
  }, [
    isScriptLoaded,
    symbol,
    theme,
    width,
    height,
    interval,
    timezone,
    style,
    locale,
    toolbar_bg,
    enable_publishing,
    allow_symbol_change,
    widgetId,
    autosize,
  ]);

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div
        ref={containerRef}
        id={widgetId}
        style={{
          width: autosize ? '100%' : width,
          height: autosize ? '100%' : height,
        }}
      />
      {!isScriptLoaded && (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement du graphique TradingView...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewWidget;