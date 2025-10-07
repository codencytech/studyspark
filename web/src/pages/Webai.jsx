import React, { useState, useRef } from "react";
import { useAI } from "../hooks/useAI";

function markdownToHtml(md) {
  if (!md) return "";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let text = esc(md);

  text = text.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  text = text.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  text = text.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/^\s*-\s+(.*)$/gim, "<li>$1</li>");
  if (text.includes("<li>")) {
    text = text.replace(/(<li>[\s\S]*<\/li>)/gim, (m) => `<ul>${m}</ul>`);
    text = text.replace(/<\/li>\s*<ul>/g, "</li><ul>");
  }
  text = text.replace(/\n{2,}/g, "</p><p>");
  text = "<p>" + text + "</p>";
  text = text.replace(/<p>\s*<\/p>/g, "");
  return text;
}

const Webai = () => {
  const { runAction, isAIAvailable, loading } = useAI();
  const [inputText, setInputText] = useState("");
  const [action, setAction] = useState("SUMMARIZE");
  const [messages, setMessages] = useState([]);
  const [aiParts, setAiParts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const resultsContainerRef = useRef(null);

  const scrollToResults = () => {
    setTimeout(() => {
      if (resultsContainerRef.current) {
        resultsContainerRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      }
    }, 100);
  };

  function appendUserMessage(text) {
    setMessages(prev => [...prev, { type: "user", text }]);
  }

  function setAiFromPartsAsHtml(parts) {
    const html = parts.map(p => markdownToHtml(p.text)).join("<hr/>");
    setMessages(prev => {
      const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
      const base = lastIsAI ? prev.slice(0, -1) : prev;
      return [...base, { type: "ai", html, raw: parts.map(p => p.text).join("\n\n") }];
    });
  }

  function typeChunkText(index, fullText) {
    let i = 0;
    const speed = 8;
    const interval = setInterval(() => {
      i++;
      setAiParts(prev => {
        const copy = prev.slice();
        const item = copy.find(p => p.index === index);
        if (!item) {
          copy.push({ index, text: fullText.slice(0, i), status: "initial" });
        } else {
          item.text = fullText.slice(0, i);
        }
        return copy.sort((a,b) => a.index - b.index);
      });
      if (i >= fullText.length) clearInterval(interval);
    }, speed);
  }

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    // Scroll to results first
    scrollToResults();
    
    appendUserMessage(inputText);
    setAiParts([]);
    setIsProcessing(true);

    setMessages(prev => [...prev, { type: "ai", html: "<p>Processing...</p>", raw: "" }]);

    const onPartial = ({ index, text, status }) => {
      if (status === "initial") {
        setAiParts(prev => {
          const copy = prev.slice();
          copy[index] = { index, text: "", status: "initial" };
          return copy.filter(Boolean);
        });
        typeChunkText(index, text);
      } else {
        setAiParts(prev => {
          const copy = prev.slice();
          copy[index] = { index, text, status: status || "initial" };
          return copy.filter(Boolean).sort((a,b) => a.index - b.index);
        });
      }
      setTimeout(() => setAiFromPartsAsHtml(getPartsArray()), 50);
    };

    const onRefined = ({ index, text }) => {
      setAiParts(prev => {
        const copy = prev.slice();
        copy[index] = { index, text, status: "refined" };
        return copy.filter(Boolean).sort((a,b) => a.index - b.index);
      });
      setTimeout(() => setAiFromPartsAsHtml(getPartsArray()), 40);
    };

    const onFinal = ({ text }) => {
      const html = markdownToHtml(text);
      setMessages(prev => {
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html, raw: text }];
      });
      setAiParts([]);
      setIsProcessing(false);
    };

    const onError = (msg) => {
      setMessages(prev => {
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html: `<p>⚠️ ${escapeHtmlForUI(msg)}</p>`, raw: msg }];
      });
      setIsProcessing(false);
    };

    try {
      await runAction(action, inputText, {
        onPartial, onRefined, onFinal, onError, targetLang: undefined
      });
    } catch (err) {
      const msg = err?.message || String(err);
      onError(msg);
    }
  };

  function getPartsArray() {
    const arr = aiParts.slice().sort((a,b) => (a.index - b.index));
    return arr.map(p => ({ index: p.index, text: p.text, status: p.status }));
  }

  function escapeHtmlForUI(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">StudySpark AI</h1>
          <p className="page-subtitle">
            Transform any content with Chrome's built-in AI technology
          </p>
        </div>

        <div className="ai-interface">
          {/* Input Section */}
          <div className="ai-input-section">
            <div className="input-card">
              <div className="input-header">
                <div className="input-icon">📝</div>
                <h3>Enter Your Content</h3>
              </div>
              <div className="input-container">
                <textarea
                  className="ai-textarea"
                  placeholder="Paste text, enter a URL, or describe what you need..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                />
                <div className="textarea-decoration"></div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="actions-card">
              <div className="actions-header">
                <div className="actions-icon">⚡</div>
                <h3>AI Actions</h3>
              </div>
              
              <div className="action-selector">
                <select
                  className="action-select"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option value="SUMMARIZE">📊 Summarize</option>
                  <option value="SIMPLIFY">✨ Simplify</option>
                  <option value="TRANSLATE">🌍 Translate</option>
                  <option value="PROOFREAD">✏️ Proofread</option>
                  <option value="FLASHCARDS">🎴 Flashcards</option>
                  <option value="TEMPLATE">💻 Generate Template</option>
                </select>
              </div>

              <button 
                className="generate-button" 
                onClick={handleSend} 
                disabled={loading || isProcessing}
              >
                <span className="button-content">
                  {(loading || isProcessing) ? (
                    <>
                      <div className="button-loader">
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">🚀</span>
                      Generate
                    </>
                  )}
                </span>
                <div className="button-glow"></div>
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="results-section" ref={resultsContainerRef}>
            <div className="results-header">
              <h2 className="results-title">AI Results</h2>
              <div className="results-indicator">
                <span className="indicator-dot"></span>
                <span>Real-time Processing</span>
              </div>
            </div>

            <div className="results-container">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🤖</div>
                  <h3>Ready to Transform Your Content</h3>
                  <p>Enter some text above and choose an AI action to get started</p>
                </div>
              ) : (
                <div className="messages-container">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type === "user" ? "user-message" : "ai-message"}`}>
                      <div className="message-avatar">
                        {msg.type === "user" ? "👤" : "🤖"}
                      </div>
                      <div className="message-content">
                        {msg.type === "user" ? (
                          <div className="user-content">
                            <div className="user-bubble">
                              {msg.text.split("\n").map((l,i) => <p key={i}>{l}</p>)}
                            </div>
                          </div>
                        ) : (
                          <div className="ai-content" dangerouslySetInnerHTML={{ __html: msg.html }} />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming parts */}
                  {aiParts.length > 0 && (
                    <div className="message ai-message">
                      <div className="message-avatar">🤖</div>
                      <div className="message-content">
                        <div className="ai-content" dangerouslySetInnerHTML={{ __html: aiParts.map(p => markdownToHtml(p.text)).join("<hr/>") }} />
                      </div>
                    </div>
                  )}

                  {(loading || isProcessing) && (
                    <div className="processing-state">
                      <div className="processing-animation">
                        <div className="processing-orb"></div>
                        <div className="processing-ring"></div>
                      </div>
                      <p>AI is generating your content...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webai;