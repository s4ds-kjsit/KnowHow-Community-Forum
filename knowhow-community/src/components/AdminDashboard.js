// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AdminDashboard = () => {
  const [flags, setFlags] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const flagList = [
    'AI-ML Lead', 'Data Science Lead', 'Cloud Native Lead', 'App and Web Dev Lead',
    'Blockchain Lead', 'Cybersecurity Lead', 'IoT Lead', 'AR-VR Lead',
    'S4DS Core Member', 'S4DS SubCore Member', 'S4DS Ex Member', 'Admin'
  ];

  useEffect(() => {
    // Fetch initial flags or other admin data here
    // This is a placeholder for admin data fetching
  }, []);

  const addFlagToUser = async () => {
    // Placeholder logic to add flag to user in Supabase
    console.log(`Adding flag to user: ${userEmail}`);
  };

  return (
    <div style={{ padding: '2rem', background: '#121212', color: '#fff' }}>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>User Flags Management</h3>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="User Email"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <select style={{ padding: '0.5rem', marginRight: '1rem' }}>
          {flagList.map((flag) => (
            <option key={flag} value={flag}>{flag}</option>
          ))}
        </select>
        <button onClick={addFlagToUser} style={{ padding: '0.5rem 1rem' }}>
          Add Flag
        </button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        {/* Additional moderation controls like hiding, deleting posts, etc. */}
        <h3>Moderation Controls</h3>
        <p>Use the admin functions to hide, delete, or edit posts and comments. Banning users and managing content filters should be implemented on the server-side.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
