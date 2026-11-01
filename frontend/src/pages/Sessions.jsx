import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Plus,
  Star,
  ExternalLink,
  BookOpen,
  Award,
  Sparkles,
  Download,
  CalendarPlus,
  Code,
} from 'lucide-react';
import ScheduleModal from '../components/ScheduleModal';
import ReviewModal from '../components/ReviewModal';
import SessionRecapModal from '../components/SessionRecapModal';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

const Sessions = () => {
  const { user, setUser } = useContext(AuthContext);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null); // { partner, session }
  const [recapModalData, setRecapModalData] = useState(null); // { partner, session }

  const fetchSessions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/sessions', config);
      setSessions(data);
    } catch (err) {
      setError('Failed to load learning sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user.token]);

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}`,
        { status },
        config
      );
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? data : s)));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating session');
    }
  };

  const handleCompleteAndReview = async (session) => {
    handleUpdateStatus(session._id, 'completed');
    const partner =
      session.creator?._id === user._id ? session.partner : session.creator;

    // Offer to transfer 1 Skill Credit to the partner if user has credits
    const currentCredits = user.skillCredits ?? 3;
    if (currentCredits >= 1) {
      const wantsCreditTransfer = window.confirm(
        `Session completed! Would you like to award 1 Skill Credit to ${partner.name}? (Your current balance: ${currentCredits} credits)`
      );
      if (wantsCreditTransfer) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.post(
            'http://localhost:5000/api/credits/transfer',
            {
              recipientId: partner._id,
              amount: 1,
              sessionId: session._id,
              notes: `Completed learning session: ${session.title}`,
            },
            config
          );
          if (data.newBalance !== undefined) {
            const updated = { ...user, skillCredits: data.newBalance };
            setUser(updated);
            localStorage.setItem('userInfo', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Credit transfer note:', e.response?.data?.message || e.message);
        }
      }
    }

    setReviewModalData({ partner, session });
  };

  const handleCancelSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this scheduled session?')) {
      handleUpdateStatus(sessionId, 'cancelled');
    }
  };

  const upcomingList = sessions.filter((s) => s.status === 'scheduled');
  const completedList = sessions.filter((s) => s.status === 'completed');
  const cancelledList = sessions.filter((s) => s.status === 'cancelled');

  const totalLearningMinutes = completedList.reduce((acc, curr) => acc + (curr.duration || 60), 0);
  const totalHours = (totalLearningMinutes / 60).toFixed(1);

  const displayedList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  const formatSessionDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSessionTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Loading sessions...
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '1.5rem', maxWidth: '1000px' }}>
      {/* Top Banner & Stats */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '2rem',
          padding: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar color="var(--primary)" /> Learning Sessions
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Schedule and track live 1-on-1 skill barter appointments with instant video rooms.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          <Plus size={18} /> Schedule Session
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{upcomingList.length}</div>
            <div className="stat-label">Upcoming Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{completedList.length}</div>
            <div className="stat-label">Completed Swaps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-value">{totalHours} hrs</div>
            <div className="stat-label">Learning Time Logged</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-pills-bar">
        <button
          className={`tab-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          className={`tab-pill ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({completedList.length})
        </button>
        <button
          className={`tab-pill ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({cancelledList.length})
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayedList.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--primary)' }} />
            <h3 style={{ margin: '0 0 0.5rem' }}>No {activeTab} sessions found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              {activeTab === 'upcoming'
                ? 'Ready to learn something new? Schedule your first exchange session with an accepted swap match!'
                : `You don't have any ${activeTab} sessions yet.`}
            </p>
            {activeTab === 'upcoming' && (
              <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}>
                <Plus size={16} /> Schedule Now
              </button>
            )}
          </div>
        ) : (
          displayedList.map((sess) => {
            const isCreator = (sess.creator?._id || sess.creator) === user._id;
            const partner = isCreator ? sess.partner : sess.creator;
            const isPast = new Date(sess.scheduledAt) < new Date();

            return (
              <div key={sess._id} className="session-item-card glass-panel">
                <div className="session-card-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="skill-tag" style={{ margin: 0, fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                      {sess.skillTopic}
                    </span>
                    <span className={`session-status-badge ${sess.status}`}>
                      {sess.status === 'scheduled' && isPast ? 'Overdue / In Progress' : sess.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.2rem' }}>{sess.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={15} color="var(--primary)" />
                      {formatSessionDate(sess.scheduledAt)} at {formatSessionTime(sess.scheduledAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={15} color="var(--primary)" />
                      {sess.duration || 60} mins
                    </span>
                    <span>
                      Partner: <strong style={{ color: 'var(--text-main)' }}>{partner?.name}</strong>
                    </span>
                  </div>

                  {sess.notes && (
                    <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--surface-secondary)', border: '1px solid var(--surface-border)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      "{sess.notes}"
                    </p>
                  )}
                </div>

                <div className="session-card-actions">
                  {sess.status === 'scheduled' && (
                    <>
                      <a
                        href={sess.meetingLink || `https://meet.jit.si/skillswap-${sess._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1.1rem', gap: '0.45rem', fontSize: '0.88rem' }}
                      >
                        <Video size={16} /> Join Video Room <ExternalLink size={13} />
                      </a>

                      <Link
                        to={`/workspace/session-${sess._id}`}
                        state={{ partnerName: partner?.name }}
                        className="btn btn-secondary"
                        title="Open Collaborative Code Sandbox & Digital Whiteboard for this session"
                        style={{ padding: '0.55rem 0.95rem', gap: '0.4rem', fontSize: '0.88rem' }}
                      >
                        <Code size={15} color="var(--primary)" /> Live Lab
                      </Link>

                      {/* Google Calendar Sync */}
                      <a
                        href={generateGoogleCalendarUrl({
                          title: sess.title,
                          scheduledAt: sess.scheduledAt,
                          duration: sess.duration,
                          notes: sess.notes,
                          meetingLink: sess.meetingLink || `https://meet.jit.si/skillswap-${sess._id}`,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        title="Add to Google Calendar"
                        style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', gap: '0.35rem' }}
                      >
                        <CalendarPlus size={15} color="var(--primary)" /> Add to GCal
                      </a>

                      {/* Download .ics */}
                      <button
                        type="button"
                        className="icon-button"
                        title="Download .ics Calendar File (Outlook, Apple Calendar)"
                        onClick={() =>
                          downloadIcsFile({
                            title: sess.title,
                            scheduledAt: sess.scheduledAt,
                            duration: sess.duration,
                            notes: sess.notes,
                            meetingLink: sess.meetingLink || `https://meet.jit.si/skillswap-${sess._id}`,
                          })
                        }
                      >
                        <Download size={16} />
                      </button>

                      <button
                        className="btn btn-success"
                        onClick={() => handleCompleteAndReview(sess)}
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.88rem' }}
                      >
                        <CheckCircle size={15} /> Complete
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancelSession(sess._id)}
                        style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <XCircle size={15} /> Cancel
                      </button>
                    </>
                  )}

                  {sess.status === 'completed' && (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setRecapModalData({ partner, session: sess })}
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem' }}
                      >
                        <Sparkles size={15} color="var(--primary)" /> ✨ AI Recap & Tasks
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setReviewModalData({ partner, session: sess })}
                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem' }}
                      >
                        <Star size={15} color="#f59e0b" fill="#f59e0b" /> Leave Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={(newSession) => {
            setSessions((prev) => [newSession, ...prev]);
            setActiveTab('upcoming');
          }}
        />
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewModal
          partner={reviewModalData.partner}
          session={reviewModalData.session}
          onClose={() => setReviewModalData(null)}
          onSuccess={() => {
            alert('Review submitted successfully! Thank you for supporting the community.');
            fetchSessions();
          }}
        />
      )}

      {/* Session Recap Modal */}
      {recapModalData && (
        <SessionRecapModal
          session={recapModalData.session}
          partner={recapModalData.partner}
          onClose={() => setRecapModalData(null)}
        />
      )}
    </div>
  );
};

export default Sessions;
