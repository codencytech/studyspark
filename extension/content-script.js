console.log("StudySpark content-script loaded.");

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.type || request.type !== "RUN_ACTION") return;

    console.log("Received action:", request.action);

    (async () => {
        if (typeof LanguageModel === "undefined") {
            console.error("❌ Real AI not available in this build.");
            sendResponse({ success: false, error: "AI not available in this build" });
            return;
        }

        try {
            const availability = await LanguageModel.availability();
            console.log("AI Availability:", availability);

            if (availability !== "available") {
                sendResponse({ success: false, error: "AI not ready: " + availability });
                return;
            }

            // ✅ Force English output (removes warning)
            const session = await LanguageModel.create({ outputLanguage: "en" });

            // Limit text for quicker testing
            const text = (document.body.innerText || "Please provide text").slice(0, 1000);

            let promptText = "";
            switch (request.action) {
                case "SUMMARIZE": promptText = `Summarize this text concisely:\n\n${text}`; break;
                case "SIMPLIFY": promptText = `Simplify this text for easy understanding:\n\n${text}`; break;
                case "TRANSLATE": promptText = `Translate this text into English:\n\n${text}`; break;
                case "PROOFREAD": promptText = `Proofread this text for grammar and clarity:\n\n${text}`; break;
                case "FLASHCARDS": promptText = `Create simple flashcards from this text:\n\n${text}`; break;
                case "TEMPLATE": promptText = `Generate a professional template based on this text:\n\n${text}`; break;
                default:
                    sendResponse({ success: false, error: "Unknown action: " + request.action });
                    return;
            }

            console.log("⏳ Sending prompt to AI...");
            const result = await session.prompt(promptText);
            console.log("✅ AI Result:", result);

            sendResponse({ success: true, result });
        } catch (err) {
            console.error("❌ AI request failed:", err);
            sendResponse({ success: false, error: err.message });
        }
    })();

    return true; // async response
});
