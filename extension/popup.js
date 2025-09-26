// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button[data-action]");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.getAttribute("data-action");
      console.log("Popup: clicked action =", action);

      // Find active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab) {
          console.error("Popup: no active tab found");
          openResultsWithData(action, "❌ No active tab found.");
          return;
        }

        // Send message to content script and wait for response with timeout
        let responded = false;
        const TIMEOUT_MS = 25000; // 25s fallback for slow AI

        // Start timeout fallback
        const timeoutId = setTimeout(() => {
          if (!responded) {
            console.warn("Popup: response timeout, opening results with a message.");
            openResultsWithData(action, "⚠️ Request timed out. The AI may be slow. Try again.");
            responded = true;
          }
        }, TIMEOUT_MS);

        chrome.tabs.sendMessage(tab.id, { type: "RUN_ACTION", action }, (response) => {
          clearTimeout(timeoutId);
          responded = true;

          // If message call caused runtime.lastError (e.g. no content script injected)
          if (chrome.runtime.lastError) {
            console.error("Popup: sendMessage error:", chrome.runtime.lastError.message);
            openResultsWithData(action, `❌ Extension error: ${chrome.runtime.lastError.message}`);
            return;
          }

          const resultData = (response && response.success) ? response.result : (response && response.error) || "❌ AI not available";
          console.log("Popup: got response, saving result (length):", (resultData || "").length);

          // Save to storage and then open results window (include action in URL)
          chrome.storage.local.set({ studySparkResult: { action, result: resultData, ts: Date.now() } }, () => {
            if (chrome.runtime.lastError) {
              console.error("Popup: storage.set error:", chrome.runtime.lastError.message);
              // still open results with plain message
              openResultsWithData(action, resultData);
              return;
            }
            // Open results window — action passed as query param for immediate title
            const url = `results.html?action=${encodeURIComponent(action)}`;
            chrome.windows.create({ url, type: "popup", width: 600, height: 600 });
          });
        });
      });
    });
  });
});

function openResultsWithData(action, result) {
  // fallback: ensure storage has something then open results
  chrome.storage.local.set({ studySparkResult: { action, result, ts: Date.now() } }, () => {
    const url = `results.html?action=${encodeURIComponent(action)}`;
    chrome.windows.create({ url, type: "popup", width: 600, height: 600 });
  });
}
