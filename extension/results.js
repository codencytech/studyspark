// result.js

function showResult(action, result) {
    console.log("[result.js] Showing result:", action, result);
    document.getElementById("result-title").textContent =
        (action ? action : "StudySpark") + " Result";
    document.getElementById("result-content").textContent =
        (result !== undefined && result !== null) ? result : "No result available.";
}

function loadFromStorage() {
    chrome.storage.local.get("studySparkResult", (data) => {
        if (chrome.runtime.lastError) {
            console.error("[result.js] storage.get error:", chrome.runtime.lastError.message);
            return;
        }
        const item = data.studySparkResult;
        if (item && item.result !== undefined) {
            showResult(item.action, item.result);
        } else {
            showResult("StudySpark", "Processing...");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[result.js] DOMContentLoaded");

    // 1. Load initial result from storage
    loadFromStorage();

    // 2. Listen for storage changes (when popup writes AI result later)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.studySparkResult?.newValue) {
            const newVal = changes.studySparkResult.newValue;
            showResult(newVal.action, newVal.result);
        }
    });

    // 3. Listen for runtime messages as a backup
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === "RESULT_AVAILABLE" || msg.type === "UPDATE_RESULT") {
            showResult(msg.action, msg.result);
        }
    });

    // 4. Copy button
    document.getElementById("copy-btn").addEventListener("click", function () {
        const text = document.getElementById("result-content").textContent;
        navigator.clipboard.writeText(text).then(() => {
            const original = this.textContent;
            this.textContent = "Copied!";
            setTimeout(() => { this.textContent = original; }, 2000);
        });
    });
});
