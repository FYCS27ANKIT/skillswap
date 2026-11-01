import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowRight,
  Repeat,
  Sparkles,
  Video,
  Star,
  Users,
  ShieldCheck,
  Calendar,
  BookOpen,
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', maxWidth: '1000px' }}>
      {/* Hero Badge */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span
          className="ai-badge"
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            padding: '0.4rem 1rem',
            fontSize: '0.82rem',
            boxShadow: 'none',
          }}
        >
          <Sparkles size={14} color="var(--primary)" /> Peer-to-Peer Knowledge Barter
        </span>
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            color: 'var(--text-main)',
          }}
        >
          Trade Skills,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Grow Together
          </span>
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Connect with lifelong learners to barter skills 1-on-1. Teach what you know, learn what you desire, schedule live video classrooms, and build trusted endorsements.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/discover" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
              Explore Swappers <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Log In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Repeat size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Smart Match Barter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Instant detection of reciprocal matches where your teaching skills align perfectly with what others wish to learn.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--secondary-light)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>AI Swap Assistant</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Powered by Google Gemini to auto-generate crisp bios, tailor 4-session exchange syllabuses, and write warm icebreakers.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Video size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Video Classrooms</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Schedule sessions on your calendar with instant 1-click WebRTC rooms for interactive video and screen sharing.
          </p>
        </div>
      </div>

      {/* How it Works Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>
          How SkillSwap Works
        </h2>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              01. Showcase Skills
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              List what you're confident teaching and what subjects you're curious to explore. Let AI polish your bio.
            </p>
          </div>

          <div>
            <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              02. Discover & Propose
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Browse the discovery board, filter by category or perfect matches, and send a structured barter proposal.
            </p>
          </div>

          <div>
            <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              03. Learn & Review
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Chat in real time, schedule live video sessions, exchange knowledge, and leave verified ratings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
