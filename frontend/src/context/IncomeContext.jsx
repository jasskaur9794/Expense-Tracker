import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  });

  // Fetch Incomes
  const fetchIncomes = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const res = await API.get(`/income?${params.toString()}`);
      if (res.data.success) {
        setIncomes(res.data.incomes);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching incomes:', err);
      toast.error(err.response?.data?.message || 'Failed to load incomes');
    } finally {
      setLoading(false);
    }
  };

  // Add Income
  const addIncome = async (incomeData) => {
    setLoading(true);
    try {
      const res = await API.post('/income', incomeData);
      if (res.data.success) {
        toast.success('Income recorded successfully!');
        return { success: true, income: res.data.income };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to record income';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Update Income
  const updateIncome = async (id, incomeData) => {
    setLoading(true);
    try {
      const res = await API.put(`/income/${id}`, incomeData);
      if (res.data.success) {
        toast.success('Income details updated!');
        return { success: true, income: res.data.income };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update income';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Delete Income
  const deleteIncome = async (id) => {
    setLoading(true);
    try {
      const res = await API.delete(`/income/${id}`);
      if (res.data.success) {
        toast.success('Income deleted successfully.');
        setIncomes((prev) => prev.filter((inc) => inc._id !== id));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete income';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        loading,
        pagination,
        fetchIncomes,
        addIncome,
        updateIncome,
        deleteIncome,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};
