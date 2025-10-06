import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    {/* Animated Background Elements */}
                    <div className="hero-bg-elements">
                        <div className="hero-orb hero-orb-1"></div>
                        <div className="hero-orb hero-orb-2"></div>
                        <div className="hero-orb hero-orb-3"></div>
                        <div className="hero-grid"></div>
                    </div>

                    {/* Hero Content */}
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">✨</span>
                            <span className="badge-text">Powered by Chrome Built-in AI</span>
                        </div>

                        <h1 className="hero-title">
                            Transform Your Learning
                            <span className="title-gradient"> with AI</span>
                        </h1>

                        <p className="hero-description">
                            StudySpark revolutionizes how you learn by leveraging Chrome's cutting-edge
                            built-in AI technology. Process any content instantly with privacy-first,
                            on-device intelligence.
                        </p>

                        {/* CTA Buttons */}
                        <div className="hero-actions">
                            <Link to="/ai" className="cta-button cta-primary">
                                <span className="button-content">
                                    <span className="button-icon">🚀</span>
                                    Try Web AI
                                </span>
                                <div className="button-glow"></div>
                            </Link>

                            <Link to="/extension" className="cta-button cta-secondary">
                                <span className="button-content">
                                    <span className="button-icon">⚡</span>
                                    Get Extension
                                </span>
                                <div className="button-glow"></div>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">On-Device</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">Zero</div>
                                <div className="stat-label">Data Sent</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">Instant</div>
                                <div className="stat-label">Processing</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="hero-visual">
                        <div className="visual-container">
                            <div className="ai-orb">
                                <div className="orb-core"></div>
                                <div className="orb-ring orb-ring-1"></div>
                                <div className="orb-ring orb-ring-2"></div>
                                <div className="orb-ring orb-ring-3"></div>
                            </div>
                            <div className="floating-cards">
                                <div className="card card-1">
                                    <div className="card-icon">📊</div>
                                    <div className="card-text">Summarize</div>
                                </div>
                                <div className="card card-2">
                                    <div className="card-icon">✨</div>
                                    <div className="card-text">Simplify</div>
                                </div>
                                <div className="card card-3">
                                    <div className="card-icon">🌍</div>
                                    <div className="card-text">Translate</div>
                                </div>
                                <div className="card card-4">
                                    <div className="card-icon">✏️</div>
                                    <div className="card-text">Proofread</div>
                                </div>
                                <div className="card card-5">
                                    <div className="card-icon">💻</div>
                                    <div className="card-text">Generate Template</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="content-container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose StudySpark?</h2>
                        <p className="section-subtitle">
                            Experience the future of AI-powered learning with unparalleled privacy and performance
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3 className="feature-title">Privacy First</h3>
                            <p className="feature-description">
                                All AI processing happens locally on your device. Your data never leaves your computer.
                            </p>
                            <div className="feature-glow"></div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3 className="feature-title">Lightning Fast</h3>
                            <p className="feature-description">
                                Built-in Chrome AI means instant responses without waiting for cloud processing.
                            </p>
                            <div className="feature-glow"></div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💸</div>
                            <h3 className="feature-title">Completely Free</h3>
                            <p className="feature-description">
                                No subscription fees, no usage limits. Powered by Chrome's built-in technology.
                            </p>
                            <div className="feature-glow"></div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🌐</div>
                            <h3 className="feature-title">Works Offline</h3>
                            <p className="feature-description">
                                Process content anywhere, anytime. No internet connection required after setup.
                            </p>
                            <div className="feature-glow"></div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3 className="feature-title">Secure by Design</h3>
                            <p className="feature-description">
                                Enterprise-grade security with on-device processing and no data collection.
                            </p>
                            <div className="feature-glow"></div>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">Multi-Platform</h3>
                            <p className="feature-description">
                                Available as Chrome Extension and Web App. Use it anywhere you learn.
                            </p>
                            <div className="feature-glow"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="content-container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Transform Your Learning?</h2>
                        <p className="cta-description">
                            Join thousands of students and professionals who are already using StudySpark
                            to enhance their learning experience with AI.
                        </p>
                        <div className="cta-actions">
                            <Link to="/ai" className="cta-button cta-large">
                                <span className="button-content">
                                    <span className="button-icon">🤖</span>
                                    Start with Web AI
                                </span>
                                <div className="button-glow"></div>
                            </Link>
                            <Link to="/guide" className="cta-link">
                                Learn how to use <span className="link-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;