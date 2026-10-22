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
  FolderLock,
  ScanLine,
  BellRing
} from 'lucide-react';
import ModernFooter from '@/components/ModernFooter';

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

  const [showStickyNav, setShowStickyNav] = useState(false);

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

  // Reveal the floating navbar once the top bar has scrolled away
  useEffect(() => {
    const handleScroll = () => setShowStickyNav(window.scrollY > 160);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTarget = (targetId: string, focusInput = false) => {
    const element = document.getElementById(targetId);
    if (!element) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const navOffset = 96;
    window.scrollTo({ top: Math.max(0, element.getBoundingClientRect().top + window.pageYOffset - navOffset), behavior: 'smooth' });
    if (focusInput && !joinedWaitlist) {
      const input = document.getElementById('email-input');
      if (input) setTimeout(() => input.focus(), 450);
    }
  };

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
      a: 'Yes. Rescan, replace or edit any document whenever life changes. Every change, view and download is recorded in your history with who did it and when.'
    },
    {
      q: 'How does the on-device AI scanner work?',
      a: 'Point your phone at a page: the scanner finds the edges, flattens it and cleans it up. Reading the title and key details happens on your own device, and the finished scan is encrypted before it is stored.'
    }
  ];

  const steps = [
    {
      img: '/images/slide1-documents.png',
      word1: 'Life',
      word2: 'Stored',
      text: 'Gather your wills, deeds, passports and policies in one vault. Scan with your phone or upload a PDF.',
    },
    {
      img: '/images/slide2-vault.png',
      word1: 'Total',
      word2: 'Trust',
      text: 'Every file is sealed with AES-256 encryption the moment it is saved, and only opened by you or the people you choose.',
    },
    {
      img: '/images/slide3-keys.png',
      word1: 'Stay',
      word2: 'Safe',
      text: 'Name your executors. When the time comes, they get exactly what you left them, and a clear plan for what to do next.',
    },
  ];

  const showcase = [
    { img: '/images/app/app-document.jpg', title: 'Every document, beautifully kept', text: 'Clean scans, key details read automatically, and renewals flagged before they lapse.' },
    { img: '/images/app/app-share.jpg', title: 'Share without losing control', text: 'Links that expire when you say, open once if you like, and carry the recipient’s name as a watermark.' },
    { img: '/images/app/app-executor.jpg', title: 'A calm handover for your family', text: 'Executors see your wishes, the documents you chose, and a step-by-step probate roadmap.' },
  ];

  return (
    <>
      {/* Floating pill navbar, shown once you scroll (black, like the app's bottom bar) */}
      <nav className={`floating-pill-navbar ${showStickyNav ? 'visible' : ''}`} aria-label="Sticky navigation">
        <button type="button" className="pill-nav-brand" onClick={scrollToTop} aria-label="LifeStored - Scroll to top">
          <span className="pill-nav-icon">
            <FolderLock size={15} strokeWidth={2} />
          </span>
          <span className="pill-nav-title">LifeStored</span>
        </button>
        <div className="pill-nav-links">
          <button type="button" className="pill-nav-link" onClick={() => scrollToTarget('pillars-section')}>
            Features
          </button>
          <button type="button" className="pill-nav-link" onClick={() => scrollToTarget('partners-banner')}>
            Partners
          </button>
          <button type="button" className="pill-nav-link" onClick={() => scrollToTarget('faq-section')}>
            FAQ
          </button>
        </div>
        <button type="button" className="pill-nav-cta-btn" onClick={() => scrollToTarget('waitlist-box', true)}>
          {joinedWaitlist ? 'Your spot' : 'Join waitlist'}
        </button>
      </nav>

      <div className="page-wrapper" id="top">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-msg" role="status" aria-live="polite">
            <Check size={16} strokeWidth={2.5} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top bar */}
        <header className="site-nav">
          <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
            <span className="brand-tile" aria-hidden="true">
              <FolderLock size={18} strokeWidth={1.9} />
            </span>
            <span className="brand-name">LifeStored</span>
            <span className="stage-pill">Coming soon</span>
          </a>
          <button type="button" className="nav-cta" onClick={() => scrollToTarget('waitlist-box', true)}>
            Join the waitlist
          </button>
        </header>

        <main className="main-content" id="main-content">
          {/* Hero */}
          <section className="hero-section" id="hero-section">
            <div className="hero-copy">
              <span className="section-tag rise" style={{ '--i': 0 } as React.CSSProperties}>Private alpha · Opening soon</span>
              <h1 className="hero-title rise" style={{ '--i': 1 } as React.CSSProperties} id="main-heading">
                <span>Life</span>
                <span>Stored.</span>
              </h1>
              <p className="hero-lead rise" style={{ '--i': 2 } as React.CSSProperties}>
                A digital vault for wills and testimony documents.
              </p>
              <p className="hero-subtitle rise" style={{ '--i': 3 } as React.CSSProperties}>
                Keep your will, deeds and vital records in one encrypted place, name the people you trust, and know your family
                will get exactly what they need, when they need it.
              </p>

              {/* Waitlist */}
              <div className="waitlist-container rise" style={{ '--i': 4 } as React.CSSProperties} id="waitlist-box">
                {!joinedWaitlist ? (
                  <form className="waitlist-form" onSubmit={handleWaitlistSubmit} id="waitlist-form">
                    <input
                      type="email"
                      id="email-input"
                      className="waitlist-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-label="Email address for waitlist"
                    />
                    <button type="submit" id="waitlist-submit-button" className="waitlist-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span>Joining…</span>
                      ) : (
                        <>
                          <span>Join the waitlist</span>
                          <ArrowRight size={16} className="btn-arrow-icon" strokeWidth={2.4} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="waitlist-success-card" id="waitlist-success-view">
                    <div className="success-icon-badge">
                      <Check size={20} strokeWidth={2.8} />
                    </div>
                    <h3 className="success-title">You&apos;re on the list</h3>
                    <p className="success-desc">
                      Welcome, <strong>{email}</strong>. You hold spot <span className="waitlist-number-chip">#{waitlistNumber}</span> for
                      the private release.
                    </p>
                    <div className="referral-share-box">
                      <span className="referral-link-text">lifestored.com/?ref=VIP-{waitlistNumber}</span>
                      <button id="copy-invite-link-button" type="button" className="share-copy-btn" onClick={handleCopyLink}>
                        {copiedLink ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} />}
                        <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                      </button>
                    </div>
                    <button type="button" id="reset-waitlist-demo-button" className="reset-waitlist-btn" onClick={handleResetWaitlist}>
                      Change email
                    </button>
                  </div>
                )}

                <p className="waitlist-note" id="social-proof-bar">
                  <strong>Free to join.</strong> Be one of the first to try LifeStored when the private alpha opens.
                </p>
              </div>
            </div>

            <div className="hero-visual rise" style={{ '--i': 3 } as React.CSSProperties}>
              <div className="phone">
                <img src="/images/app/app-vault.jpg" alt="The LifeStored vault on a phone: documents, renewals and search" className="phone-screen" />
              </div>
            </div>
          </section>

          {/* Partners */}
          <div className="partners-clean-banner scroll-reveal" id="partners-banner">
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

          {/* Three steps, like the app's welcome */}
          <section className="steps-section" id="how-it-works">
            {steps.map((step, i) => (
              <div key={step.word1} className={`step-card scroll-reveal stagger-${i + 1}`}>
                <img src={step.img} alt="" className="step-img" aria-hidden="true" />
                <h3 className="step-title">
                  <span>{step.word1}</span>
                  <span>{step.word2}</span>
                </h3>
                <p className="step-text">{step.text}</p>
              </div>
            ))}
          </section>

          {/* Features */}
          <section className="pillars-section" id="pillars-section">
            <div className="section-header scroll-reveal">
              <span className="section-tag">Key features</span>
              <h2 className="section-title">Built for a lifetime of clarity, and a calm handover.</h2>
            </div>

            <div className="pillars-grid">
              {[
                { id: 'pillar-vault', icon: FileText, title: 'A vault for wills and directives', text: 'Upload, preview, download and keep your will, testimonies, deeds and health directives up to date in one clean place.' },
                { id: 'pillar-executors', icon: Users, title: 'Trusted executors, verified release', text: 'Name the people you trust. Documents are only released after a death certificate, an optional co-signer, and a window for you to cancel.' },
                { id: 'pillar-scanner', icon: ScanLine, title: 'A scanner that reads on your phone', text: 'Point your camera at a page and get a crisp, flattened scan. Titles and key details are read on your device.' },
                { id: 'pillar-audit', icon: Hourglass, title: 'A full history of every view', text: 'Every view, download, share and change is recorded with who did it and when, so nothing happens behind your back.' },
                { id: 'pillar-subscriptions', icon: BellRing, title: 'Renewals you won’t miss', text: 'Expiry and renewal dates are pulled from your documents and flagged before they’re due.' },
                { id: 'pillar-security', icon: ShieldCheck, title: 'Bank-grade encryption', text: 'Every file is sealed with AES-256 and its own key, travels over HTTPS, and is checked for tampering every time it opens.' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.id} className={`pillar-card scroll-reveal stagger-${i + 1}`} id={f.id}>
                    <div className="pillar-icon-box" aria-hidden="true">
                      <Icon size={20} strokeWidth={1.9} />
                    </div>
                    <h3 className="pillar-title">{f.title}</h3>
                    <p className="pillar-desc">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* The app itself */}
          <section className="showcase-section" id="showcase">
            <div className="section-header scroll-reveal">
              <span className="section-tag">Inside the app</span>
              <h2 className="section-title">Designed to feel calm, simple and safe.</h2>
            </div>
            <div className="showcase-grid">
              {showcase.map((s, i) => (
                <figure key={s.img} className={`showcase-item scroll-reveal stagger-${i + 1}`}>
                  <div className="phone phone-sm">
                    <img src={s.img} alt={s.title} className="phone-screen" loading="lazy" />
                  </div>
                  <figcaption>
                    <h3 className="showcase-title">{s.title}</h3>
                    <p className="showcase-text">{s.text}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section" id="faq-section">
            <div className="section-header scroll-reveal">
              <span className="section-tag">Common questions</span>
              <h2 className="section-title">Frequently asked questions</h2>
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
                      <span className={`faq-icon ${isOpen ? 'open' : ''}`}>
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    <div
                      id={`faq-answer-wrapper-${index}`}
                      className={`faq-collapse-wrapper ${isOpen ? 'open' : ''}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                    >
                      <div className="faq-collapse-inner">
                        <div className="faq-answer">{faq.a}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Enquiry */}
          <section className="inquiry-section" id="inquiry-section">
            <div className="inquiry-grid">
              <div className="inquiry-left">
                <h2 className="inquiry-title">
                  <span>Ready to keep</span>
                  <span>what matters safe?</span>
                </h2>
                <p className="inquiry-desc">
                  For people who want one safe, clean and organised place for life&apos;s essential records. Tell us a little about you
                  and we&apos;ll be in touch.
                </p>
              </div>

              <div className="inquiry-right">
                {!inquirySubmitted ? (
                  <form className="inquiry-form" onSubmit={handleInquirySubmit} id="inquiry-form">
                    <div className="inquiry-row-split">
                      <input type="text" className="field" placeholder="Name" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} aria-label="Name" />
                      <input type="email" className="field" placeholder="Email" value={inquiryEmail} onChange={(e) => setInquiryEmail(e.target.value)} required aria-label="Email" />
                    </div>
                    <input type="tel" className="field" placeholder="Phone number" value={inquiryPhone} onChange={(e) => setInquiryPhone(e.target.value)} aria-label="Phone number" />
                    <input type="text" className="field" placeholder="Anything we should know?" value={inquiryNotes} onChange={(e) => setInquiryNotes(e.target.value)} aria-label="Anything we should know" />
                    <button type="submit" id="inquiry-submit-button" className="inquiry-submit-btn" disabled={isInquirySubmitting}>
                      {isInquirySubmitting ? 'Sending…' : 'Send'}
                    </button>
                  </form>
                ) : (
                  <div className="inquiry-success-box" id="inquiry-success-view">
                    <h4 className="inquiry-success-title">Message received</h4>
                    <p className="inquiry-success-desc">
                      Thank you, {inquiryName || inquiryEmail}. Our team has your note and will be in touch soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <ModernFooter onScrollToTarget={scrollToTarget} />
    </>
  );
}
