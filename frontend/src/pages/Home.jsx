import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Repeat } from 'lucide-react';

const Home = () => {
  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Repeat size={64} color="var(--primary)" />
      </div>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Trade Skills, Grow Together
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem' }}>
        Join the community of lifelong learners. Offer what you know, request what you want to learn, and connect with people through 1-on-1 skill swapping.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Get Started <ArrowRight size={20} />
        </Link>
        <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Log In
        </Link>
      </div>

      <div className="glass-panel" style={{ marginTop: '5rem', width: '100%', maxWidth: '800px', textAlign: 'left' }}>
        <h3>How It Works</h3>
        <div className="grid" style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
             <h4 style={{ color: 'var(--primary)' }}>1. Create your profile</h4>
             <p style={{ color: 'var(--text-muted)' }}>List the skills you have to offer and the ones you want to learn.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--accent)' }}>2. Find a match</h4>
            <p style={{ color: 'var(--text-muted)' }}>Browse other users on the discover board and send swap requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
