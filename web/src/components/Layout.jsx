import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Global Background Animation */}
      <div className="layout-bg-animation">
        <div className="bg-grid-layout"></div>
        <div className="bg-shapes-layout">
          <div className="shape-layout shape-layout-1"></div>
          <div className="shape-layout shape-layout-2"></div>
          <div className="shape-layout shape-layout-3"></div>
        </div>
      </div>

      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;