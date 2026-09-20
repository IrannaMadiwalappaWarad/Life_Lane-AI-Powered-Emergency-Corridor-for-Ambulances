import React, { useState } from 'react';
import { ActivityLogItem } from '../types';
import {
  ListFilter,
  Terminal,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
} from 'lucide-react';

interface ActivityLogPanelProps {
  logs: ActivityLogItem[];
  onClearLogs: () => void;
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({
  logs,
  onClearLogs,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((item) => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  const exportLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.category}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifelane-dispatch-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="activity-log-panel"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col h-[320px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            REAL-TIME ACTIVITY & TELEMETRY LOG
          </h3>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="export-logs-btn"
            onClick={exportLogs}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Download Incident Audit Trail"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
            title="Clear Log View"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar text-[10px] font-medium border-b border-slate-800/60">
        {['ALL', 'AMBULANCE', 'CORRIDOR', 'VEHICLE', 'JUNCTION'].map((cat) => (
          <button
            key={cat}
            id={`filter-log-${cat}`}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              filter === cat
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scrollable Event List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-[11px]">
            No activity logged yet. Start emergency to stream telematics.
          </div>
        ) : (
          filteredLogs.map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-start gap-2 py-1 px-2 rounded hover:bg-slate-800/40 text-[11px] leading-relaxed transition-colors"
              >
                <span className="text-slate-500 select-none whitespace-nowrap">
                  {item.timestamp}
                </span>

                <span
                  className={`px-1 rounded text-[9px] font-sans font-bold whitespace-nowrap ${
                    item.category === 'AMBULANCE'
                      ? 'bg-red-950 text-red-400 border border-red-900'
                      : item.category === 'CORRIDOR'
                      ? 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                      : item.category === 'VEHICLE'
                      ? 'bg-amber-950 text-amber-400 border border-amber-900'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  }`}
                >
                  {item.category}
                </span>

                <span
                  className={`flex-1 ${
                    item.severity === 'emergency'
                      ? 'text-red-300 font-semibold'
                      : item.severity === 'warning'
                      ? 'text-amber-300'
                      : item.severity === 'success'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }`}
                >
                  {item.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
