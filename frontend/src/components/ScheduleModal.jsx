import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Calendar, Clock, Video, BookOpen, AlertCircle } from 'lucide-react';

const ScheduleModal = ({ prefilledPartner = null, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const [connections, setConnections] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(prefilledPartner?._id || '');
  const [title, setTitle] = useState('');
  const [skillTopic, setSkillTopic] = useState(prefilledPartner?.skillsOffered?.[0] || '');
  
  // Default scheduled date to tomorrow at 15:00
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime());
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!prefilledPartner) {
      const fetchConnections = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/messages/connections', config);
          setConnections(data);
          if (data.length > 0 && !selectedPartnerId) {
            setSelectedPartnerId(data[0].otherUser._id);
          }
        } catch (err) {
          console.error('Failed to load connections:', err);
        }
      };
      fetchConnections();
    }
  }, [prefilledPartner, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      setError('Please select a partner for this session.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a session title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        partnerId: selectedPartnerId,
        title: title.trim(),
        skillTopic: skillTopic.trim() || 'Skill Swap Exchange',
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: Number(duration),
        notes: notes.trim(),
      };

      const { data } = await axios.post('http://localhost:5000/api/sessions', payload, config);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
              Schedule a Learning Session
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Set a date, topic, and generate an instant virtual classroom.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Swap Partner
            </label>
            {prefilledPartner ? (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                {prefilledPartner.name} ({prefilledPartner.email})
              </div>
            ) : connections.length > 0 ? (
              <select
                className="form-control"
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                required
              >
                {connections.map((conn) => (
                  <option key={conn.otherUser._id} value={conn.otherUser._id}>
                    {conn.otherUser.name} ({conn.otherUser.email})
                  </option>
                ))}
              </select>
            ) : (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                You have no active matched connections yet. Connect with someone in Discover first!
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Session Title
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Session 1: React State Management & Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Skill Focus / Topic
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, Python, UI/UX"
                value={skillTopic}
                onChange={(e) => setSkillTopic(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Duration
              </label>
              <select
                className="form-control"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Date & Time
            </label>
            <input
              type="datetime-local"
              className="form-control"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Preparation Notes / Agenda
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="What to prepare, links, or specific questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-main)',
            }}
          >
            <Video size={18} color="var(--primary)" />
            <span>
              An instant virtual meeting room with video & screen sharing will automatically be generated for this session.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Calendar size={16} /> {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
