import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  // Fetch budgets for a month
  const fetchBudgets = async (monthVal) => {
    setLoading(true);
    const month = monthVal || selectedMonth;
    try {
      const res = await API.get(`/budget?month=${month}`);
      if (res.data.success) {
        setBudgets(res.data.budgets);
        if (monthVal) setSelectedMonth(monthVal);
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  // Set Budget
  const setBudget = async (category, limit, month) => {
    setLoading(true);
    try {
      const res = await API.post('/budget', { category, limit, month });
      if (res.data.success) {
        toast.success(`Budget for ${category} successfully set!`);
        // Refresh budgets list
        await fetchBudgets(month);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to set budget';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Delete Budget
  const deleteBudget = async (id) => {
    setLoading(true);
    try {
      const res = await API.delete(`/budget/${id}`);
      if (res.data.success) {
        toast.success('Budget limit removed.');
        setBudgets((prev) => prev.filter((b) => b._id !== id));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove budget';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Evaluate if adding a specific expense will exceed the budget limits
  const checkExpenseAgainstBudget = (category, amount, dateStr) => {
    const transactionMonth = dateStr ? dateStr.substring(0, 7) : new Date().toISOString().substring(0, 7);
    
    // Check if the budget month matches the transaction month
    if (transactionMonth !== selectedMonth) {
      return { warning: false, exceeded: false };
    }

    const numericAmount = parseFloat(amount || 0);

    // 1. Check Category Specific Budget
    const categoryBudget = budgets.find((b) => b.category === category);
    if (categoryBudget) {
      const projectedSpent = categoryBudget.spent + numericAmount;
      if (projectedSpent > categoryBudget.limit) {
        return {
          exceeded: true,
          warning: true,
          message: `Category Alert: This expense will exceed your ${category} budget of ${categoryBudget.limit}! (Projected spent: ${projectedSpent})`,
        };
      } else if (projectedSpent >= categoryBudget.limit * 0.9) {
        return {
          exceeded: false,
          warning: true,
          message: `Warning: You have used 90%+ of your ${category} budget limit (${projectedSpent} / ${categoryBudget.limit}).`,
        };
      }
    }

    // 2. Check Global "All" Budget
    const globalBudget = budgets.find((b) => b.category === 'All');
    if (globalBudget) {
      const projectedSpent = globalBudget.spent + numericAmount;
      if (projectedSpent > globalBudget.limit) {
        return {
          exceeded: true,
          warning: true,
          message: `Global Alert: This expense will exceed your total monthly budget of ${globalBudget.limit}!`,
        };
      }
    }

    return { warning: false, exceeded: false };
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        loading,
        selectedMonth,
        setSelectedMonth,
        fetchBudgets,
        setBudget,
        deleteBudget,
        checkExpenseAgainstBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};
