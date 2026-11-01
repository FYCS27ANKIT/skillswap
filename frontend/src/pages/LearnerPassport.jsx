import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Award,
  Star,
  CheckCircle,
  Clock,
  Share2,
  Copy,
  Check,
  Repeat,
  Sparkles,
  ExternalLink,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import StarRating from '../components/StarRating';

const LearnerPassport = () => {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPassportData = async () => {
      try {
        // Try public fetch or fallback
        const [userRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${userId}`).catch(() => null),
          axios.get(`http://localhost:5000/api/reviews/user/${userId}`).catch(() => ({ data: { reviews: [], averageRating: 0, reviewCount: 0 } })),
        ]);

        if (userRes?.data) {
          setProfile(userRes.data);
        }
        if (reviewsRes?.data) {
          setReviewsData(reviewsRes.data);
        }
      } catch (err) {
        console.error('Passport fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassportData();
  }, [userId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Check out my verified peer-learning achievements on SkillSwap!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Loading Learner Passport...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h3>Swapper Passport Not Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>This passport link may be invalid or the profile does not exist.</p>
        <Link to="/discover" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Explore Community
        </Link>
      </div>
    );
  }

  const rating = reviewsData.averageRating || profile.averageRating || 0;
  const reviewCount = reviewsData.reviewCount || profile.reviewCount || 0;

  // Compute achievements
  const badges = [
    {
      id: 'first_swap',
      name: 'First Swap Completed',
      icon: '🔄',
      unlocked: reviewCount >= 1 || (profile.skillsOffered?.length > 0),
      description: 'Successfully joined the SkillSwap barter network.',
    },
    {
      id: 'top_mentor',
      name: 'Top-Rated Mentor',
      icon: '⭐',
      unlocked: rating >= 4.5 && reviewCount >= 1,
      description: 'Maintains an exceptional 4.5+ star teaching reputation.',
    },
    {
      id: 'polymath',
      name: 'Multi-Disciplinarian',
      icon: '🎓',
      unlocked: (profile.skillsOffered?.length || 0) + (profile.skillsWanted?.length || 0) >= 4,
      description: 'Actively bartering across multiple creative and technical domains.',
    },
    {
      id: 'timebanker',
      name: 'TimeBank Citizen',
      icon: '🪙',
      unlocked: true,
      description: 'Authorized participant in the decentralized skill credit economy.',
    },
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', maxWidth: '820px' }}>
      {/* Passport Certificate Card */}
      <div
        className="glass-panel"
        style={{
          border: '2px solid var(--primary-border)',
          borderRadius: '20px',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(238, 242, 255, 0.6) 0%, #ffffff 180px)',
        }}
      >
        {/* Verification Watermark Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Repeat size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)' }}>
                Official Learner Passport
              </span>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>{profile.name}</h2>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              color: '#065f46',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={16} /> Verified Swapper
          </div>
        </div>

        {profile.bio && (
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            "{profile.bio}"
          </p>
        )}

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ background: '#ffffff', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mentor Rating
            </span>
            <div style={{ marginTop: '0.25rem' }}>
              <StarRating rating={rating} reviewCount={reviewCount} size={18} />
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skills Offered
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {profile.skillsOffered?.length || 0}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skills Wanted
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
              {profile.skillsWanted?.length || 0}
            </div>
          </div>
        </div>

        {/* Verified Skills Portfolio */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Verified Skill Competencies
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {profile.skillsOffered?.map((s, i) => (
              <span key={i} className="skill-tag" style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}>
                <Check size={14} style={{ marginRight: '0.3rem' }} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone Badges */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Earned Achievement Badges
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {badges.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  background: b.unlocked ? '#ffffff' : 'var(--surface-secondary)',
                  border: `1px solid ${b.unlocked ? 'var(--primary-border)' : 'var(--surface-border)'}`,
                  borderRadius: '12px',
                  opacity: b.unlocked ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.9rem' }}>{b.name}</h5>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Actions */}
        <div
          style={{
            borderTop: '1px solid var(--surface-border)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="btn btn-secondary" onClick={handleShareLinkedIn} style={{ fontSize: '0.88rem', gap: '0.4rem' }}>
              <Share2 size={15} /> Share on LinkedIn
            </button>
            <button className="btn btn-secondary" onClick={handleCopyLink} style={{ fontSize: '0.88rem', gap: '0.4rem' }}>
              {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>

          <Link to={`/profile/${profile._id}`} className="btn btn-primary" style={{ fontSize: '0.88rem', gap: '0.4rem' }}>
            Propose Skill Swap <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearnerPassport;
