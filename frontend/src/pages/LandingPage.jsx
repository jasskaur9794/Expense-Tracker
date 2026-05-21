import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart,
  ArrowRight,
  Sparkles,
  DollarSign,
  Heart,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 20 } },
  };

  return (
    <div className="min-h-screen bg-mesh dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans select-none">
      {/* 1. Transparent Floating Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 dark:border-slate-800/10 py-4 px-6 sm:px-12 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
            E
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Expensify
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register">
            <Button size="small" variant="primary" className="rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 sm:pb-28 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30 mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next Generation Wealth Tracking</span>
        </motion.div>

        <motion.h1
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7.5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl"
        >
          Take absolute control of your{' '}
          <span className="bg-gradient-to-r from-primary-505 to-emerald-400 bg-clip-text text-transparent">
            financial trajectory
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mt-6 leading-relaxed"
        >
          The elegant MERN Expense Tracker built for high-performing individuals. Track incomes, outline budgets, view composite aggregations, and optimize savings in real-time.
        </motion.p>

        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 w-full sm:w-auto"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="large" variant="primary" className="w-full rounded-2xl group shadow-xl shadow-primary-505/10">
              Claim Your Wallet
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="large" variant="secondary" className="w-full rounded-2xl">
              Learn More
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/10 border-y border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3.5xl font-extrabold text-slate-950 dark:text-white mb-4">
              Engineered for absolute accuracy
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage transactions smoothly with full server-side validation and rich visual aids.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants}>
              <Card glass className="flex flex-col h-full hoverEffect">
                <div className="p-3.5 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-505 border border-primary-100/50 dark:border-primary-900/30 w-fit mb-5 shadow-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Smart Analytics
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Consolidated pie charts, multi-bars, and savings goal trackers let you easily visualize where every single cent is going.
                </p>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants}>
              <Card glass className="flex flex-col h-full hoverEffect">
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-505 border border-indigo-100/50 dark:border-indigo-900/30 w-fit mb-5 shadow-sm">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Category Limits
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Establish monthly goals and receive dynamic red dashboard alerts if spending patterns exceed category thresholds.
                </p>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants}>
              <Card glass className="flex flex-col h-full hoverEffect">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-505 border border-emerald-100/50 dark:border-emerald-900/30 w-fit mb-5 shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Production Security
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Armed with JWT tokens, express input validation, helmet security headers, and bcrypt hashing to secure your balance.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Mock Analytics Preview */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col items-center">
        <div className="text-center max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3.5xl font-extrabold text-slate-950 dark:text-white mb-4">
            Interactive Dashboard mockup
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Beautiful light/dark mode adaptation and customized responsive visual widgets.
          </p>
        </div>

        {/* CSS Mockup representation */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-4xl glass rounded-3xl border border-white/20 dark:border-slate-800/40 shadow-2xl p-6 sm:p-8 flex flex-col space-y-6"
        >
          {/* Mock metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Net Balance</span>
              <div className="text-xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">$18,452.90</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 text-emerald-500">Monthly Revenue</span>
              <div className="text-xl font-extrabold mt-1 text-emerald-500">$5,450.00</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 text-rose-500">Monthly Spent</span>
              <div className="text-xl font-extrabold mt-1 text-rose-500">$1,230.10</div>
            </div>
          </div>
          {/* Mock charts container */}
          <div className="h-44 sm:h-64 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 flex items-center justify-center p-6 text-slate-400 text-xs text-center border-dashed">
            <div className="space-y-2">
              <BarChart3 className="h-8 w-8 text-primary-505 mx-auto stroke-[1.5] animate-bounce" />
              <span className="block font-semibold">Real-Time Aggregations Graph Mockup</span>
              <span className="block text-[10px] text-slate-400">Interactive charts render live upon login</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. Pricing Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3.5xl font-extrabold text-slate-950 dark:text-white mb-4">
              Honest and simple pricing
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pick the tier that matches your wealth objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <Card className="flex flex-col justify-between border-slate-200/50 dark:border-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Standard</h3>
                <p className="text-xs text-slate-400 mt-1">Excellent for personal bookkeeping</p>
                <div className="text-3xl font-extrabold mt-4 text-slate-900 dark:text-white">
                  $0<span className="text-sm font-normal text-slate-400">/mo</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">✓ Unlimited transactions tracking</li>
                  <li className="flex items-center gap-2">✓ Standard categories</li>
                  <li className="flex items-center gap-2">✓ Standard monthly budgets</li>
                  <li className="flex items-center gap-2">✓ Dark / Light modes</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8">
                <Button variant="secondary" className="w-full rounded-xl">
                  Get Started Free
                </Button>
              </Link>
            </Card>

            {/* Pro Tier */}
            <Card className="flex flex-col justify-between border-primary-505 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-505 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-bl-xl">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  Premium
                </h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for professional budgeters</p>
                <div className="text-3xl font-extrabold mt-4 text-slate-900 dark:text-white">
                  $4.99<span className="text-sm font-normal text-slate-400">/mo</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2 font-bold text-primary-505">✓ Everything in Standard</li>
                  <li className="flex items-center gap-2">✓ Dynamic receipt attachments (Multer)</li>
                  <li className="flex items-center gap-2">✓ PDF/CSV reports exports</li>
                  <li className="flex items-center gap-2">✓ High-priority email warning alerts</li>
                  <li className="flex items-center gap-2">✓ Personalized smart AI savings tips</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8">
                <Button variant="primary" className="w-full rounded-xl">
                  Go Premium
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0 text-slate-400 text-xs">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-300">Expensify Finance</span>
          </div>
          <span className="flex items-center gap-1.5">
            Designed with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by Expensify in 2026.
          </span>
          <span className="font-semibold">&copy; All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
