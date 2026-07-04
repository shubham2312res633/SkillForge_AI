import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Flame, ArrowRight } from 'lucide-react';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      
      setToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--accent-purple-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <Flame size={24} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>Sign in to resume your agentic career workspace</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="glass-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="glass-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              marginTop: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px' 
            }}
            disabled={loading}
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-purple-bright)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
