// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg'; // Replace with your actual logo

const Header = () => {
  return (
    <header style={{ padding: '1rem', display: 'flex', alignItems: 'center', background: '#1e1e1e', color: '#fff' }}>
      <img src={logo} alt="KnowHow Logo" style={{ height: '40px', marginRight: '0.5rem' }} />
      <h1 style={{ margin: 0 }}>Community</h1>
      <nav style={{ marginLeft: 'auto' }}>
        <Link to="/forum" style={{ margin: '0 1rem', color: '#fff' }}>Forum</Link>
        <Link to="/resources" style={{ margin: '0 1rem', color: '#fff' }}>Resources</Link>
        <Link to="/admin" style={{ margin: '0 1rem', color: '#fff' }}>Admin</Link>
      </nav>
    </header>
  );
};

export default Header;
