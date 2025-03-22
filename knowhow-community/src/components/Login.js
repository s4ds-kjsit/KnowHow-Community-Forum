// src/components/Login.js
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../services/supabaseClient';

const Login = () => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Exchange the Google token for Supabase session
      const { id_token } = tokenResponse;
      const { error } = await supabase.auth.signIn({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) console.error('Login error:', error.message);
    },
    onError: errorResponse => console.error('Login Failed:', errorResponse),
  });

  return (
    <div style={{ padding: '2rem', textAlign: 'center', background: '#121212', height: '100vh', color: '#fff' }}>
      <h2>Welcome to KnowHow Community</h2>
      <button onClick={() => googleLogin()} style={{ padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
