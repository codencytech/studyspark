import React from 'react';

const APIs = () => {
  const apis = [
    {
      name: 'Summarizer API',
      status: 'Available',
      description: 'Condense long-form content into concise summaries',
      icon: '📊'
    },
    {
      name: 'Translator API', 
      status: 'Available',
      description: 'Translate text between multiple languages',
      icon: '🌍'
    },
    {
      name: 'Proofreader API',
      status: 'Available',
      description: 'Correct grammar and improve writing clarity',
      icon: '✏️'
    },
    {
      name: 'Rewriter API',
      status: 'Available',
      description: 'Rephrase and simplify complex text',
      icon: '✨'
    },
    {
      name: 'Writer API',
      status: 'Coming Soon',
      description: 'Generate original content from prompts',
      icon: '🖋️'
    },
    {
      name: 'Prompt API',
      status: 'Available',
      description: 'Multimodal AI interactions',
      icon: '💬'
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Chrome Built-in AI APIs</h1>
          <p className="page-subtitle">
            Leveraging Chrome's revolutionary on-device AI capabilities
          </p>
        </div>

        <div className="apis-content">
          <div className="apis-intro">
            <h2>What are Chrome Built-in AI APIs?</h2>
            <p>
              Chrome's Built-in AI APIs allow web applications to access powerful AI models 
              directly in the browser, without sending data to external servers. This enables 
              privacy-first, instant AI experiences.
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
            <h3>Benefits of Built-in AI</h3>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">🔒</span>
                <span>Complete Privacy - No data leaves your device</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">⚡</span>
                <span>Instant Processing - No network latency</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💸</span>
                <span>Zero Cost - No API fees or usage limits</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🌐</span>
                <span>Works Offline - Process content anywhere</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIs;