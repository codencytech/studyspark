import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Animated Background */}
      <div className="footer-bg"></div>
      
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-spark"></div>
              <span className="logo-text">StudySpark</span>
            </div>
            <p className="footer-description">
              Transform your learning experience with AI-powered content processing. 
              Built with Chrome's revolutionary built-in AI technology.
            </p>
            <div className="footer-social">
              <div className="social-glow"></div>
              <a href="#" className="social-link" aria-label="GitHub">
                <span className="social-icon">🐙</span>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <span className="social-icon">🐦</span>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <span className="social-icon">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <Link to="/ai" className="footer-link">Web AI</Link>
              <Link to="/extension" className="footer-link">Extension</Link>
              <Link to="/about" className="footer-link">Features</Link>
              <Link to="/guide" className="footer-link">How to Use</Link>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-title">Developers</h4>
              <Link to="/apis" className="footer-link">APIs</Link>
              <Link to="/guide" className="footer-link">Documentation</Link>
              <a href="#" className="footer-link">GitHub</a>
              <a href="#" className="footer-link">Contribute</a>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <Link to="/team" className="footer-link">Our Team</Link>
              <Link to="/about" className="footer-link">About</Link>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-divider">
            <div className="divider-glow"></div>
          </div>
          
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <span>© 2025 StudySpark. Built with ❤️ for the future of learning.</span>
            </div>
            
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Privacy</a>
              <a href="#" className="footer-legal-link">Terms</a>
              <a href="#" className="footer-legal-link">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;