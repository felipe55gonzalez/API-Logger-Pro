document.addEventListener('DOMContentLoaded', () => {
    const apiUrlInput = document.getElementById('apiUrlInput');
    const apiTokenInput = document.getElementById('apiTokenInput');
    const logInfoCheckbox = document.getElementById('logInfo');
    const logWarnCheckbox = document.getElementById('logWarn');
    const logErrorCheckbox = document.getElementById('logError');
    const globalLoggingToggle = document.getElementById('globalLoggingToggle');
    
    const newPageUrlInput = document.getElementById('newPageUrlInput');
    const addManualUrlButton = document.getElementById('addManualUrlButton');
    const addCurrentPageButton = document.getElementById('addCurrentPageButton');
    const monitoredPagesList = document.getElementById('monitoredPagesList');
    const monitoredPagesCount = document.getElementById('monitoredPagesCount');
    const clearAllPagesButton = document.getElementById('clearAllPagesButton');
  
    const saveConfigButton = document.getElementById('saveConfigButton');
    const testApiButton = document.getElementById('testApiButton');
    const statusMessage = document.getElementById('statusMessage');
  
    let currentMonitoredPages = [];
  
    function showStatusMessage(message, isError = false) {
      statusMessage.textContent = message;
      statusMessage.className = isError ? 'error' : 'success';
      setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = '';
      }, 3000);
    }
  
    function loadConfiguration() {
      chrome.storage.local.get(['targetApiUrl', 'apiToken', 'monitoredPages', 'captureLogs', 'isLoggingGloballyEnabled'], (data) => {
        apiUrlInput.value = data.targetApiUrl || '';
        apiTokenInput.value = data.apiToken || '';
        currentMonitoredPages = data.monitoredPages || [];
        
        if (data.captureLogs) {
          logInfoCheckbox.checked = data.captureLogs.info;
          logWarnCheckbox.checked = data.captureLogs.warn;
          logErrorCheckbox.checked = data.captureLogs.error;
        } else {
          logInfoCheckbox.checked = true;
          logWarnCheckbox.checked = true;
          logErrorCheckbox.checked = true;
        }
        globalLoggingToggle.checked = data.isLoggingGloballyEnabled !== undefined ? data.isLoggingGloballyEnabled : true;
        renderMonitoredPages();
      });
    }
  
    function renderMonitoredPages() {
      monitoredPagesList.innerHTML = '';
      monitoredPagesCount.textContent = currentMonitoredPages.length;
      currentMonitoredPages.forEach((url, index) => {
        const li = document.createElement('li');
        const urlSpan = document.createElement('span');
        urlSpan.textContent = url;
        urlSpan.title = url;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Quitar';
        removeButton.classList.add('remove-page-btn');
        removeButton.addEventListener('click', () => removeMonitoredPage(index));
        
        li.appendChild(urlSpan);
        li.appendChild(removeButton);
        monitoredPagesList.appendChild(li);
      });
    }
  
    function addMonitoredPage(url) {
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        showStatusMessage('URL inválida. Debe empezar con http:// o https://', true);
        return;
      }
      if (!currentMonitoredPages.includes(url)) {
        currentMonitoredPages.push(url);
        chrome.storage.local.set({ monitoredPages: currentMonitoredPages }, () => {
          renderMonitoredPages();
          showStatusMessage('Página añadida para monitoreo.');
        });
      } else {
        showStatusMessage('Esta página ya está siendo monitoreada.', true);
      }
    }
  
    function removeMonitoredPage(index) {
      currentMonitoredPages.splice(index, 1);
      chrome.storage.local.set({ monitoredPages: currentMonitoredPages }, () => {
        renderMonitoredPages();
        showStatusMessage('Página eliminada del monitoreo.');
      });
    }
  
    addManualUrlButton.addEventListener('click', () => {
      const newUrl = newPageUrlInput.value.trim();
      if (newUrl) {
        addMonitoredPage(newUrl);
        newPageUrlInput.value = '';
      } else {
        showStatusMessage('Por favor, ingrese una URL.', true);
      }
    });
  
    addCurrentPageButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          if (tabs[0].url.startsWith('chrome://')) {
              showStatusMessage('No se pueden monitorear URLs internas de Chrome.', true);
              return;
          }
          addMonitoredPage(tabs[0].url);
        }
      });
    });
  
    clearAllPagesButton.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres eliminar todas las páginas monitoreadas?')) {
        currentMonitoredPages = [];
        chrome.storage.local.set({ monitoredPages: [] }, () => {
          renderMonitoredPages();
          showStatusMessage('Todas las páginas monitoreadas han sido eliminadas.');
        });
      }
    });
  
    saveConfigButton.addEventListener('click', () => {
      const apiUrl = apiUrlInput.value.trim();
      const apiToken = apiTokenInput.value.trim();
      const captureLogs = {
        info: logInfoCheckbox.checked,
        warn: logWarnCheckbox.checked,
        error: logErrorCheckbox.checked
      };
      const isLoggingGloballyEnabled = globalLoggingToggle.checked;
  
      if (apiUrl && (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://'))) {
          showStatusMessage('URL de API inválida.', true);
          return;
      }
  
      chrome.storage.local.set({
        targetApiUrl: apiUrl,
        apiToken: apiToken,
        captureLogs: captureLogs,
        isLoggingGloballyEnabled: isLoggingGloballyEnabled
      }, () => {
        showStatusMessage('Configuración guardada exitosamente.');
      });
    });
  
    testApiButton.addEventListener('click', () => {
      const apiUrl = apiUrlInput.value.trim();
      const apiToken = apiTokenInput.value.trim();
  
      if (!apiUrl) {
        showStatusMessage('Por favor, configure la URL de la API primero.', true);
        return;
      }
      
      const testLogData = {
          type: 'TEST',
          message: 'Este es un log de prueba desde la extensión Captura de Logs.',
          url: 'popup.html',
          timestamp: new Date().toISOString()
      };
  
      statusMessage.textContent = 'Enviando log de prueba...';
      statusMessage.className = '';
  
      chrome.runtime.sendMessage(
        { 
          type: 'SEND_TEST_LOG',
          payload: { apiUrl, apiToken, logData: testLogData } 
        }, 
        (response) => {
          if (chrome.runtime.lastError) {
            showStatusMessage(`Error de comunicación con background: ${chrome.runtime.lastError.message}`, true);
            return;
          }
          if (response && response.success) {
            showStatusMessage('Log de prueba enviado exitosamente!');
          } else {
            showStatusMessage(`Error al enviar log de prueba: ${response ? response.error : 'Respuesta desconocida'}`, true);
          }
        }
      );
    });
  
    loadConfiguration();
  });