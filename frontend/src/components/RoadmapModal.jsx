import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Sparkles, Calendar, BookOpen, Clock, Lightbulb, RefreshCw } from 'lucide-react';

const RoadmapModal = ({ partner, onClose, onScheduleSession }) => {
  const { user } = useContext(AuthContext);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const partnerSkill = partner.skillsOffered?.[0] || 'Their expertise';
      const mySkill = user.skillsOffered?.[0] || 'My expertise';

      const { data } = await axios.post(
        'http://localhost:5000/api/ai/roadmap',
        {
          partner1Name: user.name,
          partner1Skill: mySkill,
          partner2Name: partner.name,
          partner2Skill: partnerSkill,
        },
        config
      );
      setRoadmap(data);
    } catch (err) {
      setError('Could not generate learning roadmap at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [partner._id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="ai-badge" style={{ margin: 0 }}>
              <Sparkles size={12} /> AI Syllabus
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
              Swap Roadmap with {partner.name}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Sparkles size={36} color="var(--primary)" className="spin-animation" style={{ marginBottom: '1rem' }} />
            <h4>Synthesizing Customized Learning Roadmap...</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Analyzing skills, pacing, and balanced milestones for you and {partner.name}.
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchRoadmap}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: '10px',
                borderLeft: '4px solid var(--primary)',
              }}
            >
              <h4 style={{ margin: '0 0 0.35rem', color: 'var(--primary)', fontSize: '1rem' }}>
                Exchange Objective
              </h4>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {roadmap.overview}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4-Stage Curriculum
              </h4>

              {roadmap.sessions &&
                roadmap.sessions.map((sess, idx) => (
                  <div key={idx} className="roadmap-session-card">
                    <div className="roadmap-session-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="session-number-pill">Session {sess.sessionNumber || idx + 1}</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{sess.title}</h4>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {sess.suggestedDuration || '60 mins'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.5rem 0 0.75rem' }}>
                      {sess.description}
                    </p>

                    <div className="roadmap-parts-grid">
                      <div className="roadmap-part-box">
                        <span className="part-label">Part 1</span>
                        <p>{sess.partA}</p>
                      </div>
                      <div className="roadmap-part-box accent">
                        <span className="part-label accent">Part 2</span>
                        <p>{sess.partB}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {roadmap.tips && (
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#b45309' }}>
                  <Lightbulb size={16} color="#d97706" /> Recommended Best Practices
                </h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {roadmap.tips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: '0.3rem' }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              {onScheduleSession && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onScheduleSession(partner);
                  }}
                >
                  <Calendar size={16} /> Schedule Session 1
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapModal;
