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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const resultsContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isStopped, setIsStopped] = useState(false);
  const processingIntervalsRef = useRef([]);

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

  // Stop generation function - COMPLETELY STOP AI
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear all intervals
    processingIntervalsRef.current.forEach(interval => clearInterval(interval));
    processingIntervalsRef.current = [];
    
    setIsStopped(true);
    setIsProcessing(false);
    setAiParts([]);
    
    // Remove the "Processing..." AI message and keep only user message
    setMessages(prev => {
      const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
      const base = lastIsAI ? prev.slice(0, -1) : prev;
      
      // If we have any AI messages, ensure they're complete (not partial)
      return base.map(msg => {
        if (msg.type === "ai" && msg.html === "<p>Processing...</p>") {
          return { ...msg, html: "<p><em>Generation stopped by user</em></p>" };
        }
        return msg;
      });
    });
  };

  // Regenerate last message - placed at bottom of AI response
  const handleRegenerate = async () => {
    if (messages.length === 0) return;
    
    // Find the last user message
    const lastUserMessageIndex = messages.map((msg, idx) => msg.type === "user" ? idx : -1)
      .filter(idx => idx !== -1)
      .pop();

    if (lastUserMessageIndex === undefined) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    // Remove the current AI response
    setMessages(prev => prev.slice(0, lastUserMessageIndex + 1));
    
    // Reset stopped state
    setIsStopped(false);
    
    // Resend the same prompt
    await handleSendMessage(lastUserMessage.text, lastUserMessage.action, true);
  };

  // Edit and resend message
  const handleEdit = (index, text, originalAction) => {
    setEditingIndex(index);
    setEditText(text);
    setAction(originalAction);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editText.trim()) return;
    
    // Remove messages from the edited message onward
    setMessages(prev => prev.slice(0, editingIndex));
    setEditingIndex(null);
    setIsStopped(false);
    await handleSendMessage(editText, action, false);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  // Main send message function
  const handleSendMessage = async (text, messageAction, isRegenerate = false) => {
    if (!text.trim()) return;
    
    // Reset stopped state when starting new generation
    setIsStopped(false);
    
    // Scroll to results first
    scrollToResults();
    
    if (!isRegenerate) {
      appendUserMessage(text, messageAction);
    }
    
    setAiParts([]);
    setIsProcessing(true);

    if (!isRegenerate) {
      setMessages(prev => [...prev, { type: "ai", html: "<p>Processing...</p>", raw: "" }]);
    }

    // Create abort controller for stopping
    abortControllerRef.current = new AbortController();

    const onPartial = ({ index, text, status }) => {
      if (abortControllerRef.current?.signal.aborted || isStopped) return;
      
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
      if (abortControllerRef.current?.signal.aborted || isStopped) return;
      
      setAiParts(prev => {
        const copy = prev.slice();
        copy[index] = { index, text, status: "refined" };
        return copy.filter(Boolean).sort((a,b) => a.index - b.index);
      });
      setTimeout(() => setAiFromPartsAsHtml(getPartsArray()), 40);
    };

    const onFinal = ({ text }) => {
      if (abortControllerRef.current?.signal.aborted || isStopped) return;
      
      const html = markdownToHtml(text);
      setMessages(prev => {
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html, raw: text }];
      });
      setAiParts([]);
      setIsProcessing(false);
      abortControllerRef.current = null;
      
      // Clear all intervals
      processingIntervalsRef.current.forEach(interval => clearInterval(interval));
      processingIntervalsRef.current = [];
    };

    const onError = (msg) => {
      setMessages(prev => {
        const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
        const base = lastIsAI ? prev.slice(0, -1) : prev;
        return [...base, { type: "ai", html: `<p>⚠️ ${escapeHtmlForUI(msg)}</p>`, raw: msg }];
      });
      setIsProcessing(false);
      abortControllerRef.current = null;
      
      // Clear all intervals
      processingIntervalsRef.current.forEach(interval => clearInterval(interval));
      processingIntervalsRef.current = [];
    };

    try {
      await runAction(messageAction, text, {
        onPartial, onRefined, onFinal, onError, targetLang: undefined,
        signal: abortControllerRef.current?.signal
      });
    } catch (err) {
      if (err.name === 'AbortError' || isStopped) {
        console.log('Generation stopped by user');
        // Update the processing message to show it was stopped
        setMessages(prev => {
          const lastIsAI = prev.length && prev[prev.length - 1].type === "ai";
          const base = lastIsAI ? prev.slice(0, -1) : prev;
          return [...base, { type: "ai", html: "<p><em>Generation stopped</em></p>", raw: "Generation stopped" }];
        });
        return;
      }
      const msg = err?.message || String(err);
      onError(msg);
    }
  };

  const handleSend = async () => {
    await handleSendMessage(inputText, action, false);
    setInputText("");
  };

  function appendUserMessage(text, messageAction) {
    setMessages(prev => [...prev, { type: "user", text, action: messageAction }]);
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
      if (abortControllerRef.current?.signal.aborted || isStopped) {
        clearInterval(interval);
        return;
      }
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
      if (i >= fullText.length) {
        clearInterval(interval);
        // Remove this interval from our tracking
        processingIntervalsRef.current = processingIntervalsRef.current.filter(int => int !== interval);
      }
    }, speed);
    
    // Track this interval for cleanup
    processingIntervalsRef.current.push(interval);
  }

  function getPartsArray() {
    const arr = aiParts.slice().sort((a,b) => (a.index - b.index));
    return arr.map(p => ({ index: p.index, text: p.text, status: p.status }));
  }

  function escapeHtmlForUI(s) {
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Check if we can show regenerate button (only after last AI response is complete)
  const canRegenerate = messages.length > 0 && 
    messages[messages.length - 1].type === "ai" && 
    !isProcessing && 
    aiParts.length === 0 &&
    !isStopped;

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

              <div className="action-buttons">
                <button 
                  className="generate-button" 
                  onClick={isStopped ? () => handleRegenerate() : handleSend} 
                  disabled={loading || (isProcessing && !isStopped) || !inputText.trim()}
                >
                  <span className="button-content">
                    {isStopped ? (
                      <>
                        <span className="button-icon">🔄</span>
                        Regenerate
                      </>
                    ) : (loading || isProcessing) ? (
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

                {/* Stop Button - Only show when processing and not stopped */}
                {isProcessing && !isStopped && (
                  <button 
                    className="stop-button"
                    onClick={handleStop}
                  >
                    <span className="button-content">
                      <span className="button-icon">⏹️</span>
                      Stop
                    </span>
                  </button>
                )}
              </div>
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
                              {editingIndex === idx ? (
                                <div className="edit-container">
                                  <textarea
                                    className="edit-textarea"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={4}
                                  />
                                  <div className="edit-actions">
                                    <button className="save-edit" onClick={handleSaveEdit}>
                                      Send
                                    </button>
                                    <button className="cancel-edit" onClick={handleCancelEdit}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {msg.text.split("\n").map((l,i) => <p key={i}>{l}</p>)}
                                  <button 
                                    className="edit-button"
                                    onClick={() => handleEdit(idx, msg.text, msg.action)}
                                  >
                                    ✏️ Edit
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ai-content" dangerouslySetInnerHTML={{ __html: msg.html }} />
                            {/* Regenerate Button - Only show at bottom of last AI message */}
                            {idx === messages.length - 1 && canRegenerate && (
                              <div className="regenerate-container">
                                <button 
                                  className="regenerate-button"
                                  onClick={handleRegenerate}
                                >
                                  <span className="button-content">
                                    <span className="button-icon">🔄</span>
                                    Regenerate Response
                                  </span>
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming parts - only show if not stopped */}
                  {aiParts.length > 0 && !isStopped && (
                    <div className="message ai-message">
                      <div className="message-avatar">🤖</div>
                      <div className="message-content">
                        <div className="ai-content" dangerouslySetInnerHTML={{ __html: aiParts.map(p => markdownToHtml(p.text)).join("<hr/>") }} />
                      </div>
                    </div>
                  )}

                  {/* Processing state - only show if not stopped */}
                  {(loading || isProcessing) && !isStopped && (
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