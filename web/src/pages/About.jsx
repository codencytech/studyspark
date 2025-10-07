import React from 'react';

const About = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">About StudySpark</h1>
          <p className="page-subtitle">
            Your AI learning companion that works right in your browser
          </p>
        </div>

        <div className="about-content">
          <div className="about-hero">
            <div className="about-text">
              <h2>What is StudySpark?</h2>
              <p>
                StudySpark is a smart learning tool that lives in your browser. 
                Imagine having a study buddy that can instantly summarize long articles, 
                simplify complex topics, translate languages, and help you learn better - 
                all without sending your data anywhere. That's StudySpark.
              </p>
              
              <h3>Chrome Extension - One-Click AI Magic</h3>
              <p>
                Our Chrome extension brings AI power directly to any webpage. Just install it once 
                and get instant access to all AI features without copying and pasting. Highlight any 
                text or click the extension icon to process entire pages. Perfect for quick learning 
                while browsing articles, research papers, or educational content.
              </p>

              <h3>Web App - Full-Featured AI Platform</h3>
              <p>
                Prefer working in a dedicated interface? Our web app gives you the complete 
                StudySpark experience with a beautiful, focused workspace. Great for longer 
                content, detailed analysis, and when you're working on mobile devices where 
                Chrome extensions aren't available.
              </p>

              <h3>Built with Privacy First</h3>
              <p>
                We believe your learning data should stay yours. That's why everything 
                happens right on your device. No cloud servers, no data collection, 
                just pure learning assistance that respects your privacy.
              </p>

              <h3>How It Works</h3>
              <p>
                Whether you choose the extension or web app, StudySpark uses your browser's 
                own AI capabilities to process text locally. Select text and click the extension, 
                or paste content in our web interface - you'll get instant learning support 
                without any data leaving your computer.
              </p>
            </div>
            
            <div className="about-stats">
              <div className="stat">
                <div className="stat-number">100%</div>
                <div className="stat-label">Private & Secure</div>
              </div>
              <div className="stat">
                <div className="stat-number">Instant</div>
                <div className="stat-label">AI Assistance</div>
              </div>
              <div className="stat">
                <div className="stat-number">Free</div>
                <div className="stat-label">Always Free</div>
              </div>
            </div>
          </div>

          <div className="tech-stack">
            <h2>How We Made It Possible</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-icon">🚀</div>
                <h4>Browser Technology</h4>
                <p>Built using modern Chrome extension capabilities and web technologies</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon">🤝</div>
                <h4>Chrome AI Integration</h4>
                <p>Special thanks to the Chrome team for making built-in AI accessible to developers</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon">💡</div>
                <h4>Learning Focused</h4>
                <p>Designed specifically to help students and learners of all kinds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;