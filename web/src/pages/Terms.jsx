import React from 'react';

const Terms = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-subtitle">
            Guidelines for using StudySpark
          </p>
        </div>

        <div className="legal-content">
          <div className="legal-section">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using StudySpark, you accept and agree to be bound 
              by the terms and provision of this agreement.
            </p>
          </div>

          <div className="legal-section">
            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use StudySpark for personal, 
              non-commercial purposes. This is the grant of a license, not a 
              transfer of title.
            </p>
          </div>

          <div className="legal-section">
            <h2>User Responsibilities</h2>
            <ul>
              <li>Use the service for lawful purposes only</li>
              <li>Do not attempt to reverse engineer the software</li>
              <li>Do not use the service to generate harmful content</li>
              <li>Respect intellectual property rights of others</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>AI-Generated Content</h2>
            <p>
              StudySpark provides AI-generated content for educational and 
              assistance purposes. Users are responsible for verifying the 
              accuracy and appropriateness of generated content for their 
              specific use cases.
            </p>
          </div>

          <div className="legal-section">
            <h2>Limitations</h2>
            <p>
              StudySpark is provided "as is" without any warranties. We are not 
              liable for any damages arising from the use or inability to use 
              our service.
            </p>
          </div>

          <div className="legal-section">
            <h2>Termination</h2>
            <p>
              We may terminate or suspend access to our service immediately, 
              without prior notice, for any violation of these Terms.
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

export default Terms;