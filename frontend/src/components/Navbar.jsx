import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, Repeat, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Repeat color="var(--primary)" size={28} />
          <h2>SkillSwap</h2>
        </Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/discover"><BookOpen size={18} /> Discover</Link>
            <Link to="/requests">Requests</Link>
            <Link to="/profile"><UserIcon size={18} /> Profile</Link>
            <Link to="/chat">< MessageCircle size={18} /> Chat</Link>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
