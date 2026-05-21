import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useExpenses } from '../../context/ExpenseContext';
import { useIncome } from '../../context/IncomeContext';
import { useBudgets } from '../../context/BudgetContext';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Tag, Calendar, AlertCircle, FileImage, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionForm = ({ type = 'Expense', transaction = null, onSuccess, onClose }) => {
  const { addExpense, updateExpense } = useExpenses();
  const { addIncome, updateIncome } = useIncome();
  const { checkExpenseAgainstBudget } = useBudgets();
  const { formatCurrency } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    source: '', // for income
    amount: '',
    category: type === 'Expense' ? 'Others' : 'Other',
    description: '',
    notes: '', // for income
    paymentMethod: 'Cash',
    date: new Date().toISOString().substring(0, 10),
    tags: '',
  });
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const expenseCategories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Rent', 'Investment', 'Others'];
  const incomeCategories = ['Salary', 'Freelancing', 'Business', 'Investments', 'Gifts', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'];

  // Initialize form if editing an existing record
  useEffect(() => {
    if (transaction) {
      if (type === 'Expense') {
        setFormData({
          title: transaction.title || '',
          amount: transaction.amount || '',
          category: transaction.category || 'Others',
          description: transaction.description || '',
          paymentMethod: transaction.paymentMethod || 'Cash',
          date: transaction.date ? new Date(transaction.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
          tags: transaction.tags ? transaction.tags.join(', ') : '',
        });
        if (transaction.receipt) {
          const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
          setReceiptPreview(`${apiBase}${transaction.receipt}`);
        }
      } else {
        // Income
        setFormData({
          source: transaction.source || '',
          amount: transaction.amount || '',
          category: transaction.category || 'Other',
          notes: transaction.notes || '',
          date: transaction.date ? new Date(transaction.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        });
      }
    }
  }, [transaction, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB');
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const validate = () => {
    const newErrors = {};
    const amountNum = parseFloat(formData.amount);

    if (type === 'Expense') {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
    } else {
      if (!formData.source.trim()) newErrors.source = 'Income source name is required';
    }

    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter a positive amount greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // 1. Run live budget checks for Expenses
    if (type === 'Expense' && !transaction) {
      const budgetStatus = checkExpenseAgainstBudget(formData.category, formData.amount, formData.date);
      if (budgetStatus.warning) {
        toast((t) => (
          <div className="flex gap-2 flex-col">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-slate-800">Budget Limit Crossed</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{budgetStatus.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button size="small" variant="secondary" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
              <Button size="small" variant="danger" onClick={() => {
                toast.dismiss(t.id);
                submitData();
              }}>Proceed Anyway</Button>
            </div>
          </div>
        ), { duration: 6000 });
        setLoading(false);
        return;
      }
    }

    submitData();
  };

  const submitData = async () => {
    try {
      let result;

      if (type === 'Expense') {
        const expensePayload = {
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          paymentMethod: formData.paymentMethod,
          date: formData.date,
          tags: formData.tags,
          receiptFile,
        };

        if (transaction) {
          result = await updateExpense(transaction._id, expensePayload);
        } else {
          result = await addExpense(expensePayload);
        }
      } else {
        // Income
        const incomePayload = {
          source: formData.source,
          amount: parseFloat(formData.amount),
          category: formData.category,
          notes: formData.notes,
          date: formData.date,
        };

        if (transaction) {
          result = await updateIncome(transaction._id, incomePayload);
        } else {
          result = await addIncome(incomePayload);
        }
      }

      if (result && result.success) {
        if (onSuccess) onSuccess(result);
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
      {type === 'Expense' ? (
        <Input
          label="Expense Title"
          name="title"
          placeholder="e.g. Starbucks Coffee"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          icon={Wallet}
        />
      ) : (
        <Input
          label="Income Source"
          name="source"
          placeholder="e.g. Monthly Salary"
          value={formData.source}
          onChange={handleChange}
          error={errors.source}
          required
          icon={Wallet}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          required
          icon={CreditCard}
        />

        <div className="flex flex-col space-y-1.5 w-full">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none focus:border-primary-505 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-950/30 transition-all duration-200 text-sm appearance-none"
            >
              {type === 'Expense'
                ? expenseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : incomeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Tag className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Transaction Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
          icon={Calendar}
        />

        {type === 'Expense' && (
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-wider">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none focus:border-primary-505 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-950/30 transition-all duration-200 text-sm"
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {type === 'Expense' ? (
        <>
          <Input
            label="Tags (Comma separated)"
            name="tags"
            placeholder="e.g. food, drinks, coffee"
            value={formData.tags}
            onChange={handleChange}
          />
          <Input
            label="Description / Notes"
            name="description"
            placeholder="Provide small context details..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
          {/* Multer receipt file upload */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-wider">
              Receipt Attachment
            </label>
            {receiptPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video max-w-xs group shadow-sm">
                <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-505 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer rounded-2xl p-6 text-center transition-all group">
                <FileImage className="h-8 w-8 text-slate-400 group-hover:text-primary-505 transition-colors mb-2 stroke-[1.5]" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Receipt Image</span>
                <span className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </>
      ) : (
        <Input
          label="Income Notes / Context"
          name="notes"
          placeholder="Brief description about this income..."
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
        {onClose && (
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="w-32">
          {transaction ? 'Save Changes' : 'Record'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
