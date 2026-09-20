import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, X, Building, Car, Radio } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="safety-disclaimer-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-100">
              Prototype Scope & Safety Disclosure
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-400">
            <strong className="text-amber-400">Hackathon Prototype Notice:</strong> LIFELANE is an innovative engineering concept created for the <em>WeMakeDevs First Commit Hackathon</em>. It visualizes the technical viability of directional dynamic emergency corridors.
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
              Explicit Prototype Boundaries:
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
              <li>
                <strong className="text-slate-300">Simulated Traffic:</strong> All vehicles (cars, BMTC buses, auto-rickshaws) are mathematically simulated in browser state. The prototype does not take remote control of any physical vehicle.
              </li>
              <li>
                <strong className="text-slate-300">Traffic Signal Preemption:</strong> Green wave indicators illustrate planned ITMS (Intelligent Traffic Management System) protocols, but are not wired to live Bengaluru Traffic Police (BTP) controllers.
              </li>
              <li>
                <strong className="text-slate-300">Authorized Operator Safeguards:</strong> In commercial deployment, emergency dispatch sessions require multi-factor cryptographic authentication (Amazon Cognito / Gov-PKI) to prevent fraudulent corridor triggers.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
              Production Deployment Requirements:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                <Building className="w-4 h-4 text-sky-400 mb-1" />
                <span className="font-bold text-slate-200 block">Traffic Authorities</span>
                <span className="text-[10px] text-slate-400">BTP / ITMS junction telemetry integration.</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                <Radio className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-bold text-slate-200 block">Emergency Responders</span>
                <span className="text-[10px] text-slate-400">108 EMS & private hospital fleet API partnerships.</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                <Car className="w-4 h-4 text-purple-400 mb-1" />
                <span className="font-bold text-slate-200 block">OEM & Navigation</span>
                <span className="text-[10px] text-slate-400">Android Auto, Apple CarPlay, and Maps V2X alerts.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
