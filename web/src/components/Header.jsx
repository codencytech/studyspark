import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/studysparklogo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/ai', label: 'Web AI', icon: '🤖' },
    { path: '/extension', label: 'Extension', icon: '⚡' },
    { path: '/about', label: 'About', icon: '📖' },
    { path: '/apis', label: 'APIs', icon: '🔧' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/guide', label: 'Guide', icon: '📚' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="header-bg"></div>
      
      <nav className="nav-container">
        {/* ✅ Updated Logo */}
        <Link to="/" className="logo">
          <img 
            src={logo} 
            alt="StudySpark Logo" 
            className="logo-image" 
          />
          <span className="logo-text">StudySpark</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <div className="nav-underline"></div>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className={`menu-icon ${isMobileMenuOpen ? 'menu-icon-open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Mobile Navigation */}
        <div className={`nav-mobile ${isMobileMenuOpen ? 'nav-mobile-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-mobile-item ${isActive(item.path) ? 'nav-mobile-item-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-mobile-icon">{item.icon}</span>
              <span className="nav-mobile-label">{item.label}</span>
              <div className="nav-mobile-glow"></div>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
