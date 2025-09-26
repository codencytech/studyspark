// results.js

function showResult(action, result) {
    const titleEl = document.getElementById("result-title");
    const contentEl = document.getElementById("result-content");

    titleEl.textContent = (action ? action : "StudySpark") + " Result";
    contentEl.textContent = result ?? "No result available.";
}

// Try to read result from URL params (short fallback)
function readFromUrl() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get("action");
        const result = urlParams.get("result");
        if (result || action) {
            showResult(action || "StudySpark", result ? decodeURIComponent(result) : "Processing...");
            return true;
        }
    } catch (e) {
        // ignore
    }
    return false;
}

// Read result from chrome.storage.local
function readFromStorageAndShow() {
    if (!chrome?.storage?.local) return;
    chrome.storage.local.get("studySparkResult", (data) => {
        if (chrome.runtime.lastError) {
            console.error("results.js: storage.get error:", chrome.runtime.lastError.message);
            return;
        }
        const item = data.studySparkResult;
        if (item && (item.result !== undefined)) {
            showResult(item.action || "StudySpark", item.result);
        } else {
            // if nothing in storage, maybe show a placeholder
            const urlParams = new URLSearchParams(window.location.search);
            const action = urlParams.get("action") || "StudySpark";
            showResult(action, "Processing...");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const copyBtn = document.getElementById("copy-btn");
    const contentEl = document.getElementById("result-content");
    const titleEl = document.getElementById("result-title");

    // Initial display: prefer storage, fallback to URL
    const showedFromUrl = readFromUrl();
    if (!showedFromUrl) {
        readFromStorageAndShow();
    } else {
        // Still read storage after a short delay to pick up updates if any
        setTimeout(readFromStorageAndShow, 250);
    }

    // Listen for storage changes (so late AI responses update the UI)
    if (chrome?.storage?.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== "local") return;
            if (changes.studySparkResult) {
                const newVal = changes.studySparkResult.newValue;
                if (newVal) {
                    showResult(newVal.action || "StudySpark", newVal.result);
                }
            }
        });
    }

    // Listen for runtime messages (e.g. background -> results window updates)
    if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (!msg) return;
            if (msg.type === "UPDATE_RESULT") {
                showResult(msg.action || "StudySpark", msg.result || "");
                sendResponse && sendResponse({ ok: true });
            }
        });
    }

    // Best-effort: notify background that results window opened (background may use this)
    try {
        if (chrome?.windows?.getCurrent && chrome?.runtime?.sendMessage) {
            chrome.windows.getCurrent((win) => {
                try {
                    chrome.runtime.sendMessage({ type: "RESULTS_WINDOW_OPENED", windowId: win?.id });
                } catch (e) {
                    // ignore
                }
            });
        } else if (chrome?.runtime?.sendMessage) {
            // fallback without windowId
            chrome.runtime.sendMessage({ type: "RESULTS_WINDOW_OPENED" }, () => {});
        }
    } catch (e) {
        // ignore errors (no critical failure)
    }

    // Copy button behavior
    copyBtn.addEventListener("click", function () {
        const text = contentEl.textContent;
        if (!navigator.clipboard) {
            // older fallback
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); } catch (e) {}
            document.body.removeChild(ta);
            const original = this.textContent;
            this.textContent = "Copied!";
            setTimeout(() => { this.textContent = original; }, 2000);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            const original = this.textContent;
            this.textContent = "Copied!";
            setTimeout(() => { this.textContent = original; }, 2000);
        });
    });
});
