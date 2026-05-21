import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useBudgets } from '../../context/BudgetContext';
import { CircleEqual, Calendar, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const BudgetForm = ({ budget = null, onClose, onSuccess }) => {
  const { setBudget } = useBudgets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'All',
    limit: '',
    month: new Date().toISOString().substring(0, 7), // Default current month YYYY-MM
  });
  const [error, setError] = useState('');

  const budgetCategories = [
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
  ];

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || 'All',
        limit: budget.limit || '',
        month: budget.month || new Date().toISOString().substring(0, 7),
      });
    }
  }, [budget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(formData.limit);

    if (isNaN(limitNum) || limitNum < 0) {
      setError('Please set a valid non-negative limit');
      return;
    }

    setLoading(true);
    try {
      const res = await setBudget(formData.category, limitNum, formData.month);
      if (res && res.success) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-wider">
          Target Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={!!budget} // Prevent category modification during edit
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none focus:border-primary-505 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-950/30 transition-all duration-200 text-sm disabled:opacity-50"
        >
          {budgetCategories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All (Global Monthly Budget)' : c}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Budget Limit"
        name="limit"
        type="number"
        step="0.01"
        placeholder="e.g. 1500.00"
        value={formData.limit}
        onChange={handleChange}
        error={error}
        required
        icon={Coins}
      />

      <Input
        label="Target Month"
        name="month"
        type="month"
        value={formData.month}
        onChange={handleChange}
        required
        icon={Calendar}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
        {onClose && (
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="w-32">
          {budget ? 'Save changes' : 'Set limit'}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;
