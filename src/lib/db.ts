import initSqlJs from 'sql.js';
import { useEffect, useState } from 'react';
import { create } from 'zustand';

interface DbState {
  db: any;
  isLoading: boolean;
  error: Error | null;
  initDb: () => Promise<void>;
}

export const useDb = create<DbState>((set) => ({
  db: null,
  isLoading: true,
  error: null,
  initDb: async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      const db = new SQL.Database();
      
      // Initialize database schema
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          flags TEXT DEFAULT '[]',
          is_admin INTEGER DEFAULT 0,
          is_blacklisted INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id TEXT NOT NULL,
          category TEXT NOT NULL,
          tags TEXT DEFAULT '[]',
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id TEXT NOT NULL,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id),
          FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS resources (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          url TEXT NOT NULL,
          domain TEXT NOT NULL,
          author_id TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS votes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          target_type TEXT NOT NULL,
          vote_type TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, target_id, target_type),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      set({ db, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  }
}));