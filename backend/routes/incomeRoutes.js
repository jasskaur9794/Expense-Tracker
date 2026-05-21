const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getIncomes,
  addIncome,
  editIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { incomeValidator } = require('../validators/transactionValidator');

// Apply protection to all income routes
router.use(protect);

router.get('/', getIncomes);
router.post('/', incomeValidator, addIncome);
router.put('/:id', incomeValidator, editIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
