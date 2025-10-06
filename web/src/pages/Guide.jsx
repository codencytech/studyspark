import React from 'react';
import { Link } from 'react-router-dom';

const Guide = () => {
  const steps = [
    {
      title: 'Choose Your Platform',
      description: 'Decide whether to use our Web AI or Chrome Extension',
      icon: '🖥️',
      options: [
        { text: 'Web AI', link: '/ai', description: 'Use directly in your browser' },
        { text: 'Chrome Extension', link: '/extension', description: 'Install for one-click access' }
      ]
    },
    {
      title: 'Get Started',
      description: 'Learn how to use StudySpark effectively',
      icon: '🚀',
      instructions: [
        'Enter text or paste a URL',
        'Select your desired action',
        'Click generate and get instant results'
      ]
    },
    {
      title: 'Advanced Features',
      description: 'Make the most of StudySpark',
      icon: '⚡',
      features: [
        'Use the extension on any webpage',
        'Process uploaded documents',
        'Generate flashcards for studying'
      ]
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">How to Use StudySpark</h1>
          <p className="page-subtitle">
            Get started with our AI-powered learning tools in minutes
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

          <div className="guide-cta">
            <h2>Ready to Get Started?</h2>
            <p>Choose your preferred way to use StudySpark and begin transforming your learning experience today.</p>
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