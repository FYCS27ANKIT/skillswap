import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Check, X, Repeat, MessageCircle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

const SwapRequests = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/swaps', config);
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user.token]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/swaps/${id}/status`, { status }, config);
      fetchRequests();
    } catch (err) {
      setError('Failed to update request');
    }
  };

  const handleCancel = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/swaps/${id}`, config);
      fetchRequests();
    } catch (err) {
      setError('Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'accepted') {
      return (
        <span
          style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            border: '1px solid var(--success-border)',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Accepted
        </span>
      );
    } else if (status === 'declined') {
      return (
        <span
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            border: '1px solid var(--danger-border)',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Declined
        </span>
      );
    }
    return (
      <span
        style={{
          background: 'var(--warning-light)',
          color: 'var(--warning)',
          border: '1px solid var(--warning-border)',
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <Clock size={12} /> Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Loading swap requests...
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Repeat color="var(--primary)" /> Swap Requests Dashboard
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your incoming skill barter invitations and track proposals you sent.
        </p>
      </div>

      {error && (
        <div
          style={{
            color: 'var(--danger)',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Incoming Requests */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--surface-border)',
              paddingBottom: '0.75rem',
            }}
          >
            <h3 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.2rem' }}>
              Incoming Proposals ({incoming.length})
            </h3>
          </div>

          {incoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No incoming requests yet.</p>
          ) : (
            incoming.map((req) => (
              <div
                key={req._id}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{req.sender?.name}</h4>
                  {getStatusBadge(req.status)}
                </div>

                <div style={{ margin: '0.6rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>They Offer: </span>
                    <span className="skill-tag" style={{ margin: '0 0.25rem' }}>{req.offeredSkill}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>They Want to Learn: </span>
                    <span className="skill-tag wanted" style={{ margin: '0 0.25rem' }}>{req.wantedSkill}</span>
                  </p>
                </div>

                {req.message && (
                  <p style={{ margin: '0.5rem 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                    "{req.message}"
                  </p>
                )}

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                    <button
                      className="btn btn-success"
                      style={{ padding: '0.45rem', flex: 1, fontSize: '0.88rem' }}
                      onClick={() => handleUpdateStatus(req._id, 'accepted')}
                    >
                      <Check size={16} /> Accept Proposal
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.45rem', flex: 1, fontSize: '0.88rem' }}
                      onClick={() => handleUpdateStatus(req._id, 'declined')}
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <Link
                      to="/chat"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.88rem' }}
                    >
                      <MessageCircle size={15} /> Open Chat & Schedule
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--surface-border)',
              paddingBottom: '0.75rem',
            }}
          >
            <h3 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.2rem' }}>
              Sent Proposals ({outgoing.length})
            </h3>
          </div>

          {outgoing.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>You haven't sent any requests.</p>
          ) : (
            outgoing.map((req) => (
              <div
                key={req._id}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-color)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem' }}>To: {req.receiver?.name}</h4>
                  {getStatusBadge(req.status)}
                </div>

                <div style={{ margin: '0.6rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>You Offered: </span>
                    <span className="skill-tag" style={{ margin: '0 0.25rem' }}>{req.offeredSkill}</span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>You Want to Learn: </span>
                    <span className="skill-tag wanted" style={{ margin: '0 0.25rem' }}>{req.wantedSkill}</span>
                  </p>
                </div>

                {req.status === 'pending' && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                      onClick={() => handleCancel(req._id)}
                    >
                      Withdraw Proposal
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.75rem',
                      background: 'var(--success-light)',
                      border: '1px solid var(--success-border)',
                      color: '#065f46',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    Match accepted! You can now chat and schedule learning sessions together.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapRequests;
