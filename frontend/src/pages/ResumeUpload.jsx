import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

export default function ResumeUpload({ token }) {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Backend Engineer');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file && !pastedText.trim()) {
      setError('Please upload a PDF file or paste your resume text details.');
      return;
    }

    setLoading(true);
    setUploadProgress('Starting Orchestrator agent pipeline...');
    
    const formData = new FormData();
    formData.append('targetRole', targetRole);
    if (file) {
      formData.append('resume', file);
    } else {
      formData.append('text', pastedText);
    }

    // Dynamic timer to simulate real-time agent workflow statuses
    const progressMessages = [
      'Orchestrator invoking Security Agent...',
      'Security Agent auditing text for private information...',
      'Resume Analyzer Agent parsing profile structures...',
      'Skill Gap Analyzer comparing profile with target requirements...',
      'Roadmap Agent establishing month milestones...',
      'Project Recommender selecting portfolio suggestions...',
      'Job Matching Agent calculating vacancy compatibilities...',
      'Saving configurations into Long-term Memory database...'
    ];

    let messageIdx = 0;
    const interval = setInterval(() => {
      if (messageIdx < progressMessages.length) {
        setUploadProgress(progressMessages[messageIdx]);
        messageIdx++;
      }
    }, 2500);

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      clearInterval(interval);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Workflow execution failed.');

      setUploadProgress('Workflow completed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/activity'); // Take user to see the logs of agent processes
      }, 1000);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Launch Autonomous Analysis</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload your resume and select your target path. Specialized agents will execute a collaborative task sequence.</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.2)', 
            color: '#f43f5e', 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '0.85rem' 
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Spinning indicator */}
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid rgba(139, 92, 246, 0.1)', 
              borderTopColor: 'var(--accent-purple)', 
              borderRadius: '50%',
              animation: 'spinSlow 1.5s infinite linear' 
            }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>Processing Workspace</h3>
            <p style={{ color: 'var(--accent-purple-bright)', fontWeight: 500, transition: 'all 0.3s' }}>
              {uploadProgress}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Select Role Track */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Target Career Goal</label>
              <select 
                className="glass-input" 
                style={{ appearance: 'none', background: 'rgba(22, 15, 41, 0.9)' }}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload PDF Resume</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: file ? '2px dashed var(--accent-emerald)' : '2px dashed var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <input 
                  type="file" 
                  id="resume-file" 
                  style={{ display: 'none' }} 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Upload size={36} style={{ color: file ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  {file ? (
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{file.name}</div>
                      <div style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', marginTop: '4px' }}>Ready for parser agent</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>Drag & drop your resume PDF here</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>or click to browse local files</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Paste alternative */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Or Paste Resume Details (Text)</label>
              <textarea 
                className="glass-input" 
                rows={5} 
                placeholder="Paste work history, achievements, and technical stack details here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
              <span>Initialize Multi-Agent Workspace</span>
              <ChevronRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
