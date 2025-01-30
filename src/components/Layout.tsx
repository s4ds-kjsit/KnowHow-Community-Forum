import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen } from 'lucide-react';

export default function Layout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.is_blacklisted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Sorry, you can't access this website at the moment as you are not a part of KnowHow Community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">KnowHow Community</span>
            </div>
            <nav className="flex items-center space-x-6">
              {user.is_admin && (
                <a href="/admin" className="text-gray-300 hover:text-white">
                  Admin
                </a>
              )}
              <button
                onClick={() => useAuthStore.getState().signOut()}
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}