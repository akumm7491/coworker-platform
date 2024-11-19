import { Router } from 'express';
import { createToken, authenticateLogin, protect } from '../middleware/auth.js';
import { register, getCurrentUser } from '../controllers/auth.js';

const router = Router();

router.post('/login', authenticateLogin, (req, res, next) => {
  try {
    const { accessToken, refreshToken } = createToken(req.user.id);
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', register);
router.get('/me', protect, getCurrentUser);

// Add logout endpoint
router.post('/logout', (req, res) => {
  // In a more complete implementation, you might want to:
  // 1. Invalidate the refresh token in the database
  // 2. Add the access token to a blacklist
  // For now, we'll just send a success response
  res.json({ success: true });
});

export default router;
