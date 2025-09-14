'use client';

import { useEffect, useRef } from 'react';

interface ExpediaWidgetProps {
  program?: string;
  lobs?: string;
  network?: string;
  camref: string;
  pubref?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ExpediaWidget: React.FC<ExpediaWidgetProps> = ({
  program = 'us-expedia',
  lobs = 'stays,flights',
  network = 'pz',
  camref,
  pubref,
  className,
  style
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeWidget = () => {
      if (!widgetRef.current) return;
      
      console.log('🚀 Initializing Expedia widget');
      
      // Clear any existing content
      widgetRef.current.innerHTML = '';
      
      // Set widget attributes
      const widget = widgetRef.current;
      widget.setAttribute('data-widget', 'search');
      widget.setAttribute('data-program', program);
      widget.setAttribute('data-lobs', lobs);
      widget.setAttribute('data-network', network);
      widget.setAttribute('data-camref', camref);
      if (pubref) widget.setAttribute('data-pubref', pubref);
      
      // Initialize widget with multiple fallback methods
      const tryInitialization = () => {
        try {
          // Method 1: Check for EG global
          if (typeof window !== 'undefined' && (window as any).EG) {
            console.log('Found EG global, initializing...');
            const EG = (window as any).EG;
            if (EG.processWidgets) {
              EG.processWidgets();
              return true;
            }
            if (EG.initializeWidget) {
              EG.initializeWidget(widget);
              return true;
            }
          }
          
          // Method 2: Trigger DOMContentLoaded for late-loaded widgets
          if (typeof document !== 'undefined') {
            const event = new Event('DOMContentLoaded', { bubbles: true });
            document.dispatchEvent(event);
          }
          
          return false;
        } catch (error) {
          console.warn('Widget initialization attempt failed:', error);
          return false;
        }
      };

      // Try immediate initialization
      if (!tryInitialization()) {
        // If immediate fails, wait for script load event
        const handleScriptLoaded = () => {
          setTimeout(tryInitialization, 100);
        };

        window.addEventListener('expediaScriptLoaded', handleScriptLoaded);
        
        // Also try with a delay in case script is already loaded
        setTimeout(tryInitialization, 500);
        setTimeout(tryInitialization, 1000);
        setTimeout(tryInitialization, 2000);

        return () => {
          window.removeEventListener('expediaScriptLoaded', handleScriptLoaded);
        };
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeWidget, 100);

    return () => clearTimeout(timeoutId);
  }, [program, lobs, network, camref, pubref]);

  return (
    <div style={style}>
      <div 
        ref={widgetRef}
        className={`eg-widget ${className || ''}`}
        style={{
          width: '100%',
          minHeight: '400px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff'
        }}
      />
    </div>
  );
};

export default ExpediaWidget;