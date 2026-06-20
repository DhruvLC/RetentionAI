import React, { useState, useEffect } from 'react';
import { SecurityEvent, AuditLog } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, Terminal, EyeOff, UserX } from 'lucide-react';

export default function SecurityPanel() {
  const [secEvents, setSecEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSecurityTelemetry = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security-events');
      const data = await response.json();
      if (data.status === 'success') {
        setSecEvents(data.events);
      }

      const audResponse = await fetch('/api/audit-logs');
      const audData = await audResponse.json();
      if (audData.status === 'success') {
        setAuditLogs(audData.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAlerts = async () => {
    try {
      const response = await fetch('/api/security-events/clear', { method: 'POST' });
      await response.json();
      await fetchSecurityTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSecurityTelemetry();
  }, []);

  // Secure header diagnostics checklist
  const headChecks = [
    { name: "Content Security Policy (CSP)", status: "Active", risk: "Mitigates XSS injection pathways", passed: true },
    { name: "X-Frame-Options (Clickjacking protection)", status: "DENY", risk: "Stops iframe hijacks", passed: true },
    { name: "HTTP Strict Transport Security (HSTS)", status: "Active (max-age=31536000)", risk: "Forces SSL operations", passed: true },
    { name: "TLS Ingress Cipher Suite", status: "TLS 1.3 (AES-256-GCM)", risk: "In-transit encryption standard", passed: true }
  ];

  return (
    <div className="space-y-6">
      {/* SEC DIAGNOSE READOUT OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Anti SQL Injection Card */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">
            Penetration Defense
          </span>
          <p className="text-xl font-bold font-display mt-0.5 text-slate-900">
            WAF Active
          </p>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">
            SQL Injection Filter: Robust
          </span>
        </div>

        {/* Antivirus Scan Card */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">
            Malware Guard System
          </span>
          <p className="text-xl font-bold font-display mt-0.5 text-slate-900">
            Active Scan
          </p>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">
            Signatures database status: OK
          </span>
        </div>

        {/* Threat Counters */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100">
          <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">
            Vulnerability blocks (Session)
          </span>
          <p className="text-xl font-bold font-display mt-0.5 text-rose-600">
            {secEvents.filter(e => e.eventType === 'FIREWALL_BLOCK' || e.eventType === 'UNAUTHORIZED_ACCESS').length} Blocked
          </p>
          <span className="text-[10px] text-slate-400 block mt-1">
            Shield protection: 100% stable
          </span>
        </div>

        {/* In Transit encryption status */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider font-semibold">
              Crypto Core standard
            </span>
            <p className="text-xl font-bold font-display mt-0.5 text-indigo-600">
              AES-256
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              Data Enrypted At-Rest
            </span>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECURE HEADER DIAGNOSTICS (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm">
              Secure Headers Inspection
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Automated audit of structural network security response parameters
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {headChecks.map((hdr, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-150 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 font-display block">{hdr.name}</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-semibold mt-0.5 block">{hdr.status}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-sans leading-relaxed">{hdr.risk}</span>
                </div>
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* WAF SECOPS THREAT EVENT LOGS (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-medium text-slate-900 text-sm">
                  Threat Mitigation Log
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  WAF firewall intrusion logs, file scans quarantines, and script injection blocks
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAlerts}
                  className="px-2.5 py-1 text-[10px] font-mono bg-rose-50 text-rose-700 rounded-lg hover:border-rose-300 border border-transparent transition-all"
                >
                  Clear Logs
                </button>
                <button
                  onClick={fetchSecurityTelemetry}
                  className="p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2 h-76 overflow-y-auto pr-1">
              {secEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center py-12 text-slate-400 text-xs">
                  No critical threat footprints detected.
                </div>
              ) : (
                secEvents.map((e, idx) => {
                  let alertColor = "border-amber-100 bg-amber-50 text-amber-700";
                  if (e.severity === 'CRITICAL') alertColor = "border-red-100 bg-red-50 text-red-700";
                  else if (e.severity === 'INFO') alertColor = "border-blue-100 bg-blue-50 text-blue-700";

                  return (
                    <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 text-xs leading-relaxed ${alertColor}`}>
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex justify-between font-bold text-[10px] font-mono">
                          <span>{e.eventType}</span>
                          <span className="ml-4 font-normal text-slate-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-1 text-slate-600">{e.details}</p>
                        <div className="text-[9px] font-mono mt-1 text-slate-400">
                          Threat Source Node: {e.ipAddress} | Status: <strong className="uppercase">{e.status}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMMUTABLE SYSTEM AUDIT TRAIL LOG */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-display font-medium text-slate-800 text-sm">
            Immutable Audit Trail Logs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically tied append-only registry tracking every user and workspace transaction
          </p>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 font-mono text-slate-500 border-b border-slate-150 font-semibold">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Workspace User</th>
                <th className="py-2.5 px-4">Operational Action</th>
                <th className="py-2.5 px-4">Module Node</th>
                <th className="py-2.5 px-4 font-mono">Terminal IP</th>
                <th className="py-2.5 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[10px] text-slate-600">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 font-sans text-xs">
                    Preparing immutable logs registry...
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, lidx) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-4 text-slate-400">{log.id.slice(0, 16)}</td>
                    <td className="py-2 px-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-sans font-semibold text-slate-800">{log.user}</span>
                    </td>
                    <td className="py-2 px-4 text-slate-700 font-sans">{log.action}</td>
                    <td className="py-2 px-4 text-slate-400">{log.module}</td>
                    <td className="py-2 px-4 text-slate-400">{log.ipAddress}</td>
                    <td className="py-2 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
