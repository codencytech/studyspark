import React from 'react';

const Cookies = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Cookies Policy</h1>
          <p className="page-subtitle">
            Our approach to cookies and tracking
          </p>
        </div>

        <div className="legal-content">
          <div className="legal-section">
            <h2>No Cookies Used</h2>
            <p>
              StudySpark does not use any cookies, tracking technologies, or 
              analytics services. We believe in complete user privacy and have 
              designed our application to function without storing any data 
              on your device or our servers.
            </p>
          </div>

          <div className="legal-section">
            <h2>Local Storage</h2>
            <p>
              The application may use browser local storage solely for storing 
              your preferences (like theme settings) locally on your device. 
              This data never leaves your computer and is not shared with us 
              or any third parties.
            </p>
          </div>

          <div className="legal-section">
            <h2>Third-Party Services</h2>
            <p>
              We do not integrate with any third-party services that might 
              set cookies or track your activity. All AI processing is done 
              locally through Chrome's built-in AI APIs.
            </p>
          </div>

          <div className="legal-section">
            <h2>Your Consent</h2>
            <p>
              By using StudySpark, you acknowledge that we do not use cookies 
              and that your privacy is maintained throughout your experience 
              with our application.
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

export default Cookies;