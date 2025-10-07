import React from 'react';
import { Link } from 'react-router-dom';

const Guide = () => {
  const steps = [
    {
      title: 'Choose Your Platform',
      description: 'Select how you want to use StudySpark based on your needs',
      icon: '🖥️',
      options: [
        { text: 'Web AI', link: '/ai', description: 'Use our web interface for quick AI tasks' },
        { text: 'Chrome Extension', link: '/extension', description: 'Install extension for on-page content processing' }
      ]
    },
    {
      title: 'Using the Web AI',
      description: 'How to use our web interface effectively',
      icon: '🚀',
      instructions: [
        'Type or paste any text content in the input box',
        'Select from 6 AI actions: Summarize, Simplify, Translate, Proofread, Generate Template, or Flashcards',
        'Click the action button and get instant AI-powered results',
        'Copy the results for your use'
      ]
    },
    {
      title: 'Using Chrome Extension',
      description: 'How to use our browser extension',
      icon: '⚡',
      instructions: [
        'Install the extension from our download page',
        'Visit any webpage with text content',
        'Click the StudySpark extension icon in your browser',
        'Select any AI action to process the current page content',
        'View results in a popup window'
      ]
    },
    {
      title: 'Available AI Features',
      description: 'What you can do with StudySpark',
      icon: '🤖',
      features: [
        'Summarize - Get key points from long text',
        'Simplify - Make complex content easy to understand', 
        'Translate - Convert text between languages',
        'Proofread - Fix grammar and improve writing',
        'Generate Template - Create HTML/CSS templates from websites',
        'Flashcards - Convert content into Q&A study cards'
      ]
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">How to Use StudySpark</h1>
          <p className="page-subtitle">
            Your complete guide to using our AI-powered learning tools
          </p>
        </div>

        <div className="guide-content">
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-header">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h2 className="step-title">{step.title}</h2>
                </div>
                <p className="step-description">{step.description}</p>
                
                {step.options && (
                  <div className="step-options">
                    {step.options.map((option, optIndex) => (
                      <Link key={optIndex} to={option.link} className="option-card">
                        <div className="option-content">
                          <h4>{option.text}</h4>
                          <p>{option.description}</p>
                        </div>
                        <div className="option-arrow">→</div>
                      </Link>
                    ))}
                  </div>
                )}

                {step.instructions && (
                  <div className="step-instructions">
                    {step.instructions.map((instruction, instIndex) => (
                      <div key={instIndex} className="instruction">
                        <span className="instruction-bullet">•</span>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                )}

                {step.features && (
                  <div className="step-features">
                    {step.features.map((feature, featIndex) => (
                      <div key={featIndex} className="feature-tag">
                        {feature}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="development-notice">
            <div className="notice-icon">🚧</div>
            <div className="notice-content">
              <h3>Development Notice</h3>
              <p>
                StudySpark is currently in active development as a hackathon project. 
                While our core features are functional, please note that this is a 
                demonstration of Chrome's built-in AI capabilities and may not yet 
                be production-ready for all use cases.
              </p>
              <p>
                We're continuously working to improve the AI responses and user experience. 
                Your understanding and feedback are greatly appreciated!
              </p>
            </div>
          </div>

          <div className="guide-cta">
            <h2>Ready to Get Started?</h2>
            <p>Choose your preferred way to use StudySpark and experience AI-powered learning today.</p>
            <div className="cta-buttons">
              <Link to="/ai" className="cta-button">
                Try Web AI
              </Link>
              <Link to="/extension" className="cta-button secondary">
                Get Extension
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;