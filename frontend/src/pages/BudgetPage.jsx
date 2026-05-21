import React, { useState, useEffect } from 'react';
import { useBudgets } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import BudgetForm from '../components/forms/BudgetForm';
import {
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Coins,
  CheckCircle,
  TrendingDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BudgetPage = () => {
  const { budgets, loading, selectedMonth, setSelectedMonth, fetchBudgets, deleteBudget } = useBudgets();
  const { formatCurrency } = useAuth();
  
  const [activeModal, setActiveModal] = useState(null); // 'add' or 'edit'
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets(selectedMonth);
  }, [selectedMonth]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this budget limit?')) {
      const res = await deleteBudget(id);
      if (res && res.success) {
        fetchBudgets(selectedMonth);
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setActiveModal('edit');
  };

  const handleSuccess = () => {
    setActiveModal(null);
    setEditingBudget(null);
    fetchBudgets(selectedMonth);
  };

  // Compute total budgeted vs spent
  const totalLimit = budgets.reduce((acc, b) => (b.category === 'All' ? acc : acc + b.limit), 0);
  const totalSpent = budgets.reduce((acc, b) => (b.category === 'All' ? acc : acc + b.spent), 0);
  const globalBudget = budgets.find((b) => b.category === 'All');

  // We can use either the global budget limit, or sum of category limits.
  const displayLimit = globalBudget ? globalBudget.limit : totalLimit;
  const displaySpent = globalBudget ? globalBudget.spent : totalSpent;
  const overallRatio = displayLimit > 0 ? (displaySpent / displayLimit) * 100 : 0;
  const isGlobalExceeded = displaySpent > displayLimit;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Category Budgets
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Limit monthly expenditures per category to drive active savings
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setActiveModal('add')}
            className="rounded-xl font-bold bg-primary-505 shrink-0"
            icon={Plus}
          >
            Set Limit
          </Button>
        </div>
      </div>

      {/* 2. Top-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Overall Budget Limit
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Coins className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-3">
            {formatCurrency(displayLimit)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {globalBudget ? 'Configured as overall monthly limit' : 'Sum of category limits'}
          </p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isGlobalExceeded ? 'text-rose-500' : 'text-primary-505'}`}>
              Total Spent
            </span>
            <div className={`p-2 rounded-xl ${isGlobalExceeded ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-primary-50 dark:bg-primary-950/20 text-primary-505'}`}>
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-3 ${isGlobalExceeded ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
            {formatCurrency(displaySpent)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Accumulated spent this month
          </p>
        </Card>

        <Card hoverEffect className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Remaining Budget
            </span>
            <div className={`p-2 rounded-xl ${displayLimit - displaySpent < 0 ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'}`}>
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-3 ${displayLimit - displaySpent < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {formatCurrency(Math.max(0, displayLimit - displaySpent))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {displayLimit - displaySpent < 0 ? 'Limit exceeded!' : 'Available to spend safely'}
          </p>
        </Card>
      </div>

      {/* 3. Detailed Category Progress Cards */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-505"></span>
        </div>
      ) : budgets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center py-16">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-400">
            <Layers className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No Budgets Defined
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            You haven't set any spending limits for {new Date(selectedMonth + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}.
          </p>
          <Button
            variant="primary"
            onClick={() => setActiveModal('add')}
            className="rounded-xl mt-5 font-bold bg-primary-505"
            icon={Plus}
          >
            Create Budget Limit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const ratio = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            const exceeded = b.spent > b.limit;
            const isNearLimit = !exceeded && ratio >= 90;

            return (
              <Card key={b._id} hoverEffect className="relative flex flex-col justify-between overflow-hidden border border-slate-100 dark:border-slate-800/80">
                {/* Warning Banner inside Card */}
                {exceeded && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500" />
                )}
                {isNearLimit && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {b.category === 'All' ? 'Global Limit' : b.category}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                        {b.category === 'All' ? 'Global Budget' : `${b.category} Budget`}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-505 transition-colors border border-slate-100 dark:border-slate-850"
                        title="Edit limit"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 rounded-lg bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 text-rose-450 hover:text-rose-500 transition-colors border border-rose-100/10 dark:border-rose-900/10"
                        title="Remove budget limit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between items-baseline text-xs text-slate-500">
                    <span className="font-semibold">Spent this month</span>
                    <span>
                      <strong className={`text-base font-extrabold ${exceeded ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {formatCurrency(b.spent)}
                      </strong>{' '}
                      / {formatCurrency(b.limit)}
                    </span>
                  </div>

                  {/* Progress Gauge */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden mt-2 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        exceeded
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : isNearLimit
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-450 to-primary-505'
                      }`}
                      style={{ width: `${Math.min(ratio, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Target: {new Date(b.month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>

                  {exceeded ? (
                    <span className="flex items-center gap-1 font-bold text-rose-500">
                      <AlertTriangle className="h-3 w-3" /> Exceeded by {formatCurrency(b.spent - b.limit)}
                    </span>
                  ) : isNearLimit ? (
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <AlertTriangle className="h-3 w-3" /> Near 90% Threshold
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-500">
                      {Math.max(0, 100 - Math.round(ratio))}% Safe Margin
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Action Modals */}
      <Modal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        title="Set Budget Limit"
      >
        <BudgetForm
          onClose={() => setActiveModal(null)}
          onSuccess={handleSuccess}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'edit'}
        onClose={() => {
          setActiveModal(null);
          setEditingBudget(null);
        }}
        title="Adjust Spending Limit"
      >
        <BudgetForm
          budget={editingBudget}
          onClose={() => {
            setActiveModal(null);
            setEditingBudget(null);
          }}
          onSuccess={handleSuccess}
        />
      </Modal>
    </div>
  );
};

export default BudgetPage;
