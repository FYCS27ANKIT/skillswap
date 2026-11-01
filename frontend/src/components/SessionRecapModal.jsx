import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  X,
  Sparkles,
  BookOpen,
  CheckSquare,
  Square,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

const SessionRecapModal = ({ session, partner, onClose }) => {
  const { user } = useContext(AuthContext);

  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedTasks, setCompletedTasks] = useState({});
  const [copied, setCopied] = useState(false);

  const fetchRecap = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/ai/session-recap',
        {
          skillTopic: session?.skillTopic || 'Skill Swap',
          notes: session?.notes || '',
          partnerName: partner?.name || 'Partner',
        },
        config
      );
      setRecap(data);
    } catch (err) {
      setError('Could not generate session recap at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap();
  }, [session?._id]);

  const toggleTask = (index) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyRecap = () => {
    if (!recap) return;
    const text = `SkillSwap Session Recap: ${recap.topic}\n\nKey Concepts:\n${(recap.summary || [])
      .map((s) => `• ${s}`)
      .join('\n')}\n\nPractice Homework:\n${(recap.homework || [])
      .map((h, i) => `${i + 1}. ${h}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="ai-badge" style={{ margin: 0 }}>
              <Sparkles size={12} /> AI Recap & Tasks
            </span>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
              {session?.title || 'Session Summary'}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Sparkles size={36} color="var(--primary)" className="spin-animation" style={{ marginBottom: '1rem' }} />
            <h4>Generating AI Session Recap & Exercises...</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Analyzing session topic "{session?.skillTopic}" to craft targeted practice challenges.
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchRecap}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary Box */}
            <div
              style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: '12px',
                padding: '1.2rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <BookOpen size={16} /> Key Takeaways Covered
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {recap.summary &&
                  recap.summary.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
              </ul>
            </div>

            {/* Interactive Homework Checklist */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckSquare size={16} color="var(--success)" /> Practice Homework Checklist
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {Object.values(completedTasks).filter(Boolean).length} / {recap.homework?.length || 0} completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recap.homework &&
                  recap.homework.map((task, i) => {
                    const isDone = !!completedTasks[i];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTask(i)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: isDone ? 'var(--success-light)' : 'var(--bg-color)',
                          border: `1px solid ${isDone ? 'var(--success-border)' : 'var(--surface-border)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ color: isDone ? 'var(--success)' : 'var(--text-muted)', marginTop: '2px' }}>
                          {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            textDecoration: isDone ? 'line-through' : 'none',
                            color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                            lineHeight: 1.4,
                          }}
                        >
                          {task}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Recommended Resources */}
            {recap.resources && recap.resources.length > 0 && (
              <div
                style={{
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Curated Self-Study Materials
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {recap.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', gap: '0.35rem' }}
                    >
                      {res.title} <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopyRecap}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
              </button>

              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRecapModal;
