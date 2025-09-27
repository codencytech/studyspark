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

        // STEP 1: Open results window immediately with placeholder
        chrome.storage.local.set({
          studySparkResult: { action, result: "⏳ Processing... please wait", ts: Date.now() }
        }, () => {
          const url = `results.html?action=${encodeURIComponent(action)}`;
          chrome.windows.create({ url, type: "popup", width: 600, height: 600 });
        });

        // STEP 2: Start AI request
        let responded = false;
        const TIMEOUT_MS = 25000; // 25s fallback for slow AI

        const timeoutId = setTimeout(() => {
          if (!responded) {
            console.warn("Popup: response timeout, updating results with message.");
            updateResults(action, "⚠️ Request timed out. The AI may be slow. Try again.");
            responded = true;
          }
        }, TIMEOUT_MS);

        chrome.tabs.sendMessage(tab.id, { type: "RUN_ACTION", action }, (response) => {
          clearTimeout(timeoutId);
          responded = true;

          if (chrome.runtime.lastError) {
            console.error("Popup: sendMessage error:", chrome.runtime.lastError.message);
            updateResults(action, `❌ Extension error: ${chrome.runtime.lastError.message}`);
            return;
          }

          // Normalize the result into a plain string
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

          // STEP 3: Update results with the final AI output
          updateResults(action, resultData);
        });
      });
    });
  });
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

// fallback: opens a new window with given result
function openResultsWithData(action, result) {
  updateResults(action, result);
  const url = `results.html?action=${encodeURIComponent(action)}`;
  chrome.windows.create({ url, type: "popup", width: 600, height: 600 });
}
