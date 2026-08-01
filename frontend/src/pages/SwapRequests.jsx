import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

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
      fetchRequests(); // Refresh the lists
    } catch (err) {
      setError('Failed to update request');
    }
  };

  const handleCancel = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/swaps/${id}`, config);
      fetchRequests(); // Refresh the lists
    } catch (err) {
      setError('Failed to cancel request');
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Swap Requests</h2>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="grid">
        {/* Incoming Requests */}
        <div className="glass-panel">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            Incoming Requests
          </h3>
          {incoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No incoming requests yet.</p>
          ) : (
            incoming.map(req => (
              <div key={req._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>From:</strong> {req.sender?.name}</p>
                <p><strong>They Want:</strong> <span className="skill-tag wanted">{req.wantedSkill}</span></p>
                <p><strong>They Offer:</strong> <span className="skill-tag">{req.offeredSkill}</span></p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: req.status === 'accepted' ? 'var(--success)' : req.status === 'declined' ? 'var(--danger)' : '#fbbf24' }}>{req.status}</span></p>
                
                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-success" style={{ padding: '0.5rem', flex: 1 }} onClick={() => handleUpdateStatus(req._id, 'accepted')}>
                      <Check size={18} /> Accept
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem', flex: 1 }} onClick={() => handleUpdateStatus(req._id, 'declined')}>
                      <X size={18} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="glass-panel">
          <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            Sent Requests
          </h3>
          {outgoing.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't sent any requests.</p>
          ) : (
            outgoing.map(req => (
              <div key={req._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>To:</strong> {req.receiver?.name}</p>
                <p><strong>You Want:</strong> <span className="skill-tag wanted">{req.wantedSkill}</span></p>
                <p><strong>You Offer:</strong> <span className="skill-tag">{req.offeredSkill}</span></p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: req.status === 'accepted' ? 'var(--success)' : req.status === 'declined' ? 'var(--danger)' : '#fbbf24' }}>{req.status}</span></p>
                
                {req.status === 'pending' && (
                  <div style={{ marginTop: '1rem', display: 'flex' }}>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => handleCancel(req._id)}>
                      Cancel Request
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                   <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.9rem' }}>
                     Match accepted! You can now contact {req.receiver?.name} at {req.receiver?.email}.
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
