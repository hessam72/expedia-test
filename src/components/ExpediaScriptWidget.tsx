'use client';

import { useExpedia } from '@/contexts/ExpediaWidgetManager';
import { useEffect, useRef, useState } from 'react';

interface ExpediaScriptWidgetProps {
  program?: string;
  lobs?: string;
  network?: string;
  camref: string;
  pubref?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ExpediaScriptWidget: React.FC<ExpediaScriptWidgetProps> = ({
  program = 'us-expedia',
  lobs = 'stays,flights',
  network = 'pz',
  camref,
  pubref,
  className,
  style
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isScriptLoaded, initializeWidget } = useExpedia();

  useEffect(() => {
    if (!isScriptLoaded || !widgetRef.current) return;

    console.log('🚀 Initializing widget...');
    
    // Initialize with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeWidget(widgetRef.current!);
      
      // Check for content
      const checkContent = setInterval(() => {
        if (widgetRef.current?.children.length) {
          console.log('✅ Widget content detected');
          setIsLoading(false);
          clearInterval(checkContent);
        }
      }, 500);

      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkContent);
        if (isLoading) {
          console.error('❌ Widget failed to load content');
        }
      }, 15000);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isScriptLoaded, initializeWidget]);

  return (
    <div style={{ position: 'relative', ...style }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '8px',
        }}>
          Loading Expedia Widget...
        </div>
      )}
      
      <div 
        ref={widgetRef}
        className={`eg-widget ${className || ''}`}
        data-widget="search"
        data-program={program}
        data-lobs={lobs}
        data-network={network}
        data-camref={camref}
        data-pubref={pubref}
        style={{
          width: '100%',
          minHeight: '400px',
          visibility: isLoading ? 'hidden' : 'visible'
        }}
      />
    </div>
  );
};

export default ExpediaScriptWidget;