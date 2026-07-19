import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user.token]);

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Discover Skill Swappers
      </h2>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="grid">
        {users.map(u => (
          <div key={u._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{u.name}</h3>
            {u.bio && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>"{u.bio}"</p>}
            
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Offers:</strong>
              <div>
                {u.skillsOffered.length > 0 ? u.skillsOffered.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                )) : <span style={{ color: 'var(--text-muted)' }}>None listed</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Wants:</strong>
              <div>
                {u.skillsWanted.length > 0 ? u.skillsWanted.map((skill, i) => (
                  <span key={i} className="skill-tag wanted">{skill}</span>
                )) : <span style={{ color: 'var(--text-muted)' }}>None listed</span>}
              </div>
            </div>
            
            {/* Simple Swap matching logic for UI */}
            {user.skillsOffered.some(skill => u.skillsWanted.includes(skill)) && 
             u.skillsOffered.some(skill => user.skillsWanted.includes(skill)) ? (
                <div style={{ marginBottom: '1rem', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                   Perfect Match!
                </div>
            ) : null}

            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <Link
                to={`/profile/${u._id}`}
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.5rem', display: 'flex', justifyContent: 'center' }}
              >
                <UserIcon size={16} /> View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
      {users.length === 0 && (
         <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
           No other users found. Start inviting your friends!
         </div>
      )}
    </div>
  );
};

export default Discover;
