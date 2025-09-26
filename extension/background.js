// background.js

// Store the last opened results window ID
let lastResultsWindowId = null;

// Listen for messages from popup or content-script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // --- 1. Message from popup: user clicked an action button ---
  if (request.type === "ACTION_SELECTED") {
    const action = request.action;

    // Find the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;

      const activeTab = tabs[0];

      // Send action to content-script
      chrome.tabs.sendMessage(activeTab.id, { type: "RUN_ACTION", action: action });
    });

    sendResponse({ success: true });
    return true;
  }

  // --- 2. Message from content-script: action result ready ---
  if (request.type === "ACTION_RESULT") {
    const { action, result } = request;

    if (lastResultsWindowId) {
      // Send the result to the first tab of the results window
      chrome.tabs.query({ windowId: lastResultsWindowId }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "UPDATE_RESULT",
            action: action,
            result: result,
          });
        }
      });
    }

    sendResponse({ success: true });
    return true;
  }

  // --- 3. Store the results window ID when it opens ---
  if (request.type === "RESULTS_WINDOW_OPENED") {
    lastResultsWindowId = request.windowId;
    sendResponse({ success: true });
    return true;
  }
});
