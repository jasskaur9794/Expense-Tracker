import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from '../context/BudgetContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import API from '../utils/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CircleEqual,
  FileText,
  Eye,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const DashboardPage = () => {
  const { formatCurrency, user } = useAuth();
  const { budgets, fetchBudgets } = useBudgets();
  const { onQuickAction } = useOutletContext(); // Receives global layout triggers

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  // Selected receipt viewing
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Financial Tips collection (Dynamic insights based on expenses)
  const [financialTip, setFinancialTip] = useState('');

  const tips = [
    "Tip: Try setting a budget for 'Food' or 'Entertainment' to keep minor daily spending checks aligned.",
    "Insight: Keeping a savings ratio above 20% is an excellent general target for long term compounding.",
    "Idea: Review your recurring 'Bills' or subscriptions. Pruning one unused service instantly increases your balance.",
    "Rule of Thumb: Try separating your needs, wants, and savings using the 50/30/20 rule.",
    "Insight: Investments are a great way to let your money work for you, but keep an emergency fund of 3-6 months cash.",
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch overview statistics
      const statsRes = await API.get('/analytics/overview');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch monthly trend charts (income vs expenses)
      const monthlyRes = await API.get('/analytics/monthly');
      if (monthlyRes.data.success) {
        setChartData(monthlyRes.data.data);
      }

      // 3. Fetch category breakdown pie charts
      const categoryRes = await API.get('/analytics/categories');
      if (categoryRes.data.success) {
        setCategoryData(categoryRes.data.data);
      }

      // Load budgets for budget warning check
      await fetchBudgets();
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
      toast.error('Failed to update dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Randomize a financial tip on mount
    setFinancialTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  // Categories Color Palette for Pie Chart
  const COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

  const recentTransactions = stats?.recentTransactions || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Here is your financial trajectory for this month
          </p>
        </div>

        {/* Quick action buttons row */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onQuickAction('add-income')}
            className="rounded-xl font-bold"
            icon={Plus}
          >
            Add Income
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => onQuickAction('add-expense')}
            className="rounded-xl font-bold bg-primary-505"
            icon={Plus}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* 2. Personalized Smart Financial Tips Banner */}
      <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-950/15 border border-primary-100/50 dark:border-primary-900/30 text-primary-800 dark:text-primary-300 text-xs flex items-start gap-2.5 shadow-sm">
        <Lightbulb className="h-4.5 w-4.5 text-primary-505 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold">{financialTip}</p>
      </div>

      {/* 3. Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Balance */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-3">
            {formatCurrency(stats?.totalBalance)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Total revenue minus spent</p>
        </Card>

        {/* Card 2: Income */}
        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
              Total Inflow
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-500 mt-3">
            {formatCurrency(stats?.totalIncome)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lifetime recorded revenue streams</p>
        </Card>

        {/* Card 3: Expenses */}
        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
              Total Outflow
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-500 mt-3">
            {formatCurrency(stats?.totalExpenses)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Lifetime recorded expenditures</p>
        </Card>

        {/* Card 4: Savings */}
        <Card hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary-505 uppercase tracking-wider">
              Total Saved (Ratio)
            </span>
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-505">
              <PiggyBank className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary-505 mt-3">
            {formatCurrency(stats?.savings)}
            <span className="text-xs font-bold text-slate-400 ml-1">
              ({stats?.savingsRatio}%)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ratio of income retained</p>
        </Card>
      </div>

      {/* 4. Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Graph */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Inflow vs Outflow
              </h2>
              <span className="text-[10px] text-slate-400">Monthly trend vectors</span>
            </div>
          </div>

          <div className="h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded to render trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                  <Area
                    type="monotone"
                    name="Income"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    name="Expenses"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Categories Breakdown Pie Chart */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Outflow Distribution
            </h2>
            <span className="text-[10px] text-slate-400">Total expense by categories</span>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center my-4">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-400">No expenses recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-slate-500 max-h-[85px] overflow-y-auto">
            {categoryData.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {item.name}
                </span>
                <span className="text-slate-400">({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Recent unified transactions & budget progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Recent Ledger Listings
              </h2>
              <span className="text-[10px] text-slate-400">Latest consolidated revenues and costs</span>
            </div>
            <Link to="/expenses" className="text-xs text-primary-505 hover:text-primary-600 font-bold">
              View All
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12">
              <EmptyState title="No transactions yet" description="Start by adding an income or expense." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 pb-2 font-semibold">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Attachment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {tx.title}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td
                        className={`py-3.5 text-right font-extrabold ${
                          tx.type === 'Expense' ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                      >
                        {tx.type === 'Expense' ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 text-center">
                        {tx.receipt ? (
                          <button
                            onClick={() => setSelectedReceipt(tx.receipt)}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 inline-flex"
                            title="View Receipt Image"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Budgets warning and progress panel */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Budget Tracking limits
              </h2>
              <span className="text-[10px] text-slate-400">Monthly category progress</span>
            </div>
            <Link to="/budgets" className="text-xs text-primary-505 hover:text-primary-600 font-bold">
              Adjust limits
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center select-none text-xs text-slate-400 space-y-2">
              <CircleEqual className="h-6 w-6 stroke-[1.5]" />
              <span>No budgets set for this month</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {budgets.map((b) => {
                const ratio = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                const exceeded = b.spent > b.limit;
                return (
                  <div key={b._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        {exceeded && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                        {b.category}
                      </span>
                      <span>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                      </span>
                    </div>
                    {/* Progress Bar container */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          exceeded
                            ? 'bg-rose-500'
                            : ratio >= 90
                            ? 'bg-amber-500'
                            : 'bg-primary-505'
                        }`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Dynamic Overlay Modal to render receipts */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Expense Receipt Attachment"
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

export default DashboardPage;
