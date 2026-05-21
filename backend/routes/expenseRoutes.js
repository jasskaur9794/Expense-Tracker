const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { expenseValidator } = require('../validators/transactionValidator');

// Apply protection to all expense routes
router.use(protect);

router.get('/', getExpenses);
router.post('/', upload.single('receipt'), expenseValidator, addExpense);
router.put('/:id', upload.single('receipt'), expenseValidator, editExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
