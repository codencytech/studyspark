import React from 'react';

const Privacy = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-subtitle">
            How we protect your data and privacy
          </p>
        </div>

        <div className="legal-content">
          <div className="legal-section">
            <h2>Data Collection</h2>
            <p>
              StudySpark is designed with privacy as a core principle. We do not collect, 
              store, or transmit any personal data from our users. All AI processing happens 
              locally on your device using Chrome's built-in AI capabilities.
            </p>
          </div>

          <div className="legal-section">
            <h2>Information We Don't Collect</h2>
            <ul>
              <li>Personal identification information</li>
              <li>Browser history or browsing data</li>
              <li>Content you process with our AI tools</li>
              <li>IP addresses or location data</li>
              <li>Usage statistics or analytics</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>Local Processing</h2>
            <p>
              All AI operations including summarization, translation, proofreading, 
              and other features are performed entirely on your device. No data is 
              sent to external servers or third-party services.
            </p>
          </div>

          <div className="legal-section">
            <h2>Chrome Extension Permissions</h2>
            <p>
              Our Chrome extension requires access to webpage content solely to 
              extract text for AI processing. This content is processed locally 
              and immediately discarded after generating results.
            </p>
          </div>

          <div className="legal-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify 
              you of any changes by posting the new Privacy Policy on this page.
            </p>
          </div>

          <div className="legal-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </div>

          <div className="legal-update">
            <p><strong>Last updated:</strong> October 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;