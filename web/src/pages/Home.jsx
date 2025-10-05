// src/Home.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAI } from "./hooks/useAI";

function markdownToHtml(md) {
  if (!md) return "";
  // escape then convert simple markdown to html (headings, bold, lists, paragraphs)
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let text = esc(md);

  // code fences (preserve)
  // headings
  text = text.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  text = text.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  text = text.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  // bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // inline code `x`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bullet lists
  text = text.replace(/^\s*-\s+(.*)$/gim, "<li>$1</li>");
  if (text.includes("<li>")) {
    text = text.replace(/(<li>[\s\S]*<\/li>)/gim, (m) => `<ul>${m}</ul>`);
    // simple fix for sequences of <li>
    text = text.replace(/<\/li>\s*<ul>/g, "</li><ul>");
  }
  // paragraphs
  text = text.replace(/\n{2,}/g, "</p><p>");
  text = "<p>" + text + "</p>";
  // tidy up empty paragraphs
  text = text.replace(/<p>\s*<\/p>/g, "");
  return text;
}

const Home = () => {
  const { runAction, isAIAvailable, loading } = useAI();
  const [inputText, setInputText] = useState("");
  const [action, setAction] = useState("SUMMARIZE");
  const [messages, setMessages] = useState([]); // array of {type:'user'|'ai', html, raw}
  const [aiParts, setAiParts] = useState([]);   // streaming parts: [{index, text, status}]
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // auto scroll to bottom
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiParts, isProcessing]);

  function appendUserMessage(text) {
    setMessages(prev => [...prev, { type: "user", text }]);
  }

  function setAiFromPartsAsHtml(parts) {
    // combine parts into a single HTML block (ordered)
    const html = parts.map(p => markdownToHtml(p.text)).join("<hr/>");
    // update messages: remove previous AI if exists and replace
    setMessages(prev => {
      // remove last AI message if present
      const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
      const base = lastIsAI ? prev.slice(0, -1) : prev;
      return [...base, { type: "ai", html, raw: parts.map(p => p.text).join("\n\n") }];
    });
  }

  // typing effect for initial partial: gradually reveal text
  function typeChunkText(index, fullText) {
    // We will render initial chunk as it's being typed into aiParts
    let i = 0;
    const speed = 8; // ms per char
    const interval = setInterval(() => {
      i++;
      setAiParts(prev => {
        const copy = prev.slice();
        const item = copy.find(p => p.index === index);
        if (!item) {
          // if not found, create
          copy.push({ index, text: fullText.slice(0, i), status: "initial" });
        } else {
          item.text = fullText.slice(0, i);
        }
        return copy.sort((a,b) => a.index - b.index);
      });
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);
  }

  const handleSend = async () => {
    if (!inputText.trim()) return;
    appendUserMessage(inputText);
    setAiParts([]); // reset streamed parts
    setIsProcessing(true);

    // Add placeholder AI message (so result-panel appears)
    setMessages(prev => [...prev, { type: "ai", html: "<p>Processing...</p>", raw: "" }]);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });

    // Handlers passed to useAI.runAction
    const onPartial = ({ index, text, status }) => {
      // initial partial -> type it
      if (status === "initial") {
        // create a placeholder part with empty text, then type
        setAiParts(prev => {
          const copy = prev.slice();
          copy[index] = { index, text: "", status: "initial" };
          return copy.filter(Boolean);
        });
        // start typing animation for this initial partial
        typeChunkText(index, text);
      } else {
        // other statuses are possible; treat similarly
        setAiParts(prev => {
          const copy = prev.slice();
          copy[index] = { index, text, status: status || "initial" };
          return copy.filter(Boolean).sort((a,b) => a.index - b.index);
        });
      }
      // update combined messages view
      setTimeout(() => setAiFromPartsAsHtml(getPartsArray()), 50);
    };

    const onRefined = ({ index, text }) => {
      // replace part with refined text immediately
      setAiParts(prev => {
        const copy = prev.slice();
        copy[index] = { index, text, status: "refined" };
        return copy.filter(Boolean).sort((a,b) => a.index - b.index);
      });
      setTimeout(() => setAiFromPartsAsHtml(getPartsArray()), 40);
    };

    const onFinal = ({ text }) => {
      // Replace AI blocks with final polished result
      const html = markdownToHtml(text);
      setMessages(prev => {
        // remove last AI placeholder if any
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html, raw: text }];
      });
      setAiParts([]);
      setIsProcessing(false);
    };

    const onError = (msg) => {
      // show friendly error in AI area
      setMessages(prev => {
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html: `<p>⚠️ ${escapeHtmlForUI(msg)}</p>`, raw: msg }];
      });
      setIsProcessing(false);
    };

    try {
      // run the action; pass callbacks
      const final = await runAction(action, inputText, {
        onPartial, onRefined, onFinal, onError, targetLang: undefined
      });
      // final is already handled by onFinal
    } catch (err) {
      const msg = err?.message || String(err);
      onError(msg);
    }
  };

  function getPartsArray() {
    // gather parts in order (aiParts may have sparse indices)
    const arr = aiParts.slice().sort((a,b) => (a.index - b.index));
    return arr.map(p => ({ index: p.index, text: p.text, status: p.status }));
  }

  function escapeHtmlForUI(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return (
    <div className="home-container">
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="bg-grid"></div>
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="home-wrap">
        <div className="title-section">
          <h1 className="home-title">StudySpark AI</h1>
          <p className="home-subtitle">Transform your learning with intelligent content processing</p>
        </div>

        <div className="input-section">
          <div className="input-container">
            <textarea
              className="home-input"
              placeholder="Enter text or URL to process..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <div className="input-decoration"></div>
          </div>
        </div>

        <div className="actions-section">
          <div className="action-selector">
            <div className="selector-label">
              <span className="selector-icon">⚡</span>
              <span>Action</span>
            </div>
            <select
              className="action-select"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="SUMMARIZE">Summarize</option>
              <option value="SIMPLIFY">Simplify</option>
              <option value="TRANSLATE">Translate</option>
              <option value="PROOFREAD">Proofread</option>
              <option value="FLASHCARDS">Flashcards</option>
              <option value="TEMPLATE">Template</option>
            </select>
          </div>
          
          <button className="action-button" onClick={handleSend} disabled={loading || isProcessing}>
            <span className="button-text">
              {(loading || isProcessing) ? "Processing..." : "Generate"}
            </span>
            <span className="button-icon">
              {(loading || isProcessing) ? (
                <div className="loader-small">
                  <div className="dot-small"></div>
                  <div className="dot-small"></div>
                  <div className="dot-small"></div>
                </div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          </button>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2 className="results-title">Results</h2>
            <div className="results-indicator">
              <span className="indicator-dot"></span>
              <span>AI Processing</span>
            </div>
          </div>
          
          <div className="result-panel" aria-live="polite">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type === "user" ? "user-message" : "ai-message"}`}>
                <div className="message-avatar">
                  {msg.type === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  {msg.type === "user" ? (
                    <div className="user-content">{msg.text.split("\n").map((l,i) => <p key={i}>{l}</p>)}</div>
                  ) : (
                    <div className="ai-content" dangerouslySetInnerHTML={{ __html: msg.html }} />
                  )}
                </div>
              </div>
            ))}

            {/* Streaming parts preview while processing */}
            {aiParts.length > 0 && (
              <div className="message ai-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="ai-content" dangerouslySetInnerHTML={{ __html: aiParts.map(p => markdownToHtml(p.text)).join("<hr/>") }} />
                </div>
              </div>
            )}

            {(loading || isProcessing) && (
              <div className="processing-indicator">
                <div className="processing-animation">
                  <div className="processing-bar"></div>
                </div>
                <div className="processing-text">AI is generating your content...</div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;