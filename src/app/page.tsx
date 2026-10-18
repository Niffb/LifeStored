'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Hourglass, 
  Users, 
  ArrowRight, 
  Check, 
  Copy, 
  ChevronDown, 
  FileText,
  ScanLine,
  BellRing
} from 'lucide-react';
import WavingDotsFooter from '@/components/WavingDotsFooter';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Load persisted waitlist on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('lifestored_waitlist_email');
    const savedNumber = localStorage.getItem('lifestored_waitlist_number');
    if (savedEmail && savedNumber) {
      setEmail(savedEmail);
      setWaitlistNumber(parseInt(savedNumber, 10));
      setJoinedWaitlist(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomSpot = Math.floor(Math.random() * 40) + 380;
      setWaitlistNumber(randomSpot);
      setJoinedWaitlist(true);
      setIsSubmitting(false);

      localStorage.setItem('lifestored_waitlist_email', email);
      localStorage.setItem('lifestored_waitlist_number', randomSpot.toString());

      // Trigger celebratory monochrome confetti burst
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.55 },
          colors: ['#000000', '#374151', '#9ca3af', '#e5e7eb', '#ffffff'],
        });
      } catch {
        // Fallback gracefully
      }

      showToast('You are officially on the waitlist!');
    }, 550);
  };

  const handleCopyLink = () => {
    const inviteUrl = `https://lifestored.com/?ref=VIP-${waitlistNumber || 'INVITE'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('Priority referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleResetWaitlist = () => {
    localStorage.removeItem('lifestored_waitlist_email');
    localStorage.removeItem('lifestored_waitlist_number');
    setJoinedWaitlist(false);
    setEmail('');
    setWaitlistNumber(null);
    showToast('Reset waitlist demo.');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail || !inquiryEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    setIsInquirySubmitting(true);

    setTimeout(() => {
      setIsInquirySubmitting(false);
      setInquirySubmitted(true);
      showToast('Thank you! Your inquiry has been sent to our team.');
    }, 600);
  };

  // Scroll reveal animation observer for sections and cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 100px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => {
      observer.observe(el);
      // Immediately reveal elements that are already in or near the viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('is-revealed');
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What is Life Stored?',
      a: 'Life Stored is a secure digital vault created specifically for wills, testimony documents, and vital family directives. It allows you to store, preview, download, and continuously update your legal records, while appointing verified executors for smooth future handover.'
    },
    {
      q: 'How does the executor handover process work?',
      a: 'You designate trusted contacts as executors. When verified protocols are initiated (such as proof of death verification and multi-party approvals), designated documents are securely unlocked and transferred directly to your appointed executors.'
    },
    {
      q: 'Can I continuously update my uploaded documents?',
      a: 'Yes. Life Stored provides full document version history with tamper-evident timestamps and audit logs. Whenever life changes, you can upload amendments or new drafts while maintaining clear legal provenance.'
    },
    {
      q: 'How does the on-device AI scanner work?',
      a: 'Our document scanner runs 100% locally on your browser or device. It analyzes and catalogs your legal paperwork without uploading scans to third-party cloud APIs, guaranteeing total privacy.'
    }
  ];

  return (
    <>
      <div className="page-wrapper" id="top">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg" role="status" aria-live="polite">
          <Check size={16} strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content" id="main-content">
        {/* Hero Section */}
        <section className="hero-section" id="hero-section">
          <h1 className="hero-title anim-fade-up-1" id="main-heading">
            Life Stored.
            <span className="hero-title-highlight">A digital vault for wills and testimony documents.</span>
          </h1>

          <p className="hero-subtitle anim-fade-up-2">
            Create your vault with verified identity, designate trusted executors, and upload vital documents with total privacy. Accessible and continuously updatable throughout your lifetime, safely released when your family needs it most.
          </p>

          {/* Waitlist Box */}
          <div className="waitlist-container anim-fade-up-3" id="waitlist-box">
            {!joinedWaitlist ? (
              <form className="waitlist-form" onSubmit={handleWaitlistSubmit} id="waitlist-form">
                <input
                  type="email"
                  id="email-input"
                  className="waitlist-input"
                  placeholder="Enter your email to join the waitlist..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for waitlist"
                />
                <button
                  type="submit"
                  id="waitlist-submit-button"
                  className="waitlist-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Joining...</span>
                  ) : (
                    <>
                      <span>Join Waitlist</span>
                      <ArrowRight size={15} className="btn-arrow-icon" strokeWidth={2.2} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="waitlist-success-card" id="waitlist-success-view">
                <div className="success-icon-badge">
                  <Check size={22} strokeWidth={2.6} />
                </div>
                <h3 className="success-title">You are on the priority waitlist</h3>
                <p className="success-desc">
                  Welcome, <strong style={{ color: '#000000' }}>{email}</strong>. You hold spot <span className="waitlist-number-chip">#{waitlistNumber}</span> for the private release.
                </p>

                <div className="referral-share-box">
                  <span className="referral-link-text">
                    lifestored.com/?ref=VIP-{waitlistNumber}
                  </span>
                  <button
                    id="copy-invite-link-button"
                    type="button"
                    className="share-copy-btn"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  id="reset-waitlist-demo-button"
                  className="reset-waitlist-btn"
                  onClick={handleResetWaitlist}
                >
                  Change email or reset
                </button>
              </div>
            )}

            {/* Social Proof */}
            <div className="social-proof" id="social-proof-bar">
              <div className="avatar-group" aria-hidden="true">
                <div className="proof-avatar avatar-1">N</div>
                <div className="proof-avatar avatar-2">E</div>
                <div className="proof-avatar avatar-3">A</div>
                <div className="proof-avatar avatar-4">M</div>
              </div>
              <span className="proof-text">
                Joined by <strong className="proof-highlight">1,480+</strong> individuals, families, and estate planners.
              </span>
            </div>
          </div>
        </section>

        {/* Simple & Clean Partners Banner */}
        <div className="partners-clean-banner" id="partners-banner">
          <span className="partners-banner-label">Partners</span>
          <div className="partners-pills-row">
            <span className="partner-item-text">Company X</span>
            <span className="partner-separator-dot">•</span>
            <span className="partner-item-text">Company Y</span>
            <span className="partner-separator-dot">•</span>
            <span className="partner-item-text">Dead Organised</span>
            <span className="partner-separator-dot">•</span>
            <span className="partner-item-text">Laurelo</span>
            <span className="partner-separator-dot">•</span>
            <span className="partner-item-text">Company Z</span>
          </div>
        </div>

        {/* Plain English Features Section */}
        <section className="pillars-section" id="pillars-section">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Key Features</span>
            <h2 className="section-title">Built for lifetime clarity and verified legacy handover.</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card scroll-reveal stagger-1" id="pillar-vault">
              <div className="pillar-icon-box" aria-hidden="true">
                <FileText size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">Digital Vault for Wills & Directives</h3>
              <p className="pillar-desc">
                Securely upload, preview, download, and continuously update your will, testimonies, deeds, and health directives in one clean place.
              </p>
            </div>

            <div className="pillar-card scroll-reveal stagger-2" id="pillar-executors">
              <div className="pillar-icon-box" aria-hidden="true">
                <Users size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">Trusted Executors & Verified Release</h3>
              <p className="pillar-desc">
                Assign designated contacts as executors. A secure verification protocol triggers document handover only to authorized parties.
              </p>
            </div>

            <div className="pillar-card scroll-reveal stagger-3" id="pillar-scanner">
              <div className="pillar-icon-box" aria-hidden="true">
                <ScanLine size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">On-Device Private AI Scanner</h3>
              <p className="pillar-desc">
                Scan and organize legal documents with local AI that runs entirely on your device. Zero document data leaks to external cloud APIs.
              </p>
            </div>

            <div className="pillar-card scroll-reveal stagger-4" id="pillar-audit">
              <div className="pillar-icon-box" aria-hidden="true">
                <Hourglass size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">Document History & Audit Logs</h3>
              <p className="pillar-desc">
                Immutable timestamps and full version history preserve legal provenance so document authenticity is always clear and indisputable.
              </p>
            </div>

            <div className="pillar-card scroll-reveal stagger-5" id="pillar-subscriptions">
              <div className="pillar-icon-box" aria-hidden="true">
                <BellRing size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">Subscription & Account Notifier</h3>
              <p className="pillar-desc">
                Catalog ongoing memberships, accounts, and subscriptions so executors can promptly notify providers and cancel posthumous billing.
              </p>
            </div>

            <div className="pillar-card scroll-reveal stagger-6" id="pillar-security">
              <div className="pillar-icon-box" aria-hidden="true">
                <ShieldCheck size={20} strokeWidth={2.2} />
              </div>
              <h3 className="pillar-title">Bank-Grade Encryption & Compliance</h3>
              <p className="pillar-desc">
                AES-256 encryption in transit and at rest, MFA recovery, strict GDPR compliance, and role-based access for complete peace of mind.
              </p>
            </div>
          </div>
        </section>

        {/* Minimal FAQ Section */}
        <section className="faq-section" id="faq-section">
          <div className="section-header scroll-reveal">
            <span className="section-tag">Common Questions</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? 'active' : ''}`} id={`faq-item-${index}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-wrapper-${index}`}
                    id={`faq-trigger-${index}`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`faq-icon ${isOpen ? 'open' : ''}`}
                    />
                  </button>
                  <div
                    id={`faq-answer-wrapper-${index}`}
                    className={`faq-collapse-wrapper ${isOpen ? 'open' : ''}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${index}`}
                  >
                    <div className="faq-collapse-inner">
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pre-Footer Inquiry Form */}
        <section className="inquiry-section" id="inquiry-section">
          <div className="inquiry-grid">
            <div className="inquiry-left">
              <h2 className="inquiry-title">Ready To Safeguard What Matters?</h2>
              <p className="inquiry-desc">
                Our service is for people who believe in owning a safe, clean, and organized space for life&apos;s essential records. Reach out and our team will help you prepare for tomorrow.
              </p>
            </div>

            <div className="inquiry-right">
              {!inquirySubmitted ? (
                <form className="inquiry-form" onSubmit={handleInquirySubmit} id="inquiry-form">
                  <div className="inquiry-row-split">
                    <input
                      type="text"
                      className="inquiry-underline-input"
                      placeholder="Name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      aria-label="Name"
                    />
                    <input
                      type="email"
                      className="inquiry-underline-input"
                      placeholder="Email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      required
                      aria-label="Email"
                    />
                  </div>

                  <input
                    type="tel"
                    className="inquiry-underline-input"
                    placeholder="Phone Number"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    aria-label="Phone Number"
                  />

                  <input
                    type="text"
                    className="inquiry-underline-input"
                    placeholder="Anything we should know?"
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    aria-label="Anything we should know"
                  />

                  <div className="inquiry-submit-wrapper">
                    <button
                      type="submit"
                      id="inquiry-submit-button"
                      className="inquiry-submit-btn"
                      disabled={isInquirySubmitting}
                    >
                      {isInquirySubmitting ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="inquiry-success-box" id="inquiry-success-view">
                  <h4 className="inquiry-success-title">Message Received</h4>
                  <p className="inquiry-success-desc">
                    Thank you, {inquiryName || inquiryEmail}. Our team has received your note and will be in touch soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        </main>
      </div>

      {/* Edge-to-Edge Full Width Footer with Waving Dots (No Side Margins, No White Space Below) */}
      <footer className="edge-to-edge-footer" id="site-footer">
        <WavingDotsFooter />
      </footer>
    </>
  );
}
