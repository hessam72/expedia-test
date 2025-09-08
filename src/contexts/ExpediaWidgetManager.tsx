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
    const checkScript = () => {
      return !!(
        document.querySelector('.eg-widgets-script') ||
        window.EG ||
        window.egWidgets
      );
    };

    if (checkScript()) {
      setIsScriptLoaded(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (checkScript()) {
        setIsScriptLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  const initializeWidget = (element: HTMLElement) => {
    if (!isScriptLoaded || !element) return;

    try {
      if (window.EG?.initializeWidget) {
        window.EG.initializeWidget(element);
      } else if (window.EG?.processWidgets) {
        window.EG.processWidgets();
      } else if (window.egWidgets?.init) {
        window.egWidgets.init();
      }
    } catch (error) {
      console.error('Failed to initialize Expedia widget:', error);
    }
  };

  return (
    <ExpediaContext.Provider value={{ isScriptLoaded, initializeWidget }}>
      {children}
    </ExpediaContext.Provider>
  );
};