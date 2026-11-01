import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Star, Check } from 'lucide-react';
import StarRating from './StarRating';

const ReviewModal = ({ partner, session = null, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [skill, setSkill] = useState(session?.skillTopic || partner.skillsOffered?.[0] || '');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback about your experience.');
      return;
    }
    if (!skill.trim()) {
      setError('Please specify which skill was taught.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        revieweeId: partner._id,
        rating,
        skill: skill.trim(),
        comment: comment.trim(),
        sessionId: session?._id || null,
      };

      const { data } = await axios.post('http://localhost:5000/api/reviews', payload, config);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
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
              Review {partner.name}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Share constructive feedback to empower the SkillSwap community.
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Rating
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <StarRating
                rating={rating}
                interactive={true}
                onChange={setRating}
                size={28}
                showValue={false}
              />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f59e0b' }}>
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Skill Taught
            </label>
            <input
              type="text"
              className="form-control"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. Python, UI/UX, Spanish Conversation"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Your Feedback & Experience
            </label>
            <textarea
              className="form-control"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`How was your session with ${partner.name}? Was the explanation clear? What did you accomplish together?`}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Star size={16} fill="currentColor" /> {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
