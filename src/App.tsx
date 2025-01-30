import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDb } from './lib/db';
import Layout from './components/Layout';
import Login from './pages/Login';

function App() {
  const { checkUser } = useAuthStore();
  const { initDb, isLoading: isDbLoading } = useDb();

  useEffect(() => {
    initDb().then(() => {
      checkUser();
    });
  }, []);

  if (isDbLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          {/* Add more routes here as we build them */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;