import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Sparkles, Send, Check, Coins, Repeat } from 'lucide-react';

const ProposalModal = ({ recipient, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const [tradeMode, setTradeMode] = useState('swap'); // 'swap' or 'credit'
  const [offeredSkill, setOfferedSkill] = useState(user.skillsOffered?.[0] || '');
  const [wantedSkill, setWantedSkill] = useState(recipient.skillsOffered?.[0] || '');
  const [message, setMessage] = useState(
    `Hi ${recipient.name}! I'd love to swap skills with you.`
  );
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const currentCredits = user?.skillCredits ?? 3;

  const handleModeChange = (newMode) => {
    setTradeMode(newMode);
    if (newMode === 'credit') {
      setOfferedSkill('TimeBank: 1 Skill Credit');
      setMessage(
        `Hi ${recipient.name}! I'd love to learn ${wantedSkill || 'your skill'} from you in exchange for 1 Skill Credit!`
      );
    } else {
      setOfferedSkill(user.skillsOffered?.[0] || '');
      setMessage(`Hi ${recipient.name}! I'd love to swap skills with you.`);
    }
  };

  const handleGenerateAiMessage = async () => {
    setAiLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const effectiveOffered = tradeMode === 'credit' ? '1 TimeBank Skill Credit' : offeredSkill;
      const { data } = await axios.post(
        'http://localhost:5000/api/ai/icebreaker',
        {
          offeredSkill: effectiveOffered,
          wantedSkill,
          receiverName: recipient.name,
        },
        config
      );
      if (data.icebreaker) {
        setMessage(data.icebreaker);
      }
    } catch (err) {
      console.warn('AI icebreaker failed:', err);
      if (tradeMode === 'credit') {
        setMessage(
          `Hi ${recipient.name}! I love your work in ${wantedSkill} and would like to use 1 Skill Credit for a 1-on-1 learning session with you!`
        );
      } else {
        setMessage(
          `Hi ${recipient.name}! I noticed your skills in ${wantedSkill} and would love to exchange knowledge with you. I can teach you ${offeredSkill}!`
        );
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tradeMode === 'credit' && currentCredits < 1) {
      setError('You have 0 Skill Credits. Teach a session or switch to Direct Barter to propose a swap.');
      return;
    }
    if (!wantedSkill) {
      setError('Please select a skill you want to learn.');
      return;
    }
    if (tradeMode === 'swap' && !offeredSkill) {
      setError('Please select a skill you will teach.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        receiverId: recipient._id,
        offeredSkill: tradeMode === 'credit' ? 'TimeBank: 1 Skill Credit' : offeredSkill,
        wantedSkill,
        message: tradeMode === 'credit' ? `[Skill Credit Proposal] ${message}` : message,
      };

      const { data } = await axios.post('http://localhost:5000/api/swaps', payload, config);
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send swap proposal');
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
              Connect with {recipient.name}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Choose whether to trade skills mutually or pay with TimeBank credits.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Trade Mode Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Exchange Method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className={`mode-card-btn ${tradeMode === 'swap' ? 'selected' : ''}`}
              onClick={() => handleModeChange('swap')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <Repeat size={16} color="var(--primary)" /> Direct Skill Swap
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Reciprocal 1-for-1 knowledge barter
              </p>
            </button>

            <button
              type="button"
              className={`mode-card-btn ${tradeMode === 'credit' ? 'selected' : ''}`}
              onClick={() => handleModeChange('credit')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem' }}>
                <Coins size={16} color="#d97706" /> Use 1 Skill Credit
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Balance: {currentCredits} Credits available
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {tradeMode === 'swap' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                1. What skill will YOU teach?
              </label>
              {user.skillsOffered && user.skillsOffered.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {user.skillsOffered.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setOfferedSkill(skill)}
                      className={`skill-choice-btn ${offeredSkill === skill ? 'selected' : ''}`}
                    >
                      {offeredSkill === skill && <Check size={14} />} {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter skill to offer (e.g. JavaScript, Guitar)"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  required
                />
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--warning-light)',
                border: '1px solid var(--warning-border)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <Coins size={20} color="#d97706" />
              <div>
                <strong>1 Skill Credit will be transferred</strong> upon completing this learning session.
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {recipient.name} does not need to learn a skill from you in return.
                </span>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {tradeMode === 'swap' ? '2.' : '1.'} What skill do you want {recipient.name} to teach you?
            </label>
            {recipient.skillsOffered && recipient.skillsOffered.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {recipient.skillsOffered.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setWantedSkill(skill)}
                    className={`skill-choice-btn wanted ${wantedSkill === skill ? 'selected' : ''}`}
                  >
                    {wantedSkill === skill && <Check size={14} />} {skill}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                placeholder="Enter skill you want to learn"
                value={wantedSkill}
                onChange={(e) => setWantedSkill(e.target.value)}
                required
              />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>Proposal Message</label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGenerateAiMessage}
                disabled={aiLoading || !wantedSkill}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem', gap: '0.35rem' }}
              >
                <Sparkles size={13} color="#818cf8" />
                {aiLoading ? 'Drafting...' : '✨ AI Icebreaker'}
              </button>
            </div>
            <textarea
              className="form-control"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and outline your learning goals..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.4rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={15} /> {loading ? 'Sending...' : tradeMode === 'credit' ? 'Send with 1 Credit' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
