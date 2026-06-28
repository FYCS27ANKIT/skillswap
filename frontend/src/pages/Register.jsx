import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Full Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Email</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Skills Offered (comma separated)</label>
            <input type="text" className="form-control" name="skillsOffered" placeholder="e.g. React, Python, Guitar" value={formData.skillsOffered} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Skills Wanted (comma separated)</label>
            <input type="text" className="form-control" name="skillsWanted" placeholder="e.g. Spanish, UI Design" value={formData.skillsWanted} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Bio (optional)</label>
            <textarea className="form-control" name="bio" rows="3" value={formData.bio} onChange={handleChange}></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
