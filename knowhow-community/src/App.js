// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

  // Function to simulate checking user roles (blacklist/admin)
  const checkUserRole = async (user) => {
    const { email } = user;
    
    // Dummy check: if email includes "blacklist", mark as blacklisted.
    if (email.includes('blacklist')) {
      setIsBlacklisted(true);
    }
    
    // Dummy check for admin: replace with your actual admin email verification
    if (email === 'admin@knowhowcommunity.com') {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    // Retrieve current session using the new getSession() method
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        checkUserRole(session.user);
      }
    }
    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        checkUserRole(session.user);
      } else {
        setUser(null);
      }
    });

    // Clean up the listener on component unmount
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Show error message if user is blacklisted
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
          <Route path="*" element={<Navigate to={user ? "/forum" : "/login"} />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
