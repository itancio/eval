import React, { useState } from 'react';
import { ExperimentForm } from './components/ExperimentForm';
import { LatestExperiment } from './components/LatestExperiment';
import { ExperimentHistory } from './components/ExperimentHistory';
import { Dashboard } from './components/analytics/Dashboard';
import { AuthRequired } from './components/AuthRequired';
import { Header } from './components/Header';
import { ThemeProvider } from './lib/theme';

export default function App() {
  const [view, setView] = useState<'latest' | 'history' | 'analytics'>('latest');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AuthRequired>
          <Header view={view} setView={setView} />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {view === 'latest' && (
              <div className="space-y-12">
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    New Experiment
                  </h2>
                  <ExperimentForm />
                </section>
                <section>
                  <LatestExperiment />
                </section>
              </div>
            )}
            {view === 'history' && <ExperimentHistory />}
            {view === 'analytics' && <Dashboard />}
          </main>
        </AuthRequired>
      </div>
    </ThemeProvider>
  );
}