import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log(req.body);

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );

  const token = generateToken(newUser.rows[0].id, newUser.rows[0].role);

  res.cookie('token', token, cookieOptions);

  return res.status(201).json({ user: newUser.rows[0]});
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  // console.log('req.body: ', req.body);

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (user.rows.length === 0) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const userData = user.rows[0];

  if (userData.role !== role) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, userData.password);

  // console.log('Password match:', isMatch);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(userData.id, userData.role);

  res.cookie('token', token, cookieOptions);

  res.json({
    user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
  });
});

// Get logged in user
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Logout
router.post('/logout', async (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
  res.json({ message: "Logged out successfully" });
});

export default router;
