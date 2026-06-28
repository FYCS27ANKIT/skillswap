import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    skillsOffered: user.skillsOffered?.join(', ') || '',
    skillsWanted: user.skillsWanted?.join(', ') || '',
    bio: user.bio || ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [aiLoading, setAiLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      
      const formattedData = {
        ...formData,
        skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
        skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(Boolean)
      };

      const { data } = await axios.put('http://localhost:5000/api/users/profile', formattedData, config);
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    }
  };

  const generateBio = async () => {
    if (!formData.skillsOffered && !formData.skillsWanted) {
        alert("Please add some skills first so I can write a relevant bio!");
        return;
    }
    
    setAiLoading(true);
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.post('http://localhost:5000/api/ai/generate-bio', {
            name: formData.name,
            skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
            skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(Boolean)
        }, config);
        
        setFormData({ ...formData, bio: data.bio });
        setMessage({ text: 'AI Bio generated! Check it out below.', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to generate bio.");
    } finally {
        setAiLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '2rem' }}>My Profile</h2>
        
        {message.text && (
          <div style={{ 
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '8px' 
          }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Skills Offered (comma separated)</label>
            <input type="text" className="form-control" name="skillsOffered" value={formData.skillsOffered} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Skills Wanted (comma separated)</label>
            <input type="text" className="form-control" name="skillsWanted" value={formData.skillsWanted} onChange={handleChange} />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Bio</label>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={generateBio}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                  Magic Bio ✨
                </button>
            </div>
            <textarea className="form-control" name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Tell us more about yourself..."></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
