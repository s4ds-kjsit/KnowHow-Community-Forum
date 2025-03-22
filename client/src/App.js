// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Header from './components/Header';
import Login from './components/Login';
import Forum from './components/Forum';
import Resources from './components/Resources';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabaseClient';

const App = () => {
  const [user, setUser] = useState(null);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate(); // ✅ Add useNavigate

  // Function to check if the user is blacklisted or admin
  const checkUserRole = async (user) => {
    const { email } = user;

    // Example: Blacklist condition (replace with actual logic)
    if (email.includes('blacklist')) {
      setIsBlacklisted(true);
    }

    // Admin logic (replace with your actual admin email condition)
    if (email === 'admin@knowhowcommunity.com') {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    // ✅ Check session with getSession()
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        checkUserRole(session.user);
        navigate('/forum'); // ✅ Redirect to forum after login
      } else {
        navigate('/login'); // Redirect to login if no session
      }
    }
    checkSession();

    // ✅ Auth listener to listen for login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        checkUserRole(session.user);
        navigate('/forum'); // ✅ Redirect after login
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    // Cleanup listener on unmount
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  // Block access for blacklisted users
  if (isBlacklisted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>
          Sorry, you can’t access this website at the moment as you are not a part of
          KnowHow Community.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forum" element={user ? <Forum /> : <Navigate to="/login" />} />
          <Route path="/resources" element={user ? <Resources /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && isAdmin ? <AdminDashboard /> : <Navigate to="/forum" />} />
          <Route path="*" element={<Navigate to={user ? '/forum' : '/login'} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
