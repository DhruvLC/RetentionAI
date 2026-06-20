import React, { useState, useEffect } from 'react';
import { ModelMetrics } from '../types';
import { Database, GitFork, RefreshCw, BarChart, Terminal, CheckCircle2 } from 'lucide-react';

export default function MLPipe() {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bench' | 'terminal'>('bench');
  const [logs, setLogs] = useState<string[]>([
    "[MLFlow Tracker] Initializing experiment series index: ChurnClassifierRunX...",
    "[MLFlow Tracker] Param loaded: 'n_estimators'=350, 'learning_rate'=0.045, 'max_depth'=8",
    "[MLFlow Tracker] Split mapping: 80% train, 20% test cross validation...",
    "[MLFlow Tracker] XGBoost Classifier refitted. Average PR-AUC: 0.941",
    "[MLFlow Tracker] Model artifacts compiled successfully. Serialized payload written to Google Drive repository backup."
  ]);

  const fetchMLMetrics = async () => {
    try {
      const response = await fetch('/api/ml-metrics');
      const data = await response.json();
      if (data.status === 'success' || data.metrics) {
        setMetrics(data.metrics || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMLMetrics();
  }, []);

  const handleRetrain = async () => {
    setLoading(true);
    // Add fake training terminal lines
    setLogs(prev => [
      ...prev,
      `[Retraining Pipeline Init] Triggering automated Grid-Search Optimizer at timestamp: ${new Date().toISOString()}`,
      `[Feature Engineering Engine] Normalizing values for customer cohorts, RFM recency logs, and ticket frictions...`,
      `[Hyperparameters Search] Cross validated metric ROC-AUC: 0.958 achieved for leaf-wise Gradient Trees.`
    ]);

    try {
      const response = await fetch('/api/ml-retrain', { method: 'POST' });
      await response.json();
      await fetchMLMetrics();
      setLogs(prev => [
        ...prev,
        `[SUCCESS] Gradient Boost matrices fully compressed and optimized. Version 1.4.2 active on production container.`
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: MODELS METRICS LISTINGS (7 cols) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" /> Model Selection Performance
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              We compile and evaluate multiple classifiers on custom files. Best fit on recall is selected.
            </span>
          </div>
          <button
            onClick={handleRetrain}
            disabled={loading}
            className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 cursor-pointer disabled:bg-slate-300"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Retrain Models
          </button>
        </div>

        {/* COMPARATIVE METRICS SCATTER TABLE */}
        <div className="space-y-3.5 pt-2">
          {metrics.map((m, idx) => {
            const isBest = m.name.includes("Best Fit");
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-colors ${
                  isBest ? 'bg-indigo-50/20 border-indigo-200' : 'bg-slate-50 border-slate-150'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${isBest ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-bold text-slate-800">{m.name}</span>
                  </div>
                  {isBest && (
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </div>

                {/* Sub KPI values inside row */}
                <div className="grid grid-cols-4 gap-2 pt-3 text-[10px] font-mono text-slate-500">
                  <div>
                    <span>Accuracy</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{m.accuracy}</span>
                  </div>
                  <div>
                    <span>Recall (Sensitivity)</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{m.recall}</span>
                  </div>
                  <div>
                    <span>Roc-Auc Margin</span>
                    <span className="block font-bold text-indigo-700 mt-0.5">{m.rocAuc}</span>
                  </div>
                  <div>
                    <span>F1 Optimization</span>
                    <span className="block font-bold text-slate-800 mt-0.5">{m.f1Score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: LIVE TERMINAL EXPERIMENT TRACKING MLFLOW (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-100">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase font-mono tracking-wider">
                MLFlow Experiment Registry
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Connected
            </span>
          </div>

          <div className="space-y-2 h-64 overflow-y-auto pr-1 font-mono text-[10px] text-slate-400 scrollbar-thin leading-relaxed">
            {logs.map((log, lidx) => (
              <div key={lidx} className="border-l border-emerald-500 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Active Pipeline: ML-XGB-1.4</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Artifact Compiled
          </span>
        </div>
      </div>
    </div>
  );
}
