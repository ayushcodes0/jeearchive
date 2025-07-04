

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1️⃣  ‑‑ redirect the browser to Google
exports.googleAuthRedirect = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',         // refresh_token on first consent
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
  });
  res.redirect(url);
};

// 2️⃣  ‑‑ handle Google's callback
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange `code` for tokens
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    // Verify ID token & parse payload
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();     // name, email, picture, sub
    console.log(payload);
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        fullName: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: 'google',
        googleId: payload.sub,
      });
    }

    // Issue your own JWT
    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Option A: redirect with token in query (simplest for SPA dev)
    const redirect = `${process.env.FRONTEND_URL}/auth/success?token=${appToken}`;
    return res.redirect(redirect);

    /*  Option B: set HttpOnly cookie instead
        res.cookie('token', appToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600_000,
        });
        return res.redirect(process.env.FRONTEND_URL);
    */
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};
