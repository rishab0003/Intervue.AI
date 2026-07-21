const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set. Set it in your .env file before starting the server.");
}
const SECRET = process.env.JWT_SECRET;

/**
 * REGISTER USER
 */
exports.registerUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const user = await User.create({
      full_name,
      email: email.toLowerCase().trim(),
      password_hash
    });

    const token = jwt.sign({ user_id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: { 
        user_id: user._id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role,
        graduation_date: user.graduation_date,
        target_domain: user.target_domain,
        weekly_practice_goal: user.weekly_practice_goal
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * LOGIN USER
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ user_id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        graduation_date: user.graduation_date,
        target_domain: user.target_domain,
        weekly_practice_goal: user.weekly_practice_goal
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

const axios = require("axios");

// ── Google OAuth ─────────────────────────────────────────────────────────────
exports.googleAuth = (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  let host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    host = 'localhost:5055';
  }
  const redirect_uri = `${protocol}://${host}/api/auth/google/callback`;
  const origin = req.query.origin || `${protocol}://${req.hostname}:5600`;

  if (!client_id) {
    return res.send(`
      <html>
        <body style="font-family:sans-serif; text-align:center; padding: 3rem; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 500px; margin: auto; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="color: #ef4444; margin-bottom: 1rem;">Google OAuth Key Missing</h2>
            <p style="color: #64748b; line-height: 1.5; margin-bottom: 1.5rem;">
              Please configure <strong>GOOGLE_CLIENT_ID</strong> and <strong>GOOGLE_CLIENT_SECRET</strong> in your backend <code>.env</code> file to enable Google login.
            </p>
            <button onclick="window.close()" style="background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=openid%20profile%20email&state=${encodeURIComponent(origin)}`;
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const { code, state } = req.query;
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  let host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    host = 'localhost:5055';
  }
  const redirect_uri = `${protocol}://${host}/api/auth/google/callback`;
  const frontendOrigin = state || `${protocol}://${req.hostname}:5600`;

  if (!code) return res.redirect(`${frontendOrigin}/?error=no_code`);

  try {
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: "authorization_code"
    });

    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { name, email } = userResponse.data;
    if (!email) return res.redirect(`${frontendOrigin}/?error=no_email`);

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const dummyPass = bcrypt.hashSync(Math.random().toString(36), 10);
      user = await User.create({
        full_name: name || "Google User",
        email: email.toLowerCase().trim(),
        password_hash: dummyPass
      });
    }

    const userData = { 
      user_id: user._id, 
      full_name: user.full_name, 
      email: user.email, 
      role: user.role,
      graduation_date: user.graduation_date,
      target_domain: user.target_domain,
      weekly_practice_goal: user.weekly_practice_goal
    };

    const token = jwt.sign({ user_id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });

    res.redirect(`${frontendOrigin}/?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (err) {
    console.error("Google Auth Callback Error:", err.response?.data || err.message);
    res.redirect(`${frontendOrigin}/?error=auth_failed`);
  }
};

// ── GitHub OAuth ─────────────────────────────────────────────────────────────
exports.githubAuth = (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  let host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    host = 'localhost:5055';
  }
  const redirect_uri = `${protocol}://${host}/api/auth/github/callback`;
  const origin = req.query.origin || `${protocol}://${req.hostname}:5600`;

  if (!client_id) {
    return res.send(`
      <html>
        <body style="font-family:sans-serif; text-align:center; padding: 3rem; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 500px; margin: auto; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="color: #ef4444; margin-bottom: 1rem;">GitHub OAuth Key Missing</h2>
            <p style="color: #64748b; line-height: 1.5; margin-bottom: 1.5rem;">
              Please configure <strong>GITHUB_CLIENT_ID</strong> and <strong>GITHUB_CLIENT_SECRET</strong> in your backend <code>.env</code> file to enable GitHub login.
            </p>
            <button onclick="window.close()" style="background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=user:email&state=${encodeURIComponent(origin)}`;
  res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  const { code, state } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  let host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    host = 'localhost:5055';
  }
  const redirect_uri = `${protocol}://${host}/api/auth/github/callback`;
  const frontendOrigin = state || `${protocol}://${req.hostname}:5600`;

  if (!code) return res.redirect(`${frontendOrigin}/?error=no_code`);

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      { code, client_id, client_secret, redirect_uri },
      { headers: { Accept: "application/json" } }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) throw new Error("No access token returned");

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${access_token}` }
    });

    const { name, login } = userResponse.data;
    let email = userResponse.data.email;

    if (!email) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${access_token}` }
      });
      const primaryEmailObj = emailResponse.data.find(e => e.primary && e.verified) || emailResponse.data[0];
      email = primaryEmailObj ? primaryEmailObj.email : null;
    }

    if (!email) {
      email = `${login || "github-user"}@github.val`;
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const dummyPass = bcrypt.hashSync(Math.random().toString(36), 10);
      user = await User.create({
        full_name: name || login || "GitHub User",
        email: email.toLowerCase().trim(),
        password_hash: dummyPass
      });
    }

    const userData = { 
      user_id: user._id, 
      full_name: user.full_name, 
      email: user.email, 
      role: user.role,
      graduation_date: user.graduation_date,
      target_domain: user.target_domain,
      weekly_practice_goal: user.weekly_practice_goal
    };

    const token = jwt.sign({ user_id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });

    res.redirect(`${frontendOrigin}/?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (err) {
    console.error("GitHub Auth Callback Error:", err.response?.data || err.message);
    res.redirect(`${frontendOrigin}/?error=auth_failed`);
  }
};

/**
 * UPDATE USER PROFILE AND PASSWORD
 */
exports.updateProfile = async (req, res) => {
  const { full_name, current_password, new_password, graduation_date, target_domain, weekly_practice_goal } = req.body;
  const user_id = req.user.user_id;

  if (!full_name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let password_hash = user.password_hash;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: "Current password is required to change password" });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const match = bcrypt.compareSync(current_password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
      password_hash = bcrypt.hashSync(new_password, 10);
    }

    user.full_name = full_name;
    user.password_hash = password_hash;
    user.graduation_date = graduation_date || null;
    user.target_domain = target_domain || null;
    user.weekly_practice_goal = weekly_practice_goal || 3;

    await user.save();

    res.json({
      message: "Profile updated successfully!",
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        graduation_date: user.graduation_date,
        target_domain: user.target_domain,
        weekly_practice_goal: user.weekly_practice_goal
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error during profile update" });
  }
};
