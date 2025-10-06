import React from 'react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Your Name',
      role: 'Full Stack Developer',
      description: 'Passionate about creating innovative web experiences with cutting-edge technologies.',
      avatar: '👨‍💻'
    },
    {
      name: 'Chrome Team',
      role: 'AI Technology',
      description: 'Providing the revolutionary built-in AI APIs that power StudySpark.',
      avatar: '🤖'
    }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="page-header">
          <h1 className="page-title">Our Team</h1>
          <p className="page-subtitle">
            The passionate developers behind StudySpark
          </p>
        </div>

        <div className="team-content">
          <div className="team-intro">
            <h2>Small Team, Big Vision</h2>
            <p>
              We're a dedicated team of developers and AI enthusiasts committed to 
              making learning more accessible and efficient through innovative technology.
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-avatar">
                  {member.avatar}
                </div>
                <h3 className="member-name">{member.name}</h3>
                <div className="member-role">{member.role}</div>
                <p className="member-description">{member.description}</p>
                <div className="member-glow"></div>
              </div>
            ))}
          </div>

          <div className="team-values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">🔒</div>
                <h4>Privacy First</h4>
                <p>Your data belongs to you. We never collect or store personal information.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🎯</div>
                <h4>User Focused</h4>
                <p>Every feature is designed with the user's learning experience in mind.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🚀</div>
                <h4>Innovation</h4>
                <p>Leveraging the latest technologies to create better learning tools.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌍</div>
                <h4>Accessibility</h4>
                <p>Making AI-powered learning available to everyone, for free.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;