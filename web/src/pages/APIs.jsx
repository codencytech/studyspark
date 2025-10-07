import React from 'react';

const APIs = () => {
  const apis = [
    {
      name: 'Summarize',
      status: 'Available',
      description: 'Quickly condense long articles and texts into key points for faster learning',
      icon: '📊'
    },
    {
      name: 'Simplify', 
      status: 'Available',
      description: 'Make complex topics easier to understand by breaking down difficult language',
      icon: '✨'
    },
    {
      name: 'Translate',
      status: 'Available',
      description: 'Instantly translate text between different languages while maintaining meaning',
      icon: '🌍'
    },
    {
      name: 'Proofread',
      status: 'Available',
      description: 'Fix grammar mistakes and improve writing clarity for better communication',
      icon: '✏️'
    },
    {
      name: 'Generate Template',
      status: 'Available',
      description: 'Create HTML/CSS templates from any website with placeholder content for learning web development',
      icon: '💻'
    },
    {
      name: 'Flashcards',
      status: 'Available',
      description: 'Automatically convert any content into Q&A flashcards for effective studying',
      icon: '📝'
    },
    {
      name: 'Writer API',
      status: 'Coming Soon',
      description: 'Generate original content and creative writing from prompts',
      icon: '🖋️'
    },
    {
      name: 'Prompt API',
      status: 'Coming Soon',
      description: 'Advanced multimodal AI interactions and complex queries',
      icon: '💬'
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">AI Features</h1>
          <p className="page-subtitle">
            Powerful learning tools powered by Chrome's built-in AI
          </p>
        </div>

        <div className="apis-content">
          <div className="apis-intro">
            <h2>Smart Learning Features</h2>
            <p>
              StudySpark brings you essential AI tools designed specifically for learners. 
              Each feature works instantly in your browser, helping you study smarter without 
              compromising your privacy or breaking your workflow.
            </p>
          </div>

          <div className="apis-grid">
            {apis.map((api, index) => (
              <div key={index} className={`api-card ${api.status === 'Coming Soon' ? 'coming-soon' : ''}`}>
                <div className="api-header">
                  <div className="api-icon">{api.icon}</div>
                  <div className="api-status">{api.status}</div>
                </div>
                <h3 className="api-name">{api.name}</h3>
                <p className="api-description">{api.description}</p>
                <div className="api-glow"></div>
              </div>
            ))}
          </div>

          <div className="apis-info">
            <h3>Why It Works So Well</h3>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">🔒</span>
                <span>Your data never leaves your computer - complete privacy</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">⚡</span>
                <span>Instant results without waiting for servers</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💸</span>
                <span>Completely free - no hidden costs or subscriptions</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🎯</span>
                <span>Built specifically for students and learners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIs;