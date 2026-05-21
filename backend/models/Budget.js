const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category or All for global budget'],
      enum: [
        'All',
        'Food',
        'Travel',
        'Shopping',
        'Entertainment',
        'Health',
        'Education',
        'Bills',
        'Rent',
        'Investment',
        'Others',
      ],
      default: 'All',
    },
    limit: {
      type: Number,
      required: [true, 'Please set a budget limit'],
      min: [0, 'Limit cannot be negative'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Please specify the month in YYYY-MM format'],
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: props => `${props.value} is not a valid month format! Use YYYY-MM.`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one budget entry per category per month for each user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
