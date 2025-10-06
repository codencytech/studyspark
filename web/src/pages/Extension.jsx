import React from 'react';
import { Link } from 'react-router-dom';

const Extension = () => {
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
                <button className="download-button">
                  <span className="download-icon">⬇️</span>
                  Download Extension
                </button>
                <div className="download-info">
                  <span className="version">v1.0.0</span>
                  <span className="size">• 2.3 MB</span>
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