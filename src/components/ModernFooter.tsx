'use client';

import React from 'react';

interface ModernFooterProps {
  onScrollToTarget?: (targetId: string, focusInput?: boolean) => void;
}

export default function ModernFooter({ onScrollToTarget }: ModernFooterProps) {
  const handleScroll = (id: string, focus = false) => {
    if (onScrollToTarget) {
      onScrollToTarget(id, focus);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const offset = 85;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        if (focus) {
          const input = document.getElementById('email-input');
          if (input) {
            setTimeout(() => input.focus(), 450);
          }
        }
      }
    }
  };

  return (
    <footer className="modern-gradient-footer" id="modern-site-footer">
      <div className="modern-footer-container">
        {/* Main Columns Content */}
        <div className="modern-footer-main-row">
          {/* Left Column: Socials, Email, Address */}
          <div className="modern-footer-left-col">
            <div className="modern-social-icons">
              {/* Facebook Icon */}
              <a href="#" className="modern-social-btn" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              {/* LinkedIn Icon */}
              <a href="#" className="modern-social-btn" aria-label="LinkedIn" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              {/* X / Twitter Icon */}
              <a href="#" className="modern-social-btn" aria-label="X (Twitter)" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            <a href="mailto:hello@lifestored.com" className="modern-contact-email">
              hello@lifestored.com
            </a>

            <div className="modern-company-address">
              <p>A secure vault for wills and vital records</p>
              <p>London, United Kingdom</p>
            </div>
          </div>

          {/* Right Area: Navigation Links Relevant to Page Content */}
          <div className="modern-footer-right-area">
            {/* Column 1: Core Platform */}
            <div className="modern-footer-links-group">
              <span className="modern-footer-group-title">Platform</span>
              <nav className="modern-footer-nav" aria-label="Platform navigation">
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('pillar-vault')}
                >
                  Digital Vault
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('pillar-executors')}
                >
                  Trusted Executors
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('pillar-scanner')}
                >
                  On-Device AI Scanner
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('pillar-security')}
                >
                  Encryption & Security
                </button>
              </nav>
            </div>

            {/* Column 2: Ecosystem & Help */}
            <div className="modern-footer-links-group">
              <span className="modern-footer-group-title">Ecosystem</span>
              <nav className="modern-footer-nav" aria-label="Ecosystem navigation">
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('partners-banner')}
                >
                  Partners
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('faq-section')}
                >
                  FAQ
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link"
                  onClick={() => handleScroll('inquiry-section')}
                >
                  Contact & Inquiries
                </button>
                <button 
                  type="button" 
                  className="modern-footer-link highlight-link"
                  onClick={() => handleScroll('waitlist-box', true)}
                >
                  Join Waitlist →
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Legal Sub-Bar */}
        <div className="modern-footer-subbar">
          <a href="#" className="modern-subbar-link" onClick={(e) => e.preventDefault()}>
            Terms and conditions
          </a>
          <span className="modern-subbar-copyright">
            © {new Date().getFullYear()} LifeStored. All Rights Reserved
          </span>
          <a href="#" className="modern-subbar-link" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Giant Bottom Watermark Typography */}
      <div className="modern-giant-watermark" aria-hidden="true">
        lifestored
      </div>
    </footer>
  );
}
