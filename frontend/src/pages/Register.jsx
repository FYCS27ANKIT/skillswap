import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Repeat, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skillsOffered: '',
    skillsWanted: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const formattedData = {
        ...formData,
        skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
        skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(Boolean)
      };
      await register(formattedData);
      navigate('/discover');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Repeat size={24} />
          </div>
          <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.6rem' }}>Create Your Swapper Account</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join the community of knowledge barters and lifelong learners
          </p>
        </div>
        
        {error && (
          <div
            style={{
              color: 'var(--danger)',
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              borderRadius: '8px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem 1.25rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Skills Offered to Teach (comma separated)</label>
            <input
              type="text"
              className="form-control"
              name="skillsOffered"
              placeholder="e.g. Python, Machine Learning, Data Visualization"
              value={formData.skillsOffered}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Skills Wanted to Learn (comma separated)</label>
            <input
              type="text"
              className="form-control"
              name="skillsWanted"
              placeholder="e.g. UI/UX Design, Figma, Guitar"
              value={formData.skillsWanted}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Short Bio (optional)</label>
            <textarea
              className="form-control"
              name="bio"
              rows="3"
              placeholder="Tell others what you love teaching and what motivates you..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            <UserPlus size={16} /> {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
