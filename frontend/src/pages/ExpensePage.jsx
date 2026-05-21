import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import {
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExpensePage = () => {
  const { expenses, loading, pagination, fetchExpenses, deleteExpense } = useExpenses();
  const { formatCurrency } = useAuth();

  const [activeModal, setActiveModal] = useState(null); // 'add' or 'edit'
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sort, setSort] = useState('date:desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const expenseCategories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Rent', 'Investment', 'Others'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'];

  const loadExpenses = () => {
    fetchExpenses({
      search,
      category,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sort,
      page,
      limit: 8, // Expose 8 rows per page
    });
  };

  // Trigger load when search, filter, sorting, or pagination states change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadExpenses();
    }, 400); // 400ms debounce for typing!

    return () => clearTimeout(delayDebounce);
  }, [search, category, paymentMethod, startDate, endDate, minAmount, maxAmount, sort, page]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSort('date:desc');
    setPage(1);
    toast.success('Filters cleared successfully.');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this expense record?')) {
      const res = await deleteExpense(id);
      if (res && res.success) {
        loadExpenses();
      }
    }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setActiveModal('edit');
  };

  const handleSuccess = () => {
    setActiveModal(null);
    setEditingExpense(null);
    loadExpenses();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Outflow Management
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Outline and record your expenditure ledger entries
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setActiveModal('add')}
          className="rounded-xl font-bold bg-primary-505"
          icon={Plus}
        >
          Add Expense
        </Button>
      </div>

      {/* 2. Filters & Search Box */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:flex-1">
            <SearchBar
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search expenses by title..."
              onClear={() => setSearch('')}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="secondary"
              className="rounded-xl flex-1 md:flex-initial"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filters
            </Button>
            {(category || paymentMethod || startDate || endDate || minAmount || maxAmount || search) && (
              <Button
                variant="glass"
                className="rounded-xl"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic sliding advanced filter fields */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {/* Category selection */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
              >
                <option value="">All Categories</option>
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment method selection */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Payment Method
              </span>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
              >
                <option value="">All Methods</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort order selection */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Sort By
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
              >
                <option value="date:desc">Newest First</option>
                <option value="date:asc">Oldest First</option>
                <option value="amount:desc">Highest Amount</option>
                <option value="amount:asc">Lowest Amount</option>
              </select>
            </div>

            {/* Min amount and Max amount ranges */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Amount Range
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
                />
              </div>
            </div>

            {/* Start date selection */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Start Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
              />
            </div>

            {/* End date selection */}
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                End Date
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 outline-none"
              />
            </div>
          </div>
        )}
      </Card>

      {/* 3. Transaction Table List */}
      <Card className="p-0 overflow-hidden">
        {expenses.length === 0 && !loading ? (
          <div className="py-12">
            <EmptyState
              title="No expenses found"
              description="Adjust your search query or click below to record a new expense item."
              actionButton={
                <Button variant="primary" onClick={() => setActiveModal('add')} icon={Plus}>
                  Record Expense
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <Table
              headers={['Expense Title', 'Category', 'Date', 'Payment', 'Amount', 'Attachment', 'Actions']}
              loading={loading}
              colCount={7}
            >
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-100 max-w-[200px] truncate">
                    <div>
                      <span>{exp.title}</span>
                      {exp.tags && exp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {exp.tags.map((tag) => (
                            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-sm">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-slate-400 text-sm">
                    {new Date(exp.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    {exp.paymentMethod}
                  </td>
                  <td className="px-6 py-4.5 text-rose-500 font-extrabold text-sm">
                    -{formatCurrency(exp.amount)}
                  </td>
                  <td className="px-6 py-4.5">
                    {exp.receipt ? (
                      <button
                        onClick={() => setSelectedReceipt(exp.receipt)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors inline-flex border border-slate-100 dark:border-slate-800/80 shadow-sm"
                        title="View receipt image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary-505 transition-colors border border-slate-100 dark:border-slate-800/80 shadow-sm"
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-2 rounded-xl bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-500 transition-colors border border-rose-100/20 dark:border-rose-900/10 shadow-sm"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/15">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
                totalResults={pagination.totalResults}
                resultsPerPage={pagination.limit}
              />
            </div>
          </>
        )}
      </Card>

      {/* 4. Action Modals */}
      <Modal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        title="Record New Expense"
      >
        <TransactionForm
          type="Expense"
          onClose={() => setActiveModal(null)}
          onSuccess={handleSuccess}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'edit'}
        onClose={() => {
          setActiveModal(null);
          setEditingExpense(null);
        }}
        title="Edit Expense Record"
      >
        <TransactionForm
          type="Expense"
          transaction={editingExpense}
          onClose={() => {
            setActiveModal(null);
            setEditingExpense(null);
          }}
          onSuccess={handleSuccess}
        />
      </Modal>

      {/* View attachment receipt modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Receipt Attachment View"
      >
        <div className="w-full flex items-center justify-center p-2">
          {selectedReceipt && (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${selectedReceipt}`}
              alt="Receipt Attachment View"
              className="max-h-[60vh] max-w-full rounded-xl object-contain border dark:border-slate-800"
              onError={(e) => {
                e.target.onerror = null;
                toast.error('Could not load receipt attachment image.');
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExpensePage;
