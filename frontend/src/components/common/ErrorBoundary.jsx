import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
          <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 mb-5 border border-rose-100 dark:border-rose-900/30">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            An unexpected error occurred in this view. Don't worry, your financial data remains perfectly safe.
          </p>
          <Button variant="primary" onClick={this.handleReset}>
            Return to Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
