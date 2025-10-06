import React from 'react';

const About = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">About StudySpark</h1>
          <p className="page-subtitle">
            Revolutionizing learning with Chrome's built-in AI technology
          </p>
        </div>

        <div className="about-content">
          <div className="about-hero">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                StudySpark was born from a simple idea: learning should be accessible, 
                private, and enhanced by AI without compromising your data privacy. 
                We leverage Chrome's revolutionary built-in AI to bring powerful 
                learning tools directly to your browser.
              </p>
              
              <h3>Why We're Different</h3>
              <p>
                Unlike other AI tools that send your data to remote servers, 
                StudySpark processes everything locally on your device. This means 
                faster responses, complete privacy, and no subscription fees.
              </p>
            </div>
            
            <div className="about-stats">
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">On-Device Processing</div>
              </div>
              <div className="stat">
                <div className="stat-number">Zero</div>
                <div className="stat-label">Data Collection</div>
              </div>
              <div className="stat">
                <div className="stat-number">Free</div>
                <div className="stat-label">Forever</div>
              </div>
            </div>
          </div>

          <div className="tech-stack">
            <h2>Powered by Cutting-Edge Technology</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-icon">🤖</div>
                <h4>Gemini Nano</h4>
                <p>Google's advanced on-device AI model</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon">🌐</div>
                <h4>Chrome Built-in AI</h4>
                <p>Native browser AI capabilities</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon">⚡</div>
                <h4>Web Technologies</h4>
                <p>Modern React and Chrome Extensions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;