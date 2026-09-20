import React from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ArrowRight,
  Shield,
  Radio,
  Clock,
  Car,
  X,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemoStep: (stepNumber: number) => void;
  currentStep: number;
}

export const DEMO_STAGES = [
  {
    step: 1,
    title: 'Baseline Traffic (The Problem in Bengaluru)',
    duration: '00:00 - 00:30',
    description:
      'Arterial congestion along Koramangala 80ft Road & Sony World signal. Vehicles move at regular speeds with no advance warning. Traditional sirens only alert drivers ~50m away, resulting in gridlock.',
    talkingPoint:
      'Judges, notice how ambulances in Bengaluru get blocked because drivers have zero advance notice until the siren is right behind them.',
  },
  {
    step: 2,
    title: 'Emergency Dispatch & GPS Telematics',
    duration: '00:30 - 01:00',
    description:
      'Ambulance KA-01-EA-108 is dispatched to Manipal Hospital (HAL Old Airport Road). Telematics streams 5Hz GPS, speed (54 km/h), heading, and route waypoints.',
    talkingPoint:
      'The moment dispatch is triggered, our system computes real-time trajectory vectors rather than an unhelpful static circular radius.',
  },
  {
    step: 3,
    title: 'AI Dynamic Directional Corridor Activation',
    duration: '01:00 - 01:45',
    description:
      'The 3-tier directional corridor cone (Red: <450m, Orange: <1000m, Yellow: <1800m) projects forward along the planned route. Vehicles behind receive NO ALERT (reducing driver panic).',
    talkingPoint:
      'Crucial innovation: LIFELANE is direction-aware. Vehicles ahead get notified early to pull over, while trailing or cross-street vehicles are spared needless distraction.',
  },
  {
    step: 4,
    title: 'Connected Vehicle HUD Alert & Compliance',
    duration: '01:45 - 02:20',
    description:
      'Nearby vehicles (e.g. Priyas Creta V-103, BMTC Bus 500D) receive the high-contrast in-cockpit HUD alert + audio chime and pull over to the shoulder.',
    talkingPoint:
      'Simulated drivers immediately pull over to the left shoulder, and upcoming signals (Sony World, Domlur) engage Green Wave preemption.',
  },
  {
    step: 5,
    title: 'Green Wave Passage & Safe Hospital Arrival',
    duration: '02:20 - 03:00',
    description:
      'With the emergency corridor cleared, the ambulance maintains optimal transit velocity, saving an estimated 8-12 critical minutes.',
    talkingPoint:
      'Clear the way before the ambulance arrives. Built serverless-ready for AWS Lambda, DynamoDB, Bedrock, and IoT Core.',
  },
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  onStartDemoStep,
  currentStep,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="demo-tour-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-purple-800/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-950 border border-purple-700/80 rounded-xl text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                3-Minute Hackathon Demo Script & Judge Pitch
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step walkthrough for "First Commit" Hackathon by WeMakeDevs
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

        {/* Demo Stage Flow Cards */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {DEMO_STAGES.map((stage) => {
            const isCurrent = currentStep === stage.step;
            return (
              <div
                key={stage.step}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                  isCurrent
                    ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-900 border border-purple-500 text-purple-200 font-bold flex items-center justify-center text-[11px]">
                      {stage.step}
                    </span>
                    <span className="font-bold text-slate-100 text-sm">
                      {stage.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {stage.duration}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed pl-7">
                  {stage.description}
                </p>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 ml-7 text-[11px] text-amber-300">
                  <strong className="text-amber-400 uppercase tracking-wide text-[10px] block mb-0.5">
                    Judge Pitch Talking Point:
                  </strong>
                  "{stage.talkingPoint}"
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onStartDemoStep(stage.step);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Jump to Step {stage.step}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Target Pitch Time: 3 Minutes</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
