'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, FolderLock } from 'lucide-react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lifestored_waitlist_email');
    if (saved) {
      setEmail(saved);
      setJoined(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'Something went wrong. Please try again.');
        return;
      }
    } catch {
      showToast('Could not connect. Please try again.');
      return;
    } finally {
      setIsSubmitting(false);
    }

    setJoined(true);
    localStorage.setItem('lifestored_waitlist_email', email);

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#000000', '#374151', '#9ca3af', '#e5e7eb', '#ffffff'],
      });
    } catch {
      // Confetti is decorative; ignore failures.
    }

    showToast('You are on the waitlist!');
  };

  const handleReset = () => {
    localStorage.removeItem('lifestored_waitlist_email');
    setJoined(false);
    setEmail('');
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-msg" role="status" aria-live="polite">
          <Check size={16} strokeWidth={2.5} />
          <span>{toast}</span>
        </div>
      )}

      <header className="site-nav fade-in" style={{ '--i': 0 } as React.CSSProperties}>
        <a href="/" className="brand">
          <span className="brand-tile" aria-hidden="true">
            <FolderLock size={18} strokeWidth={1.9} />
          </span>
          <span className="brand-name">LifeStored</span>
        </a>
        <span className="stage-pill">
          <span className="stage-dot" aria-hidden="true" />
          Coming soon
        </span>
      </header>

      <main className="hero" id="main-content">
        <h1 className="hero-title">
          <span className="hero-word"><span className="hero-word-inner" style={{ '--i': 0 } as React.CSSProperties}>Life</span></span>
          <span className="hero-word"><span className="hero-word-inner" style={{ '--i': 1 } as React.CSSProperties}>Stored.</span></span>
        </h1>
        <p className="hero-lead rise" style={{ '--i': 7 } as React.CSSProperties}>
          A private, encrypted vault for your will, deeds and vital records, handed to the people you trust when it matters.
        </p>

        <div className="waitlist rise" style={{ '--i': 9 } as React.CSSProperties} id="waitlist-box">
          {!joined ? (
            <form className="waitlist-form" onSubmit={handleSubmit} id="waitlist-form">
              <input
                type="email"
                id="email-input"
                className="waitlist-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
              />
              <input
                type="text"
                name="company"
                className="waitlist-honeypot"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <button type="submit" className="waitlist-submit-btn" disabled={isSubmitting}>
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
              <h2 className="success-title">You&apos;re on the list</h2>
              <p className="success-desc">
                Thanks, <strong>{email}</strong>. We&apos;ll email you when the private alpha opens.
              </p>
              <button type="button" className="reset-waitlist-btn" onClick={handleReset}>
                Change email
              </button>
            </div>
          )}

          <p className="waitlist-note">
            <strong>Free to join.</strong> We&apos;ll only use your email to tell you about LifeStored.
          </p>
        </div>
      </main>

      <footer className="site-footer fade-in" style={{ '--i': 12 } as React.CSSProperties}>
        <span>© {new Date().getFullYear()} LifeStored</span>
        <a href="mailto:hello@lifestored.com">hello@lifestored.com</a>
      </footer>
    </div>
  );
}
