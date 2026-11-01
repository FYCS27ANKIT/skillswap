import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, Check, Calendar, ArrowRight, UserPlus, Clock } from 'lucide-react';

const NotificationDropdown = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [swapsRes, sessionsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/swaps', config).catch(() => ({ data: { incoming: [] } })),
        axios.get('http://localhost:5000/api/sessions', config).catch(() => ({ data: [] })),
      ]);

      const pendingSwaps = (swapsRes.data?.incoming || []).filter((r) => r.status === 'pending');
      const now = new Date();
      const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const imminentSessions = (sessionsRes.data || []).filter((s) => {
        if (s.status !== 'scheduled') return false;
        const sessionDate = new Date(s.scheduledAt);
        return sessionDate >= now && sessionDate <= next48Hours;
      });

      setIncomingRequests(pendingSwaps);
      setUpcomingSessions(imminentSessions);
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCount = incomingRequests.length + upcomingSessions.length;

  const handleAcceptRequest = async (requestId, e) => {
    e.stopPropagation();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/swaps/${requestId}/status`, { status: 'accepted' }, config);
      fetchNotifications();
    } catch (err) {
      console.error('Error accepting swap:', err);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="icon-button notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <span className="notification-badge-count">{totalCount > 9 ? '9+' : totalCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown animate-fade-in">
          <div className="notification-dropdown-header">
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Notifications ({totalCount})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SkillSwap Feed</span>
          </div>

          <div className="notification-dropdown-body">
            {totalCount === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>You're all caught up!</p>
              </div>
            ) : (
              <>
                {incomingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="notification-item"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/requests');
                    }}
                  >
                    <div className="notification-icon swap">
                      <UserPlus size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                        {req.sender?.name} wants to swap
                      </p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Offers: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{req.offeredSkill}</span> • Wants: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{req.wantedSkill}</span>
                      </p>
                      <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={(e) => handleAcceptRequest(req._id, e)}
                        >
                          <Check size={12} /> Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {upcomingSessions.map((sess) => {
                  const isCreator = (sess.creator?._id || sess.creator) === user._id;
                  const partner = isCreator ? sess.partner : sess.creator;
                  const sessionDate = new Date(sess.scheduledAt);
                  return (
                    <div
                      key={sess._id}
                      className="notification-item"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/sessions');
                      }}
                    >
                      <div className="notification-icon session">
                        <Calendar size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                          Upcoming: {sess.title}
                        </p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          With {partner?.name} • {sessionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="notification-dropdown-footer">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/requests');
              }}
              className="notification-footer-btn"
            >
              View Requests <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
