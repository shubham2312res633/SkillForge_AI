import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertCircle, RefreshCw, Star, HelpCircle, Terminal } from 'lucide-react';

export default function InterviewRoom({ token }) {
  const [targetRole, setTargetRole] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCurrentRole = async () => {
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 404) {
          setError('Please upload a resume first to define your target role.');
          setInitLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to load profile.');
        const data = await res.json();
        setTargetRole(data.targetRole);
      } catch (err) {
        setError(err.message);
      } finally {
        setInitLoading(false);
      }
    };
    fetchCurrentRole();
  }, [token, navigate]);

  // Scroll to bottom on transcript updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');
    setFinished(false);
    setEvaluation(null);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: targetRole })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to start interview.');

      setInterviewId(data._id);
      setHistory(data.history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const currentAnswer = userInput;
    setUserInput('');
    setLoading(true);

    // Optimistically update candidate response in local view
    setHistory(prev => [...prev, { role: 'user', message: currentAnswer, timestamp: Date.now() }]);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewId, message: currentAnswer })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to submit response.');

      if (data.finished) {
        setFinished(true);
        setEvaluation(data.evaluation);
        setHistory(data.interviewSession.history);
      } else {
        setHistory(data.interviewSession.history);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Entering Interview Room...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>AI Technical Interview Simulation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Test your engineering skills for: <strong style={{ color: 'var(--accent-purple-bright)' }}>{targetRole}</strong></p>
      </div>

      {error && (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--accent-coral)', marginBottom: '20px' }}>
          <AlertCircle size={20} style={{ color: 'var(--accent-coral)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
        </div>
      )}

      {/* Start screen / Welcome layout */}
      {!interviewId ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Terminal size={48} style={{ color: 'var(--accent-purple)', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '12px' }}>Prepare to begin</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            The interview consists of 3 mock questions assessing technical depth, communication, and system design structures. The AI Interview Agent evaluates answers and updates career readiness scores.
          </p>
          <button 
            disabled={!targetRole}
            onClick={handleStartInterview} 
            className="btn-primary" 
            style={{ padding: '14px 36px', fontSize: '1.1rem' }}
          >
            Start Technical Interview
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chat log window */}
          <div className="terminal-window" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>interview_agent_session_active.sh</span>
            </div>
            
            <div className="terminal-body" style={{ flex: 1, maxHeight: '420px', minHeight: '300px' }}>
              {history.map((msg, idx) => (
                <div key={idx} className="terminal-line" style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: msg.role === 'user' ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid var(--border-color)',
                  padding: '12px 18px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
                }}>
                  <strong className={msg.role === 'user' ? 'terminal-success' : 'terminal-accent'} style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
                    {msg.role === 'user' ? 'Candidate' : 'Interviewer'}
                  </strong>
                  <span style={{ whiteSpace: 'pre-line' }}>{msg.message}</span>
                </div>
              ))}
              
              {loading && !finished && (
                <div className="terminal-line" style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    border: '2px solid rgba(255,255,255,0.1)', 
                    borderTopColor: 'var(--accent-purple)', 
                    borderRadius: '50%',
                    animation: 'spinSlow 1s infinite linear' 
                  }} />
                  <span>Interviewer is analyzing response depth...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Answer submission bar */}
            {!finished && (
              <form onSubmit={handleSendAnswer} style={{ display: 'flex', borderTop: '1px solid var(--border-color)', background: '#0a0516' }}>
                <textarea
                  className="glass-input"
                  style={{ 
                    border: 'none', 
                    borderRadius: '0', 
                    background: 'transparent', 
                    resize: 'none', 
                    padding: '16px',
                    height: '60px',
                    flex: 1
                  }}
                  placeholder="Type your explanation here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAnswer(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ borderRadius: '0', padding: '0 24px', background: 'transparent', borderLeft: '1px solid var(--border-color)', boxShadow: 'none' }}
                  disabled={loading || !userInput.trim()}
                >
                  <Send size={18} style={{ color: userInput.trim() ? 'var(--accent-purple-bright)' : 'var(--text-muted)' }} />
                </button>
              </form>
            )}
          </div>

          {/* Interview Evaluation Report */}
          {finished && evaluation && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '4px solid var(--accent-emerald)', animation: 'var(--transition-smooth)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Assessment Report</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Interview sessions finalized.</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', uppercase: 'true' }}>Evaluation Score</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{evaluation.score}/100</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} style={{ color: 'var(--accent-purple-bright)' }} />
                    <span>Technical correctness</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{evaluation.feedback.technicalCorrectness}</p>
                </div>
                
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} style={{ color: 'var(--accent-purple-bright)' }} />
                    <span>Communication</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{evaluation.feedback.communication}</p>
                </div>

                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} style={{ color: 'var(--accent-purple-bright)' }} />
                    <span>Problem Solving</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{evaluation.feedback.problemSolving}</p>
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />

              <div>
                <h4 style={{ color: '#f43f5e', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>Key Weakness Identified</span>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{evaluation.feedback.keyWeakness}</p>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Study Recommendations</span>
                </h4>
                <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {evaluation.feedback.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button onClick={handleStartInterview} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={14} />
                  <span>Retake Interview</span>
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">Return to Dashboard</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
