import { useDb } from './db';
import { v4 as uuidv4 } from 'uuid';

const GOOGLE_CLIENT_ID = "565491962112-dcq4gv899il9ag0jr5p38o1qar3sh78b.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const REDIRECT_URI = import.meta.env.DEV 
  ? "http://localhost:5173/login"
  : "https://knowhowcommunity.netlify.app";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function signInWithGoogle() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function handleGoogleCallback(code: string): Promise<GoogleUser> {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token } = await tokenResponse.json();

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    return userResponse.json();
  } catch (error) {
    console.error('Error in handleGoogleCallback:', error);
    throw error;
  }
}

export async function signOut() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getUser(id: string) {
  const { db } = useDb.getState();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const result = stmt.getAsObject([id]);
  
  if (result.id) {
    return {
      ...result,
      flags: JSON.parse(result.flags),
      is_admin: Boolean(result.is_admin),
      is_blacklisted: Boolean(result.is_blacklisted),
    };
  }
  return null;
}

export function createUser(data: {
  id: string;
  email: string;
  flags?: string[];
  is_admin?: boolean;
  is_blacklisted?: boolean;
}) {
  const { db } = useDb.getState();
  const { id, email, flags = [], is_admin = false, is_blacklisted = false } = data;
  
  const stmt = db.prepare(
    `INSERT INTO users (id, email, flags, is_admin, is_blacklisted)
     VALUES (?, ?, ?, ?, ?)`
  );
  
  stmt.run([id, email, JSON.stringify(flags), Number(is_admin), Number(is_blacklisted)]);
}

export async function findOrCreateUser(googleUser: GoogleUser) {
  const { db } = useDb.getState();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const result = stmt.getAsObject([googleUser.email]);
  
  if (!result.id) {
    const userId = uuidv4();
    createUser({
      id: userId,
      email: googleUser.email,
    });
    return getUser(userId);
  }
  
  return {
    ...result,
    flags: JSON.parse(result.flags),
    is_admin: Boolean(result.is_admin),
    is_blacklisted: Boolean(result.is_blacklisted),
  };
}