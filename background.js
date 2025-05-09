chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
      targetApiUrl: '',
      apiToken: '',
      monitoredPages: [],
      captureLogs: { info: true, warn: true, error: true },
      isLoggingGloballyEnabled: true
    });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SEND_TEST_LOG') {
      const { apiUrl, apiToken, logData } = message.payload;
      if (!apiUrl) {
        sendResponse({ success: false, error: 'API URL no configurada.' });
        return true;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
      }
      fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(logData)
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Error de red: ${response.status} ${response.statusText} - ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  });