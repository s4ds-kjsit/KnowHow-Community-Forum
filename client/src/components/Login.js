// src/components/Login.js
import React from 'react';
import { supabase } from '../services/supabaseClient';

const Login = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  return (
    <div className="login-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h2>Welcome to KnowHow Community</h2>
      <p>Please login with your Google account to access the platform.</p>
      <button onClick={handleLogin} className="btn-login">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
