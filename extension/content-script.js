// content-script.js (fixed single-chunk duplicates)
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

// format final response for display
function formatFinalResponse(action, text) {
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

// helper to safely call session.prompt with one retry on transient error
async function safePrompt(session, promptText) {
  try {
    return await session.prompt(promptText);
  } catch (err) {
    console.warn("Prompt failed, retrying once...", err);
    // small delay then retry once
    await new Promise(r => setTimeout(r, 600));
    try {
      return await session.prompt(promptText);
    } catch (err2) {
      console.error("Prompt failed twice:", err2);
      throw err2;
    }
  }
}

// ---- SMART DUPLICATE REMOVAL ----
function removeDuplicateContent(text) {
  if (!text) return text;
  
  console.log("🔄 Removing duplicates from text length:", text.length);
  
  // Split by lines and remove empty lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const uniqueLines = [];
  const seenLines = new Set();
  
  for (const line of lines) {
    const cleanLine = line.trim();
    const lineFingerprint = createLineFingerprint(cleanLine);
    
    // Check if this line is a duplicate of any previous line
    if (!isLineDuplicate(cleanLine, lineFingerprint, seenLines)) {
      uniqueLines.push(line);
      seenLines.add(lineFingerprint);
    }
  }
  
  // Also check for duplicate sections (when entire content repeats)
  const result = removeDuplicateSections(uniqueLines.join('\n'));
  
  console.log("🎯 Final text length after cleaning:", result.length);
  return result;
}

function createLineFingerprint(line) {
  return line.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLineDuplicate(line, fingerprint, seenLines) {
  // Exact match
  if (seenLines.has(fingerprint)) return true;
  
  // Check for similar lines (80% similarity)
  for (const existingFingerprint of seenLines) {
    const similarity = calculateLineSimilarity(fingerprint, existingFingerprint);
    if (similarity > 0.8) return true;
  }
  
  return false;
}

function calculateLineSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

function removeDuplicateSections(text) {
  // Split by double newlines to get sections
  const sections = text.split(/\n\s*\n/);
  const uniqueSections = [];
  const seenSections = new Set();
  
  for (const section of sections) {
    const cleanSection = section.trim();
    if (!cleanSection) continue;
    
    const sectionFingerprint = createSectionFingerprint(cleanSection);
    
    if (!seenSections.has(sectionFingerprint)) {
      uniqueSections.push(cleanSection);
      seenSections.add(sectionFingerprint);
    }
  }
  
  return uniqueSections.join('\n\n');
}

function createSectionFingerprint(section) {
  // Use first 3 lines or first 100 chars as fingerprint
  const lines = section.split('\n').slice(0, 3);
  return lines.map(line => 
    line.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  ).join(' ').substring(0, 100);
}

// ---- ENHANCED RESPONSE CLEANER ----
function cleanAndValidateResponse(rawText, action) {
  if (!rawText) return "No content generated.";
  
  let cleaned = rawText;
  
  console.log("🔧 Before cleaning:", cleaned.length);
  
  // Remove ALL duplicates
  cleaned = removeDuplicateContent(cleaned);
  
  // Fix formatting
  cleaned = fixCommonFormatting(cleaned);
  
  console.log("✨ After cleaning:", cleaned.length);
  
  return cleaned;
}

function fixCommonFormatting(text) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

// ---- SINGLE CHUNK OPTIMIZED PROMPTS ----
function getEnhancedPrompt(action, chunk, chunkIndex, totalChunks, targetLang = "English") {
  const singleChunkInstructions = {
    SUMMARIZE: `Create ONE SINGLE summary from this text. 
CRITICAL: Generate each point ONLY ONCE. No repetition.
Structure:
- Clear title
- 4-6 unique bullet points
- Each point must be completely different

Text: ${chunk}

🚫 NO DUPLICATES - Generate content only once.`,

    FLASHCARDS: `Create flashcards from this content.
CRITICAL: Each question must be unique.
- Valid JSON array format
- 6-8 unique questions
- No duplicate questions

Content: ${chunk}`,

    SIMPLIFY: `Simplify this text.
CRITICAL: No repeated explanations.
- One clear simplified version
- Unique points only

Text: ${chunk}`,

    TRANSLATE: `Translate this text to ${targetLang}.
CRITICAL: No duplicate sentences.
- Fluent translation
- Unique content only

Text: ${chunk}`,

    PROOFREAD: `Proofread this text.
CRITICAL: No duplicate corrections.
- Improved version
- Unique correction list

Text: ${chunk}`,

    TEMPLATE: `Create HTML template from this page.
CRITICAL: No duplicate code.
- Clean template code
- Unique sections only

Page: ${chunk}`
  };

  const multiChunkInstructions = {
    SUMMARIZE: `Create a partial summary (chunk ${chunkIndex + 1}/${totalChunks}).
Focus on unique points not covered in previous chunks.
Text: ${chunk}`,

    FLASHCARDS: `Create partial flashcards (chunk ${chunkIndex + 1}/${totalChunks}).
Add unique questions not in previous chunks.
Content: ${chunk}`,

    SIMPLIFY: `Simplify this partial text (chunk ${chunkIndex + 1}/${totalChunks}).
Add unique explanations.
Text: ${chunk}`,

    TRANSLATE: `Translate this partial text to ${targetLang} (chunk ${chunkIndex + 1}/${totalChunks}).
Text: ${chunk}`,

    PROOFREAD: `Proofread this partial text (chunk ${chunkIndex + 1}/${totalChunks}).
Text: ${chunk}`,

    TEMPLATE: `Create partial template (chunk ${chunkIndex + 1}/${totalChunks}).
Add unique code sections.
Page: ${chunk}`
  };

  const instructions = (totalChunks === 1) ? singleChunkInstructions : multiChunkInstructions;
  const instruction = instructions[action] || `Process this text for: ${action}`;
  
  return instruction;
}

// ---- OPTIMIZED PROCESSING ----
async function sendChunkedResults(session, action, chunks, opts = {}) {
  const results = [];
  const targetLang = opts.targetLang || "English";

  console.log(`📦 Processing ${chunks.length} chunk(s) for ${action}`);

  for (let i = 0; i < chunks.length; i++) {
    const promptText = getEnhancedPrompt(action, chunks[i], i, chunks.length, targetLang);
    let raw = null;
    try {
      raw = await safePrompt(session, promptText);
    } catch (err) {
      const errMsg = `❌ Error processing chunk ${i + 1}: ${err?.message || String(err)}`;
      results.push(errMsg);
      chrome.storage.local.set({ studySparkResult: { action, result: results, ts: Date.now() } }, () => {});
      try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: results }); } catch(e){}
      throw err;
    }

    const rawText = extractResultText(raw);
    const cleanedText = cleanAndValidateResponse(rawText, action);
    
    // Only add if we have meaningful content
    if (cleanedText && cleanedText.length > 10) {
      results.push(cleanedText);
      console.log(`✅ Processed chunk ${i + 1}/${chunks.length}`);
    }

    chrome.storage.local.set({ studySparkResult: { action, result: results, ts: Date.now() } }, () => {});
    try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: results }); } catch(e){}
  }

  // For single chunk, use it directly without merge
  if (chunks.length === 1) {
    const finalFormatted = formatFinalResponse(action, results[0]);
    chrome.storage.local.set({ studySparkResult: { action, result: [finalFormatted], ts: Date.now() } }, () => {});
    try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: [finalFormatted] }); } catch(e){}
    return;
  }

  // For multiple chunks, do final merge
  await createFinalPolishedResult(session, action, results, targetLang);
}

async function createFinalPolishedResult(session, action, partialResults, targetLang) {
  console.log("🔗 Merging partial results...");

  const mergeInstructions = {
    SUMMARIZE: `COMBINE these partial summaries into ONE cohesive summary.
CRITICAL: Remove ALL duplicate points. Each bullet point must be UNIQUE.
Keep only the best 5-6 points total.`,

    FLASHCARDS: `COMBINE into ONE JSON array.
CRITICAL: Remove duplicate questions.
Keep maximum 10 unique questions.`,

    SIMPLIFY: `MERGE into one simplified version.
Remove duplicate explanations.`,
    
    TRANSLATE: `COMBINE into one fluent translation.
Remove duplicate sentences.`,
    
    PROOFREAD: `MERGE into complete polished text.
Remove duplicate corrections.`,
    
    TEMPLATE: `COMBINE into one complete template.
Remove duplicate code sections.`
  };

  const instruction = mergeInstructions[action] || `Combine and remove ALL duplicates.`;
  const mergePrompt = `${instruction}\n\nParts to combine:\n${partialResults.join('\n\n---\n\n')}`;

  try {
    const mergedRaw = await safePrompt(session, mergePrompt);
    const mergedText = extractResultText(mergedRaw);
    const finalCleaned = cleanAndValidateResponse(mergedText, action);
    
    const finalFormatted = formatFinalResponse(action, finalCleaned);
    chrome.storage.local.set({ studySparkResult: { action, result: [finalFormatted], ts: Date.now() } }, () => {});
    try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: [finalFormatted] }); } catch(e){}
    console.log("✅ Final merge completed");
  } catch (error) {
    console.error('❌ Final merge failed:', error);
    // Use the first result as fallback
    const fallback = partialResults[0] || "No content generated";
    const finalFormatted = formatFinalResponse(action, fallback);
    chrome.storage.local.set({ studySparkResult: { action, result: [finalFormatted], ts: Date.now() } }, () => {});
    try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action, result: [finalFormatted] }); } catch(e){}
  }
}

// ---- MAIN MESSAGE HANDLER -------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || request.type !== "RUN_ACTION") return;

  (async () => {
    // Clear older stored result so UI doesn't show stale data
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

      // Determine output language: default "en". For TRANSLATE, prompt user for target language.
      let targetLang = "English";
      if (request.action === "TRANSLATE") {
        try {
          // prompt the user for target language code / name (minimal UX)
          const userLang = window.prompt("Enter target language code or name (e.g. en, es, ja) — default: en", "en");
          if (userLang && userLang.trim()) {
            // convert code to name when simple codes provided:
            const map = { en: "English", es: "Spanish", ja: "Japanese", hi: "Hindi", fr: "French" };
            const k = userLang.trim().toLowerCase();
            targetLang = map[k] || userLang.trim();
          }
        } catch (e) {
          targetLang = "English";
        }
      }

      // Create a session and explicitly set outputLanguage to avoid warnings
      const outputCode = (request.action === "TRANSLATE" ? (targetLang === "English" ? "en" : targetLang.substring(0, 2).toLowerCase()) : "en");
      const session = await LanguageModel.create({ outputLanguage: outputCode });

      // Extract content
      const fullText = getCleanPageText();
      if (!fullText || fullText.length < 10) {
        const msg = "No readable page text found to process.";
        chrome.storage.local.set({ studySparkResult: { action: request.action, result: [formatFinalResponse(request.action, msg)], ts: Date.now() } }, () => {});
        try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action: request.action, result: [formatFinalResponse(request.action, msg)] }); } catch(e){}
        sendResponse({ success: false, error: msg });
        return;
      }

      const chunks = chunkText(fullText, 3000);
      console.log(`📄 Extracted ${fullText.length} chars, split into ${chunks.length} chunks`);

      // Send progressive + final
      await sendChunkedResults(session, request.action, chunks, { targetLang });

      sendResponse({ success: true, result: "Processing complete." });
    } catch (err) {
      console.error("❌ AI request failed:", err);
      const message = err?.message || String(err);
      chrome.storage.local.set({ studySparkResult: { action: request.action, result: [`❌ ${message}`], ts: Date.now() } }, () => {});
      try { chrome.runtime.sendMessage({ type: "RESULT_AVAILABLE", action: request.action, result: [`❌ ${message}`] }); } catch(e){}
      sendResponse({ success: false, error: message });
    }
  })();

  return true;
});