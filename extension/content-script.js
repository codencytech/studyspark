// content-script.js
console.log("StudySpark content-script loaded.");

// helper to extract a readable string from many possible AI return shapes
function extractResultText(result) {
    if (result === null || result === undefined) return "";
    if (typeof result === "string") return result;

    // Common fields
    if (typeof result.content === "string") return result.content;
    if (typeof result.text === "string") return result.text;
    if (typeof result.outputText === "string") return result.outputText;
    if (typeof result.output === "string") return result.output;
    if (typeof result.answer === "string") return result.answer;

    // choices / outputs style (OpenAI-like)
    if (Array.isArray(result.choices) && result.choices.length) {
        const first = result.choices[0];
        if (typeof first === "string") return first;
        if (typeof first.text === "string") return first.text;
        if (first?.message?.content) return first.message.content;
    }
    if (Array.isArray(result.outputs) && result.outputs.length) {
        const first = result.outputs[0];
        if (typeof first === "string") return first;
        if (typeof first.text === "string") return first.text;
        if (first?.content) return first.content;
    }

    // First string property fallback
    try {
        for (const k of Object.keys(result)) {
            if (typeof result[k] === "string") return result[k];
            if (Array.isArray(result[k]) && result[k].length && typeof result[k][0] === "string") return result[k][0];
        }
    } catch (e) {
        // ignore
    }

    // Last resort: JSON stringify (truncate if huge)
    try {
        const s = JSON.stringify(result, null, 2);
        return s.length > 20000 ? s.slice(0, 20000) + "\n\n[truncated]" : s;
    } catch (e) {
        return String(result);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request.type || request.type !== "RUN_ACTION") return;

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

            // Force English output (removes warning)
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
            const resultRaw = await session.prompt(promptText);
            const resultText = extractResultText(resultRaw);

            console.log("✅ AI Result (extracted):", resultText);

            // Save result into storage so results window can pick it up
            chrome.storage.local.set({
                studySparkResult: {
                    action: request.action,
                    result: resultText,
                    ts: Date.now()
                }
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("content-script: storage.set error:", chrome.runtime.lastError.message);
                }
            });

            // Broadcast directly to any results window
            try {
                chrome.runtime.sendMessage({
                    type: "RESULT_AVAILABLE",
                    action: request.action,
                    result: resultText
                });
            } catch (e) {
                // ignore
            }

            // Respond back to popup (if it’s still listening)
            sendResponse({ success: true, result: resultText });
        } catch (err) {
            console.error("❌ AI request failed:", err);
            sendResponse({ success: false, error: err?.message || String(err) });
        }
    })();

    return true; // keep message channel open for async
});
