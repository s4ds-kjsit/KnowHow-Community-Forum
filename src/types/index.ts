export interface User {
  id: string;
  email: string;
  flags: string[];
  created_at: string;
  is_admin: boolean;
  is_blacklisted: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  domain: string;
  author_id: string;
  created_at: string;
}