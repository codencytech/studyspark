// content-script.js (FIXED - no duplicates)
console.log("StudySpark content-script loaded.");

// ---- Helpers --------------------------------------------------------
function extractResultText(result) {
  if (result === null || result === undefined) return "";
  if (typeof result === "string") return result;

  if (typeof result.content === "string") return result.content;
  if (typeof result.text === "string") return result.text;
  if (typeof result.outputText === "string") return result.outputText;
  if (typeof result.output === "string") return result.output;
  if (typeof result.answer === "string") return result.answer;

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

  try {
    for (const k of Object.keys(result)) {
      if (typeof result[k] === "string") return result[k];
      if (Array.isArray(result[k]) && result[k].length && typeof result[k][0] === "string")
        return result[k][0];
    }
  } catch (e) {}

  try {
    const s = JSON.stringify(result, null, 2);
    return s.length > 20000 ? s.slice(0, 20000) + "\n\n[truncated]" : s;
  } catch (e) {
    return String(result);
  }
}

function getCleanPageText() {
  const clone = document.body.cloneNode(true);
  const selectors = ["script", "style", "noscript", "nav", "footer", "header", "iframe"];
  selectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));
  let text = clone.innerText || "";
  return text.replace(/\s+/g, " ").trim();
}

function chunkText(str, size = 3000) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
  return chunks;
}

function formatFinalResponse(action, text) {
  // If text already has our header, return as-is
  if (text.includes('## 📌 Summary') || text.includes('## ✏️ Simplified Explanation') || 
      text.includes('## 🌍 Translation') || text.includes('## ✅ Proofread') || 
      text.includes('## 🎴 Flashcards') || text.includes('## 🧩 Generated Template')) {
    return text;
  }
  
  switch (action) {
    case "SUMMARIZE": return `## 📌 Summary\n\n${text.trim()}`;
    case "SIMPLIFY": return `## ✏️ Simplified Explanation\n\n${text.trim()}`;
    case "TRANSLATE": return `## 🌍 Translation\n\n${text.trim()}`;
    case "PROOFREAD": return `## ✅ Proofread & Polished Text\n\n${text.trim()}`;
    case "FLASHCARDS": return `## 🎴 Flashcards (Q / A)\n\n${text.trim()}`;
    case "TEMPLATE": return `## 🧩 Generated Template\n\n${text.trim()}`;
    default: return text;
  }
}

async function safePrompt(session, promptText) {
  try {
    return await session.prompt(promptText);
  } catch (err) {
    console.warn("Prompt failed, retrying once...", err);
    await new Promise(r => setTimeout(r, 600));
    try {
      return await session.prompt(promptText);
    } catch (err2) {
      console.error("Prompt failed twice:", err2);
      throw err2;
    }
  }
}

// ---- SIMPLE PROCESSING - NO DUPLICATES ----
async function processSingleChunk(session, action, chunk, targetLang) {
  console.log("🔄 Processing single chunk...");
  
  const prompts = {
    SUMMARIZE: `Create a concise summary with these requirements:
- Start with a clear title
- Use bullet points for key information
- Maximum 5-6 main points
- No duplicate content
- Clean, readable format

Text to summarize: ${chunk}`,

    FLASHCARDS: `Create flashcards as valid JSON array.
Requirements:
- [{"q": "question?", "a": "answer."}]
- 6-8 unique questions
- No duplicates

Content: ${chunk}`,

    SIMPLIFY: `Simplify this text for better understanding.
Use clear language and structure.

Text: ${chunk}`,

    TRANSLATE: `Translate this to ${targetLang}.
Maintain original meaning.

Text: ${chunk}`,

    PROOFREAD: `Proofread and improve this text.
Provide corrected version and changes list.

Text: ${chunk}`,

    TEMPLATE: `Create HTML/CSS template.
Use placeholder content.

Page: ${chunk}`
  };

  const promptText = prompts[action] || `Process: ${chunk}`;
  
  try {
    const raw = await safePrompt(session, promptText);
    const resultText = extractResultText(raw);
    
    // Clean the result
    let cleaned = resultText.trim();
    
    // Remove any exact duplicate lines
    const lines = cleaned.split('\n');
    const uniqueLines = [];
    const seenLines = new Set();
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && !seenLines.has(cleanLine)) {
        uniqueLines.push(line);
        seenLines.add(cleanLine);
      }
    }
    
    cleaned = uniqueLines.join('\n');
    
    // Format final response (ONCE)
    const finalResult = formatFinalResponse(action, cleaned);
    
    // Store ONCE
    chrome.storage.local.set({ 
      studySparkResult: { 
        action, 
        result: [finalResult], 
        ts: Date.now() 
      } 
    });
    
    console.log("✅ Single chunk processed successfully");
    return finalResult;
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
    const errorMsg = `Error: ${error?.message || 'Processing failed'}`;
    const finalResult = formatFinalResponse(action, errorMsg);
    
    chrome.storage.local.set({ 
      studySparkResult: { 
        action, 
        result: [finalResult], 
        ts: Date.now() 
      } 
    });
    
    throw error;
  }
}

// ---- MAIN PROCESSING FUNCTION ----
async function processContent(session, action, chunks, targetLang) {
  console.log(`📦 Processing ${chunks.length} chunk(s) for ${action}`);
  
  // For single chunk - simple direct processing
  if (chunks.length === 1) {
    return await processSingleChunk(session, action, chunks[0], targetLang);
  }
  
  // For multiple chunks - process each and merge
  const results = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const promptText = `Process part ${i + 1} of ${chunks.length} for ${action}:\n\n${chunks[i]}`;
    
    try {
      const raw = await safePrompt(session, promptText);
      const resultText = extractResultText(raw);
      results.push(resultText.trim());
      console.log(`✅ Processed chunk ${i + 1}/${chunks.length}`);
    } catch (error) {
      console.error(`❌ Failed chunk ${i + 1}:`, error);
      results.push(`Error in part ${i + 1}`);
    }
  }
  
  // Merge results
  const mergePrompt = `Combine these ${results.length} parts into one cohesive ${action} result:\n\n${results.join('\n\n---\n\n')}`;
  
  try {
    const mergedRaw = await safePrompt(session, mergePrompt);
    const mergedText = extractResultText(mergedRaw);
    const finalResult = formatFinalResponse(action, mergedText.trim());
    
    chrome.storage.local.set({ 
      studySparkResult: { 
        action, 
        result: [finalResult], 
        ts: Date.now() 
      } 
    });
    
    console.log("✅ All chunks merged successfully");
    return finalResult;
    
  } catch (error) {
    console.error('❌ Merge failed:', error);
    const fallback = results[0] || "No content generated";
    const finalResult = formatFinalResponse(action, fallback);
    
    chrome.storage.local.set({ 
      studySparkResult: { 
        action, 
        result: [finalResult], 
        ts: Date.now() 
      } 
    });
    
    throw error;
  }
}

// ---- MAIN MESSAGE HANDLER -------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || request.type !== "RUN_ACTION") return;

  (async () => {
    // Clear previous result
    try { await chrome.storage.local.remove("studySparkResult"); } catch (e){}

    if (typeof LanguageModel === "undefined") {
      console.error("❌ Real AI not available in this build.");
      sendResponse({ success: false, error: "AI not available in this build" });
      return;
    }

    try {
      let availability = await LanguageModel.availability();
      console.log("AI Availability:", availability);

      if (availability === "downloadable") {
        console.log("📥 Downloading AI model...");
        try {
          await LanguageModel.download();
        } catch (err) {
          console.warn("Download failed once, retrying...", err);
          try { await LanguageModel.download(); } catch (err2) {
            sendResponse({ success: false, error: "AI download failed: " + (err2?.message || err2) });
            return;
          }
        }
        availability = await LanguageModel.availability();
      }

      if (availability !== "available") {
        sendResponse({ success: false, error: "AI not ready: " + availability });
        return;
      }

      // Handle language selection
      let targetLang = "English";
      if (request.action === "TRANSLATE") {
        try {
          const userLang = window.prompt("Enter target language code or name (e.g. en, es, ja) — default: en", "en");
          if (userLang && userLang.trim()) {
            const map = { en: "English", es: "Spanish", ja: "Japanese", hi: "Hindi", fr: "French" };
            const k = userLang.trim().toLowerCase();
            targetLang = map[k] || userLang.trim();
          }
        } catch (e) {
          targetLang = "English";
        }
      }

      // Create session
      const outputCode = (request.action === "TRANSLATE" ? (targetLang === "English" ? "en" : targetLang.substring(0, 2).toLowerCase()) : "en");
      const session = await LanguageModel.create({ outputLanguage: outputCode });

      // Extract and process content
      const fullText = getCleanPageText();
      if (!fullText || fullText.length < 10) {
        const msg = "No readable page text found to process.";
        chrome.storage.local.set({ 
          studySparkResult: { 
            action: request.action, 
            result: [formatFinalResponse(request.action, msg)], 
            ts: Date.now() 
          } 
        });
        sendResponse({ success: false, error: msg });
        return;
      }

      const chunks = chunkText(fullText, 3000);
      console.log(`📄 Extracted ${fullText.length} chars, split into ${chunks.length} chunks`);

      // PROCESS CONTENT ONLY ONCE
      await processContent(session, request.action, chunks, targetLang);

      sendResponse({ success: true, result: "Processing complete." });
      
    } catch (err) {
      console.error("❌ AI request failed:", err);
      const message = err?.message || String(err);
      chrome.storage.local.set({ 
        studySparkResult: { 
          action: request.action, 
          result: [`❌ ${message}`], 
          ts: Date.now() 
        } 
      });
      sendResponse({ success: false, error: message });
    }
  })();

  return true;
});