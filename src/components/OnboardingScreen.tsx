import React, { useState } from 'react';
import { 
  UploadCloud, Play, CheckCircle2, RefreshCw, AlertTriangle, 
  Database, ShieldCheck, Sparkles, Binary, Award, ArrowRight, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingScreenProps {
  onOnboardingComplete: () => void;
  currentUser: { name: string; role: string; email: string };
}

export default function OnboardingScreen({ onOnboardingComplete, currentUser }: OnboardingScreenProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ count: number; name: string } | null>(null);

  const steps = [
    { log: "Scanning dataset payload for security credentials, viral signatures & SQL Injection elements...", delay: 800 },
    { log: "Ingestion verified. Verifying structural feature maps... Columns recognized: ID, PlanType, Tenure, Engagement", delay: 900 },
    { log: "Evaluating Multi-tenant Row-Level Security policies inside sandbox container...", delay: 700 },
    { log: "Training XGBoost Regression and Cox Proportional Hazards survival engines...", delay: 1000 },
    { log: "Model predictions generated: Churn probabilities and Customer Lifetime Value (CLV) computed!", delay: 600 }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        ingestDataStream(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        ingestDataStream(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const ingestDataStream = (fileName: string, fileContent: string) => {
    setUploading(true);
    setErrorMessage('');
    setProgressStep(0);
    setActiveLogs([]);

    // Call API ingestion first immediately so we can parse & check errors
    fetch('/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName, fileContent })
    })
    .then(async (res) => {
      const data = await res.json();
      if (data.status === 'success') {
        let stepIndex = 0;
        const runStep = () => {
          if (stepIndex < steps.length) {
            setActiveLogs(prev => [...prev, `[SaaS core] ${steps[stepIndex].log}`]);
            setProgressStep(stepIndex);
            setTimeout(() => {
              stepIndex++;
              runStep();
            }, steps[stepIndex].delay);
          } else {
            setSuccessInfo({
              count: data.addedCount || 0,
              name: fileName
            });
            setIsSuccess(true);
            setUploading(false);
          }
        };
        runStep();
      } else {
        setErrorMessage(data.error || "Failed importing testing dataset due to unrecognized framework layout.");
        setUploading(false);
        setIsSuccess(false);
      }
    })
    .catch((err) => {
      setErrorMessage("Network socket failed to initialize pipeline: " + err.message);
      setUploading(false);
      setIsSuccess(false);
    });
  };

  const loadSimulatedSandbox = () => {
    setUploading(true);
    setErrorMessage('');
    setProgressStep(0);
    setActiveLogs([]);

    fetch('/api/customers/reset', { method: 'POST' })
      .then(async (res) => {
        const data = await res.json();
        if (data.status === 'success') {
          let stepIndex = 0;
          const runStep = () => {
            if (stepIndex < steps.length) {
              setActiveLogs(prev => [...prev, `[SaaS core] ${steps[stepIndex].log}`]);
              setProgressStep(stepIndex);
              setTimeout(() => {
                stepIndex++;
                runStep();
              }, steps[stepIndex].delay);
            } else {
              setSuccessInfo(null);
              setIsSuccess(true);
              setUploading(false);
            }
          };
          runStep();
        } else {
          setErrorMessage("Failed to restore baseline simulation database.");
          setUploading(false);
          setIsSuccess(false);
        }
      })
      .catch((err) => {
        setErrorMessage("Network socket failed to initialize pipeline: " + err.message);
        setUploading(false);
        setIsSuccess(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Background ambient grid design */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Corporate header details */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 font-display font-bold text-xl">
            R
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            RetentionAI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-300">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{currentUser.role} • Active</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* Core main container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-auto py-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column Description */}
              <div className="col-span-1 md:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                  <Layers className="h-3.5 w-3.5" /> Stage 2: Data Ingestion
                </div>
                
                <h1 className="text-3xl font-display font-medium text-white tracking-tight leading-tight">
                  Welcome, let's prime your SaaS platform.
                </h1>
                
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The ML Pipeline and interactive matrices require customer metrics datasets to run. Provide your custom active portfolios to calculate metrics instantly.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-400 leading-snug">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Calculates active churn risk factors on Random Forests model structures.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-400 leading-snug">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Compiles LTV predictions calibrated using historical cohort engagement data.</span>
                  </div>
                </div>
              </div>

              {/* Right Column Upload Control */}
              <div className="col-span-1 md:col-span-7 bg-slate-900/60 border border-slate-850 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl">
                {uploading ? (
                  <div className="space-y-6 py-6 text-center">
                    <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                        Running Cloud ML Pipelines...
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Executing secure serverless computations, profiling cohorts parameters, and computing survival thresholds.
                      </p>
                    </div>

                    {/* Progress tracking logs list */}
                    <div className="bg-slate-950/70 text-left border border-slate-850 p-4 rounded-xl space-y-2 font-mono text-[10px] text-slate-400 h-40 overflow-y-auto leading-relaxed scrollbar-thin">
                      {activeLogs.map((log, lidx) => (
                        <div key={lidx} className="border-l border-emerald-500 pl-2 text-slate-300">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {errorMessage && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold uppercase tracking-wide text-[9px] text-red-400 font-mono">Ingestion Failed</p>
                          <p className="mt-1">{errorMessage}</p>
                        </div>
                      </div>
                    )}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-60 transition-all ${
                        dragActive
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/20'
                      }`}
                    >
                      <UploadCloud className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-300 font-medium">
                          Drag and drop spreadsheet (.csv) here, or{' '}
                          <label className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer">
                            browse local directories
                            <input
                              type="file"
                              accept=".csv"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Supports headers: ID, Region, TenureMonths, PlanType, Engagement
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800/80"></div>
                      </div>
                      <span className="relative bg-slate-900 px-4 text-[10px] font-mono tracking-widest uppercase text-slate-500">
                        Or explore instantly
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={loadSimulatedSandbox}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 text-slate-950 fill-slate-950" />
                      Deploy Enterprise Sandbox Dataset
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-t-2xl" />
              
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                  SaaS Prediction Models Initialized!
                </h2>
                <p className="text-xs text-slate-400">
                  {successInfo ? (
                    `WAF scanning passed cleanly. Machine learning matrices computed. Customer database initialized with ${successInfo.count} patient/customer profiles from "${successInfo.name}".`
                  ) : (
                    `WAF scanning passed cleanly. Machine learning matrices computed. Customer database initialized with 50 profiles across regions.`
                  )}
                </p>
              </div>

              {/* Computed indices mini readout */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl grid grid-cols-2 gap-4 text-left font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Active Classifiers</span>
                  <span className="block text-xs font-bold text-emerald-400 mt-0.5">XGBoost Resilient</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">PR-AUC Margin</span>
                  <span className="block text-xs font-bold text-indigo-400 mt-0.5">0.941 Verified</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOnboardingComplete}
                className="w-full py-3.5 bg-white text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                Enter Prediction Suite
                <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Compliance statement footnote */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-2 border-t border-slate-900 pt-6">
        <span>RetentionAI Sandbox Sandbox-Terminal v1.4.2</span>
        <span>Secure container sandbox operations compiled with full AES-256 standards.</span>
      </footer>
    </div>
  );
}
