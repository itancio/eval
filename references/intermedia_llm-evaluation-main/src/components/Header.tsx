import React from 'react';
import { Bot, History, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  view: 'latest' | 'history' | 'analytics';
  setView: (view: 'latest' | 'history' | 'analytics') => void;
}

export function Header({ view, setView }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              LLM Evaluation Platform
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('latest')}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  view === 'latest'
                    ? 'text-white bg-indigo-600 dark:bg-indigo-500'
                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50 dark:hover:bg-indigo-900'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setView('history')}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  view === 'history'
                    ? 'text-white bg-indigo-600 dark:bg-indigo-500'
                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50 dark:hover:bg-indigo-900'
                }`}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  view === 'analytics'
                    ? 'text-white bg-indigo-600 dark:bg-indigo-500'
                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50 dark:hover:bg-indigo-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            </div>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-900"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}