// discord.js — Vercel serverless function
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '1529104213575991346',           // ← Your client ID
        client_secret: 'YOUR_CLIENT_SECRET_HERE',    // ← ADD YOUR SECRET
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://meteor-hub.vercel.app/',
        scope: 'identify'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || 'Token exchange failed' });
    }

    // Fetch user data with the access token
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();

    // Return user info to the frontend
    return res.status(200).json({
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name,
      avatar: userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : null,
      discriminator: userData.discriminator
    });

  } catch (err) {
    console.error('OAuth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
