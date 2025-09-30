// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button[data-action]");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.getAttribute("data-action");
      console.log("Popup: clicked action =", action);

      // Clear old result so no stale data shows
      chrome.storage.local.remove("studySparkResult", () => {
        // STEP 1: Open results window immediately
        const url = `results.html?action=${encodeURIComponent(action)}`;
        chrome.windows.create({ url, type: "popup", width: 600, height: 600 });

        // STEP 2: Start AI request
        let responded = false;
        const TIMEOUT_MS = 25000;

        const timeoutId = setTimeout(() => {
          if (!responded) {
            console.warn("Popup: response timeout");
            updateResults(action, "⚠️ Request timed out. The AI may be slow. Try again.");
            responded = true;
          }
        }, TIMEOUT_MS);

        // Send request to active tab content-script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs && tabs[0];
          if (!tab) {
            console.error("Popup: no active tab found");
            openResultsWithData(action, "❌ No active tab found.");
            clearTimeout(timeoutId);
            return;
          }

          chrome.tabs.sendMessage(tab.id, { type: "RUN_ACTION", action }, (response) => {
            clearTimeout(timeoutId);
            responded = true;

            if (chrome.runtime.lastError) {
              console.error("Popup: sendMessage error:", chrome.runtime.lastError.message);
              updateResults(action, `❌ Extension error: ${chrome.runtime.lastError.message}`);
              return;
            }

            let resultData;
            if (response && response.success) {
              resultData = response.result;
            } else if (response && response.error) {
              resultData = `❌ ${response.error}`;
            } else {
              resultData = "❌ AI not available";
            }

            try {
              if (typeof resultData !== "string") {
                resultData = (typeof resultData === "object")
                  ? JSON.stringify(resultData, null, 2)
                  : String(resultData);
              }
            } catch (e) {
              resultData = String(resultData || "");
            }

            console.log("Popup: got response, saving result (chars):", resultData.length);
            updateResults(action, resultData);
          });
        });
      });
    });
  });

  // Download button (if present in popup.html)
  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "DOWNLOAD_RESULT" });
    });
  }
});

// helper to update results in storage and notify results window
function updateResults(action, result) {
  const resultData = (typeof result === "string")
    ? result
    : (JSON.stringify(result, null, 2) || String(result));

  chrome.storage.local.set({
    studySparkResult: { action, result: resultData, ts: Date.now() }
  }, () => {
    try {
      chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: resultData });
    } catch (e) {
      // ignore
    }
  });
}

function openResultsWithData(action, result) {
  updateResults(action, result);
  const url = `results.html?action=${encodeURIComponent(action)}`;
  chrome.windows.create({ url, type: "popup", width: 600, height: 600 });
}
