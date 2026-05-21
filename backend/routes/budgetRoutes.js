const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { budgetValidator } = require('../validators/budgetValidator');

// Apply protection to all budget routes
router.use(protect);

router.get('/', getBudgets);
router.post('/', budgetValidator, setBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
