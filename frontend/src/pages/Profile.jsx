import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Loader2, Star, User, BookOpen, Save, Award } from 'lucide-react';
import StarRating from '../components/StarRating';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    skillsOffered: user.skillsOffered?.join(', ') || '',
    skillsWanted: user.skillsWanted?.join(', ') || '',
    bio: user.bio || '',
  });

  const [aiTone, setAiTone] = useState('friendly');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [myReviews, setMyReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'reviews'

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/reviews/my', config);
        setMyReviews(data);
      } catch (err) {
        console.warn('Could not load reviews:', err);
      }
    };
    fetchReviews();
  }, [user.token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiEnhanceBio = async () => {
    setAiLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const skillsOffered = formData.skillsOffered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const skillsWanted = formData.skillsWanted
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { data } = await axios.post(
        'http://localhost:5000/api/ai/enhance-bio',
        {
          currentBio: formData.bio,
          skillsOffered,
          skillsWanted,
          tone: aiTone,
        },
        config
      );

      if (data.enhancedBio) {
        setFormData((prev) => ({ ...prev, bio: data.enhancedBio }));
        setMessage({ text: 'Bio generated with AI! Review and click Save Changes.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to generate bio with AI. Please try again.', type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const formattedData = {
        ...formData,
        skillsOffered: formData.skillsOffered
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        skillsWanted: formData.skillsWanted
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const { data } = await axios.put(
        'http://localhost:5000/api/users/profile',
        formattedData,
        config
      );
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error updating profile',
        type: 'error',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const averageRating = user.averageRating || 0;
  const reviewCount = myReviews.length;

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '680px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0' }}>Profile & Reputation</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <StarRating rating={averageRating} reviewCount={reviewCount} size={18} />
              <Link
                to={`/passport/${user._id}`}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              >
                <Award size={14} color="#f59e0b" /> Learner Passport
              </Link>
            </div>
          </div>

          <div className="tab-pills-bar" style={{ margin: 0 }}>
            <button
              type="button"
              className={`tab-pill ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Profile
            </button>
            <button
              type="button"
              className={`tab-pill ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              My Reviews ({reviewCount})
            </button>
          </div>
        </div>

        {message.text && (
          <div
            style={{
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              background:
                message.type === 'success'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {message.text}
          </div>
        )}

        {activeTab === 'edit' ? (
          <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Skills Offered to Teach (comma separated)</label>
              <input
                type="text"
                className="form-control"
                name="skillsOffered"
                value={formData.skillsOffered}
                onChange={handleChange}
                placeholder="e.g. Python, Machine Learning, Data Science"
              />
              {formData.skillsOffered && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {formData.skillsOffered.split(',').map((s, i) => s.trim() && (
                    <span key={i} className="skill-tag" style={{ margin: 0 }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Skills Wanted to Learn (comma separated)</label>
              <input
                type="text"
                className="form-control"
                name="skillsWanted"
                value={formData.skillsWanted}
                onChange={handleChange}
                placeholder="e.g. UI/UX Design, Figma, Guitar"
              />
              {formData.skillsWanted && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {formData.skillsWanted.split(',').map((s, i) => s.trim() && (
                    <span key={i} className="skill-tag wanted" style={{ margin: 0 }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ margin: 0 }}>About Me & Bio</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                  >
                    <option value="friendly">Tone: Friendly</option>
                    <option value="professional">Tone: Professional</option>
                    <option value="mentor">Tone: Mentor</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAiEnhanceBio}
                    disabled={aiLoading}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.8rem', gap: '0.35rem' }}
                  >
                    <Sparkles size={14} color="#818cf8" />
                    {aiLoading ? 'Crafting Bio...' : '✨ AI Bio Assistant'}
                  </button>
                </div>
              </div>
              <textarea
                className="form-control"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your learning goals, background, and teaching style..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saveLoading}
              style={{ marginTop: '0.5rem', padding: '0.75rem' }}
            >
              <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award color="#f59e0b" size={18} /> Endorsements & Feedback Received
            </h3>

            {myReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Star size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ margin: '0 0 0.5rem' }}>No reviews yet.</p>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  Complete swap sessions with matched partners to accumulate ratings and build credibility!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myReviews.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      background: 'var(--bg-color)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '10px',
                      padding: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>{rev.reviewer?.name || 'Swapper'}</strong>
                        <StarRating rating={rev.rating} showValue={false} size={14} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span className="skill-tag" style={{ margin: 0, fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                        Skill: {rev.skill}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
