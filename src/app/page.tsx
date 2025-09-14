
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  useEffect(() => {
    const checkWidgetLoaded = () => {
      const widgetElement = document.querySelector('.eg-widget');
      const loadingElement = document.getElementById('widget-loading');
      const statusElement = document.getElementById('load-status');

      if (!widgetElement || !loadingElement || !statusElement) return false;

      const hasContent = widgetElement && (
        widgetElement.children.length > 0 ||
        widgetElement.innerHTML.trim().length > 0
      );

      if (hasContent) {
        (loadingElement as HTMLElement).style.display = 'none';
        (widgetElement as HTMLElement).style.display = 'block';
        statusElement.textContent = 'Widget Status: Loaded Successfully ✅';
        (statusElement as HTMLElement).style.color = '#22543d';
        console.log('✅ Expedia widget loaded successfully');
        return true;
      }
      return false;
    };

    const timer = setTimeout(() => {
      if (!checkWidgetLoaded()) {
        const interval = setInterval(() => {
          if (checkWidgetLoaded()) {
            clearInterval(interval);
          }
        }, 500);

        setTimeout(() => {
          clearInterval(interval);
          const statusElement = document.getElementById('load-status');
          const loadingElement = document.getElementById('widget-loading');

          if (statusElement && loadingElement && (document.querySelector('.eg-widget') as HTMLElement)?.style.display === 'none') {
            statusElement.textContent = 'Widget Status: Failed to Load ❌';
            (statusElement as HTMLElement).style.color = '#e53e3e';
            loadingElement.innerHTML = `
              <div style="text-align: center; color: #e53e3e;">
                ❌ Widget failed to load<br>
                <small>This might be due to network restrictions or widget configuration issues</small>
              </div>
            `;
          }
        }, 90000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script
        src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"
        className="eg-widgets-script"
        strategy="afterInteractive"
      />

      <div className="min-h-screen" style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        margin: 0,
        padding: '40px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h1 style={{
              margin: '0 0 10px 0',
              fontSize: '2.5em',
              fontWeight: '700'
            }}>
              🌍 Expedia Widget Integration
            </h1>
            <p style={{
              margin: 0,
              fontSize: '1.2em',
              opacity: 0.9
            }}>
              Testing Expedia Group Widget with Wurora Integration
            </p>
          </div>

          <div style={{ padding: '40px' }}>
            <div style={{
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px',
              position: 'relative'
            }}>
              <div style={{
                content: '✈️ 🏨',
                position: 'absolute',
                top: '-15px',
                left: '30px',
                background: 'white',
                padding: '0 15px',
                fontSize: '1.5em'
              }}>
                ✈️ 🏨
              </div>

              <h2 style={{
                margin: '0 0 20px 0',
                color: '#2d3748',
                fontSize: '1.5em',
                fontWeight: '600'
              }}>
                Search Hotels & Flights
              </h2>
              <p style={{
                color: '#4a5568',
                marginBottom: '25px',
                lineHeight: '1.6'
              }}>
                This widget allows users to search for hotels and flights directly through Expedia&apos;s platform.
                The widget is configured with Wurora&apos;s affiliate parameters for tracking and commission purposes.
              </p>

              <div
                id="widget-loading"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  color: '#718096',
                  fontSize: '1.1em'
                }}
              >
                <div style={{
                  border: '4px solid #e2e8f0',
                  borderLeft: '4px solid #667eea',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 1s linear infinite',
                  marginRight: '15px'
                }}></div>
                Loading Expedia Widget...
              </div>

              <div
                className="eg-widget"
                data-widget="search"
                data-program="us-expedia"
                data-lobs="stays,flights"
                data-network="pz"
                data-camref="1110ldRms"
                data-pubref="Wurora"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  background: 'white',
                  minHeight: '400px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
              </div>
            </div>

            <div style={{
              background: '#e6fffa',
              border: '1px solid #81e6d9',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <div style={{
                color: '#234e52',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                Widget Configuration Details
              </div>
              <div style={{
                color: '#285e61',
                lineHeight: '1.6'
              }}>
                This Expedia widget is configured with the following parameters:
                <div style={{
                  background: '#f7fafc',
                  borderRadius: '8px',
                  padding: '15px',
                  marginTop: '15px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.9em',
                  color: '#4a5568'
                }}>
                  • <strong>Program:</strong> us-expedia (US Expedia program)<br/>
                  • <strong>Products:</strong> stays, flights (Hotels and Flight bookings)<br/>
                  • <strong>Network:</strong> pz (Partner Zone network)<br/>
                  • <strong>Campaign Reference:</strong> 1110ldRms (Tracking ID)<br/>
                  • <strong>Publisher Reference:</strong> Wurora (Your brand identifier)
                </div>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#718096',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p>Powered by Expedia Group Partner Solutions | Integrated with Wurora</p>
            <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
              <span id="load-status">Widget Status: Loading...</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .container {
            padding: 20px !important;
          }
        }
      `}</style>
    </>
  );
}