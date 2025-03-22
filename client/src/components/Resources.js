// src/components/Resources.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const domains = [
  'AI-ML',
  'Data Science and Analytics',
  'Cloud Native',
  'App and Web Development',
  'Blockchain and Web3',
  'Cybersecurity',
  'Internet of Things (IoT)',
  'Augmented Reality & Virtual Reality (AR-VR)',
];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(domains[0]);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceURL, setResourceURL] = useState('');

  useEffect(() => {
    fetchResources();
  }, [selectedDomain]);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('domain', selectedDomain)
      .order('created_at', { ascending: false });
    if (!error) {
      setResources(data);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!resourceTitle || !resourceURL) return;
    const { error } = await supabase.from('resources').insert([
      {
        title: resourceTitle,
        url: resourceURL,
        domain: selectedDomain,
      },
    ]);
    if (!error) {
      setResourceTitle('');
      setResourceURL('');
      fetchResources();
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#121212', color: '#fff' }}>
      <h2>Resources</h2>
      <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
        {domains.map((domain) => (
          <option key={domain} value={domain}>{domain}</option>
        ))}
      </select>
      <form onSubmit={handleUploadResource} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={resourceTitle}
          onChange={(e) => setResourceTitle(e.target.value)}
          placeholder="Resource Title"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <input
          type="url"
          value={resourceURL}
          onChange={(e) => setResourceURL(e.target.value)}
          placeholder="Resource URL"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Upload</button>
      </form>
      <div style={{ marginTop: '2rem' }}>
        {resources.map((resource) => (
          <div key={resource.id} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
            <h3>{resource.title}</h3>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4ea1d3' }}>
              Visit Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
