// src/components/Forum.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // Fetch posts from Supabase on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setPosts(data);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const { error } = await supabase.from('posts').insert([
      {
        content: newPost,
        // Additional fields such as user_id, upvotes, downvotes can be added here
      },
    ]);
    if (!error) {
      setNewPost('');
      fetchPosts();
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#121212', color: '#fff' }}>
      <h2>Discussions</h2>
      <form onSubmit={handleCreatePost}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          rows="4"
          style={{ width: '100%', padding: '1rem', background: '#1e1e1e', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Post</button>
      </form>
      <div style={{ marginTop: '2rem' }}>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
            <p>{post.content}</p>
            {/* Voting and comment components can be added here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
