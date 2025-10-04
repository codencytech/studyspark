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
  } catch (e) { }

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
    try { await chrome.storage.local.remove("studySparkResult"); } catch (e) { }

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


// ---- PREMIUM FLOATING TOOLBAR ----
let selectionToolbar = null;

function createSelectionToolbar() {
  if (selectionToolbar) return;

  selectionToolbar = document.createElement('div');
  selectionToolbar.id = 'studySparkToolbar';
  Object.assign(selectionToolbar.style, {
    position: 'absolute',
    zIndex: '99999',
    background: 'linear-gradient(145deg, #0f172a, #1e293b)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    display: 'flex',
    gap: '12px',
    padding: '12px 18px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    userSelect: 'none',
    cursor: 'default',
    transition: 'opacity 0.3s, transform 0.2s',
    opacity: '0',
    transform: 'scale(0.9)',
    color: '#e2e8f0'
  });

  const actions = ['SUMMARIZE', 'SIMPLIFY', 'TRANSLATE', 'PROOFREAD'];
  actions.forEach(act => {
    const btn = document.createElement('button');
    btn.textContent = act.charAt(0) + act.slice(1).toLowerCase();
    Object.assign(btn.style, {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      transition: 'all 0.25s ease',
      boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
      textTransform: 'none',
      letterSpacing: '0.025em'
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.7)';
      btn.style.background = 'linear-gradient(135deg, #60a5fa, #2563eb)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
      btn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    });

    btn.addEventListener('click', async () => {
      const selectedText = window.getSelection().toString().trim();
      if (!selectedText) return;
      hideToolbar();
      try {
        await chrome.storage.local.remove("studySparkResult");
        displayStudySparkResult(`Processing selected text...`);
        if (typeof LanguageModel === "undefined") {
          displayStudySparkResult("❌ AI not available in this build.");
          return;
        }
        const session = await LanguageModel.create({ outputLanguage: 'en' });
        const chunks = chunkText(selectedText, 3000);
        const finalResult = await processContent(session, act, chunks, 'English');
        displayStudySparkResult(finalResult);
      } catch (err) {
        displayStudySparkResult(`❌ ${err?.message || String(err)}`);
      }
    });

    selectionToolbar.appendChild(btn);
  });

  document.body.appendChild(selectionToolbar);
}

function showToolbar() {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === '') return;
  createSelectionToolbar();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const toolbarWidth = selectionToolbar.offsetWidth || 240;
  const toolbarHeight = selectionToolbar.offsetHeight || 48;

  let top = rect.top + window.scrollY - toolbarHeight - 10;
  if (top < 0) top = rect.bottom + window.scrollY + 10;
  let left = rect.left + window.scrollX + rect.width / 2 - toolbarWidth / 2;
  if (left < 8) left = 8;
  if (left + toolbarWidth > window.innerWidth - 8) left = window.innerWidth - toolbarWidth - 8;

  selectionToolbar.style.top = `${top}px`;
  selectionToolbar.style.left = `${left}px`;
  selectionToolbar.style.opacity = '1';
  selectionToolbar.style.transform = 'scale(1)';
}

function hideToolbar() {
  if (selectionToolbar) {
    selectionToolbar.style.opacity = '0';
    selectionToolbar.style.transform = 'scale(0.9)';
  }
}

document.addEventListener('mouseup', () => { setTimeout(() => window.getSelection().toString().trim() ? showToolbar() : hideToolbar(), 10); });
document.addEventListener('mousedown', e => { if (selectionToolbar && !selectionToolbar.contains(e.target)) hideToolbar(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideToolbar(); });


// ---- PREMIUM RESPONSE POPUP WITH SMOOTH HIDE/SHOW + TYPING ----
function displayStudySparkResult(text) {
  let respWindow = document.getElementById('studySparkResponseWindow');
  if (!respWindow) {
    respWindow = document.createElement('div');
    respWindow.id = 'studySparkResponseWindow';
    Object.assign(respWindow.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '500px',
      maxHeight: '65vh',
      background: 'linear-gradient(145deg, #1e293b, #0f172a)', // darker premium
      borderRadius: '18px',
      boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
      fontFamily: 'Inter, sans-serif',
      color: '#f1f5f9',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.5s ease, opacity 0.5s ease',
      opacity: '0',
      transform: 'translateY(100%)'
    });

    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.background = 'rgba(15,23,42,0.9)';
    header.style.padding = '12px 16px';
    header.style.borderBottom = '1px solid rgba(148,163,184,0.15)';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    header.style.fontWeight = '600';
    header.style.borderTopLeftRadius = '18px';
    header.style.borderTopRightRadius = '18px';

    const title = document.createElement('div');
    title.textContent = '✨ AI Response';
    title.style.color = '#f8fafc';
    title.style.fontSize = '14px';
    header.appendChild(title);

    // Icons
    const icons = document.createElement('div');
    icons.style.display = 'flex';
    icons.style.gap = '10px';

    const hideBtn = document.createElement('span');
    hideBtn.textContent = '−'; // minus sign
    styleIconButton(hideBtn);
    hideBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const contentDiv = document.getElementById('studySparkResponseContent');
      contentDiv.style.maxHeight = '0px';
      respWindow.style.maxHeight = '52px';
      respWindow.style.transform = 'translateY(calc(100% - 52px))'; // smooth slide down
    });

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    styleIconButton(closeBtn);
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      respWindow.style.opacity = '0';
      respWindow.style.transform = 'translateY(100%)';
      setTimeout(() => respWindow.remove(), 400);
    });

    icons.appendChild(hideBtn);
    icons.appendChild(closeBtn);
    header.appendChild(icons);

    respWindow.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.id = 'studySparkResponseContent';
    Object.assign(content.style, {
      padding: '18px',
      overflowY: 'auto',
      maxHeight: 'calc(65vh - 52px)',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6',
      fontSize: '14px',
      transition: 'max-height 0.6s ease, padding 0.6s ease'
    });
    respWindow.appendChild(content);

    // Restore popup when header clicked
    header.addEventListener('click', () => {
      const contentDiv = document.getElementById('studySparkResponseContent');
      if (contentDiv.style.maxHeight === '0px') {
        contentDiv.style.maxHeight = 'calc(65vh - 52px)';
        respWindow.style.maxHeight = '65vh';
        respWindow.style.transform = 'translateY(0)'; // slide back up
      }
    });

    document.body.appendChild(respWindow);
  }

  const contentDiv = document.getElementById('studySparkResponseContent');
  if (contentDiv) {
    contentDiv.textContent = ''; // reset
    typeWriter(contentDiv, text, 12); // typing effect
    contentDiv.style.maxHeight = 'calc(65vh - 52px)';
  }

  respWindow.style.opacity = '1';
  respWindow.style.transform = 'translateY(0)';
  respWindow.style.maxHeight = '65vh';
}

// Icon styling helper
function styleIconButton(btn) {
  Object.assign(btn.style, {
    cursor: 'pointer',
    fontSize: '16px',
    color: '#f1f5f9',
    transition: 'all 0.25s ease',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.color = '#38bdf8';
    btn.style.transform = 'scale(1.25)';
    btn.style.background = 'rgba(56,189,248,0.3)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.color = '#f1f5f9';
    btn.style.transform = 'scale(1)';
    btn.style.background = 'rgba(255,255,255,0.08)';
  });
}

// Typing animation helper
function typeWriter(element, text, speed = 20) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      element.scrollTop = element.scrollHeight;
      setTimeout(typing, speed);
    }
  }
  typing();
}
