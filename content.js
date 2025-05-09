(function() {
    let originalConsole = {};
    let currentConfig = {};
    let isCapturingActive = false;
  
    function initializeConsoleCapture() {
      if (isCapturingActive) return;
  
      originalConsole.log = console.log;
      originalConsole.warn = console.warn;
      originalConsole.error = console.error;
  
      console.log = function(...args) {
        sendCapturedLog('info', args);
        originalConsole.log.apply(console, args);
      };
  
      console.warn = function(...args) {
        sendCapturedLog('warn', args);
        originalConsole.warn.apply(console, args);
      };
  
      console.error = function(...args) {
        sendCapturedLog('error', args);
        originalConsole.error.apply(console, args);
      };
      isCapturingActive = true;
    }
    
    function revertConsoleCapture() {
      if (!isCapturingActive) return;
      if (originalConsole.log) console.log = originalConsole.log;
      if (originalConsole.warn) console.warn = originalConsole.warn;
      if (originalConsole.error) console.error = originalConsole.error;
      isCapturingActive = false;
      originalConsole = {};
    }
  
    function sendCapturedLog(type, messageArgs) {
      if (!currentConfig.isLoggingGloballyEnabled || 
          !currentConfig.captureLogs || !currentConfig.captureLogs[type] || 
          !currentConfig.targetApiUrl) {
        return;
      }
  
      const logData = {
        type: type,
        message: messageArgs.map(arg => {
          try {
            return (typeof arg === 'object' || typeof arg === 'symbol') ? JSON.stringify(arg) : String(arg);
          } catch (e) {
            return '[Circular Structure]';
          }
        }).join(' '),
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
  
      const headers = { 'Content-Type': 'application/json' };
      if (currentConfig.apiToken) {
        headers['Authorization'] = `Bearer ${currentConfig.apiToken}`;
      }
  
      fetch(currentConfig.targetApiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(logData)
      }).catch(err => {
        if (originalConsole.error) {
           originalConsole.error.call(console, "Extensión Captura Logs: Error al enviar el log:", err);
        } else {
           console.error("Extensión Captura Logs: Error al enviar el log (original console not available):", err);
        }
      });
    }
    
    function loadConfigAndManageCapture() {
      chrome.storage.local.get(['targetApiUrl', 'apiToken', 'monitoredPages', 'captureLogs', 'isLoggingGloballyEnabled'], (data) => {
        currentConfig = data;
        const currentPageUrl = window.location.href;
        
        if (data.isLoggingGloballyEnabled && 
            data.monitoredPages && 
            data.monitoredPages.includes(currentPageUrl)) {
          initializeConsoleCapture();
        } else {
          revertConsoleCapture();
        }
      });
    }
    
    loadConfigAndManageCapture();
  
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        loadConfigAndManageCapture();
      }
    });
  
  })();