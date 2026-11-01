import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  Video,
  Code,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  CalendarPlus,
  Download,
  Trash2,
  UserCheck,
} from 'lucide-react';
import HostWorkshopModal from '../components/HostWorkshopModal';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

const CATEGORIES = [
  'All',
  'Web Development',
  'System Design',
  'AI & Machine Learning',
  'Mobile Development',
  'Cloud & DevOps',
  'Design & UI/UX',
];

const Workshops = () => {
  const { user } = useContext(AuthContext);

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'registered', 'hosting'
  const [showHostModal, setShowHostModal] = useState(false);
  const [rsvpLoadingId, setRsvpLoadingId] = useState(null);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data } = await axios.get('http://localhost:5000/api/workshops', { params });
      setWorkshops(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load community workshops.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkshops();
  };

  const handleToggleRsvp = async (workshopId) => {
    if (!user) {
      alert('Please log in to RSVP for community workshops.');
      return;
    }

    setRsvpLoadingId(workshopId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `http://localhost:5000/api/workshops/${workshopId}/rsvp`,
        {},
        config
      );

      setWorkshops((prev) =>
        prev.map((w) => (w._id === workshopId ? data.workshop : w))
      );

      setSuccessToast(data.message);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update RSVP.');
    } finally {
      setRsvpLoadingId(null);
    }
  };

  const handleDeleteWorkshop = async (workshopId) => {
    if (!window.confirm('Are you sure you want to cancel this community workshop circle?')) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/workshops/${workshopId}`, config);
      setWorkshops((prev) => prev.filter((w) => w._id !== workshopId));
      setSuccessToast('Workshop circle successfully cancelled.');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel workshop.');
    }
  };

  // Helper date formatters
  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const currentUserId = user?._id || user?.id;

  // Filter workshops by sub-tab
  const filteredWorkshops = workshops.filter((w) => {
    const isHost = (w.host?._id || w.host) === currentUserId;
    const isRegistered = w.attendees?.some(
      (a) => (a.user?._id || a.user) === currentUserId
    );

    if (activeTab === 'hosting') return isHost;
    if (activeTab === 'registered') return isRegistered;
    return true;
  });

  const registeredCount = workshops.filter((w) =>
    w.attendees?.some((a) => (a.user?._id || a.user) === currentUserId)
  ).length;

  const hostingCount = workshops.filter(
    (w) => (w.host?._id || w.host) === currentUserId
  ).length;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            background: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >
          <CheckCircle size={18} />
          {successToast}
        </div>
      )}

      {/* Hero Section */}
      <section
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.8), rgba(253, 242, 248, 0.6))',
          border: '1px solid var(--primary-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
              border: '1px solid var(--primary-border)',
            }}
          >
            <Users size={14} /> COHORT LEARNING • SKILL CIRCLES
          </div>
          <h1 style={{ fontSize: '2.3rem', letterSpacing: '-0.03em', margin: '0 0 0.75rem', color: '#1e1b4b' }}>
            Interactive Masterclasses & Skill Circles
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            Small group workshops hosted by experienced peers. Code together live, diagram architectures on shared whiteboards, and learn collaboratively.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowHostModal(true)}
          style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem', gap: '0.5rem', borderRadius: '12px' }}
        >
          <Plus size={18} /> Host a Skill Circle
        </button>
      </section>

      {/* Controls: Category Filter + Search + Sub-Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {/* Top Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-secondary)',
              padding: '0.25rem',
              borderRadius: '12px',
              border: '1px solid var(--surface-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'all' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'all' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              All Circles ({workshops.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registered')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'registered' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'registered' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'registered' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'registered' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              My RSVPs ({registeredCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hosting')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'hosting' ? 'var(--surface)' : 'transparent',
                color: activeTab === 'hosting' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'hosting' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'hosting' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Hosted by Me ({hostingCount})
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search topics, skills, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              Search
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                background: selectedCategory === cat ? 'var(--primary-light)' : 'var(--surface)',
                color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div className="spin-animation" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Users size={32} color="var(--primary)" />
          </div>
          <p style={{ fontWeight: 600 }}>Loading Skill Circles & Masterclasses...</p>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            borderRadius: '16px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--text-muted)',
            }}
          >
            <Users size={28} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem' }}>No workshops found</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {activeTab === 'registered'
              ? "You haven't reserved a seat in any upcoming workshops yet."
              : activeTab === 'hosting'
              ? "You haven't hosted any workshops yet. Share your expertise with the community!"
              : 'No workshops match the selected category or search filters.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowHostModal(true)}
            style={{ padding: '0.55rem 1.25rem' }}
          >
            <Plus size={16} /> Host a Workshop Circle
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredWorkshops.map((workshop) => {
            const isHost = (workshop.host?._id || workshop.host) === currentUserId;
            const isRegistered = workshop.attendees?.some(
              (a) => (a.user?._id || a.user) === currentUserId
            );
            const attendeesCount = workshop.attendees?.length || 0;
            const capacityRatio = attendeesCount / workshop.maxAttendees;
            const isFull = attendeesCount >= workshop.maxAttendees;

            // Capacity status color
            const capacityColor =
              capacityRatio >= 1.0 ? 'var(--danger)' : capacityRatio >= 0.75 ? 'var(--warning)' : 'var(--success)';

            return (
              <div
                key={workshop._id}
                className="glass-card animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: 'var(--surface)',
                  border: isHost ? '2px solid var(--primary-border)' : '1px solid var(--surface-border)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-border)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {workshop.skillCategory}
                  </span>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    {workshop.level}
                  </span>
                </div>

                {/* Host Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {workshop.host?.name?.charAt(0).toUpperCase() || 'H'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {workshop.host?.name} {isHost && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Host)</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {workshop.host?.headline || 'SkillSwap Community Mentor'}
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', lineHeight: '1.4' }}>
                  {workshop.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    flex: '1',
                  }}
                >
                  {workshop.description}
                </p>

                {/* Schedule & Duration Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    background: 'var(--surface-secondary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--primary)" />
                    {formatDateTime(workshop.scheduledAt)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="var(--primary)" />
                    {workshop.duration} mins
                  </span>
                </div>

                {/* Seat Capacity Bar */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      <Users size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Capacity: {attendeesCount} / {workshop.maxAttendees} seats
                    </span>
                    <span style={{ fontWeight: 700, color: capacityColor }}>
                      {isFull ? 'Sold Out' : `${workshop.maxAttendees - attendeesCount} seats remaining`}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '999px',
                      background: 'var(--surface-border)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(capacityRatio * 100, 100)}%`,
                        height: '100%',
                        background: capacityColor,
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Tags */}
                {workshop.tags && workshop.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {workshop.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          background: 'var(--surface-secondary)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--surface-border)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  {/* Join buttons (only if registered or host) */}
                  {(isHost || isRegistered) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <a
                        href={workshop.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ padding: '0.45rem', fontSize: '0.82rem', gap: '0.35rem', justifyContent: 'center' }}
                      >
                        <Video size={14} /> Join Video
                      </a>

                      <Link
                        to={`/workspace/${workshop.workspaceRoomId || `circle-${workshop._id}`}`}
                        state={{ partnerName: workshop.title }}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem', fontSize: '0.82rem', gap: '0.35rem', justifyContent: 'center' }}
                      >
                        <Code size={14} color="var(--primary)" /> Live Lab
                      </Link>
                    </div>
                  )}

                  {/* Primary RSVP / Manage button */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isHost ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDeleteWorkshop(workshop._id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          gap: '0.35rem',
                          color: 'var(--danger)',
                          borderColor: 'var(--danger-border)',
                        }}
                      >
                        <Trash2 size={14} /> Cancel Workshop
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`btn ${isRegistered ? 'btn-secondary' : isFull ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleRsvp(workshop._id)}
                        disabled={rsvpLoadingId === workshop._id || (!isRegistered && isFull)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          gap: '0.35rem',
                          background: isRegistered ? 'var(--success-light)' : undefined,
                          color: isRegistered ? 'var(--success)' : undefined,
                          borderColor: isRegistered ? 'var(--success-border)' : undefined,
                        }}
                      >
                        {rsvpLoadingId === workshop._id ? (
                          'Updating...'
                        ) : isRegistered ? (
                          <>
                            <UserCheck size={15} /> Seat Reserved (Cancel RSVP)
                          </>
                        ) : isFull ? (
                          'Sold Out (Full)'
                        ) : (
                          <>
                            <Users size={15} /> Reserve Free Seat
                          </>
                        )}
                      </button>
                    )}

                    {/* Google Calendar Add Button (if registered or host) */}
                    {(isRegistered || isHost) && (
                      <a
                        href={generateGoogleCalendarUrl({
                          title: workshop.title,
                          scheduledAt: workshop.scheduledAt,
                          duration: workshop.duration,
                          notes: workshop.description,
                          meetingLink: workshop.meetingLink,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-button"
                        title="Add to Google Calendar"
                        style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                      >
                        <CalendarPlus size={15} color="var(--primary)" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Host Workshop Modal */}
      {showHostModal && (
        <HostWorkshopModal
          onClose={() => setShowHostModal(false)}
          onSuccess={(newWorkshop) => {
            setWorkshops((prev) => [newWorkshop, ...prev]);
            setSuccessToast('Workshop circle successfully published!');
            setTimeout(() => setSuccessToast(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default Workshops;
