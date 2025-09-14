'use client';

import { useEffect, useRef } from 'react';

interface ExpediaHtmlWidgetProps {
  camref?: string;
  pubref?: string;
  program?: string;
  lobs?: string;
  network?: string;
}

const ExpediaHtmlWidget: React.FC<ExpediaHtmlWidgetProps> = ({
  camref = '1110ldRms',
  pubref = 'Wurora',
  program = 'us-expedia',
  lobs = 'stays,flights',
  network = 'pz'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // First, ensure script is loaded BEFORE setting up widget
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('.eg-widgets-script');
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js';
        script.className = 'eg-widgets-script';
        script.onload = () => {
          console.log('✅ Expedia script loaded successfully');
          resolve();
        };
        script.onerror = (e) => {
          console.error('❌ Expedia script failed to load:', e);
          reject(e);
        };
        document.head.appendChild(script);
      });
    };

    const setupWidget = () => {
      if (!containerRef.current) return;

      const htmlContent = `
        <style>
          .widget-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            text-align: center;
            color: white;
          }
          
          .widget-header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: 700;
          }
          
          .widget-header p {
            margin: 0;
            font-size: 1.2em;
            opacity: 0.9;
          }
          
          .widget-content {
            padding: 40px;
          }
          
          .widget-section {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            position: relative;
          }
          
          .widget-section::before {
            content: '✈️ 🏨';
            position: absolute;
            top: -15px;
            left: 30px;
            background: white;
            padding: 0 15px;
            font-size: 1.5em;
          }
          
          .widget-title {
            margin: 0 0 20px 0;
            color: #2d3748;
            font-size: 1.5em;
            font-weight: 600;
          }
          
          .widget-description {
            color: #4a5568;
            margin-bottom: 25px;
            line-height: 1.6;
          }
          
          .eg-widget {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            background: white;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .widget-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: #718096;
            font-size: 1.1em;
          }
          
          .spinner {
            border: 4px solid #e2e8f0;
            border-left: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-right: 15px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .info-section {
            background: #e6fffa;
            border: 1px solid #81e6d9;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .info-title {
            color: #234e52;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .info-text {
            color: #285e61;
            line-height: 1.6;
          }
          
          .tech-details {
            background: #f7fafc;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #4a5568;
          }
          
          .widget-footer {
            text-align: center;
            padding: 30px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
        </style>
        
        <div class="widget-container">
          <div class="widget-header">
            <h1>🌍 Expedia Widget Integration</h1>
            <p>Testing Expedia Group Widget with Wurora Integration</p>
          </div>
          
          <div class="widget-content">
            <div class="widget-section">
              <h2 class="widget-title">Search Hotels & Flights</h2>
              <p class="widget-description">
                This widget allows users to search for hotels and flights directly through Expedia's platform. 
                The widget is configured with Wurora's affiliate parameters for tracking and commission purposes.
              </p>
              
              <div class="widget-loading" id="widget-loading-${Date.now()}">
                <div class="spinner"></div>
                Loading Expedia Widget...
              </div>
              
              <div class="eg-widget" 
                   data-widget="search" 
                   data-program="${program}" 
                   data-lobs="${lobs}" 
                   data-network="${network}" 
                   data-camref="${camref}" 
                   data-pubref="${pubref}"
                   id="widget-${Date.now()}"
                   style="display: none;">
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-title">Widget Configuration Details</div>
              <div class="info-text">
                This Expedia widget is configured with the following parameters:
                <div class="tech-details">
                  • <strong>Program:</strong> ${program} (US Expedia program)<br>
                  • <strong>Products:</strong> ${lobs} (Hotels and Flight bookings)<br>
                  • <strong>Network:</strong> ${network} (Partner Zone network)<br>
                  • <strong>Campaign Reference:</strong> ${camref} (Tracking ID)<br>
                  • <strong>Publisher Reference:</strong> ${pubref} (Your brand identifier)
                </div>
              </div>
            </div>
          </div>
          
          <div class="widget-footer">
            <p>Powered by Expedia Group Partner Solutions | Integrated with Wurora</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
              <span id="load-status-${Date.now()}">Widget Status: Loading...</span>
            </p>
          </div>
        </div>
      `;

      containerRef.current.innerHTML = htmlContent;

      // NOW initialize the widget after DOM is ready
      const timestamp = Date.now();
      const widgetElement = document.getElementById(`widget-${timestamp}`) as HTMLElement;
      const loadingElement = document.getElementById(`widget-loading-${timestamp}`) as HTMLElement;
      const statusElement = document.getElementById(`load-status-${timestamp}`) as HTMLElement;

      if (!widgetElement || !loadingElement || !statusElement) {
        console.error('Widget elements not found');
        return;
      }

      console.log('🔧 Widget Configuration:', { program, lobs, network, camref, pubref });

      let loadTimeout: NodeJS.Timeout;
      let checkInterval: NodeJS.Timeout;

      // Function to check if widget has loaded
      const checkWidgetLoaded = () => {
        const hasContent = widgetElement && (
          widgetElement.children.length > 0 || 
          widgetElement.innerHTML.trim().length > 0
        );

        if (hasContent) {
          clearInterval(checkInterval);
          clearTimeout(loadTimeout);

          loadingElement.style.display = 'none';
          widgetElement.style.display = 'block';
          statusElement.textContent = 'Widget Status: Loaded Successfully ✅';
          statusElement.style.color = '#22543d';

          console.log('✅ Expedia widget loaded successfully');
          return true;
        }
        return false;
      };

      // Wait a bit more before checking
      setTimeout(() => {
        console.log('🚀 Starting widget load check...');
        if (!checkWidgetLoaded()) {
          checkInterval = setInterval(checkWidgetLoaded, 500);
        }
      }, 2000); // Increased delay

      // Timeout after 20 seconds
      loadTimeout = setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }

        if (widgetElement.style.display === 'none') {
          statusElement.textContent = 'Widget Status: Failed to Load ❌';
          statusElement.style.color = '#e53e3e';
          loadingElement.innerHTML = `
            <div style="text-align: center; color: #e53e3e;">
              ❌ Widget failed to load<br>
              <small>Script loaded but widget not initializing. Check console for errors.</small>
            </div>
          `;
          console.warn('⚠️ Expedia widget failed to load within timeout period');
        }
      }, 20000);
    };

    // Load script first, THEN setup widget
    loadScript()
      .then(() => {
        console.log('✅ Script loaded, setting up widget in 1 second...');
        setTimeout(setupWidget, 1000);
      })
      .catch((error) => {
        console.error('❌ Failed to load script:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="text-align: center; color: #e53e3e; padding: 40px;">
              ❌ Failed to load Expedia script<br>
              <small>Check network connection and console for details</small>
            </div>
          `;
        }
      });

    // Cleanup
    return () => {
      // Clear any running intervals
    };
  }, [camref, pubref, program, lobs, network]);

  return (
    <div 
      ref={containerRef} 
      className="expedia-html-widget"
      style={{ 
        width: '100%',
        minHeight: '600px'
      }}
    />
  );
};

export default ExpediaHtmlWidget;