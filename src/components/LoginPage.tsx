import React, { useState } from 'react';
import { Shield, Sparkles, KeyRound, ArrowRight, UserCheck, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'analyst' | 'admin' | 'exec'>('analyst');
  const [passcode, setPasscode] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const roles = {
    analyst: { name: 'Dhruv Patil', role: 'Lead Risk Analyst', email: 'dhruvpatil370@gmail.com' },
    admin: { name: 'Sarah Jenkins', role: 'Database Administrator', email: 'sarah.j@retention.ai' },
    exec: { name: 'Marcus Sterling', role: 'Chief Executive Officer', email: 'm.sterling@retention.ai' }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate high-fidelity multi-tenant OAuth & Clerk check
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      setTimeout(() => {
        onLogin(roles[selectedRole]);
      }, 800);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      {/* Dynamic ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Decorative ambient blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Top logo */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 font-display font-bold text-xl">
            R
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            RetentionAI
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-mono">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>WAF Protection Block: ACTIVE</span>
        </div>
      </header>

      {/* Form content */}
      <main className="relative z-10 my-auto flex items-center justify-center py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-2xl relative"
        >
          {/* Decorative scanner line if loading */}
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-2xl overflow-hidden">
              <div className="w-1/3 h-full bg-emerald-300 animate-infinite-scroll" style={{
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />
            </div>
          )}

          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Enterprise Control Portal
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with your multi-tenant workspace credentials
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Role / User Profile selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Select Workspace Identity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(roles) as Array<keyof typeof roles>).map((key) => {
                  const roleActive = selectedRole === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRole(key)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        roleActive
                          ? 'bg-slate-850 border-emerald-500/55 text-white shadow-md'
                          : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800 hover:bg-slate-950/50'
                      }`}
                    >
                      <span className="text-[9px] font-bold block uppercase tracking-wide opacity-50">
                        {key === 'analyst' ? 'Analyst' : key === 'admin' ? 'Admin' : 'Exec'}
                      </span>
                      <span className="text-[11px] font-medium block truncate mt-1">
                        {roles[key].name.split(' ')[0]}
                      </span>
                      {roleActive && (
                        <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Address Read-Only based on identity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                E-mail Username
              </label>
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono select-none">
                {roles[selectedRole].email}
              </div>
            </div>

            {/* Simulated Passcode input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Interactive Passcode
                </label>
                <span className="text-[9px] text-slate-500 font-mono">
                  SSO Authenticator
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-xl px-10 py-2.5 text-xs text-white tracking-widest font-mono transition-all"
                />
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Sign In Trigger Button */}
            <button
              type="submit"
              disabled={loading || completed}
              className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                completed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-950 shadow-md shadow-white/5 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verifying Clerk Multi-tenant session...</span>
                </>
              ) : completed ? (
                <>
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span>Interactive Token Authenticated!</span>
                </>
              ) : (
                <>
                  <span>Sign In to {roles[selectedRole].name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Secure footnote */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 block"></span> TLS 1.3 Certified
            </span>
            <span>Clerk SaaS Proxy: Connected</span>
          </div>
        </motion.div>
      </main>

      {/* Footer system details */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-500 gap-2 border-t border-slate-900 pt-6">
        <span>RetentionAI Workspace Container v1.4.2</span>
        <span>Securely decrypted in sandboxed container cloud run ingress.</span>
      </footer>
    </div>
  );
}
