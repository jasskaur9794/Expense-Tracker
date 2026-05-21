import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { IncomeProvider } from './context/IncomeContext';
import { BudgetProvider } from './context/BudgetContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ExpenseProvider>
            <IncomeProvider>
              <BudgetProvider>
                {/* Global toast notification system */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '16px',
                      fontSize: '13px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '12px 18px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
                
                {/* Router configurations */}
                <AppRoutes />
              </BudgetProvider>
            </IncomeProvider>
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
