import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import API from '../utils/api';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Percent,
  CalendarDays,
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
  LineChart,
  Line,
} from 'recharts';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const { formatCurrency } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  const COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch overall overview
      const overviewRes = await API.get('/analytics/overview');
      if (overviewRes.data.success) {
        setStats(overviewRes.data.data);
      }

      // 2. Fetch monthly trend
      const monthlyRes = await API.get('/analytics/monthly');
      if (monthlyRes.data.success) {
        setMonthlyData(monthlyRes.data.data);
      }

      // 3. Fetch category breakdown for selected month
      const categoryRes = await API.get(`/analytics/categories?month=${selectedMonth}`);
      if (categoryRes.data.success) {
        setCategoryData(categoryRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching report analytics:', err);
      toast.error('Failed to load analytical reports data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  // Export to CSV helper
  const handleExportCSV = async () => {
    try {
      toast.loading('Generating export files...');
      
      // Fetch recent history of both incomes and expenses to export
      const expensesRes = await API.get('/expenses?limit=1000');
      const incomesRes = await API.get('/income?limit=1000');

      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Header row
      csvContent += 'Type,Title/Source,Category,Payment Method,Date,Amount,Tags/Notes\r\n';

      if (expensesRes.data?.expenses) {
        expensesRes.data.expenses.forEach((exp) => {
          const title = (exp.title || '').replace(/"/g, '""');
          const cat = exp.category || '';
          const pm = exp.paymentMethod || '';
          const date = exp.date ? new Date(exp.date).toLocaleDateString() : '';
          const tags = exp.tags ? exp.tags.join('; ') : '';
          csvContent += `Expense,"${title}",${cat},${pm},${date},${exp.amount},"${tags}"\r\n`;
        });
      }

      if (incomesRes.data?.incomes) {
        incomesRes.data.incomes.forEach((inc) => {
          const src = (inc.source || '').replace(/"/g, '""');
          const cat = inc.category || 'Income';
          const pm = inc.paymentMethod || '';
          const date = inc.date ? new Date(inc.date).toLocaleDateString() : '';
          const desc = (inc.description || '').replace(/"/g, '""');
          csvContent += `Income,"${src}",${cat},${pm},${date},${inc.amount},"${desc}"\r\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `financial_report_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('CSV Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('Failed to compile data for CSV download.');
    }
  };

  // Browser print triggering
  const handlePrint = () => {
    window.print();
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 print-container">
      {/* 1. Header and controls (hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-505" /> Financial Reports
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Download comprehensive financial logs and inspect trend breakdowns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          />
          <Button
            variant="secondary"
            size="small"
            onClick={handleExportCSV}
            className="rounded-xl font-bold font-sans"
            icon={Download}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handlePrint}
            className="rounded-xl font-bold bg-primary-505"
            icon={Printer}
          >
            Print PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Header (Visible only during print) */}
      <div className="hidden print-only py-6 border-b border-slate-200 text-slate-800 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">EXPENSE TRACKER FINANCIAL REPORT</h1>
        <p className="text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()} | Target Month: {selectedMonth}</p>
      </div>

      {/* 2. Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inflow</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-500 mt-2">{formatCurrency(stats?.totalIncome)}</div>
          <p className="text-[9px] text-slate-400 mt-0.5">Total registered revenue</p>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outflow</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-500 mt-2">{formatCurrency(stats?.totalExpenses)}</div>
          <p className="text-[9px] text-slate-400 mt-0.5">Lifetime expenditures</p>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
            <div className="p-1.5 rounded-lg bg-slate-150 dark:bg-slate-800 text-slate-500">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{formatCurrency(stats?.totalBalance)}</div>
          <p className="text-[9px] text-slate-400 mt-0.5">Retained asset reserves</p>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-850">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Savings Ratio</span>
            <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/20 text-primary-505">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-primary-505 mt-2">{stats?.savingsRatio}%</div>
          <p className="text-[9px] text-slate-400 mt-0.5">Proportion of income saved</p>
        </Card>
      </div>

      {/* 3. Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend line: inflow vs outflow */}
        <Card className="flex flex-col justify-between border border-slate-100 dark:border-slate-850">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Monthly Cash Inflow vs Outflow</h2>
            <span className="text-[10px] text-slate-400">Past 6-month budget trajectory</span>
          </div>

          <div className="h-72 w-full mt-4 print-chart-adjust">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No monthly trends recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncomeReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpensesReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '10px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" name="Income" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomeReport)" />
                  <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpensesReport)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Bar chart: Savings values */}
        <Card className="flex flex-col justify-between border border-slate-100 dark:border-slate-850">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Monthly Net Savings</h2>
            <span className="text-[10px] text-slate-400">Total surplus saved over the past 6 months</span>
          </div>

          <div className="h-72 w-full mt-4 print-chart-adjust">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No monthly savings figures</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '10px',
                    }}
                  />
                  <Bar name="Savings Amount" dataKey="savings" fill="#22c55e" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.savings > 0 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Category Spending Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie breakdown chart */}
        <Card className="flex flex-col justify-between border border-slate-100 dark:border-slate-850">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-primary-505" /> Outflow Shares
            </h2>
            <span className="text-[10px] text-slate-400">Category split for {selectedMonth}</span>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center my-4 print-chart-adjust">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-400 flex flex-col items-center gap-1">
                <Layers className="h-5 w-5" />
                <span>No category expenses this month</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '10px',
                    }}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
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

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] text-slate-500 max-h-[85px] overflow-y-auto">
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

        {/* Detailed Category Table List */}
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-850">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Category Breakdown Details</h2>
            <span className="text-[10px] text-slate-400">Detailed list of spent values during {selectedMonth}</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-450">
                No categorical expenses recorded in selected month.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-semibold">
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Total Amount</th>
                    <th className="pb-3 text-right">Budget Share</th>
                    <th className="pb-3 pl-4">Distribution Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50">
                  {categoryData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {item.name}
                      </td>
                      <td className="py-3 text-right font-extrabold text-slate-800 dark:text-slate-205">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-500 dark:text-slate-400">
                        {item.percentage}%
                      </td>
                      <td className="py-3 pl-4 w-1/3">
                        <div className="flex items-center space-x-2">
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
