'use client';

import React from 'react';

/** Scrolls smoothly to a section of the page. */
const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const PLATFORM: [label: string, target: string][] = [
  ['Digital Vault', 'pillars-section'],
  ['Trusted Executors', 'how-it-works'],
  ['On-Device AI Scanner', 'pillars-section'],
  ['Encryption & Security', 'pillars-section'],
];

const ECOSYSTEM: [label: string, target: string][] = [
  ['How it works', 'how-it-works'],
  ['FAQ', 'faq-section'],
  ['Contact & Inquiries', 'inquiry-section'],
];

export default function GradientFooter() {
  return (
    <footer className="modern-gradient-footer" id="modern-site-footer">
      <div className="modern-footer-container">
        <div className="modern-footer-main-row">
          <div className="modern-footer-left-col">
            <div className="modern-social-icons">
              <a href="#" className="modern-social-btn" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="modern-social-btn" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="modern-social-btn" aria-label="X (Twitter)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

          <div className="modern-footer-right-area">
            <div className="modern-footer-links-group">
              <span className="modern-footer-group-title">Platform</span>
              <nav className="modern-footer-nav" aria-label="Platform navigation">
                {PLATFORM.map(([label, target]) => (
                  <button key={label} type="button" className="modern-footer-link" onClick={() => goTo(target)}>
                    {label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="modern-footer-links-group">
              <span className="modern-footer-group-title">Ecosystem</span>
              <nav className="modern-footer-nav" aria-label="Ecosystem navigation">
                {ECOSYSTEM.map(([label, target]) => (
                  <button key={label} type="button" className="modern-footer-link" onClick={() => goTo(target)}>
                    {label}
                  </button>
                ))}
                <button type="button" className="modern-footer-link highlight-link" onClick={() => goTo('waitlist-box')}>
                  Join Waitlist →
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="modern-footer-subbar">
          <a href="#" className="modern-subbar-link">
            Terms and conditions
          </a>
          <span className="modern-subbar-copyright">© {new Date().getFullYear()} LifeStored. All Rights Reserved</span>
          <a href="#" className="modern-subbar-link">
            Privacy Policy
          </a>
        </div>
      </div>
      <div className="modern-giant-watermark" aria-hidden="true">
        lifestored
      </div>
    </footer>
  );
}
