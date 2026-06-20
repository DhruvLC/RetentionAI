import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Sliders, Activity, Database, Cloud, UploadCloud, ShieldCheck,
  Award, Sparkles, RefreshCw, X, MessageSquare, ChevronRight, User, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from './types';

// Component imports
import LoginPage from './components/LoginPage.js';
import OnboardingScreen from './components/OnboardingScreen.js';
import InteractiveDashboard from './components/InteractiveDashboard.js';
import ChurnSimulator from './components/ChurnSimulator.js';
import SurvivalPanel from './components/SurvivalPanel.js';
import MLPipe from './components/MLPipe.js';
import GoogleIntegration from './components/GoogleIntegration.js';
import DataUploader from './components/DataUploader.js';
import SecurityPanel from './components/SecurityPanel.js';
import { LogOut } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab ] = useState<'dash' | 'sim' | 'survival' | 'ml' | 'google' | 'upload' | 'security'>('dash');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeModel, setActiveModel] = useState('Standard Ensemble model loading...');
  const [selectedSimCust, setSelectedSimCust] = useState<Customer | null>(null);

  // Gemini Insight state
  const [openInsightModal, setOpenInsightModal] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [aiReportText, setAiReportText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch full portfolio listings from Express fullstack API
  const fetchCustomersDB = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.status === 'success') {
        setCustomers(data.customers);
        setActiveModel(data.activeModel);
      }
    } catch (e) {
      console.error("Database connection failure:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersDB();
  }, []);

  const handleOpenSimForCustomer = (cust: Customer) => {
    setSelectedSimCust(cust);
    setActiveTab('sim');
  };

  // Compile Gemini insights portfolio summary
  const generateAIExecutiveSummary = async () => {
    setOpenInsightModal(true);
    setInsightLoading(true);
    setAiReportText('');

    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: true
        })
      });
      const data = await response.json();
      setAiReportText(data.report || "Analytics completed cleanly. High risk trends flagged.");
    } catch (err: any) {
      setAiReportText("Gemini process aborted: " + err.message);
    } finally {
      setInsightLoading(false);
    }
  };

  const handleOnboardingSuccess = async () => {
    await fetchCustomersDB();
    setIsDataLoaded(true);
  };

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  if (!isDataLoaded) {
    return <OnboardingScreen currentUser={currentUser} onOnboardingComplete={handleOnboardingSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-850">
      {/* 1. CORPORATE LEFT SIDEBAR (ROUTER RAIL) */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between select-none">
        <div>
          {/* Logo container brand name */}
          <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-display font-medium text-lg leading-none">
                R
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                RetentionAI
              </span>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
              Ensemble
            </span>
          </div>

          <p className="px-6 pt-5 pb-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Analysis Suite
          </p>

          {/* Nav groups */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => { setActiveTab('dash'); setSelectedSimCust(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'dash'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> BI Dashboard Core
            </button>

            <button
              onClick={() => { setActiveTab('sim'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'sim'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Sliders className="h-4 w-4" /> Churn ML Simulator
            </button>

            <button
              onClick={() => { setActiveTab('survival'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'survival'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Activity className="h-4 w-4" /> Survival Probability
            </button>

            <button
              onClick={() => { setActiveTab('ml'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'ml'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Database className="h-4 w-4" /> MLOps Benchmarks
            </button>

            <button
              onClick={() => { setActiveTab('google'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'google'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Cloud className="h-4 w-4" /> Google Integrator
            </button>
          </nav>

          <p className="px-6 pt-6 pb-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Data Engineering
          </p>

          <nav className="px-3 space-y-1">
            <button
              onClick={() => { setActiveTab('upload'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'upload'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <UploadCloud className="h-4 w-4" /> Ingestion Gateway
            </button>

            <button
              onClick={() => { setActiveTab('security'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border border-transparent ${
                activeTab === 'security'
                  ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold shadow-2xs'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Cyber SecOps WAF
            </button>
          </nav>
        </div>

        {/* BOTTOM METRICS CONSOLE PROFILE */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 font-sans">
          <div className="flex items-center justify-between text-xs leading-none">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-750 flex items-center justify-center font-bold text-white border border-slate-700">
                {currentUser?.name.split(' ').map(n => n[0]).join('') || 'DP'}
              </div>
              <div>
                <p className="font-semibold text-slate-200">{currentUser?.name || 'Dhruv Patil'}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{currentUser?.role || 'Lead Analyst'}</p>
              </div>
            </div>
            <button
              onClick={() => { setCurrentUser(null); setIsDataLoaded(false); }}
              title="Sign Out of Session"
              className="p-1 px-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. CHOSEN CONTENT BODY AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER BAR PANEL */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between select-none">
          {/* Breadcrumb path */}
          <div>
            <h1 className="text-xl font-display font-medium text-slate-900 tracking-tight leading-none">
              {activeTab === 'dash' && "Business Intelligence Portal"}
              {activeTab === 'sim' && "Real-Time Churn Simulator"}
              {activeTab === 'survival' && "Kaplan-Meier Survival Estimation"}
              {activeTab === 'ml' && "MLOps Performance Benchmarks"}
              {activeTab === 'google' && "Google Sheets & Drive Integrator"}
              {activeTab === 'upload' && "Ingestion Gateway Pipeline"}
              {activeTab === 'security' && "WAF Threat Monitor Console"}
            </h1>
          </div>

          {/* AI Insighter button trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={generateAIExecutiveSummary}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 shadow-sm hover:shadow-emerald-500/20 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" /> Gemini AI Insighter
            </button>
            <div className="h-5 w-px bg-slate-200"></div>
            <button
              onClick={fetchCustomersDB}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT VIEW PORT */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                Allocating workspace memory models and training ensemble classifiers...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dash' && (
                  <InteractiveDashboard
                    customers={customers}
                    activeModelName={activeModel}
                    onSelectCustomer={handleOpenSimForCustomer}
                    onOpenSimulatorWithCustomer={handleOpenSimForCustomer}
                  />
                )}
                {activeTab === 'sim' && (
                  <ChurnSimulator
                    initialCustomer={selectedSimCust}
                    onSimulateSuccess={fetchCustomersDB}
                  />
                )}
                {activeTab === 'survival' && <SurvivalPanel />}
                {activeTab === 'ml' && <MLPipe />}
                {activeTab === 'google' && (
                  <GoogleIntegration onExportFinish={fetchCustomersDB} />
                )}
                {activeTab === 'upload' && (
                  <DataUploader onIngestSuccess={fetchCustomersDB} />
                )}
                {activeTab === 'security' && <SecurityPanel />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* 3. GEMINI AI SUMMARIZER INSIGHTS DIALOG MODAL */}
      <AnimatePresence>
        {openInsightModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  <span className="font-display font-medium text-sm text-neutral-100 uppercase tracking-wider font-semibold">
                    RetentionAI Summary Generator
                  </span>
                </div>
                <button
                  onClick={() => setOpenInsightModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* MD Render container body */}
              <div className="p-6 overflow-y-auto max-h-120 text-xs text-slate-700 leading-relaxed space-y-4 select-text">
                {insightLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="h-7 w-7 text-emerald-500 animate-spin" />
                    <p className="text-[11px] text-slate-400 font-mono">
                      Querying Gemini-3.5-flash with portfolio indices, segments risk maps, and recovery estimates...
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-slate prose-xs max-w-none">
                    {/* Parse manual formatting cleanly */}
                    {aiReportText.split('\n').map((line, ix) => {
                      if (line.startsWith('###')) {
                        return (
                          <h4 key={ix} className="font-display font-bold text-slate-900 text-[13px] uppercase tracking-wide border-b border-slate-100 pb-1 mt-5">
                            {line.replace('###', '').trim()}
                          </h4>
                        );
                      }
                      if (line.startsWith('####')) {
                        return (
                          <h5 key={ix} className="font-display font-semibold text-slate-800 text-[11px] tracking-wide mt-3.5">
                            {line.replace('####', '').trim()}
                          </h5>
                        );
                      }
                      if (line.startsWith('* **') || line.startsWith('**') || line.startsWith('- **') || line.startsWith('* ')) {
                        // Bold parsing
                        const displayLine = line.replace(/^[\s*-]+/, '').trim();
                        return (
                          <div key={ix} className="flex gap-2 items-start mt-1.5 pl-2 font-sans font-medium text-slate-700">
                            <ChevronRight className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              {displayLine.split('**').map((part, pidx) => (
                                pidx % 2 === 1 ? <strong key={pidx} className="text-slate-900 font-bold">{part}</strong> : part
                              ))}
                            </span>
                          </div>
                        );
                      }
                      return <p key={ix} className="text-slate-600 mt-2">{line}</p>;
                    })}
                  </div>
                )}
              </div>

              {/* Close footer buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpenInsightModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Dimiss Summary Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
