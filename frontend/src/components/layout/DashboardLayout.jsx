import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import TransactionForm from '../forms/TransactionForm';
import BudgetForm from '../forms/BudgetForm';
import { useExpenses } from '../../context/ExpenseContext';
import { useIncome } from '../../context/IncomeContext';
import { useBudgets } from '../../context/BudgetContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'add-expense', 'add-income', 'set-budget'
  
  const { fetchExpenses } = useExpenses();
  const { fetchIncomes } = useIncome();
  const { fetchBudgets, selectedMonth } = useBudgets();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleQuickAction = (action) => {
    setActiveModal(action);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleFormSuccess = () => {
    // Refresh records dynamically based on what was added
    if (activeModal === 'add-expense') {
      fetchExpenses({ month: selectedMonth });
      fetchBudgets(selectedMonth);
    } else if (activeModal === 'add-income') {
      fetchIncomes({ month: selectedMonth });
    } else if (activeModal === 'set-budget') {
      fetchBudgets(selectedMonth);
    }
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Global Navbar */}
      <Navbar onToggleSidebar={handleToggleSidebar} />

      {/* 2. Unified Container Wrapper */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          onQuickAction={handleQuickAction}
        />

        {/* 3. Main Outlet Page Viewport */}
        <main className="flex-1 min-h-[calc(100vh-68px)] lg:pl-68 xl:pl-72 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ onQuickAction: handleQuickAction }} />
          </div>
        </main>
      </div>

      {/* 4. Global Action Modals Portals */}
      <Modal
        isOpen={activeModal === 'add-expense'}
        onClose={handleCloseModal}
        title="Record New Expense"
      >
        <TransactionForm
          type="Expense"
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'add-income'}
        onClose={handleCloseModal}
        title="Record New Income"
      >
        <TransactionForm
          type="Income"
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'set-budget'}
        onClose={handleCloseModal}
        title="Define Monthly Budget Limit"
      >
        <BudgetForm
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default DashboardLayout;
