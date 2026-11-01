import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Gift,
  HelpCircle,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const CreditModal = ({ onClose, onBalanceUpdate }) => {
  const { user } = useContext(AuthContext);

  const [balance, setBalance] = useState(user?.skillCredits ?? 3);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet', 'history'

  const fetchBalanceAndTransactions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/credits/balance', config);
      setBalance(data.skillCredits);
      setTransactions(data.transactions || []);
      if (onBalanceUpdate) onBalanceUpdate(data.skillCredits);
    } catch (err) {
      console.warn('Could not load credit balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceAndTransactions();
  }, [user.token]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-fade-in" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>TimeBank Skill Credits</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Your decentralized barter currency for knowledge exchange
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Balance Display Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
              Available Balance
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1 }}>
                {loading ? '...' : balance}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.9 }}>
                {balance === 1 ? 'Skill Credit' : 'Skill Credits'}
              </span>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
              1 Skill Credit = 1 Hour of personalized 1-on-1 mentorship with any swapper.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-pills-bar" style={{ width: '100%', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            How Credits Work
          </button>
          <button
            type="button"
            className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Transaction History ({transactions.length})
          </button>
        </div>

        {activeTab === 'wallet' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                padding: '1rem',
                background: 'var(--success-light)',
                border: '1px solid var(--success-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--success)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', color: '#065f46' }}>
                  How to Earn Credits (+1)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Teach any swapper for 1 hour, host a group workshop, or achieve mentor endorsements. Your earned credits let you learn from anyone on the platform.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                padding: '1rem',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ArrowUpRight size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', color: 'var(--primary)' }}>
                  How to Spend Credits (-1)
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Want to learn from someone whose interests don't match your offered skills? Book them with 1 Skill Credit—no mutual barter required!
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                padding: '1rem',
                background: 'var(--warning-light)',
                border: '1px solid var(--warning-border)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--warning)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Gift size={18} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', color: '#92400e' }}>
                  Free Welcome Bonus
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Every learner starts with 3 complimentary Skill Credits so you can immediately begin learning before having to teach.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No credit transactions recorded yet.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isIncoming = tx.receiver?._id === user._id || !tx.sender;
                return (
                  <div
                    key={tx._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isIncoming ? 'var(--success-light)' : 'var(--danger-light)',
                          color: isIncoming ? 'var(--success)' : 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                          {tx.notes || (isIncoming ? 'Credits Received' : 'Credits Spent')}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: isIncoming ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {isIncoming ? `+${tx.amount}` : `-${tx.amount}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
