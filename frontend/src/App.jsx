import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Upload, Milestone, MessageSquare, Terminal, LogOut, Flame } from 'lucide-react';

// Import Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import CareerGoal from './pages/CareerGoal.jsx';
import RoadmapView from './pages/RoadmapView.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import AgentLogs from './pages/AgentLogs.jsx';

function NavWrapper({ children, token, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/dashboard')}>
          <Flame size={24} style={{ color: '#8b5cf6' }} />
          <span>SkillForge AI</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={16} />
              <span>Upload Resume</span>
            </div>
          </Link>
          <Link to="/goal" className={`nav-link ${location.pathname === '/goal' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} />
              <span>Target Role</span>
            </div>
          </Link>
          <Link to="/roadmap" className={`nav-link ${location.pathname === '/roadmap' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Milestone size={16} />
              <span>Roadmap</span>
            </div>
          </Link>
          <Link to="/interview" className={`nav-link ${location.pathname === '/interview' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} />
              <span>Interview Room</span>
            </div>
          </Link>
          <Link to="/activity" className={`nav-link ${location.pathname === '/activity' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} />
              <span>Agent Activity</span>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="btn-secondary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 14px', 
              fontSize: '0.85rem' 
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <main className="main-container">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <NavWrapper token={token} handleLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/upload" element={<ResumeUpload token={token} />} />
          <Route path="/goal" element={<CareerGoal token={token} />} />
          <Route path="/roadmap" element={<RoadmapView token={token} />} />
          <Route path="/interview" element={<InterviewRoom token={token} />} />
          <Route path="/activity" element={<AgentLogs token={token} />} />
        </Routes>
      </NavWrapper>
    </Router>
  );
}
