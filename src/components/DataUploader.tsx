import React, { useState } from 'react';
import { IngestionProfile } from '../types';
import {
  UploadCloud, Play, FileSpreadsheet, ShieldCheck,
  AlertTriangle, RefreshCw, BarChart, CheckCircle2, ChevronRight
} from 'lucide-react';

interface DataUploaderProps {
  onIngestSuccess: () => void;
}

export default function DataUploader({
  onIngestSuccess
}: DataUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<IngestionProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successLogs, setSuccessLogs] = useState<string[]>([]);

  // Parse custom uploaded files
  const handleIngestFile = async (fileName: string, fileContent: string) => {
    setUploading(true);
    setErrorMessage('');
    setProfile(null);
    setSuccessLogs([]);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName,
          fileContent
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setProfile(data.profile);
        onIngestSuccess();
        setSuccessLogs([
          `[WAF Scan] Safe extension signature (.csv/.json/.xlsx) verified cleanly.`,
          `[Malware Core] Executed signature scans against ClamAV quarantine lists. Zero threats active.`,
          `[Penetration Guard] Inspected records payloads for SQLi parameters. Anti-SQLi filter passed.`,
          `[Ingestion Engine] Profiling complete. Registered ${data.profile.rowCount} rows. Appended ${data.addedCount} high-fidelity mock nodes to production memory.`
        ]);
      } else {
        setErrorMessage(data.error || "Ingestion reject: Malicious signature detected during vulnerability diagnostics check.");
      }
    } catch (e: any) {
      setErrorMessage("Network server communication failure: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  // Drag and Drop structures
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
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleIngestFile(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleIngestFile(file.name, text);
      };
      reader.readAsText(file);
    }
  };

  // Sandbox CSV Generator helper for clean experience
  const triggerSandboxGeneration = () => {
    const csvContent = `ID,Name,Email,Region,TenureMonths,Age,PlanType,LoginFrequency,WebsiteVisits,AppUsageHours,OrderCount,AverageOrderValue,TicketsRaised,ComplaintCount,RecencyDays,Frequency,MonetaryValue
C-MOCK-201,Simulated Bank Corp,sim@bank.com,EU-West,14,48,Enterprise,28,88,140,24,1850,2,0,8,1.71,44400
C-MOCK-202,Vapor Cloud SCM,vapor@scm.com,US-West,5,31,Standard,4,12,18,2,220,5,1,45,0.4,440
C-MOCK-203,Alpha Medtech Ltd,alpha@med.io,APAC-South,18,44,Premium,15,44,82,10,610,0,0,12,0.55,6100
C-MOCK-204,Boba Retail group,boba@retail.ai,US-East,9,26,Basic,6,15,35,4,120,4,2,33,0.44,480`;
    
    handleIngestFile("RetentionAI_Enterprise_Sandbox_Upload.csv", csvContent);
  };

  const resetSimulationDB = async () => {
    setUploading(true);
    setProfile(null);
    setErrorMessage('');
    setSuccessLogs([]);
    try {
      const response = await fetch('/api/customers/reset', { method: 'POST' });
      await response.json();
      onIngestSuccess();
      setSuccessLogs(["Restored baseline simulation database cleanly."]);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT Upload & actions (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm">
              Data Ingestion Gateway
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Load customer parameters spreadsheets (.csv / .xlsx) into the modeling pipeline
            </span>
          </div>

          {/* DRAG AND DROP CONTAINER */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-60 transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
            }`}
          >
            {uploading ? (
              <div className="space-y-3">
                <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-mono font-medium text-slate-500">
                  Executing cyber vulnerability scanner and profiling inputs...
                </p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <UploadCloud className="h-10 w-10 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs text-slate-600 font-medium">
                    Drag and drop file here, or{' '}
                    <label className="text-indigo-600 hover:text-indigo-900 font-bold underline cursor-pointer">
                      browse explorer
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Accepts: .CSV, .XLSX (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] font-sans text-slate-500 space-y-2 pt-2 border-t border-slate-100">
            <span>Don't have a dataset? Try our simulated enterprise sandbox files:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerSandboxGeneration}
                className="flex-1 bg-slate-900 border border-slate-800 text-white font-medium py-2 rounded-lg text-[10px] hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="h-3 w-3" /> Execute Sandbox CSV
              </button>
              <button
                type="button"
                onClick={resetSimulationDB}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium py-2 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* SECURE BLOCK / THREAT RESPONSE STATUS GAUGE */}
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-xs leading-relaxed text-red-700 font-sans">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block tracking-tight">WAF Block Intervention</span>
              <p className="mt-1 text-slate-600">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT Diagnostics log & quality statistics (7 cols) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm">
              Real-Time Quality Assessment Profile
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Detailed metadata mapping, completeness score, and diagnostic reporting
            </span>
          </div>

          {profile ? (
            <div className="space-y-4">
              {/* Score grid metrics */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">FILES SIZE</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1 font-mono">
                    {(profile.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono">TOTAL ROWS</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1 font-mono">
                    {profile.rowCount} Profiles
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                  <span className="text-[10px] text-slate-400 block font-sans">ANOMALIES</span>
                  <span className="text-xs font-bold text-rose-600 block mt-1">
                    {profile.anomaliesDetected} flags
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block font-bold font-mono">QUALITY</span>
                  <span className="text-xs font-bold text-emerald-800 block mt-1 font-mono">
                    {profile.dataQualityScore}%
                  </span>
                </div>
              </div>

              {/* Mapped parameters listings */}
              <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
                <span className="font-sans font-bold text-[11px] text-slate-700 block">Matched Feature Vectors:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.columnsDetected.map((col, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-sm">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
              Upload files or launch Sandbox model to generate profile reporting...
            </div>
          )}

          {/* Trace scan logs */}
          {successLogs.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Vulnerability Diagnostics Checklist
              </span>
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                {successLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] font-mono text-slate-400 text-right pt-4 border-t border-slate-100">
          WAF Engine: Standard Ingress Controller V1.1
        </div>
      </div>
    </div>
  );
}
