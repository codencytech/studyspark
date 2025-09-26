document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("button");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.getAttribute("data-action");

            // Send action to content script of active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]) return;

                chrome.tabs.sendMessage(tabs[0].id, { type: "RUN_ACTION", action }, (response) => {
                    if (response?.success) {
                        openResultsWindow(action, response.result);
                    } else {
                        openResultsWindow(action, response?.error || "AI not available");
                    }
                });
            });
        });
    });
});

function openResultsWindow(action, result) {
    const url = `results.html?action=${encodeURIComponent(action)}&result=${encodeURIComponent(result)}`;
    chrome.windows.create({ url, type: "popup", width: 500, height: 600 });
}
