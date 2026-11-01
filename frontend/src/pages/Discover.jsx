import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Search,
  Sparkles,
  Filter,
  ArrowUpDown,
  Repeat,
  CheckCircle2,
  X,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import ProposalModal from '../components/ProposalModal';

const CATEGORIES = [
  { name: 'All', keywords: [] },
  { name: 'Tech & Code', keywords: ['python', 'react', 'javascript', 'node', 'data science', 'machine learning', 'sql', 'css', 'html', 'backend', 'frontend', 'cloud', 'devops'] },
  { name: 'Design & Media', keywords: ['ui/ux', 'design', 'figma', 'photoshop', 'illustrator', 'video', 'animation', '3d', 'blender'] },
  { name: 'Languages', keywords: ['spanish', 'french', 'german', 'japanese', 'mandarin', 'english', 'italian', 'russian'] },
  { name: 'Music & Arts', keywords: ['guitar', 'piano', 'singing', 'music theory', 'drums', 'audio', 'production'] },
  { name: 'Business & Soft Skills', keywords: ['marketing', 'seo', 'finance', 'writing', 'public speaking', 'sales', 'management'] },
];

const Discover = () => {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [perfectMatchesOnly, setPerfectMatchesOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('match'); // 'match', 'rating', 'name'

  // Swap Proposal Modal
  const [proposalRecipient, setProposalRecipient] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch swappers');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user.token]);

  // Helper to test if a swapper is a perfect mutual match
  const isPerfectMatch = (targetUser) => {
    if (!user || !targetUser) return false;
    const myOffered = (user.skillsOffered || []).map((s) => s.toLowerCase());
    const myWanted = (user.skillsWanted || []).map((s) => s.toLowerCase());
    const theirOffered = (targetUser.skillsOffered || []).map((s) => s.toLowerCase());
    const theirWanted = (targetUser.skillsWanted || []).map((s) => s.toLowerCase());

    const iOfferWhatTheyWant = myOffered.some((skill) =>
      theirWanted.some((w) => w.includes(skill) || skill.includes(w))
    );
    const theyOfferWhatIWant = theirOffered.some((skill) =>
      myWanted.some((w) => w.includes(skill) || skill.includes(w))
    );

    return iOfferWhatTheyWant && theyOfferWhatIWant;
  };

  // Helper to calculate match score
  const getMatchScore = (targetUser) => {
    let score = 0;
    if (isPerfectMatch(targetUser)) score += 10;
    const myWanted = (user?.skillsWanted || []).map((s) => s.toLowerCase());
    const theirOffered = (targetUser.skillsOffered || []).map((s) => s.toLowerCase());
    const overlap = theirOffered.filter((skill) =>
      myWanted.some((w) => w.includes(skill) || skill.includes(w))
    ).length;
    score += overlap * 3;
    score += targetUser.averageRating || 0;
    return score;
  };

  // Filtered & Sorted Swappers
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const nameMatch = u.name.toLowerCase().includes(query);
          const bioMatch = (u.bio || '').toLowerCase().includes(query);
          const offeredMatch = (u.skillsOffered || []).some((s) =>
            s.toLowerCase().includes(query)
          );
          const wantedMatch = (u.skillsWanted || []).some((s) =>
            s.toLowerCase().includes(query)
          );
          if (!nameMatch && !bioMatch && !offeredMatch && !wantedMatch) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All') {
          const categoryDef = CATEGORIES.find((c) => c.name === selectedCategory);
          if (categoryDef && categoryDef.keywords.length > 0) {
            const allUserSkills = [
              ...(u.skillsOffered || []),
              ...(u.skillsWanted || []),
            ].map((s) => s.toLowerCase());
            const hasKeyword = categoryDef.keywords.some((k) =>
              allUserSkills.some((skill) => skill.includes(k) || k.includes(skill))
            );
            if (!hasKeyword) return false;
          }
        }

        // Perfect Match Filter
        if (perfectMatchesOnly && !isPerfectMatch(u)) {
          return false;
        }

        // Top Rated Filter
        if (topRatedOnly && (!u.averageRating || u.averageRating < 4.0)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return getMatchScore(b) - getMatchScore(a);
        } else if (sortBy === 'rating') {
          return (b.averageRating || 0) - (a.averageRating || 0);
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [users, searchTerm, selectedCategory, perfectMatchesOnly, topRatedOnly, sortBy]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        Discovering talented swappers...
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '1.5rem' }}>
      {/* Header and Search Controls */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          Discover Skill Swappers
        </h2>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Find reciprocal learning partners, exchange domain expertise, and level up together.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '650px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.8rem', paddingRight: searchTerm ? '2.5rem' : '1rem' }}
            placeholder="Search by swapper name, skill offered, or skill wanted (e.g. Python, Figma, Spanish)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="icon-button"
              style={{
                position: 'absolute',
                right: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '28px',
                height: '28px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="category-scroll-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="filter-controls-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={perfectMatchesOnly}
                onChange={(e) => setPerfectMatchesOnly(e.target.checked)}
              />
              <span className="toggle-label">
                <Sparkles size={14} color="#818cf8" /> Perfect Matches Only
              </span>
            </label>

            <label className="checkbox-toggle">
              <input
                type="checkbox"
                checked={topRatedOnly}
                onChange={(e) => setTopRatedOnly(e.target.checked)}
              />
              <span className="toggle-label">⭐ 4+ Stars Only</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              className="form-control"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="match">Best Match</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {/* Swappers Grid */}
      <div className="grid">
        {filteredUsers.map((u) => {
          const perfect = isPerfectMatch(u);

          return (
            <div
              key={u._id}
              className={`glass-panel swapper-card ${perfect ? 'perfect-match-border' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              {perfect && (
                <div className="perfect-match-badge">
                  <Sparkles size={12} /> Perfect Match!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>{u.name}</h3>
                  <StarRating rating={u.averageRating || 0} reviewCount={u.reviewCount || 0} size={15} />
                </div>
              </div>

              {u.bio ? (
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '1rem',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                  }}
                >
                  "{u.bio}"
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', opacity: 0.6 }}>
                  Lifelong learner exploring new skills.
                </p>
              )}

              {/* Skills Offered */}
              <div style={{ marginBottom: '0.85rem' }}>
                <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Offers to Teach:
                </strong>
                <div>
                  {u.skillsOffered?.length > 0 ? (
                    u.skillsOffered.map((skill, i) => (
                      <span
                        key={i}
                        className="skill-tag clickable"
                        onClick={() => setSearchTerm(skill)}
                        title={`Filter by ${skill}`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None listed</span>
                  )}
                </div>
              </div>

              {/* Skills Wanted */}
              <div style={{ marginBottom: '1.25rem', flex: 1 }}>
                <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Wants to Learn:
                </strong>
                <div>
                  {u.skillsWanted?.length > 0 ? (
                    u.skillsWanted.map((skill, i) => (
                      <span
                        key={i}
                        className="skill-tag wanted clickable"
                        onClick={() => setSearchTerm(skill)}
                        title={`Filter by ${skill}`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None listed</span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div
                style={{
                  borderTop: '1px solid var(--surface-border)',
                  paddingTop: '1rem',
                  marginTop: 'auto',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.6rem',
                }}
              >
                <Link
                  to={`/profile/${u._id}`}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '0.88rem' }}
                >
                  <UserIcon size={15} /> Profile
                </Link>

                <button
                  className="btn btn-primary"
                  onClick={() => setProposalRecipient(u)}
                  style={{ padding: '0.5rem', fontSize: '0.88rem', gap: '0.35rem' }}
                >
                  <Repeat size={15} /> Swap
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem', marginTop: '2rem' }}>
          <Search size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No swappers match your current filters</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Try broadening your search term or clearing filters to see more community members.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setPerfectMatchesOnly(false);
              setTopRatedOnly(false);
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Swap Proposal Modal */}
      {proposalRecipient && (
        <ProposalModal
          recipient={proposalRecipient}
          onClose={() => setProposalRecipient(null)}
          onSuccess={() => {
            alert(`Swap proposal sent to ${proposalRecipient.name}! You can track it in Requests.`);
          }}
        />
      )}
    </div>
  );
};

export default Discover;
