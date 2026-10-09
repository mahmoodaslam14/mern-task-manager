import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (await User.exists({ email: String(email).toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    // The very first account becomes admin so the demo has someone to manage things.
    const role = (await User.estimatedDocumentCount()) === 0 ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.checkPassword(password || ''))) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
