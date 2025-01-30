import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle, handleCallback } = useAuthStore();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  React.useEffect(() => {
    if (code) {
      handleCallback(code);
    }
  }, [code]);

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="h-16 w-16 text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-white">KnowHow Community</h1>
          <p className="text-gray-400 text-center mt-2">
            Join our community of knowledge seekers and share your expertise
          </p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}