import { admin } from '../../src/firebase/admin-config';
import nookies from 'nookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const { token } = req.body;

  if (!token) {
    // This handles logout
    nookies.set({ res }, 'token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
    });
    return res.status(200).json({ status: 'success', message: 'Logged out' });
  }

  try {
    // This handles login
    // We set the session cookie for 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds
    const sessionCookie = await admin.auth().createSessionCookie(token, { expiresIn });
    
    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    nookies.set({ res }, 'token', sessionCookie, options);

    res.status(200).json({ status: 'success', message: 'Logged in' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    res.status(401).send({ message: 'Unauthorized' });
  }
}