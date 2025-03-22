// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Initialize Supabase client using the service key (server-side)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required in the .env file.');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --------------------------------------------------------------------
// Helper: Simple Admin Check Function
// In production, replace with a robust admin verification (e.g., a dedicated field in your users table)
function isAdmin(email) {
  return email === 'admin@knowhowcommunity.com';
}

// --------------------------------------------------------------------
// Posts Endpoints
// --------------------------------------------------------------------

// Get all posts (discussions)
app.get('/api/posts', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  const { content, user_id } = req.body;
  if (!content || !user_id) {
    return res.status(400).json({ error: 'Missing content or user_id' });
  }
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, user_id, upvotes: 0, downvotes: 0 }]);
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

// Update a post (e.g., editing post content)
app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Missing content' });
  const { data, error } = await supabase
    .from('posts')
    .update({ content })
    .eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Post deleted successfully', data });
});

// Voting on a post (upvote or downvote)
app.post('/api/posts/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // vote should be 'up' or 'down'
  if (!vote || (vote !== 'up' && vote !== 'down')) {
    return res.status(400).json({ error: 'Invalid vote value' });
  }
  // Retrieve current votes
  const { data: post, error: getError } = await supabase
    .from('posts')
    .select('upvotes, downvotes')
    .eq('id', id)
    .single();
  if (getError) return res.status(400).json({ error: getError });
  const updatedFields = vote === 'up'
    ? { upvotes: post.upvotes + 1 }
    : { downvotes: post.downvotes + 1 };
  const { data, error } = await supabase
    .from('posts')
    .update(updatedFields)
    .eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// --------------------------------------------------------------------
// Comments Endpoints
// --------------------------------------------------------------------

// Get comments for a given post
app.get('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Create a new comment on a post
app.post('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { content, user_id } = req.body;
  if (!content || !user_id) {
    return res.status(400).json({ error: 'Missing content or user_id' });
  }
  const { data, error } = await supabase
    .from('comments')
    .insert([{ content, user_id, post_id: postId }]);
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

// Update a comment
app.put('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Missing content' });
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json({ message: 'Comment deleted successfully', data });
});

// --------------------------------------------------------------------
// Resources Endpoints
// --------------------------------------------------------------------

// Get resources. You can filter by domain using a query parameter.
app.get('/api/resources', async (req, res) => {
  const { domain } = req.query;
  let query = supabase.from('resources').select('*').order('created_at', { ascending: false });
  if (domain) {
    query = query.eq('domain', domain);
  }
  const { data, error } = await query;
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Upload a new resource (by domain leads)
app.post('/api/resources', async (req, res) => {
  const { title, url, domain, uploader_id } = req.body;
  if (!title || !url || !domain || !uploader_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { data, error } = await supabase
    .from('resources')
    .insert([{ title, url, domain, uploader_id }]);
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

// --------------------------------------------------------------------
// Admin Endpoints (Protected by Middleware)
// --------------------------------------------------------------------

// Simple admin middleware: Checks if the provided email in the request body belongs to an admin.
function adminMiddleware(req, res, next) {
  const { email } = req.body;
  if (!email || !isAdmin(email)) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// Admin: Manage User Flags
// Example: Add or remove a flag from a user using remote procedures
app.post('/api/admin/flags', adminMiddleware, async (req, res) => {
  const { target_email, flag, action } = req.body; // action should be 'add' or 'remove'
  if (!target_email || !flag || !action || (action !== 'add' && action !== 'remove')) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }
  let rpcName = action === 'add' ? 'add_user_flag' : 'remove_user_flag';
  const { data, error } = await supabase.rpc(rpcName, { user_email: target_email, flag_value: flag });
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Admin: Ban a User
app.post('/api/admin/ban', adminMiddleware, async (req, res) => {
  const { target_email } = req.body;
  if (!target_email) return res.status(400).json({ error: 'Target email is required' });
  const { data, error } = await supabase
    .from('users')
    .update({ banned: true })
    .eq('email', target_email);
  if (error) return res.status(400).json({ error });
  res.json({ message: `User ${target_email} banned successfully`, data });
});

// Admin: Moderation Controls for Posts and Comments (hide, delete, or edit)
// The request body should include type ('post' or 'comment'), id, action, and if editing, new content.
app.post('/api/admin/moderate', adminMiddleware, async (req, res) => {
  const { type, id, action, content } = req.body;
  if (!type || !id || !action) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  if (action === 'delete') {
    if (type === 'post') {
      const { data, error } = await supabase.from('posts').delete().eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Post deleted successfully', data });
    } else if (type === 'comment') {
      const { data, error } = await supabase.from('comments').delete().eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Comment deleted successfully', data });
    }
  } else if (action === 'hide') {
    // Assumes a "hidden" column exists in the table
    if (type === 'post') {
      const { data, error } = await supabase.from('posts').update({ hidden: true }).eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Post hidden successfully', data });
    } else if (type === 'comment') {
      const { data, error } = await supabase.from('comments').update({ hidden: true }).eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Comment hidden successfully', data });
    }
  } else if (action === 'edit') {
    if (!content) return res.status(400).json({ error: 'Missing content for edit action' });
    if (type === 'post') {
      const { data, error } = await supabase.from('posts').update({ content }).eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Post updated successfully', data });
    } else if (type === 'comment') {
      const { data, error } = await supabase.from('comments').update({ content }).eq('id', id);
      if (error) return res.status(400).json({ error });
      return res.json({ message: 'Comment updated successfully', data });
    }
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }
});

// --------------------------------------------------------------------
// Serve React Frontend
// --------------------------------------------------------------------

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// For any other routes, serve the React app's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// --------------------------------------------------------------------
// Start the Server
// --------------------------------------------------------------------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
