import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Terminal, Activity, ArrowRight, Zap, Target, Cpu } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Landing Navbar */}
      <header className="navbar" style={{ padding: '20px 8%' }}>
        <div className="nav-logo" onClick={() => navigate('/')}>
          <Cpu size={24} style={{ color: 'var(--accent-purple)' }} />
          <span>SkillForge AI</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '80px 8% 100px 8%',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Glow effect backdrops */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'var(--accent-purple)',
          filter: 'blur(120px)',
          opacity: 0.15,
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: -1
        }} />

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(139, 92, 246, 0.1)', 
          border: '1px solid rgba(139, 92, 246, 0.3)', 
          padding: '6px 16px', 
          borderRadius: '99px',
          marginBottom: '28px',
          fontSize: '0.9rem',
          color: 'var(--accent-purple-bright)'
        }}>
          <Sparkles size={14} />
          <span>Autonomous Multi-Agent Career Operating System</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
          lineHeight: '1.15', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px'
        }}>
          Forge Your Path to Job Readiness
        </h1>

        <p style={{ 
          fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
          color: 'var(--text-secondary)', 
          maxWidth: '750px', 
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Upload your resume and let our autonomous agents analyze gaps, generate roadmap milestones, recommend engineering projects, and run technical mock interviews.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/register')} 
            className="btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px 36px', 
              fontSize: '1.1rem' 
            }}
          >
            <span>Launch Agentic Workspace</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ 
        padding: '80px 8%', 
        background: 'var(--bg-secondary)', 
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '15px', color: '#fff' }}>Collaborating Career Agents</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Nine specialized AI agents cooperating through the Model Context Protocol to guide your growth.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          {/* Agent 1 */}
          <div className="glass-card">
            <div style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}><Cpu size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Career Orchestrator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>The brain of the system. Evaluates intent, schedules agent task routing, and aggregates analysis logs.</p>
          </div>
          {/* Agent 2 */}
          <div className="glass-card">
            <div style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}><Shield size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Security & Privacy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Sanitizes inputs and redacts sensitive PII (emails, phone numbers) before calling external models.</p>
          </div>
          {/* Agent 3 */}
          <div className="glass-card">
            <div style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}><Activity size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Skill Gap Analyzer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Compares credentials against target roles, prioritizing HIGH/MEDIUM/LOW training gaps.</p>
          </div>
          {/* Agent 4 */}
          <div className="glass-card">
            <div style={{ color: 'var(--accent-purple)', marginBottom: '16px' }}><Terminal size={32} /></div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Roadmap Generator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Structures personalized month-by-month timelines containing core topics, projects, and resources.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 8%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)' }}>
        <p>© 2026 SkillForge AI. Build for the future of job-readiness. Model Context Protocol Compliant.</p>
      </footer>
    </div>
  );
}
