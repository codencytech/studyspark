import React from 'react';

const Extension = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/studyspark-extension.zip';
    link.download = 'studyspark-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Download StudySpark Extension</h1>
          <p className="page-subtitle">
            Supercharge your browsing experience with our Chrome extension
          </p>
        </div>

        <div className="extension-content">
          <div className="extension-hero">
            <div className="extension-visual">
              <div className="browser-mockup">
                <div className="browser-header">
                  <div className="browser-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="browser-content">
                  <div className="extension-popup">
                    <div className="popup-header">
                      <div className="popup-logo">
                        <div className="logo-spark"></div>
                      </div>
                      <span className="popup-title">StudySpark</span>
                    </div>
                    <div className="popup-actions">
                      <div className="action-button">Summarize</div>
                      <div className="action-button">Simplify</div>
                      <div className="action-button">Translate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="extension-info">
              <h2>One-Click AI Magic</h2>
              <p>
                Transform any webpage instantly with Chrome's built-in AI.
                No data sent to servers, completely private and free.
              </p>

              <div className="download-section">
                <button className="download-button" onClick={handleDownload}>
                  <div className="download-icon-wrapper">
                    <svg className="download-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16L12 4M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="download-pulse"></div>
                  </div>
                  <span className="download-text">
                    Download Extension
                    <span className="download-subtext">Get started in seconds</span>
                  </span>
                </button>
                <div className="download-info">
                  <span className="version">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Instructions Section */}
          <div className="installation-guide">
            <h2 className="guide-title">Installation Guide</h2>
            <div className="guide-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Download the Extension</h3>
                  <p>Click the download button above to get the StudySpark extension ZIP file</p>
                  <div className="step-image">
                    <img src="./images/download-step.jpg" alt="Download extension" />
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Extract the ZIP File</h3>
                  <p>Unzip the downloaded file to a folder on your computer</p>
                  <div className="step-image">
                    <img src="/images/extract-step.jpg" alt="Extract ZIP file" />
                  </div>
                  <div className="step-image">
                    <img src="/images/unzipit.jpg" alt="Extract ZIP file" />
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Open Chrome Extensions</h3>
                  <p>Navigate to <code>chrome://extensions/</code> in your Chrome browser</p>
                  <div className="step-image">
                    <img src="/images/extensions-page.jpg" alt="Chrome extensions page" />
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Enable Developer Mode</h3>
                  <p>Toggle the "Developer mode" switch in the top right corner</p>
                  <div className="step-image">
                    <img src="/images/developer-mode.jpg" alt="Enable developer mode" />
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Load Unpacked Extension</h3>
                  <p>Click "Load unpacked" and select the extracted extension folder</p>
                  <div className="step-image">
                    <img src="/images/load-unpacked.jpg" alt="Load unpacked extension" />
                  </div>
                  <div className="step-image">
                    <img src="/images/selectfolder.jpg" alt="Load unpacked extension" />
                  </div>
                </div>
              </div>
              <div className="step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h3>Start Using</h3>
                  <p>Pin the extension and click on any webpage to use AI features</p>
                  <div className="step-image">
                    <img src="/images/using-extension.jpg" alt="Using the extension" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>100% Private</h3>
              <p>All processing happens locally on your device</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>No waiting for cloud processing</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💸</div>
              <h3>Completely Free</h3>
              <p>No subscriptions or usage limits</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌐</div>
              <h3>Works Everywhere</h3>
              <p>Compatible with all websites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Extension;