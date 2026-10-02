import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, X, RefreshCw, Key, ExternalLink, Database, ShieldCheck } from 'lucide-react';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health.js');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      setHealthData(json);
    } catch (err: any) {
      setError(err.message || 'Failed connecting to /api/health.js');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-health-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 id="api-health-title" className="text-base font-bold text-slate-900">
                Singapore Government API Monitor
              </h2>
              <p className="text-xs text-slate-500 font-mono">/api/health.js · Lot Type: C (Cars)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              title="Refresh health check"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close monitor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {loading && !healthData && (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p>Pinging HDB data.gov.sg and transport endpoints...</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Endpoint check failed:</span>
                <p className="mt-0.5 font-mono">{error}</p>
              </div>
            </div>
          )}

          {healthData && (
            <div className="space-y-3.5">
              {/* Overall status banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${healthData.status.startsWith('healthy') ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-bold text-slate-800 uppercase tracking-wide">
                    Status: {healthData.status}
                  </span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">
                  {healthData.totalDurationMs}ms total latency
                </span>
              </div>

              {/* HDB Direct Open Data Banner */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HDB Live Data & Information</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    LIVE & ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Streaming 2,000+ real-time carparks from data.gov.sg (HDB Info + Live Lot Type: C availability).
                </p>
              </div>

              {/* Configured Endpoints Breakdown */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  Connected Government Feeds
                </span>

                {/* 1. HDB Carpark Availability (Lot Type: C) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. HDB Carpark Availability (Lot Type: C)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {healthData.endpoints?.hdbCarparkAvailability?.latencyMs}ms
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 truncate">
                    {healthData.endpoints?.hdbCarparkAvailability?.url}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium pt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-slate-600">
                      Status: {healthData.endpoints?.hdbCarparkAvailability?.status} (HTTP {healthData.endpoints?.hdbCarparkAvailability?.httpCode || 200})
                    </span>
                  </div>
                </div>

                {/* 2. HDB Carpark Info (d_23f946fa557947f93a8043bbef41dd09) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. HDB Carpark Info (d_23f946fa...)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {healthData.endpoints?.hdbCarparkInfo?.latencyMs}ms
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 truncate">
                    {healthData.endpoints?.hdbCarparkInfo?.url}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium pt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-slate-600">
                      Status: {healthData.endpoints?.hdbCarparkInfo?.status} (HTTP {healthData.endpoints?.hdbCarparkInfo?.httpCode || 200})
                    </span>
                  </div>
                </div>

                {/* 3. URA Car_Park_Availability */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      <span>3. URA Car_Park_Availability</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {healthData.endpoints?.uraCarParkAvailability?.latencyMs}ms
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 truncate">
                    {healthData.endpoints?.uraCarParkAvailability?.url}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium pt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-slate-600">
                      Status: {healthData.endpoints?.uraCarParkAvailability?.status} (HTTP {healthData.endpoints?.uraCarParkAvailability?.httpCode || 200})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <a
            href="/api/health.js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            <span>Open Raw JSON</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
