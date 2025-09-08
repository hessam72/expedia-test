'use client';

import { useExpedia } from '@/contexts/ExpediaWidgetManager';
import { useEffect, useRef } from 'react';

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
  const { isScriptLoaded, initializeWidget } = useExpedia();

  useEffect(() => {
    if (isScriptLoaded && widgetRef.current) {
      initializeWidget(widgetRef.current);
    }
  }, [isScriptLoaded, initializeWidget]);

  return (
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
        width: '400px',
        minHeight: '400px',
        ...style
      }}
    />
  );
};

export default ExpediaScriptWidget;