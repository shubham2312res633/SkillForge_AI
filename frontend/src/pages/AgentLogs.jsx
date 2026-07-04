import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Cpu, Activity, Play, CheckCircle, XCircle } from 'lucide-react';

export default function AgentLogs({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/dashboard/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 404) {
        setLogs([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to load agent activity.');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchLogs();

    // Auto-poll logs every 3 seconds for active simulation feeling
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const getAgentColor = (name) => {
    switch (name) {
      case 'CareerOrchestrator': return '#8b5cf6'; // Purple
      case 'SecurityAgent': return '#3b82f6'; // Blue
      case 'ResumeAgent': return '#10b981'; // Emerald
      case 'SkillAgent': return '#fbbf24'; // Amber
      case 'RoadmapAgent': return '#ec4899'; // Pink
      case 'ProjectAgent': return '#6366f1'; // Indigo
      case 'JobAgent': return '#14b8a6'; // Teal
      case 'InterviewAgent': return '#f43f5e'; // Rose
      case 'MemoryAgent': return '#84cc16'; // Lime
      default: return '#6e648f';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading agent activity logs...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={28} style={{ color: 'var(--accent-purple)' }} />
            <span>Agent Workspace Activity Logs</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live monitor detailing the step-by-step executions of the multi-agent system.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchLogs} className="btn-secondary">Refresh Feed</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Hub</button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Terminal size={48} style={{ color: 'var(--text-muted)', marginBottom: '24px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Activity Recorded</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload a resume or modify your target goal track to trigger agent executions.</p>
          <button onClick={() => navigate('/upload')} className="btn-primary">Upload Resume Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log, idx) => {
            const agentColor = getAgentColor(log.agentName);
            const dateStr = new Date(log.timestamp).toLocaleTimeString();
            
            return (
              <div 
                key={log._id || idx} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '20px', 
                  padding: '20px',
                  borderLeft: `4px solid ${agentColor}`
                }}
              >
                {/* Status indicator icon */}
                <div style={{ marginTop: '3px' }}>
                  {log.status === 'running' && (
                    <div style={{ 
                      width: '18px', 
                      height: '18px', 
                      borderRadius: '50%', 
                      border: '2.5px solid rgba(251, 191, 36, 0.1)',
                      borderTopColor: '#fbbf24',
                      animation: 'spinSlow 1s infinite linear'
                    }} />
                  )}
                  {log.status === 'success' && <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />}
                  {log.status === 'failed' && <XCircle size={20} style={{ color: 'var(--accent-coral)' }} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.85rem', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        background: `${agentColor}20`,
                        color: agentColor,
                        border: `1px solid ${agentColor}40`
                      }}>
                        {log.agentName}
                      </span>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{log.action}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{log.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
