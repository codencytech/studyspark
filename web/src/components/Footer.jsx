import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/studysparklogo.png'; // ✅ Adjust path as needed

const Footer = () => {
  return (
    <footer className="footer">
      {/* Animated Background */}
      <div className="footer-bg"></div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* ✅ Brand Section Updated */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={logo}
                alt="StudySpark Logo"
                className="footer-logo-image"
              />
              <span className="logo-text">StudySpark</span>
            </div>
            <p className="footer-description">
              Transform your learning experience with AI-powered content processing.
              Built with Chrome's revolutionary built-in AI technology.
            </p>

            {/* Social Links */}
            <div className="footer-social">
              <div className="social-glow"></div>
              <a
                href="https://x.com/thecodency?t=idZL_U0P-qkjDcQ0AxVv5w&s=09"
                className="social-link"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="social-icon"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/codency-tech-86bb36370?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                className="social-link"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="https://www.threads.com/@the_codency"
                className="social-link"
                aria-label="Threads"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="social-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  color="#FFFF"
                  fill="none"
                >
                  <path
                    d="M19.25 8.50488C17.6729 2.63804 12.25 3.00452 12.25 3.00452C12.25 3.00452 4.75 2.50512 4.75 12C4.75 21.4949 12.25 20.9955 12.25 20.9955C12.25 20.9955 16.7077 21.2924 18.75 17.0782C19.4167 15.2204 19.25 11.5049 12.75 11.5049C12.75 11.5049 9.75 11.5049 9.75 14.0049C9.75 14.9812 10.75 16.0049 12.25 16.0049C13.75 16.0049 15.4212 14.9777 15.75 13.0049C16.75 7.00488 11.25 6.50488 9.75 9.00488"
                    stroke="#FFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-title">Product</h4>
              <Link to="/ai" className="footer-link">Web AI</Link>
              <Link to="/extension" className="footer-link">Extension</Link>
              <Link to="/apis" className="footer-link">AI Features</Link>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Developers</h4>
              <a href="https://github.com/codencytech?tab=repositories" className="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link to="/apis" className="footer-link">Documentation</Link>
              <Link to="/team" className="footer-link">Our Team</Link>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Company</h4>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <a href="https://github.com/codencytech/studyspark" className="footer-link" target="_blank" rel="noopener noreferrer">Source Code</a>
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
              <Link to="/privacy" className="footer-legal-link">Privacy</Link>
              <Link to="/terms" className="footer-legal-link">Terms</Link>
              <Link to="/cookies" className="footer-legal-link">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
