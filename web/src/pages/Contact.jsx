import React from 'react';

const Contact = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">
            We're here to help you make the most of StudySpark
          </p>
        </div>
        
        <div className="contact-content">
          <div className="contact-hero">
            <div className="contact-intro">
              <h2>Let's Connect</h2>
              <p>
                Whether you have questions about features, need technical support, 
                want to report an issue, or have suggestions for improvement - 
                we're always excited to hear from our users.
              </p>
            </div>

            <div className="contact-grid">
              <div className="contact-card">
                <div className="card-glow"></div>
                <div className="contact-icon">💌</div>
                <h3>Email Support</h3>
                <p>Get direct help from our team for any questions or issues</p>
                <div className="contact-detail">
                  <span className="detail-label">Email Address:</span>
                  <a href="mailto:codencyindia@gmail.com" className="detail-value">
                    codencyindia@gmail.com
                  </a>
                </div>
                <div className="response-time">
                  <span className="time-badge">Typically replies within 24 hours</span>
                </div>
              </div>

              <div className="contact-card">
                <div className="card-glow"></div>
                <div className="contact-icon">🐙</div>
                <h3>GitHub Issues</h3>
                <p>Report bugs, request features, or contribute to the project</p>
                <div className="contact-detail">
                  <span className="detail-label">Repository:</span>
                  <span className="detail-value">studyspark-ai</span>
                </div>
                <div className="contact-actions">
                  <a href="https://github.com/codencytech/studyspark" className="github-button" target="_blank" rel="noopener noreferrer">
                    View Repository
                  </a>
                </div>
              </div>

              <div className="contact-card">
                <div className="card-glow"></div>
                <div className="contact-icon">🚀</div>
                <h3>Quick Support</h3>
                <p>Common questions and documentation to help you get started</p>
                <div className="support-links">
                  <a href="/guide" className="support-link">📖 User Guide</a>
                  <a href="/apis" className="support-link">🔧 API Documentation</a>
                  <a href="/extension" className="support-link">⚡ Extension Setup</a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-cta">
            <div className="cta-content">
              <h3>Building the Future of Learning Together</h3>
              <p>
                Your feedback helps us improve StudySpark for everyone. 
                Don't hesitate to reach out - we're committed to making 
                your learning experience exceptional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;