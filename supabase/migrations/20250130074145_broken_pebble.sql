/*
  # Initial Schema Setup for KnowHow Community

  1. New Tables
    - users
      - Stores user profiles and their flags
    - posts
      - Stores forum posts
    - comments
      - Stores post comments
    - resources
      - Stores domain-specific resources
    - votes
      - Stores up/down votes for posts and comments
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  flags text[] DEFAULT '{}',
  is_admin boolean DEFAULT false,
  is_blacklisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id),
  content text NOT NULL,
  author_id uuid REFERENCES users(id),
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Resources table
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  domain text NOT NULL,
  author_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Domain leads can create resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND domain = ANY(flags)
    )
  );

-- Votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  target_id uuid NOT NULL,
  target_type text NOT NULL,
  vote_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_type = 'post' THEN
    UPDATE posts
    SET 
      upvotes = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND vote_type = 'down')
    WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    UPDATE comments
    SET 
      upvotes = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM votes WHERE target_id = NEW.target_id AND vote_type = 'down')
    WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER votes_update_counts
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();