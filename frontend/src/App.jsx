import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import SwapRequests from './pages/SwapRequests';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import LearnerPassport from './pages/LearnerPassport';
import Workspace from './pages/Workspace';
import Workshops from './pages/Workshops';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/passport/:userId" element={<LearnerPassport />} />
            <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><SwapRequests /></PrivateRoute>} />
            <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
            <Route path="/workshops" element={<PrivateRoute><Workshops /></PrivateRoute>} />
            <Route path="/circles" element={<PrivateRoute><Workshops /></PrivateRoute>} />
            <Route path="/workspace" element={<PrivateRoute><Workspace /></PrivateRoute>} />
            <Route path="/workspace/:roomId" element={<PrivateRoute><Workspace /></PrivateRoute>} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
