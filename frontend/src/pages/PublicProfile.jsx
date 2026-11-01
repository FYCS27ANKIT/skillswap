import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  Calendar,
  Star,
  BookOpen,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import ProposalModal from '../components/ProposalModal';
import RoadmapModal from '../components/RoadmapModal';
import ScheduleModal from '../components/ScheduleModal';
import ReviewModal from '../components/ReviewModal';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, reviewCount: 0 });
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'pending', 'accepted', 'declined'
  const [connectionRequestId, setConnectionRequestId] = useState(null);
  const [isSender, setIsSender] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchProfileAndStatus = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const [userRes, statusRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${id}`, config),
        axios.get(`http://localhost:5000/api/swaps/status/${id}`, config).catch(() => ({ data: { status: 'none' } })),
        axios.get(`http://localhost:5000/api/reviews/user/${id}`, config).catch(() => ({ data: { reviews: [], averageRating: 0, reviewCount: 0 } })),
      ]);

      setProfile(userRes.data);
      setConnectionStatus(statusRes.data.status);
      setIsSender(statusRes.data.isSender);
      setConnectionRequestId(statusRes.data.requestId);
      setReviewsData(reviewsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id === id) {
      navigate('/profile');
      return;
    }
    fetchProfileAndStatus();
  }, [id, user]);

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
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    navigate('/chat', { state: { selectedUserId: profile._id } });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Loading swapper profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        User not found.
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', maxWidth: '850px' }}>
      <button
        className="btn btn-secondary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Swapper Profile Card */}
      <div className="glass-panel" style={{ width: '100%', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.35rem 0' }}>{profile.name}</h2>
            <StarRating
              rating={reviewsData.averageRating || profile.averageRating || 0}
              reviewCount={reviewsData.reviewCount || profile.reviewCount || 0}
              size={18}
            />
            {profile.bio && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.75rem', fontSize: '0.95rem', maxWidth: '550px' }}>
                "{profile.bio}"
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Passport verification link */}
            <Link
              to={`/passport/${id}`}
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.88rem', gap: '0.4rem' }}
            >
              <Award size={16} color="#f59e0b" /> Learner Passport
            </Link>

            {/* AI Roadmap button */}
            <button
              className="btn btn-secondary"
              onClick={() => setShowRoadmapModal(true)}
              style={{ padding: '0.55rem 1rem', fontSize: '0.88rem', gap: '0.4rem' }}
            >
              <Sparkles size={16} color="var(--primary)" /> AI Swap Roadmap
            </button>

            {/* Connection Actions */}
            {connectionStatus === 'none' || connectionStatus === 'declined' ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowProposalModal(true)}
                disabled={actionLoading}
              >
                <UserPlus size={18} /> Connect / Swap
              </button>
            ) : connectionStatus === 'pending' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--warning)',
                    background: 'var(--warning-light)',
                    border: '1px solid var(--warning-border)',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  <Clock size={16} /> {isSender ? 'Request Sent' : 'Pending Request'}
                </div>
                {isSender && (
                  <button className="btn btn-danger" onClick={handleCancel} disabled={actionLoading} style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
                    Cancel
                  </button>
                )}
              </div>
            ) : connectionStatus === 'accepted' ? (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-success" onClick={handleOpenChat}>
                  <MessageCircle size={18} /> Chat
                </button>
                <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}>
                  <Calendar size={18} /> Schedule Session
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <h4 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--primary)' }}>
              Skills Offered to Teach
            </h4>
            <div>
              {profile.skillsOffered?.length > 0 ? (
                profile.skillsOffered.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>None listed</span>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <h4 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--success)' }}>
              Skills Wanted to Learn
            </h4>
            <div>
              {profile.skillsWanted?.length > 0 ? (
                profile.skillsWanted.map((skill, i) => (
                  <span key={i} className="skill-tag wanted">
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Endorsements Section */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star color="#f59e0b" fill="#f59e0b" size={18} /> Swapper Reviews & Endorsements
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Verified feedback from reciprocal skill sessions
            </span>
          </div>

          {connectionStatus === 'accepted' && (
            <button className="btn btn-secondary" onClick={() => setShowReviewModal(true)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              <Star size={15} color="#f59e0b" /> Leave Review
            </button>
          )}
        </div>

        {reviewsData.reviews?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>No reviews yet for {profile.name}.</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Be the first swapper to exchange skills and leave an endorsement!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                style={{
                  background: 'var(--bg-color)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong>{rev.reviewer?.name || 'Swapper'}</strong>
                    <StarRating rating={rev.rating} showValue={false} size={14} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="skill-tag" style={{ margin: 0, fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                    Taught: {rev.skill}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && (
        <ProposalModal
          recipient={profile}
          onClose={() => setShowProposalModal(false)}
          onSuccess={() => {
            setConnectionStatus('pending');
            setIsSender(true);
            fetchProfileAndStatus();
          }}
        />
      )}

      {/* AI Roadmap Modal */}
      {showRoadmapModal && (
        <RoadmapModal
          partner={profile}
          onClose={() => setShowRoadmapModal(false)}
          onScheduleSession={() => setShowScheduleModal(true)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          prefilledPartner={profile}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            alert('Session scheduled successfully! Check your Sessions dashboard.');
            navigate('/sessions');
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          partner={profile}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            alert('Thank you! Your review was recorded.');
            fetchProfileAndStatus();
          }}
        />
      )}
    </div>
  );
};

export default PublicProfile;
