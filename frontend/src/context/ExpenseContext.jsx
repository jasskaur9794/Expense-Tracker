import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  });

  // Fetch Expenses with filters
  const fetchExpenses = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const res = await API.get(`/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Add Expense
  const addExpense = async (expenseData) => {
    setLoading(true);
    try {
      let res;
      // If there's a receipt file, use FormData, else send JSON
      if (expenseData.receiptFile) {
        const formData = new FormData();
        Object.keys(expenseData).forEach((key) => {
          if (key === 'receiptFile') {
            formData.append('receipt', expenseData.receiptFile);
          } else if (expenseData[key] !== undefined) {
            formData.append(key, expenseData[key]);
          }
        });

        res = await API.post('/expenses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await API.post('/expenses', expenseData);
      }

      if (res.data.success) {
        toast.success('Expense recorded successfully!');
        return { success: true, expense: res.data.expense };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to record expense';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Update Expense
  const updateExpense = async (id, expenseData) => {
    setLoading(true);
    try {
      let res;
      if (expenseData.receiptFile) {
        const formData = new FormData();
        Object.keys(expenseData).forEach((key) => {
          if (key === 'receiptFile') {
            formData.append('receipt', expenseData.receiptFile);
          } else if (expenseData[key] !== undefined) {
            formData.append(key, expenseData[key]);
          }
        });

        res = await API.put(`/expenses/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await API.put(`/expenses/${id}`, expenseData);
      }

      if (res.data.success) {
        toast.success('Expense updated successfully!');
        return { success: true, expense: res.data.expense };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update expense';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    setLoading(true);
    try {
      const res = await API.delete(`/expenses/${id}`);
      if (res.data.success) {
        toast.success('Expense deleted successfully.');
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete expense';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        pagination,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
