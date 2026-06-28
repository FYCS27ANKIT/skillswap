import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, UserPlus, Check, Clock, MessageCircle } from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'pending', 'accepted', 'declined'
  const [connectionRequestId, setConnectionRequestId] = useState(null);
  const [isSender, setIsSender] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // If it's my own profile, just go to /profile
    if (user._id === id) {
      navigate('/profile');
      return;
    }

    const fetchProfileAndStatus = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch user data
        const { data: userData } = await axios.get(`http://localhost:5000/api/users/${id}`, config);
        setProfile(userData);

        // Fetch connection status
        const { data: statusData } = await axios.get(`http://localhost:5000/api/swaps/status/${id}`, config);
        setConnectionStatus(statusData.status);
        setIsSender(statusData.isSender);
        setConnectionRequestId(statusData.requestId);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStatus();
  }, [id, user]);

  const handleConnect = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        receiverId: profile._id,
        offeredSkill: user.skillsOffered[0] || 'My Skill',
        wantedSkill: profile.skillsOffered[0] || 'Your Skill',
        message: `Hi, I'd like to connect and swap skills!`
      };
      const { data } = await axios.post('http://localhost:5000/api/swaps', payload, config);
      setConnectionStatus('pending');
      setIsSender(true);
      setConnectionRequestId(data._id);
    } catch (err) {
      console.error("Connect error:", err);
      if (err.response && err.response.status === 400) {
         try {
           const { data: statusData } = await axios.get(`http://localhost:5000/api/swaps/status/${profile._id}`, config);
           setConnectionStatus(statusData.status);
           setIsSender(statusData.isSender);
         } catch (e) {}
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!connectionRequestId) return;
    setActionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/swaps/${connectionRequestId}`, config);
      setConnectionStatus('none');
      setIsSender(false);
      setConnectionRequestId(null);
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages');
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  if (!profile) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>User not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-panel" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>{profile.name}</h2>
            {profile.bio && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>"{profile.bio}"</p>}
          </div>

          <div>
             {/* Connection Actions */}
             {connectionStatus === 'none' || connectionStatus === 'declined' ? (
                <button className="btn btn-primary" onClick={handleConnect} disabled={actionLoading}>
                   <UserPlus size={18} /> Connect
                </button>
             ) : connectionStatus === 'pending' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
                     <Clock size={18} /> {isSender ? 'Request Sent' : 'Pending Request'}
                  </div>
                  {isSender && (
                    <button className="btn btn-danger" onClick={handleCancel} disabled={actionLoading}>
                      Cancel
                    </button>
                  )}
                </div>
             ) : connectionStatus === 'accepted' ? (
                <button className="btn btn-success" onClick={handleMessage}>
                   <MessageCircle size={18} /> Message
                </button>
             ) : null}
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
           <div>
              <h4 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Skills Offered</h4>
              {profile.skillsOffered.length > 0 ? profile.skillsOffered.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
              )) : <p style={{ color: 'var(--text-muted)' }}>None listed</p>}
           </div>

           <div>
              <h4 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Skills Wanted</h4>
              {profile.skillsWanted.length > 0 ? profile.skillsWanted.map((skill, i) => (
                  <span key={i} className="skill-tag wanted">{skill}</span>
              )) : <p style={{ color: 'var(--text-muted)' }}>None listed</p>}
           </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
