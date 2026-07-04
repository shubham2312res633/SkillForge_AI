import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, Briefcase, Award, Zap } from 'lucide-react';

export default function CareerGoal({ token }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Fetch current target role to pre-select
    const fetchCurrentRole = async () => {
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedRole(data.targetRole);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentRole();
  }, [token, navigate]);

  const handleSubmit = async (role) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/career/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetRole: role })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update target role.');

      // Redirect to Activity logs to watch the agents rebuild the roadmap and projects!
      navigate('/activity');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const tracks = [
    {
      name: 'Frontend Engineer',
      description: 'Design interactive interfaces, optimize web client speed, and manage application states using React and modern build pipelines.',
      icon: Zap,
      color: '#fbbf24'
    },
    {
      name: 'Backend Engineer',
      description: 'Structure scalable data tables, build microservices, manage background worker queues, and optimize load distribution.',
      icon: Briefcase,
      color: '#8b5cf6'
    },
    {
      name: 'AI Engineer',
      description: 'Interface with advanced language model APIs, structure retrieval pipelines (RAG), and embed systems using Gemini SDK.',
      icon: Target,
      color: '#10b981'
    },
    {
      name: 'Data Scientist',
      description: 'Aggregate massive databases, run predictive analytical modeling, map custom graphs, and extract clean statistics.',
      icon: Award,
      color: '#3b82f6'
    },
    {
      name: 'DevOps Engineer',
      description: 'Automate build runs (CI/CD), package services inside Docker environments, orchestrate Kubernetes, and manage cloud endpoints.',
      icon: Target,
      color: '#f43f5e'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>Select Target Career Trajectory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Changing your goal forces the orchestrator agent pipeline to audit credentials, reconstruct roadmaps, and propose new projects.</p>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(244, 63, 94, 0.1)', 
          border: '1px solid rgba(244, 63, 94, 0.2)', 
          color: '#f43f5e', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(139, 92, 246, 0.1)', 
            borderTopColor: 'var(--accent-purple)', 
            borderRadius: '50%',
            animation: 'spinSlow 1.5s infinite linear' 
          }} />
          <h3 style={{ color: '#fff' }}>Re-scheduling agents...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Comparing credentials against new track criteria and redrafting plans...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tracks.map((track, idx) => {
            const Icon = track.icon;
            const isSelected = selectedRole === track.name;
            
            return (
              <div 
                key={idx}
                onClick={() => handleSubmit(track.name)}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  cursor: 'pointer',
                  borderWidth: isSelected ? '2px' : '1px',
                  borderColor: isSelected ? 'var(--accent-purple)' : 'var(--glass-border)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'var(--glass-bg)'
                }}
              >
                <div style={{ 
                  width: '54px', 
                  height: '54px', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: track.color
                }}>
                  <Icon size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{track.name}</span>
                    {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple-bright)', border: '1px solid var(--accent-purple)', padding: '2px 6px', borderRadius: '4px' }}>Active Path</span>}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{track.description}</p>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
