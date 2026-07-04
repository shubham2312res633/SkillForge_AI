import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, CheckCircle2, TrendingUp, AlertTriangle, Play, HelpCircle } from 'lucide-react';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 404) {
          // Profile doesn't exist yet - guide them to upload
          setStats(null);
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
        
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading Career Dashboard...</div>
      </div>
    );
  }

  // If no stats because profile is not set up
  if (!stats) {
    return (
      <div style={{ maxWidth: '650px', margin: '80px auto', textAlign: 'center' }} className="glass-card">
        <Award size={48} style={{ color: 'var(--accent-purple)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '16px' }}>Forge Your Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
          Welcome to SkillForge AI! To activate your autonomous multi-agent operating workspace, please upload a resume. Our agents will process the file, compute skills gaps, and launch custom roadmaps.
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary" style={{ padding: '14px 32px' }}>
          Upload Resume (PDF)
        </button>
      </div>
    );
  }

  // Calculate completion percentage
  const totalTopics = stats.totalTopicsCount || 10;
  const completedTopics = stats.completedTopicsCount || 0;
  const progressPercent = Math.min(100, Math.round((completedTopics / totalTopics) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Title & Goal Summary Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '6px' }}>Your Career Operating Hub</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Tracking trajectory for: <strong style={{ color: 'var(--accent-purple-bright)' }}>{stats.targetRole}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/interview')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={16} />
            <span>Simulate Interview</span>
          </button>
          <button onClick={() => navigate('/goal')} className="btn-secondary">Change Role</button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        {/* Overall Readiness Score */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            background: 'var(--accent-purple-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-purple)'
          }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.overallCareerScore}%</div>
          </div>
        </div>

        {/* Resume Score */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            background: 'var(--accent-blue-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-blue)'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.resumeScore}/100</div>
          </div>
        </div>

        {/* Readiness % */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px', 
            background: 'var(--accent-emerald-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Match</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{stats.readinessScore}%</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>Roadmap Learning Progress</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed {completedTopics} out of {totalTopics} study units</p>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{progressPercent}%</div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Detailed Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Missing Skills Gap Priority list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-purple)' }} />
            <span>Missing Skill Priorities</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {stats.missingSkills && stats.missingSkills.length > 0 ? (
              stats.missingSkills.map((gap, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 16px',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 500 }}>{gap.skill}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    background: gap.priority === 'HIGH' ? 'rgba(244, 63, 94, 0.15)' : gap.priority === 'MEDIUM' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: gap.priority === 'HIGH' ? '#f43f5e' : gap.priority === 'MEDIUM' ? '#fbbf24' : '#3b82f6',
                    border: `1px solid ${gap.priority === 'HIGH' ? 'rgba(244, 63, 94, 0.3)' : gap.priority === 'MEDIUM' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                  }}>
                    {gap.priority}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', padding: '10px' }}>
                <CheckCircle2 size={16} />
                <span>You have no missing skills recorded! Job ready.</span>
              </div>
            )}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Strengths */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span>Core Strengths</span>
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {stats.strengths?.map((str, idx) => <li key={idx}>{str}</li>)}
            </ul>
          </div>
          
          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />
          
          {/* Weaknesses */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} style={{ color: 'var(--accent-coral)' }} />
              <span>Areas of Improvement</span>
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {stats.weaknesses?.map((weak, idx) => <li key={idx}>{weak}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
