import React from 'react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Ayush Kumar Singh',
      role: 'Lead Developer & Designer',
      description: 'Built the entire application from scratch including the Chrome extension, React website, AI integration, and all the user interfaces. Passionate about creating innovative learning tools.',
      avatar: '👨‍💻'
    },
    {
      name: 'Pranjal Gupta',
      role: 'Project Advisor & Tester',
      description: 'Provided valuable feedback, testing, and support throughout the development process. Helped with project planning and feature validation.',
      avatar: '👨‍🎓'
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
            <h2>Built by Students, for Students</h2>
            <p>
              We're two computer science students who saw the potential of Chrome's new AI technology 
              to help learners. What started as a hackathon project turned into a fully-featured 
              learning platform that we're proud to share with the world.
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

          <div className="special-thanks">
            <h3>Special Thanks</h3>
            <p>
              We want to express our gratitude to the Chrome team for making their built-in AI APIs 
              accessible to developers. Their innovative technology made this project possible.
            </p>
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