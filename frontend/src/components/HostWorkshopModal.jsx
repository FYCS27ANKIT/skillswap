import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Users, Calendar, Clock, Sparkles, Layers, Tag, BookOpen, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'System Design',
  'AI & Machine Learning',
  'Mobile Development',
  'Cloud & DevOps',
  'Design & UI/UX',
  'Data Science & SQL',
  'General Programming',
];

const HostWorkshopModal = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const getDefaultDateTime = () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    future.setHours(17, 0, 0, 0);
    return future.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillCategory, setSkillCategory] = useState('Web Development');
  const [level, setLevel] = useState('All Levels');
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime());
  const [duration, setDuration] = useState(60);
  const [maxAttendees, setMaxAttendees] = useState(12);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a workshop title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description or agenda for attendees.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/workshops',
        {
          title: title.trim(),
          description: description.trim(),
          skillCategory,
          level,
          scheduledAt,
          duration: Number(duration),
          maxAttendees: Number(maxAttendees),
          tags: tagsInput,
        },
        config
      );

      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workshop circle.');
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-xl)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Host a Skill Circle</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Organize an interactive cohort workshop for community learners
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            style={{ width: '34px', height: '34px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Workshop Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Fullstack Microservices Architecture & Redis Caching"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Skill Category
              </label>
              <select
                className="input-field"
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Audience Level
              </label>
              <select
                className="input-field"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="All Levels">All Levels Welcome</option>
                <option value="Beginner">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced Deep Dive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Overview & What Attendees Will Learn *
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Outline key topics, hands-on coding exercises, and prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Duration
              </label>
              <select
                className="input-field"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hr)</option>
                <option value={75}>75 mins</option>
                <option value={90}>90 mins (1.5 hr)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Max Capacity
              </label>
              <input
                type="number"
                min={2}
                max={50}
                className="input-field"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Topic Tags (comma-separated)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. React, TypeScript, Performance, Vite"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--surface-border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} color="var(--primary)" />
            <span>
              Skill Circles automatically generate a dedicated <strong>Jitsi Video Room</strong> and an interactive <strong>Live Code & Whiteboard Lab</strong> for all attendees.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.55rem 1.1rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '0.55rem 1.35rem', gap: '0.4rem' }}
            >
              {loading ? 'Creating Circle...' : 'Publish Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostWorkshopModal;
