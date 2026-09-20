import React, { useState } from 'react';
import {
  DEFAULT_AWS_CONFIG,
  AWS_LAMBDA_BLUEPRINT_CODE,
} from '../services/awsConfig';
import {
  Cloud,
  Cpu,
  Database,
  Server,
  Key,
  Archive,
  Radio,
  CheckCircle2,
  Code2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AwsArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AwsArchitectureModal: React.FC<AwsArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'code' | 'services'>('topology');

  if (!isOpen) return null;

  return (
    <div
      id="aws-architecture-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  AWS Cloud Architecture & Target Services
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] font-mono">
                  First Commit Hackathon
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Serverless V2X pipeline specification: DynamoDB • Lambda • Bedrock AI • API Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'topology'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture Flow
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'services'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AWS Services Used
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'code'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lambda Blueprint (Node.js)
          </button>
        </div>

        {/* Tab 1: Architecture Topology */}
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <div className="text-amber-400 font-bold mb-2">
                # LIFELANE END-TO-END TELEMETRY & DISPATCH PIPELINE
              </div>
              <pre className="text-[11px] text-slate-300">
{`
[Connected Ambulance OBU] ───► (GPS: Lat, Lng, Speed, Heading @ 5Hz)
          │
          ▼
 [AWS IoT Core] ──────────────► MQTT Topic: lifelane/bengaluru/emergency
          │
          ▼
 [Amazon API Gateway] ────────► WebSocket / REST (Sub-second broadcast)
          │
          ▼
    [AWS Lambda] ─────────────► evaluateEmergencyCorridor.ts
    ├──► [Amazon DynamoDB] ───► Geospatial Index: Look up nearby connected vehicles
    ├──► [Amazon Bedrock] ────► Claude 3.5: Arterial bottleneck & green-wave prediction
    └──► [Amazon S3] ─────────► Dispatch audit logs & regulatory compliance trail
          │
          ▼
 [Connected Vehicles HUD] ────► "🚨 EMERGENCY VEHICLE APPROACHING - CLEAR LANE"
`}
              </pre>
            </div>

            {/* Cloud Transparency Banner */}
            <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transparent Engineering Notice: </span>
                This web prototype runs with high-fidelity local vector math and browser-synthesized audio.
                All endpoints and payload schemas are strictly structured to connect to the AWS stack above without rewriting business logic.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AWS Services Breakdown */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Server className="w-4 h-4" />
                <span>AWS Lambda</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Executes vector dot-product computations in 15ms. Computes directional forward cones and filters out non-relevant trailing traffic.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <Database className="w-4 h-4" />
                <span>Amazon DynamoDB</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Single-digit millisecond reads using Geohash-6 partition keys. Manages ephemeral positions of thousands of city vehicles with TTL.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-400">
                <Cpu className="w-4 h-4" />
                <span>Amazon Bedrock (AI)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Forecasts congestion choke points (e.g. Sony World Signal bottleneck index) and triggers proactive green-wave signal sequencing.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Radio className="w-4 h-4" />
                <span>Amazon API Gateway</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Maintains bidirectional WebSocket connections to in-car head units (Android Automotive / Apple CarPlay) for zero-latency alert delivery.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <Key className="w-4 h-4" />
                <span>Amazon Cognito</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Ensures only authenticated emergency dispatchers and authorized ambulance telematics units can trigger high-priority green waves.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-400">
                <Archive className="w-4 h-4" />
                <span>Amazon S3</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Permanent encrypted storage for emergency route audit records, speed compliance telematics, and civic transparency metrics.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Lambda Code Preview */}
        {activeTab === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Production Serverless Handler Code (`evaluateEmergencyCorridor.ts`)</span>
              <span className="font-mono text-[10px]">Node.js 20.x • AWS SDK v3</span>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
              {AWS_LAMBDA_BLUEPRINT_CODE}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Configured Region: <span className="text-slate-200 font-mono">{DEFAULT_AWS_CONFIG.region}</span> (Mumbai)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
