import { useState } from "react";

/**
 * useAI - Enhanced AI hook
 * Features:
 *  ✅ Always uses safe CORS proxy (no more blocked fetches)
 *  ✅ Streams output chunk by chunk (no waiting)
 *  ✅ Adds Deduplication Wall (no repeated content)
 *  ✅ Polishes final output
 *  ✅ Always sets outputLanguage = "en"
 */

export const useAI = (opts = {}) => {
  const [loading, setLoading] = useState(false);
  const refineThreshold = opts.refineThreshold ?? 8;

  const isAIAvailable = () =>
    typeof window !== "undefined" && typeof window.LanguageModel !== "undefined";

  // Split text into chunks safely
  const splitToChunks = (str, size = 3000) => {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
    return chunks;
  };

  // 🔒 Proxy-based page text fetch (no CORS errors)
  async function fetchPageText(url) {
    async function parseHtmlToText(html, url) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      ["script", "style", "noscript", "header", "footer", "nav", "iframe", "form"].forEach(sel =>
        doc.querySelectorAll(sel).forEach(el => el.remove())
      );
      const main = doc.querySelector("main") || doc.querySelector("article") || doc.body;
      const titleEl = doc.querySelector("title");
      const title = titleEl ? titleEl.innerText.trim() : "";
      let text = (main && main.innerText) ? main.innerText : doc.body.innerText || "";
      text = text.replace(/\s+/g, " ").trim();
      return { title: title || url, text, url };
    }

    try {
      const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
      const html = await res.text();
      return await parseHtmlToText(html, url);
    } catch (err) {
      console.error("Proxy fetch failed:", err);
      throw new Error("Unable to fetch URL content (CORS blocked or invalid link).");
    }
  }

  // Enhanced URL detection for templates
  function isTemplateUrl(input) {
    const urlPattern = /^https?:\/\//i;
    const templateKeywords = [
      'template', 'design', 'layout', 'website', 'webpage', 'page', 
      'ui', 'interface', 'theme', 'style', 'design system'
    ];
    
    if (!urlPattern.test(input.trim())) return false;
    
    // Check if the URL might be pointing to a design/template resource
    const url = input.trim().toLowerCase();
    return templateKeywords.some(keyword => 
      url.includes(keyword) || 
      input.toLowerCase().includes('template') ||
      input.toLowerCase().includes('design')
    );
  }

  // Safe wrapper for AI prompt
  async function safePrompt(session, promptText) {
    try {
      return await session.prompt(promptText);
    } catch (err) {
      console.warn("safePrompt: retrying once", err);
      await new Promise(r => setTimeout(r, 500));
      return await session.prompt(promptText);
    }
  }

  // Detect target language from user input
  function detectTargetLanguage(input, action) {
    if (action !== "TRANSLATE") return undefined;
    
    const languagePatterns = {
      spanish: /(?:in|to|into)\s+(spanish|español)/gi,
      french: /(?:in|to|into)\s+(french|français)/gi,
      german: /(?:in|to|into)\s+(german|deutsch)/gi,
      italian: /(?:in|to|into)\s+(italian|italiano)/gi,
      portuguese: /(?:in|to|into)\s+(portuguese|português)/gi,
      russian: /(?:in|to|into)\s+(russian|русский)/gi,
      chinese: /(?:in|to|into)\s+(chinese|mandarin|中文)/gi,
      japanese: /(?:in|to|into)\s+(japanese|日本語)/gi,
      korean: /(?:in|to|into)\s+(korean|한국어)/gi,
      arabic: /(?:in|to|into)\s+(arabic|العربية)/gi,
      hindi: /(?:in|to|into)\s+(hindi|हिन्दी)/gi
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(input)) {
        return lang.charAt(0).toUpperCase() + lang.slice(1);
      }
    }

    // Default to English if no specific language detected
    return "English";
  }

  // Clean input text by removing language commands for translation
  function cleanTranslationInput(input) {
    return input.replace(/(?:translate|convert|in|to|into)\s+(?:to|in|into)?\s*(spanish|french|german|italian|portuguese|russian|chinese|japanese|korean|arabic|hindi|español|français|deutsch|italiano|português|русский|中文|日本語|한국어|العربية|हिन्दí)/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- Prompt Builder ---
  function buildInitialPrompt(action, chunk, meta = {}) {
    const { title, url, idx, total, targetLang } = meta;
    const header = `Page: ${title || "Untitled"}\nURL: ${url || "N/A"}\nChunk: ${idx}/${total}\n\n`;

    switch (action) {
      case "SUMMARIZE":
        return `${header}You are a professional summarizer. Output MARKDOWN only.\n` +
          `- Start with "# " title\n- Write 3–6 concise bullet points\n- Focus on key points and main ideas\n- Remove unnecessary details\n\n${chunk}`;
      case "SIMPLIFY":
        return `${header}Explain this simply in MARKDOWN for easy understanding.\n` +
          `- Start with a clear one-line summary\n- Then 2–4 short, easy-to-read paragraphs\n- Use simple language anyone can understand\n- Break down complex concepts\n\n${chunk}`;
      case "TRANSLATE":
        const lang = targetLang || "English";
        return `${header}Translate the following text to ${lang}. Maintain the original meaning and context.\n` +
          `- Ensure accurate translation preserving the original meaning\n` +
          `- Maintain proper grammar and natural phrasing in ${lang}\n` +
          `- Keep the same tone and style as the original\n` +
          `- If technical terms exist, translate appropriately or keep with explanation\n\n${chunk}`;
      case "PROOFREAD":
        return `${header}Proofread and improve grammar, spelling, and clarity:\n\n${chunk}`;
      case "FLASHCARDS":
        return `${header}Create useful flashcards from this content. Format in clear MARKDOWN:\n` +
          `- Start with "# Flashcards" heading\n` +
          `- Create 5-8 question and answer pairs\n` +
          `- Format each as: **Q:** Question text\n**A:** Answer text\n` +
          `- Make questions clear and educational\n` +
          `- Provide concise, accurate answers\n` +
          `- Cover the most important concepts\n\n${chunk}`;
      case "TEMPLATE":
        // Special handling for URLs - analyze the content to generate appropriate template
        if (meta.url) {
          return `${header}Analyze this webpage content and generate a clean, modern HTML + CSS template that captures the essence of this website.\n\n` +
            `GUIDELINES:\n` +
            `- Create a responsive HTML template with CSS\n` +
            `- Use modern CSS features like Flexbox/Grid\n` +
            `- Make it mobile-friendly\n` +
            `- Include a proper document structure\n` +
            `- Add comments for important sections\n` +
            `- Use semantic HTML elements\n` +
            `- Output in code blocks with proper formatting\n\n` +
            `WEBSITE CONTENT TO ANALYZE:\n${chunk}`;
        } else {
          return `${header}Generate clean, modern HTML + CSS template based on the following description.\n\n` +
            `GUIDELINES:\n` +
            `- Create responsive HTML with CSS\n` +
            `- Use modern CSS features\n` +
            `- Make it mobile-friendly\n` +
            `- Include proper document structure\n` +
            `- Add comments for important sections\n` +
            `- Use semantic HTML elements\n` +
            `- Output in code blocks with proper formatting\n\n` +
            `DESCRIPTION:\n${chunk}`;
        }
      default:
        return `${header}Process this text (${action}):\n\n${chunk}`;
    }
  }

  // --- Background Refinement (hidden from user) ---
  async function refineInBackground(session, action, text) {
    const prompt = `Clean this MARKDOWN: remove duplication, fix grammar, simplify phrasing, ensure clarity.\n\n${text}`;
    const raw = await safePrompt(session, prompt);
    return extractResultText(raw)?.trim() || text;
  }

  // --- Deduplication Wall ---
  function removeDuplicatesAcrossChunks(current, previousChunks) {
    let cleaned = current;
    for (const prev of previousChunks) {
      const prevSentences = prev.split(/[.!?]\s+/);
      for (const s of prevSentences) {
        if (s && s.length > 20 && cleaned.includes(s)) {
          cleaned = cleaned.replace(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), "");
        }
      }
    }
    return cleaned.replace(/\n\s*\n\s*\n/g, "\n\n").trim();
  }

  // --- Background Merge and Polish ---
  async function mergeAndPolishInBackground(session, parts, meta = {}) {
    const { title, url, action, targetLang } = meta;
    
    let mergePrompt = `Merge these sections into a single polished MARKDOWN document.\n` +
      `Remove duplicates, fix formatting, and ensure smooth flow.\n` +
      `Page: ${title}\nURL: ${url}\n\n${parts.join("\n\n---\n\n")}`;

    // Action-specific final polishing
    if (action === "SUMMARIZE") {
      mergePrompt = `Create a comprehensive summary from these sections. Ensure:\n` +
        `- Clear hierarchical structure with headings\n` +
        `- Concise bullet points for key information\n` +
        `- No redundant information\n` +
        `- Smooth flow between sections\n\n${parts.join("\n\n")}`;
    } else if (action === "SIMPLIFY") {
      mergePrompt = `Simplify and merge these sections into easy-to-understand content. Ensure:\n` +
        `- Simple language suitable for all readers\n` +
        `- Clear explanations of complex concepts\n` +
        `- Logical flow between paragraphs\n` +
        `- No technical jargon without explanation\n\n${parts.join("\n\n")}`;
    } else if (action === "TRANSLATE") {
      mergePrompt = `Merge these translated sections into a cohesive document in ${targetLang || "English"}.\n` +
        `Ensure consistent translation quality, proper grammar, and natural flow.\n\n${parts.join("\n\n")}`;
    } else if (action === "FLASHCARDS") {
      mergePrompt = `Merge these flashcard sections into a single comprehensive flashcard set.\n` +
        `Format as clean MARKDOWN with:\n` +
        `- "# Flashcards" heading at top\n` +
        `- Clear Q: and A: format for each pair\n` +
        `- Remove duplicate questions\n` +
        `- Ensure 8-12 high-quality educational flashcards\n\n${parts.join("\n\n")}`;
    } else if (action === "TEMPLATE") {
      mergePrompt = `Combine these template sections into a single, cohesive HTML + CSS template.\n` +
        `Ensure:\n` +
        `- Valid HTML5 and CSS3 code\n` +
        `- Proper code formatting in markdown code blocks\n` +
        `- No duplicate code sections\n` +
        `- Complete, working template structure\n` +
        `- Responsive design principles\n\n${parts.join("\n\n")}`;
    }

    const raw = await safePrompt(session, mergePrompt);
    return extractResultText(raw)?.trim() || parts.join("\n\n");
  }

  function extractResultText(result) {
    if (!result) return "";
    if (typeof result === "string") return result;
    if (result.content) return result.content;
    if (result.text) return result.text;
    if (Array.isArray(result.choices) && result.choices[0]) {
      return result.choices[0].text || result.choices[0].message?.content || "";
    }
    try { return JSON.stringify(result, null, 2); } catch { return String(result); }
  }

  // --- MAIN AI RUNNER ---
  const runAction = async (action, input, handlers = {}) => {
    const { onPartial, onRefined, onFinal, onError, targetLang } = handlers;
    if (!isAIAvailable()) {
      const msg = "AI not available in this browser.";
      onError?.(msg);
      throw new Error(msg);
    }

    setLoading(true);
    try {
      let meta = { title: null, url: null, action };
      let contentText = input;

      // Detect target language for TRANSLATE action
      let detectedTargetLang = targetLang;
      if (action === "TRANSLATE" && !targetLang) {
        detectedTargetLang = detectTargetLanguage(input, action);
        // Clean the input text by removing language commands
        contentText = cleanTranslationInput(input);
      }

      // For TRANSLATE action, show friendly usage tip
      if (action === "TRANSLATE") {
        onPartial?.({
          index: -1, // Special index for tips
          text: "🌍 **Translation Tips**\n\n" +
                "To translate to a specific language, include it in your prompt:\n\n" +
                "• **\"Translate this to Spanish: [your text]\"**\n" +
                "• **\"Convert this in French: [your text]\"**\n" +
                "• **\"Help me with this in German: [your text]\"**\n\n" +
                "Supported languages: Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi\n\n" +
                "*You can also paste URLs or documents to translate their content!*",
          status: "tip"
        });
      }

      // For TEMPLATE action, show friendly processing message
      if (action === "TEMPLATE") {
        onPartial?.({
          index: 0,
          text: "🛠️ **Template Generation in Progress**\n\nGenerating a high-quality template takes a bit more time as we're carefully crafting responsive HTML and CSS code. Don't worry - we're working on it and will have your template ready soon! ✨",
          status: "info"
        });
      }

      // Detect URL and fetch - FOR ALL ACTIONS INCLUDING TEMPLATE
      const urlPattern = /^https?:\/\//i;
      if (urlPattern.test(contentText.trim())) {
        try {
          const fetched = await fetchPageText(contentText.trim());
          meta.title = fetched.title;
          meta.url = fetched.url;
          contentText = fetched.text;
          
          // If template action with URL, use a smaller chunk size for better analysis
          if (action === "TEMPLATE" && contentText.length > 5000) {
            contentText = contentText.substring(0, 5000) + "\n\n[Content truncated for template generation...]";
          }
        } catch (fetchError) {
          console.warn("URL fetch failed, using URL as direct input:", fetchError);
          // If fetch fails, use the URL as direct input for template generation
          if (action === "TEMPLATE") {
            contentText = `Create a website template based on this URL: ${contentText}`;
          }
        }
      }

      if (!contentText || contentText.length < 10) {
        throw new Error("No valid text found to process.");
      }

      const session = await window.LanguageModel.create({ outputLanguage: "en" });
      
      // Adjust chunk size based on action
      let chunkSize = 3000;
      if (action === "TEMPLATE") chunkSize = 4000;
      if (action === "FLASHCARDS") chunkSize = 2000;
      
      const chunks = splitToChunks(contentText, chunkSize);
      const total = chunks.length;

      const initialParts = [];
      const refinedParts = [];

      for (let i = 0; i < total; i++) {
        const chunk = chunks[i];
        const metaChunk = { ...meta, idx: i + 1, total, targetLang: detectedTargetLang };

        try {
          // Step 1: Initial processing (show to user)
          const raw = await safePrompt(session, buildInitialPrompt(action, chunk, metaChunk));
          const initialText = extractResultText(raw) || "";
          initialParts.push(initialText);
          
          // Show initial result to user immediately
          onPartial?.({ index: i, text: initialText, status: "initial" });

          // Step 2: Background refinement (hidden from user)
          const refined = await refineInBackground(session, action, initialText);
          const deduped = removeDuplicatesAcrossChunks(refined, refinedParts);
          refinedParts.push(deduped);
          
        } catch (err) {
          const msg = `⚠️ Error in part ${i + 1}: ${err.message}`;
          console.warn(msg);
          onPartial?.({ index: i, text: msg, status: "error" });
        }
      }

      // Step 3: Final background merge and polish
      const finalOutput = await mergeAndPolishInBackground(session, refinedParts, { ...meta, targetLang: detectedTargetLang });
      onFinal?.({ text: finalOutput });

      setLoading(false);
      return finalOutput;
    } catch (err) {
      console.error("runAction failed:", err);
      onError?.(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { runAction, isAIAvailable, loading };
};