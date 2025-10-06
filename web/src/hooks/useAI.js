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

  // --- Prompt Builder ---
  function buildInitialPrompt(action, chunk, meta = {}) {
    const { title, url, idx, total, targetLang } = meta;
    const header = `Page: ${title || "Untitled"}\nURL: ${url || "N/A"}\nChunk: ${idx}/${total}\n\n`;

    switch (action) {
      case "SUMMARIZE":
        return `${header}You are a professional summarizer. Output MARKDOWN only.\n` +
          `- Start with "# " title\n- Write 3–6 concise bullet points\n\n${chunk}`;
      case "SIMPLIFY":
        return `${header}Explain this simply in MARKDOWN.\n` +
          `- Start with a one-line summary\n- Then 2–4 short paragraphs\n\n${chunk}`;
      case "TRANSLATE":
        return `${header}Translate to ${targetLang || "English"}:\n\n${chunk}`;
      case "PROOFREAD":
        return `${header}Proofread and improve grammar:\n\n${chunk}`;
      case "FLASHCARDS":
        return `${header}Create JSON flashcards [{"q":"", "a":""}] from:\n\n${chunk}`;
      case "TEMPLATE":
        return `${header}Generate HTML + CSS (inside code blocks):\n\n${chunk}`;
      default:
        return `${header}Process this text (${action}):\n\n${chunk}`;
    }
  }

  // --- Refinement Wall (grammar, clarity) ---
  async function refineChunk(session, action, text) {
    const prompt = `Clean this MARKDOWN: remove duplication, fix grammar, simplify phrasing.\n\n${text}`;
    const raw = await safePrompt(session, prompt);
    return extractResultText(raw)?.trim() || text;
  }

  // --- Deduplication Wall ---
  function removeDuplicatesAcrossChunks(current, previousChunks) {
    let cleaned = current;
    for (const prev of previousChunks) {
      const prevSentences = prev.split(/[.!?]\s+/);
      for (const s of prevSentences) {
        if (s && cleaned.includes(s)) {
          cleaned = cleaned.replace(s, "");
        }
      }
    }
    return cleaned.trim();
  }

  // --- Merge all refined chunks ---
  async function mergeAndPolish(session, parts, meta = {}) {
    const { title, url } = meta;
    const prompt = `Merge these sections into a single polished MARKDOWN document.\n` +
      `Remove leftover duplicates and fix formatting.\n` +
      `Page: ${title}\nURL: ${url}\n\n${parts.join("\n\n---\n\n")}`;
    const raw = await safePrompt(session, prompt);
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
      let meta = { title: null, url: null };
      let contentText = input;

      // Detect URL and fetch
      const urlPattern = /^https?:\/\//i;
      if (urlPattern.test(input.trim())) {
        const fetched = await fetchPageText(input.trim());
        meta.title = fetched.title;
        meta.url = fetched.url;
        contentText = fetched.text;
      }

      if (!contentText || contentText.length < 10) {
        throw new Error("No valid text found to process.");
      }

      const session = await window.LanguageModel.create({ outputLanguage: "en" });
      const chunks = splitToChunks(contentText, 3000);
      const total = chunks.length;

      const refinedParts = [];

      for (let i = 0; i < total; i++) {
        const chunk = chunks[i];
        const metaChunk = { title: meta.title, url: meta.url, idx: i + 1, total, targetLang };

        try {
          // Wall 1: Initial AI Processing
          const raw = await safePrompt(session, buildInitialPrompt(action, chunk, metaChunk));
          const text = extractResultText(raw) || "";
          onPartial?.({ index: i, text, status: "initial" });

          // Wall 2: Refine + Deduplicate
          const refined = await refineChunk(session, action, text);
          const deduped = removeDuplicatesAcrossChunks(refined, refinedParts);
          refinedParts.push(deduped);
          onRefined?.({ index: i, text: deduped, status: "refined" });
        } catch (err) {
          const msg = `⚠️ Error in part ${i + 1}: ${err.message}`;
          console.warn(msg);
          onPartial?.({ index: i, text: msg, status: "error" });
        }
      }

      // Wall 3: Final Merge
      const finalOutput = await mergeAndPolish(session, refinedParts, meta);
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
