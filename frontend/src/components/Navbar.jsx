import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Repeat, Coins } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import CreditModal from './CreditModal';

const Navbar = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreditModal, setShowCreditModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const handleBalanceUpdate = (newBalance) => {
    if (user) {
      const updated = { ...user, skillCredits: newBalance };
      setUser(updated);
      localStorage.setItem('userInfo', JSON.stringify(updated));
    }
  };

  const currentCredits = user?.skillCredits ?? 3;

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Repeat size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Skill<span style={{ color: 'var(--primary)' }}>Swap</span>
            </h2>
          </Link>
        </div>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/discover" className={isActive('/discover') ? 'active' : ''}>
                Discover
              </Link>
              <Link to="/requests" className={isActive('/requests') ? 'active' : ''}>
                Requests
              </Link>
              <Link to="/sessions" className={isActive('/sessions') ? 'active' : ''}>
                Sessions
              </Link>
              <Link to="/workshops" className={isActive('/workshops') ? 'active' : ''}>
                Circles
              </Link>
              <Link to="/workspace" className={isActive('/workspace') ? 'active' : ''}>
                Live Lab
              </Link>
              <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>
                Chat
              </Link>
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                Profile
              </Link>

              {/* TimeBank Credits Pill */}
              <button
                type="button"
                className="credit-pill-btn"
                onClick={() => setShowCreditModal(true)}
                title="View your TimeBank Skill Credits balance and transactions"
              >
                <div className="credit-pill-icon">
                  <Coins size={14} />
                </div>
                <span>{currentCredits} Credits</span>
              </button>

              <NotificationDropdown />

              <button
                className="btn btn-secondary"
                onClick={handleLogout}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', color: '#ffffff' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {showCreditModal && (
        <CreditModal
          onClose={() => setShowCreditModal(false)}
          onBalanceUpdate={handleBalanceUpdate}
        />
      )}
    </>
  );
};

export default Navbar;
