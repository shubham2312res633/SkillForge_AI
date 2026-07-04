import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milestone, BookOpen, CheckSquare, Square, FolderGit2, Link2, Award } from 'lucide-react';

export default function RoadmapView({ token }) {
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch Roadmap
      const roadmapRes = await fetch('/api/roadmap', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (roadmapRes.status === 404) {
        setRoadmap(null);
        return;
      }
      if (!roadmapRes.ok) throw new Error('Failed to load roadmap.');
      const roadmapData = await roadmapRes.json();
      setRoadmap(roadmapData);

      // Fetch User Progress
      const progressRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
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
    fetchData();
  }, [token, navigate]);

  const handleToggleTopic = async (topic) => {
    try {
      const res = await fetch('/api/roadmap/toggle-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        // Refresh local stats to show updated overall career score
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProject = async (projectTitle) => {
    try {
      const res = await fetch('/api/roadmap/toggle-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectTitle })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading learning roadmap...</div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }} className="glass-card">
        <Milestone size={48} style={{ color: 'var(--accent-purple)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '16px' }}>No Active Roadmap</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please upload a resume first to run the career alignment agents and produce a customized learning path.
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary">Get Started</button>
      </div>
    );
  }

  const completedTopics = progress?.completedTopicsCount || 0;
  const completedProjects = progress?.completedProjectsCount || 0;
  const careerScore = progress?.overallCareerScore || 30;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Banner showing Dynamic Career Score */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '4px' }}>Personal Growth Roadmap</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Complete modules and build suggested capstone projects to improve your score.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Career Readiness</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{careerScore}%</div>
          </div>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '50%', 
            background: 'var(--accent-emerald-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-emerald)'
          }}>
            <Award size={26} />
          </div>
        </div>
      </div>

      {/* Month Timeline */}
      <div className="timeline">
        {roadmap.months.map((monthPlan, idx) => {
          const isMonthCompleted = monthPlan.topics.every(t => progress?.completedTopics?.includes(t));
          
          return (
            <div key={idx} className="timeline-node">
              <div className={`timeline-bullet ${isMonthCompleted ? 'completed' : ''}`}>
                {idx + 1}
              </div>
              <div className="timeline-content glass-card" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>{monthPlan.month}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-purple-bright)' }}>Duration: {monthPlan.timeRequired}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  
                  {/* Study Topics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-purple)' }} />
                      <span>Study Topics</span>
                    </h4>
                    {monthPlan.topics.map((topic, tIdx) => {
                      const isDone = progress?.completedTopics?.includes(topic);
                      return (
                        <div 
                          key={tIdx}
                          onClick={() => handleToggleTopic(topic)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid var(--border-color)',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          {isDone ? (
                            <CheckSquare size={18} style={{ color: 'var(--accent-emerald)' }} />
                          ) : (
                            <Square size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ 
                            fontSize: '0.9rem', 
                            color: isDone ? 'var(--text-secondary)' : '#fff',
                            textDecoration: isDone ? 'line-through' : 'none' 
                          }}>
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommended Project */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FolderGit2 size={16} style={{ color: 'var(--accent-purple)' }} />
                      <span>Capstone Project</span>
                    </h4>
                    {monthPlan.projects && monthPlan.projects.map((proj, pIdx) => {
                      const isDone = progress?.completedProjects?.includes(proj.title);
                      return (
                        <div 
                          key={pIdx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid var(--border-color)',
                            padding: '14px',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{proj.title}</strong>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: 'var(--accent-emerald)',
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>{proj.difficulty}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{proj.description}</p>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong>Skills:</strong> {proj.skills.join(', ')}
                          </div>
                          
                          <button 
                            onClick={() => handleToggleProject(proj.title)}
                            className="btn-secondary"
                            style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              border: isDone ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                              background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                            }}
                          >
                            {isDone ? (
                              <>
                                <CheckSquare size={14} style={{ color: 'var(--accent-emerald)' }} />
                                <span style={{ color: 'var(--accent-emerald)' }}>Project Completed (+15 XP)</span>
                              </>
                            ) : (
                              <>
                                <Square size={14} />
                                <span>Mark Project Complete (+15 XP)</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Study Resources */}
                {monthPlan.resources && monthPlan.resources.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Curated Study Resources:</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {monthPlan.resources.map((res, rIdx) => (
                        <a 
                          key={rIdx} 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--accent-purple-bright)',
                            textDecoration: 'none',
                            background: 'rgba(139, 92, 246, 0.05)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.12)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.05)'}
                        >
                          <Link2 size={12} />
                          <span>{res.name} ({res.type})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
