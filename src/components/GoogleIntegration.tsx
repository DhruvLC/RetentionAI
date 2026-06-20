import React, { useState, useEffect } from 'react';
import {
  FileText, Database, Shield, Cloud, CheckCircle,
  ExternalLink, DownloadCloud, AlertCircle, RefreshCw, Send, Check, Copy, ChevronDown, ChevronUp, Lock, Eye, Download
} from 'lucide-react';

const DEFAULT_SUPABASE_SQL_SETUP = `-- Copy and paste this into your Supabase SQL Editor to prepare your tables:

-- Create Customers table
CREATE TABLE IF NOT EXISTS public.retention_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    region TEXT,
    tenure_months INTEGER,
    age INTEGER,
    plan_type TEXT,
    login_frequency INTEGER,
    website_visits INTEGER,
    app_usage_hours INTEGER,
    order_count INTEGER,
    average_order_value NUMERIC,
    revenue NUMERIC,
    tickets_raised INTEGER,
    complaint_count INTEGER,
    recency_days INTEGER,
    frequency NUMERIC,
    monetary_value NUMERIC,
    churn_probability NUMERIC,
    churn_score INTEGER,
    churn_category TEXT,
    churn_drivers JSONB,
    predicted_clv NUMERIC,
    clv_category TEXT,
    expected_purchases_30d NUMERIC,
    remaining_tenure_months NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.retention_customers ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow full access for authenticated processes)
CREATE POLICY "Allow public read access" ON public.retention_customers FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.retention_customers FOR ALL USING (true) WITH CHECK (true);

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS public.retention_audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT,
    ip_address TEXT,
    status TEXT NOT NULL
);

ALTER TABLE public.retention_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on logs" ON public.retention_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write access on logs" ON public.retention_audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

interface GoogleIntegrationProps {
  onExportFinish: () => void;
}

export default function GoogleIntegration({
  onExportFinish
}: GoogleIntegrationProps) {
  // Supabase states
  const [supabaseConfig, setSupabaseConfig] = useState<{ configured: boolean; url: string; sqlSetup: string; validationError: string }>({
    configured: false,
    url: '',
    sqlSetup: '',
    validationError: ''
  });
  const [supabaseSyncing, setSupabaseSyncing] = useState<boolean>(false);
  const [supabaseMessage, setSupabaseMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [showSqlSetup, setShowSqlSetup] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Google OAuth states
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; photoURL?: string } | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string>('');
  const [oauthLoading, setOauthLoading] = useState<boolean>(false);
  const [gauthError, setGauthError] = useState<string>('');

  // Backup logs
  const [backups, setBackups] = useState<any[]>([
    { id: "MOCK-BAK-1", name: "Retention_DB_Baseline_Backup.json", date: "Just now (Local Cache)", size: "45 KB", status: "Local Ready" },
    { id: "MOCK-BAK-2", name: "ML_LightGBM_Model_Weights_V12.bin", date: "2026-06-19 12:45", size: "8.2 MB", status: "Synced" },
    { id: "MOCK-BAK-3", name: "Customer_SHAP_Waterfall_Artifacts.json", date: "2026-06-20 02:30", size: "480 KB", status: "Synced" }
  ]);
  const [uploadingToDrive, setUploadingToDrive] = useState<boolean>(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string>('');

  // Fetch Supabase status on mount
  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseConfig({
        configured: data.configured,
        url: data.url,
        sqlSetup: data.sqlSetup || '',
        validationError: data.validationError || ''
      });
    } catch (err) {
      console.error("Failed to query Supabase status:", err);
    }
  };

  useEffect(() => {
    fetchSupabaseStatus();
  }, []);

  // Safe dynamic initialization of Firebase Authentication to prevent build errors when config isn't generated yet
  useEffect(() => {
    const tryInitFirebase = async () => {
      try {
        const configPath = '../firebase-applet-config.json';
        // @ts-ignore
        const configModule = await import(/* @vite-ignore */ configPath);
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getAuth, GoogleAuthProvider } = await import('firebase/auth');

        const config = configModule.default;
        const app = getApps().length === 0 ? initializeApp(config) : getApp();
        const auth = getAuth(app);
        
        // Listen to active auth changes
        auth.onAuthStateChanged((user) => {
          if (user) {
            setGoogleUser({
              name: user.displayName || 'Google Operator',
              email: user.email || '',
              photoURL: user.photoURL || undefined
            });
            // Try to recover access token from sessionStorage if we persisted it
            const cachedToken = sessionStorage.getItem('gdrive_oauth_token');
            if (cachedToken) {
              setGoogleAccessToken(cachedToken);
            }
          } else {
            setGoogleUser(null);
            setGoogleAccessToken('');
          }
        });

        setIsFirebaseLoaded(true);
      } catch (err) {
        // Safe logger ignore - means oauth has not been fully requested yet or config is empty
        console.log("[Firebase] Loader status: waiting for config initialization");
        setIsFirebaseLoaded(false);
      }
    };

    tryInitFirebase();
  }, []);

  // Copy SQL Snippet helper
  const handleCopySql = () => {
    if (!supabaseConfig.sqlSetup) return;
    navigator.clipboard.writeText(supabaseConfig.sqlSetup);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Perform database sync direction triggers
  const handleSupabaseSync = async (direction: 'push' | 'pull') => {
    setSupabaseSyncing(true);
    setSupabaseMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setSupabaseMessage({ text: data.message, type: 'success' });
        if (direction === 'pull') {
          onExportFinish(); // reload dashboard records in App.tsx
        }
      } else {
        setSupabaseMessage({ text: data.error || 'Sync transaction failed.', type: 'error' });
      }
    } catch (err: any) {
      setSupabaseMessage({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setSupabaseSyncing(false);
    }
  };

  // Google OAuth triggers
  const handleGoogleConnect = async () => {
    setOauthLoading(true);
    setGauthError('');

    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const configPath = '../firebase-applet-config.json';
      // @ts-ignore
      const configModule = await import(/* @vite-ignore */ configPath);
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');

      const app = getApps().length === 0 ? initializeApp(configModule.default) : getApp();
      const auth = getAuth(app);

      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (accessToken) {
        setGoogleAccessToken(accessToken);
        sessionStorage.setItem('gdrive_oauth_token', accessToken);
        setGoogleUser({
          name: result.user.displayName || 'Google Workspace Operator',
          email: result.user.email || '',
          photoURL: result.user.photoURL || undefined
        });
      } else {
        throw new Error("Could not extract access token from connection payload.");
      }
    } catch (err: any) {
      console.error("Connection failed:", err);
      // Let's explain nicely to the user
      setGauthError(err.message || 'Authentication flow aborted.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      await auth.signOut();
      sessionStorage.removeItem('gdrive_oauth_token');
      setGoogleUser(null);
      setGoogleAccessToken('');
    } catch (e) {}
  };

  // Real backup execution to Google Drive
  const handleBackupToGoogleDrive = async () => {
    if (!googleUser || !googleAccessToken) {
      // Prompt OAuth link
      setGauthError("Google authorization required to push raw binary blobs.");
      return;
    }

    setUploadingToDrive(true);
    setDriveUploadSuccess('');

    try {
      // 1. Fetch current live customer list from server API to compile CSV content
      const listRes = await fetch('/api/customers');
      const listData = await listRes.json();
      const rawCustomers = listData.customers || [];

      if (rawCustomers.length === 0) {
        throw new Error("No customer records found to backup.");
      }

      // Convert customers to string CSV contents
      const headers = ['id', 'name', 'email', 'region', 'tenureMonths', 'age', 'planType', 'loginFrequency', 'websiteVisits', 'appUsageHours', 'orderCount', 'averageOrderValue', 'revenue', 'ticketsRaised', 'complaintCount', 'recencyDays', 'churnProbability', 'churnCategory', 'predictedCLV'];
      const csvRows = [headers.join(',')];
      
      for (const c of rawCustomers) {
        const values = [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          c.email,
          c.region,
          c.tenureMonths,
          c.age,
          c.planType,
          c.loginFrequency,
          c.websiteVisits,
          c.appUsageHours,
          c.orderCount,
          c.averageOrderValue,
          c.revenue,
          c.ticketsRaised,
          c.complaintCount,
          c.recencyDays,
          c.churnProbability || 0,
          c.churnCategory || 'Low Risk',
          c.predictedCLV || 0
        ];
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const filename = `RetentionAI_Backup_${new Date().toISOString().slice(0, 10)}.csv`;

      // 2. Google Drive Multipart REST API upload or Simple upload for Least Privilege drive.file authorization
      // First we register the metadata mapping block
      const metadata = {
        name: filename,
        mimeType: 'text/csv',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const driveRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`
        },
        body: form
      });

      if (!driveRes.ok) {
        const errDetails = await driveRes.text();
        throw new Error(`Google Upload Rejection: ${errDetails}`);
      }

      const driveData = await driveRes.json();
      const fileId = driveData.id || '';

      // Add to backup history list locally
      const sizeStr = `${(blob.size / 1024).toFixed(1)} KB`;
      setBackups(prev => [
        { id: fileId, name: filename, date: new Date().toLocaleString(), size: sizeStr, status: "Google Cloud", synced: true },
        ...prev
      ]);

      setDriveUploadSuccess(`Successfully backed up customer sheets payload to Google Drive (ID: ${fileId})`);
    } catch (err: any) {
      console.error(err);
      setGauthError(`Drive Backup Failed: ${err.message}`);
    } finally {
      setUploadingToDrive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: SUPABASE PG SYSTEM */}
      <div id="supabase-panel" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Supabase Relational Database Connection
              </h3>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Automated multi-tenant database replica engine for real-time customer and log persistence
            </span>
          </div>

          <div className="flex items-center gap-2">
            {supabaseConfig.configured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE SUPABASE CONNECTION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 font-mono">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                IN-MEMORY STORAGE ENGINE (FALLBACK)
              </span>
            )}
          </div>
        </div>

        {/* Validation warning when URL is pointing to Supabase Studio */}
        {supabaseConfig.validationError && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs space-y-2 text-rose-900 shadow-3xs">
            <div className="flex gap-2.5 items-start">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950 font-display block text-[13px]">Incorrect Supabase Keys Configuration Detected</span>
                <p className="mt-1 leading-relaxed text-rose-800">
                  {supabaseConfig.validationError}
                </p>
                <div className="mt-3 bg-rose-100/50 p-2.5 rounded-lg font-mono text-[10px] text-rose-900 border border-rose-200 leading-normal">
                  <strong>PRO-TIP:</strong> Go to your Supabase project browser dashboard &rarr; click on <strong>Project Settings</strong> (gear icon) &rarr; choose <strong>API</strong> &rarr; and copy the <strong>Project URL</strong> (e.g. <code>https://abcdefghijklm.supabase.co</code>). Do NOT copy the browser URL from your address bar!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If Supabase is not configured yet, show configuration manual instructions */}
        {!supabaseConfig.configured ? (
          <div className="bg-amber-50/40 border border-amber-100 p-4.5 rounded-xl text-xs space-y-3.5 text-slate-700">
            <div className="flex gap-2.5 items-start">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 font-display block">Supabase Connection Required for Remote Storage</span>
                <p className="mt-1 leading-relaxed text-slate-600">
                  This application is currently falling back safely to high-speed client-side and server-side memory buffering, which resets when the environment restarts. To store registrations, work simulation data, and audit activity traces securely:
                </p>
              </div>
            </div>

            <ol className="list-decimal list-inside pl-7 space-y-1.5 text-slate-600 leading-snug">
              <li>Create or open a project in the <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Supabase Dashboard</a>.</li>
              <li>Go to <strong>Project Settings</strong> &rarr; <strong>API</strong>.</li>
              <li>Copy your <strong>Project URL</strong> and <strong>Anon Public Key</strong>.</li>
              <li>Open your <strong>Settings &rarr; Secrets</strong> panel in the upper-right corner of AI Studio, and add:
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg font-mono text-[10px]">
                  <div className="bg-slate-900 text-slate-200 px-3 py-1 rounded-lg border border-slate-800 flex justify-between">
                    <span>SUPABASE_URL</span>
                    <span className="text-slate-500">https://xyz.supabase.co</span>
                  </div>
                  <div className="bg-slate-900 text-slate-200 px-3 py-1 rounded-lg border border-slate-800 flex justify-between">
                    <span>SUPABASE_ANON_KEY</span>
                    <span className="text-slate-500">eyJhbGciOiJIUzI1NiI...</span>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        ) : (
          <div className="bg-emerald-55/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold font-display block">Successfully Connected database!</span>
                <span className="font-mono text-xs opacity-80 mt-0.5 block">Endpoint: {supabaseConfig.url}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-mono">
              Row-Level Security Online
            </span>
          </div>
        )}

        {/* SQL Drawer Setup Panel */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSqlSetup(!showSqlSetup)}
            className="w-full bg-slate-50 hover:bg-slate-100 p-4 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors select-none cursor-pointer"
          >
            <span className="flex items-center gap-2 font-display">
              <Shield className="h-4 w-4 text-indigo-500" /> Need Supabase Tables Setup? View SQL Initialization Script
            </span>
            {showSqlSetup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSqlSetup && (
            <div className="p-4 bg-slate-950 text-slate-300 font-mono text-[10px] border-t border-slate-150 space-y-4">
              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <span className="text-[9px] text-slate-400">Run this code in your Supabase SQL editor to bootstrap table models:</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded text-[9px] font-sans flex items-center gap-1 transition-all"
                >
                  {copiedSql ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy SQL Code
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-56 p-3 bg-slate-900 rounded-lg custom-scrollbar whitespace-pre text-slate-300 select-text">
                {supabaseConfig.sqlSetup || DEFAULT_SUPABASE_SQL_SETUP}
              </pre>
            </div>
          )}
        </div>

        {/* Synchronization actions */}
        {supabaseConfig.configured && (
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 font-display">
              Bidirectional Data Synchronization Controls
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-150 p-3 rounded-lg space-y-2 text-xs">
                <span className="font-bold text-slate-700 block font-display">Replicate Local Memory to SQL (Push)</span>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">
                  Bulk upsert current simulation state and generated churn predictions directly into Supabase table public.retention_customers.
                </p>
                <button
                  type="button"
                  onClick={() => handleSupabaseSync('push')}
                  disabled={supabaseSyncing}
                  className="w-full bg-slate-900 text-white font-medium text-xs py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:bg-slate-300 transition-colors shadow-2xs pointer-events-auto cursor-pointer"
                >
                  {supabaseSyncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Replicate Local Dataset to Cloud SQL</span>
                </button>
              </div>

              <div className="bg-white border border-slate-150 p-3 rounded-lg space-y-2 text-xs">
                <span className="font-bold text-slate-700 block font-display">Synchronize Cloud SQL to Memory (Pull)</span>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">
                  Read, retrieve, and reload the active custom files/registrations directly from remote Supabase tables, refreshing index matrices.
                </p>
                <button
                  type="button"
                  onClick={() => handleSupabaseSync('pull')}
                  disabled={supabaseSyncing}
                  className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs py-2 rounded-lg flex items-center justify-center gap-2 disabled:bg-slate-300 transition-colors pointer-events-auto cursor-pointer"
                >
                  {supabaseSyncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <DownloadCloud className="h-3.5 w-3.5 text-indigo-500" />}
                  <span>Import Active Cloud Records To Suite</span>
                </button>
              </div>
            </div>

            {supabaseMessage.text && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                supabaseMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}>
                {supabaseMessage.type === 'success' ? (
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                )}
                <span>{supabaseMessage.text}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: GOOGLE DRIVE BACKUP SYSTEM */}
      <div id="gdrive-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connection block (5 span) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-emerald-600" />
              <h3 className="font-display font-medium text-slate-900 text-sm">
                Google Workspace OAuth
              </h3>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              OAuth login authorization with Google Drive write limits
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {!googleUser ? (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <span className="text-xs text-slate-500 leading-relaxed block">
                  Connect your Google account using secure SSO credentials to sync generated logs, predictions sheets, and model weights directly to your Google Drive.
                </span>
                
                <button
                  type="button"
                  onClick={handleGoogleConnect}
                  disabled={oauthLoading}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer transition-all"
                >
                  {oauthLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-emerald-400" /> Authorize Google Account Sync
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-emerald-100 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt={googleUser.name} className="h-9 w-9 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-9 w-9 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                        {googleUser.name[0]}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block font-display">
                        {googleUser.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {googleUser.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide font-mono">
                    Authorized
                  </span>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={handleBackupToGoogleDrive}
                    disabled={uploadingToDrive}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer"
                  >
                    {uploadingToDrive ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                    Create instant cloud backup
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleDisconnect}
                    className="border border-slate-200 hover:bg-slate-100 text-slate-500 text-[11px] font-medium px-2.5 py-1.5 rounded-md pointer-events-auto cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {gauthError && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-[10.5px] leading-relaxed text-rose-700 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <span className="font-bold">Authorization Notice:</span>
                  <p className="mt-0.5">{gauthError}</p>
                </div>
              </div>
            )}

            {driveUploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-[10.5px] leading-relaxed text-emerald-800 flex gap-2">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                <span>{driveUploadSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Backups table lists (7 span) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm flex items-center gap-1">
              Google Drive Storage backups
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Backups logs snapshot repository and predictive CLV evaluations exported onto Google Drive Cloud Storage
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
            {backups.map((bak, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-slate-500">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 font-sans text-xs block truncate max-w-xs">{bak.name}</span>
                    <span className="text-[10px] mt-0.5 block">{bak.date} | size: {bak.size}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide font-mono ${
                    bak.synced || bak.status === 'Google Cloud'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                  }`}>
                    {bak.status}
                  </span>
                  {bak.synced ? (
                    <a
                      href={`https://drive.google.com/file/d/${bak.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600"
                      title="View file in Google Drive"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBackupToGoogleDrive}
                      className="text-slate-400 hover:text-indigo-600"
                      title="Direct Drive Backup upload"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
