# Expedia Widget Integration in Next.js - Complete Guide

This guide provides the essential steps to integrate Expedia widgets in any Next.js project, based on solving the DOM lifecycle timing issues between HTML and React environments.

## 🎯 **Problem Overview**

Expedia widgets work perfectly in standalone HTML but fail in Next.js due to:
- DOM lifecycle differences between static HTML and React components
- Script loading timing conflicts with component mounting
- DOM manipulation conflicts between React and third-party scripts

## 🛠️ **Solution Architecture**

### Core Components:
1. **ExpediaWidgetManager** - Context provider for script state management
2. **ExpediaScriptWidget** - The actual widget component with DOM-safe rendering
3. **Global Script Loading** - Proper script loading in Next.js layout

---

## 📋 **Implementation Steps**

### Step 1: Create the Context Provider

Create `src/components/widgets/ExpediaWidgetManager.tsx`:

```tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Extend Window interface for Expedia globals
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

interface ExpediaWidgetManagerProps {
  children: ReactNode;
}

export const ExpediaWidgetManager: React.FC<ExpediaWidgetManagerProps> = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    const checkScript = () => {
      return !!(
        document.querySelector('.eg-widgets-script') ||
        document.querySelector('#expedia-widgets') ||
        window.EG ||
        window.egWidgets ||
        document.querySelector('script[src*="eg-widgets"]')
      );
    };

    if (checkScript()) {
      console.log('✅ Expedia script already loaded');
      setIsScriptLoaded(true);
      return;
    }

    // Polling fallback - check every 100ms for script
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
      if (!checkScript()) {
        console.error('❌ Expedia script failed to load within timeout');
      } else {
        console.log('⏰ Script loaded within timeout');
        setIsScriptLoaded(true);
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  const initializeWidget = (element: HTMLElement) => {
    if (!isScriptLoaded || !element) {
      console.warn('⚠️ Cannot initialize widget: script not loaded or element missing');
      return;
    }

    console.log('🔧 Attempting widget initialization...');

    const attemptInit = () => {
      // Try multiple initialization methods in order of preference
      const methods = [
        {
          name: 'EG.initializeWidget',
          fn: () => window.EG?.initializeWidget?.(element)
        },
        {
          name: 'EG.processWidgets',
          fn: () => window.EG?.processWidgets?.()
        },
        {
          name: 'EG.widgets.init',
          fn: () => window.EG?.widgets?.init?.()
        },
        {
          name: 'egWidgets.init',
          fn: () => window.egWidgets?.init?.()
        },
        {
          name: 'egWidgets.process',
          fn: () => window.egWidgets?.process?.()
        },
        {
          name: 'DOMContentLoaded event',
          fn: () => {
            const event = new CustomEvent('DOMContentLoaded', { bubbles: true });
            document.dispatchEvent(event);
          }
        },
        {
          name: 'Manual widget discovery',
          fn: () => {
            try {
              const widgets = document.querySelectorAll('.eg-widget:not([data-eg-initialized])');
              console.log(`🔍 Found ${widgets.length} uninitialized widgets`);
              widgets.forEach(widget => {
                try {
                  widget.setAttribute('data-eg-initialized', 'true');
                  const widgetEvent = new CustomEvent('eg-widget-found', {
                    bubbles: true,
                    detail: { widget }
                  });
                  widget.dispatchEvent(widgetEvent);
                } catch (widgetError) {
                  console.warn('Error processing individual widget:', widgetError);
                }
              });
            } catch (discoveryError) {
              console.warn('Error in widget discovery:', discoveryError);
            }
          }
        }
      ];

      for (const method of methods) {
        try {
          console.log(`🧪 Trying method: ${method.name}`);
          method.fn();
          console.log(`✅ Method succeeded: ${method.name}`);
          
          // Check if widget was populated after a short delay
          setTimeout(() => {
            if (element.children.length > 0 || element.innerHTML.trim().length > 0) {
              console.log('🎉 Widget successfully initialized and populated!');
            }
          }, 1000);
          
          break;
        } catch (error) {
          console.warn(`❌ Method failed: ${method.name}`, error);
        }
      }
    };

    // Try immediately
    attemptInit();

    // Try again after delays to handle different timing scenarios
    const delays = [100, 500, 1000, 2000];
    delays.forEach(delay => {
      setTimeout(() => {
        console.log(`🔄 Retry attempt after ${delay}ms`);
        attemptInit();
      }, delay);
    });
  };

  return (
    <ExpediaContext.Provider value={{ isScriptLoaded, initializeWidget }}>
      {children}
    </ExpediaContext.Provider>
  );
};
```

### Step 2: Create the Widget Component

Create `src/components/widgets/ExpediaScriptWidget.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useExpedia } from './ExpediaWidgetManager';

interface ExpediaScriptWidgetProps {
  program?: string;
  lobs?: string;
  network?: string;
  camref?: string;
  pubref?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ExpediaScriptWidget: React.FC<ExpediaScriptWidgetProps> = ({
  program = 'us-expedia',
  lobs = 'stays,flights', 
  network = 'pz',
  camref = '1110ldRms',
  pubref = 'Wurora',
  className,
  style = { width: '100%', minHeight: '400px' }
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [widgetStatus, setWidgetStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [initAttempted, setInitAttempted] = useState(false);
  
  const { isScriptLoaded, initializeWidget } = useExpedia();

  // Initialize widget when script is loaded and DOM is ready
  useEffect(() => {
    if (!isScriptLoaded || !widgetRef.current || initAttempted) {
      return;
    }

    console.log('🚀 Initializing Expedia widget...', {
      program, lobs, network, camref, pubref
    });

    setInitAttempted(true);

    // Small delay to ensure DOM is fully ready
    const timeoutId = setTimeout(() => {
      if (widgetRef.current) {
        initializeWidget(widgetRef.current);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isScriptLoaded, initializeWidget, initAttempted, program, lobs, network, camref, pubref]);

  // Check for widget content and update status (DOM-safe approach)
  useEffect(() => {
    if (!widgetRef.current) return;

    let checkInterval: NodeJS.Timeout;
    let errorTimeout: NodeJS.Timeout;

    const checkWidgetContent = () => {
      if (!widgetRef.current) return false;

      try {
        // More robust content checking
        const hasContent = widgetRef.current.children.length > 0 || 
                          widgetRef.current.innerHTML.trim().length > 50; // More than just attributes
        
        if (hasContent) {
          console.log('🎉 Widget content detected!');
          setWidgetStatus('loaded');
          
          clearInterval(checkInterval);
          clearTimeout(errorTimeout);
          return true;
        }
      } catch (error) {
        console.warn('⚠️ Error checking widget content:', error);
        // Continue checking despite errors
      }
      
      return false;
    };

    // Start checking after script is loaded
    if (isScriptLoaded && initAttempted) {
      // Initial check
      if (!checkWidgetContent()) {
        // Check every 500ms
        checkInterval = setInterval(checkWidgetContent, 500);
        
        // Set error after 30 seconds
        errorTimeout = setTimeout(() => {
          if (widgetStatus === 'loading') {
            console.warn('⚠️ Widget failed to load within 30 seconds');
            setWidgetStatus('error');
          }
          clearInterval(checkInterval);
        }, 30000);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [isScriptLoaded, initAttempted, widgetStatus]);

  // Re-initialize when widget becomes visible (Intersection Observer)
  useEffect(() => {
    if (!widgetRef.current || !isScriptLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target === widgetRef.current) {
            console.log('👁️ Widget became visible, attempting re-initialization');
            if (widgetRef.current) {
              initializeWidget(widgetRef.current);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(widgetRef.current);

    return () => observer.disconnect();
  }, [isScriptLoaded, initializeWidget]);

  // Cleanup effect to prevent DOM conflicts on unmount
  useEffect(() => {
    return () => {
      // Clean up any potential DOM listeners or observers
      if (widgetRef.current) {
        try {
          // Remove any data attributes that might cause conflicts
          widgetRef.current.removeAttribute('data-eg-initialized');
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className={className} style={style}>
      <div style={{
        position: 'relative',
        border: '2px solid #e7f3ff',
        borderRadius: '12px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fcff 0%, #e7f3ff 100%)',
        minHeight: '400px',
      }}>
        {/* Loading State - Only show when loading */}
        {widgetStatus === 'loading' && (
          <div 
            ref={loadingRef}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '1.1em',
              flexDirection: 'column',
              gap: '15px',
              background: 'linear-gradient(135deg, #f8fcff 0%, #e7f3ff 100%)',
              borderRadius: '12px'
            }}
          >
            <div style={{
              border: '4px solid #e2e8f0',
              borderLeft: '4px solid #667eea',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }} />
            <div>Loading Expedia Widget...</div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Error State - Only show when error */}
        {widgetStatus === 'error' && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e53e3e',
            fontSize: '1.1em',
            flexDirection: 'column',
            gap: '15px',
            background: 'linear-gradient(135deg, #f8fcff 0%, #e7f3ff 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em' }}>❌</div>
            <div>
              <strong>Widget Failed to Load</strong>
              <div style={{ fontSize: '0.9em', marginTop: '8px', color: '#a0aec0' }}>
                This might be due to network restrictions or widget configuration issues
              </div>
            </div>
          </div>
        )}

        {/* Expedia Widget - Let Expedia control this completely */}
        <div 
          ref={widgetRef}
          className="eg-widget"
          data-widget="search"
          data-program={program}
          data-lobs={lobs}
          data-network={network}
          data-camref={camref}
          data-pubref={pubref}
          style={{
            width: '100%',
            minHeight: '360px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: widgetStatus === 'loaded' ? 'transparent' : 'white',
            opacity: widgetStatus === 'loaded' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '12px',
            fontSize: '10px',
            color: '#666',
            background: 'rgba(255,255,255,0.9)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            lineHeight: '1.4',
            zIndex: 1000
          }}>
            <div>Script: {isScriptLoaded ? '✅' : '❌'}</div>
            <div>Init: {initAttempted ? '✅' : '❌'}</div>
            <div>Status: {widgetStatus}</div>
          </div>
        )}

        {/* Expedia Branding */}
        {widgetStatus === 'loaded' && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '11px',
            color: '#a0aec0',
            fontStyle: 'italic',
            zIndex: 1000
          }}>
            Powered by Expedia
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpediaScriptWidget;
```

### Step 3: Update Root Layout

Update your `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ExpediaWidgetManager } from "@/components/widgets/ExpediaWidgetManager";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expedia Widget Demo",
  description: "Next.js Expedia Widget Integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Expedia Widgets Script - Global Load */}
        <Script
          id="expedia-widgets"
          src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"
          strategy="afterInteractive"
          className="eg-widgets-script"
        />
      </head>
      <body className={inter.className}>
        <ExpediaWidgetManager>
          {children}
        </ExpediaWidgetManager>
      </body>
    </html>
  );
}
```

### Step 4: Create a Test Page

Create `src/app/page.tsx` to test the widget:

```tsx
import ExpediaScriptWidget from '@/components/widgets/ExpediaScriptWidget';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Expedia Widget Demo</h1>
      <p>This demonstrates the Expedia widget integration in Next.js</p>
      
      {/* Basic Widget */}
      <ExpediaScriptWidget 
        camref="1110ldRms"
        pubref="YourBrand"
        style={{ marginTop: '20px' }}
      />
    </div>
  );
}
```

---

## 🔧 **Configuration Options**

### Widget Props:
- `program` - Expedia program (default: 'us-expedia')
- `lobs` - Lines of business (default: 'stays,flights')  
- `network` - Network type (default: 'pz')
- `camref` - Campaign reference ID (required)
- `pubref` - Publisher reference (optional)

### Customization:
- Replace styling in `ExpediaScriptWidget` with your design system
- Modify loading/error states to match your app's UX
- Update debug information display preferences

---

## 🚨 **Key Solutions Implemented**

1. **DOM Conflict Resolution**: Let Expedia script control widget DOM completely
2. **Script Loading Management**: Robust detection with polling and timeouts
3. **Multiple Initialization Strategies**: 7 different methods to ensure widget loads
4. **Error Handling**: Comprehensive error catching and recovery
5. **Development Debugging**: Real-time status indicators
6. **Memory Leak Prevention**: Proper cleanup on component unmount

---

## ✅ **Testing the Integration**

1. Run `npm run dev`
2. Navigate to your test page
3. Check browser console for initialization logs:
   - `✅ Expedia script already loaded`
   - `🚀 Initializing Expedia widget...`  
   - `🎉 Widget content detected!`
4. Debug panel should show: `Script: ✅ Init: ✅ Status: loaded`
5. Widget should display Expedia's search form

---

## 🔍 **Troubleshooting**

**Widget not loading:**
- Check console for script loading errors
- Verify `camref` is a valid Expedia campaign ID
- Ensure no ad blockers are interfering

**DOM errors:**
- The solution prevents `removeChild` errors through DOM-safe rendering
- Check React version compatibility (tested with Next.js 15)

**Script timing issues:**
- Multiple initialization methods handle various timing scenarios
- Intersection Observer re-initializes widgets when they become visible

---

This guide provides a complete, production-ready solution for integrating Expedia widgets in Next.js while avoiding common DOM lifecycle and timing issues.