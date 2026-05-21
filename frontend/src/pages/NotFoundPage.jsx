import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Home, Compass, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full flex flex-col items-center text-center p-8 border border-slate-100 dark:border-slate-850 shadow-2xl relative overflow-hidden">
        {/* Abstract blur background sphere */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mb-6 border border-rose-100/50 dark:border-rose-900/30">
          <AlertCircle className="h-8 w-8 stroke-[1.5]" />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          404
        </h1>
        
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-205 mt-2">
          Page Not Found
        </h2>
        
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="w-full font-bold bg-primary-505 shrink-0 rounded-xl"
              icon={Home}
            >
              Go to Home
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full font-bold rounded-xl"
              icon={Compass}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
