import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../services/api';

export default function StudentFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    feedbackAPI.getForStudent()
      .then(r => { setFeedbacks(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#a0aec0' }}>Loading...</div>;

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Feedback</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Feedback from your mentor on your performance.</p>
      </div>

      <div style={{ marginBottom:16, fontSize:13, color:'#718096' }}>{feedbacks.length} feedback message{feedbacks.length !== 1 ? 's' : ''} received</div>

      {feedbacks.length === 0 && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'60px 0', textAlign:'center', color:'#a0aec0' }}>
          <div style={{ fontSize:14, fontWeight:500 }}>No feedback yet.</div>
          <div style={{ fontSize:12, marginTop:6 }}>Your mentor will share feedback here.</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {feedbacks.map(f => (
          <div key={f._id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px', borderLeft:'4px solid #2b6cb0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#ebf4ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#2b6cb0' }}>
                  {f.mentor?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>From: {f.mentor?.name || 'Mentor'}</div>
                  {f.subject && <div style={{ fontSize:11, color:'#718096' }}>Subject: {f.subject}</div>}
                </div>
              </div>
              <span style={{ fontSize:11, color:'#a0aec0' }}>{new Date(f.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
            </div>
            <div style={{ fontSize:14, color:'#2d3748', lineHeight:1.7 }}>{f.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
