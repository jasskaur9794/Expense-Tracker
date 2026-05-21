const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOverview,
  getMonthlyAnalytics,
  getCategoryAnalytics,
} = require('../controllers/analyticsController');

// Apply protection to all analytics routes
router.use(protect);

router.get('/overview', getOverview);
router.get('/monthly', getMonthlyAnalytics);
router.get('/categories', getCategoryAnalytics);

module.exports = router;
