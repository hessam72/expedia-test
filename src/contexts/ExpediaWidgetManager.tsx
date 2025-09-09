'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

declare global {
  interface Window {
    EG?: {
      initializeWidget?: (element: HTMLElement) => void;
      processWidgets?: () => void;
      widgets?: {
        init?: () => void;
        process?: () => void;
        refresh?: () => void;
      };
    };
    egWidgets?: {
      init?: () => void;
      process?: () => void;
      refresh?: () => void;
    };
  }
}

interface ExpediaContextType {
  isScriptLoaded: boolean;
  initializeWidget: (element: HTMLElement) => void;
}

const ExpediaContext = createContext<ExpediaContextType>({
  isScriptLoaded: false,
  initializeWidget: () => {},
});

export const useExpedia = () => useContext(ExpediaContext);

export const ExpediaWidgetManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // More robust script loading check
    const checkScript = () => {
      return !!(
        document.querySelector('.eg-widgets-script') ||
        document.querySelector('#expedia-widgets') ||
        window.EG ||
        window.egWidgets ||
        document.querySelector('script[src*="eg-widgets"]')
      );
    };

    // Initial check
    if (checkScript()) {
      console.log('✅ Expedia script already loaded');
      setIsScriptLoaded(true);
      return;
    }

    // Polling with timeout
    const checkInterval = setInterval(() => {
      if (checkScript()) {
        console.log('🔍 Script detected via polling');
        setIsScriptLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.error('❌ Script load timeout');
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  const initializeWidget = (element: HTMLElement) => {
    if (!isScriptLoaded || !element) {
      console.warn('⚠️ Cannot initialize: script not loaded or element missing');
      return;
    }

    console.log('🔧 Attempting widget initialization...');

    // Try multiple initialization methods
    const initMethods = [
      () => window.EG?.initializeWidget?.(element),
      () => window.EG?.processWidgets?.(),
      () => window.EG?.widgets?.init?.(),
      () => window.egWidgets?.init?.(),
      () => {
        const event = new Event('DOMContentLoaded', { bubbles: true });
        document.dispatchEvent(event);
      }
    ];

    for (const method of initMethods) {
      try {
        method();
      } catch (error) {
        console.warn('Method failed:', error);
      }
    }
  };

  return (
    <ExpediaContext.Provider value={{ isScriptLoaded, initializeWidget }}>
      {children}
    </ExpediaContext.Provider>
  );
};