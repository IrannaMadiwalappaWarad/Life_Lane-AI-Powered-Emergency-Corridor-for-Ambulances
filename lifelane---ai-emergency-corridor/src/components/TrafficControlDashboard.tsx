import React from 'react';
import {
  AmbulanceState,
  EmergencyCorridor,
  Junction,
  EmergencyStatus,
} from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Zap,
  Activity,
  Navigation,
  Shield,
  Clock,
  Sparkles,
  AlertOctagon,
  Radio,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface TrafficControlDashboardProps {
  ambulance: AmbulanceState;
  corridor: EmergencyCorridor;
  junctions: Junction[];
  congestionIndex: number;
  bottleneckDetected: boolean;
  bottleneckLocation?: string;
  etaSeconds: number;
  simulationSpeed: number;
  isAutoDemo: boolean;
  onStartEmergency: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onIncreaseSpeed: () => void;
  onDecreaseSpeed: () => void;
  onTriggerDemoMode: () => void;
  onToggleGreenWaveJunction: (junctionId: string) => void;
}

export const TrafficControlDashboard: React.FC<TrafficControlDashboardProps> = ({
  ambulance,
  corridor,
  junctions,
  congestionIndex,
  bottleneckDetected,
  bottleneckLocation,
  etaSeconds,
  simulationSpeed,
  isAutoDemo,
  onStartEmergency,
  onPauseResume,
  onReset,
  onIncreaseSpeed,
  onDecreaseSpeed,
  onTriggerDemoMode,
  onToggleGreenWaveJunction,
}) => {
  const isRunning = ambulance.status === 'EN_ROUTE';
  const isPaused = ambulance.status === 'PAUSED';
  const isArrived = ambulance.status === 'ARRIVED';
  const isIdle = ambulance.status === 'IDLE';

  // Format ETA into min : sec
  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  return (
    <div
      id="traffic-control-dashboard"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5"
    >
      {/* Dashboard Top Header & Primary Simulation Dispatch Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-950 border border-red-800 rounded-md text-red-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </span>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              BENGALURU TRAFFIC OPERATIONS COMMAND
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time V2X Emergency Preemption & Green Wave Control
          </p>
        </div>

        {/* Action Controls Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Emergency Dispatch Action */}
          {isIdle ? (
            <button
              id="start-emergency-btn"
              onClick={onStartEmergency}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START EMERGENCY</span>
            </button>
          ) : isArrived ? (
            <button
              id="re-dispatch-btn"
              onClick={onReset}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DISPATCH</span>
            </button>
          ) : (
            <button
              id="pause-resume-btn"
              onClick={onPauseResume}
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{isPaused ? 'RESUME CORRIDOR' : 'PAUSE'}</span>
            </button>
          )}

          {/* Speed Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              id="decrease-speed-btn"
              onClick={onDecreaseSpeed}
              disabled={simulationSpeed <= 0.5}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded"
              title="Slow Down Simulation"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-200 text-[11px]">
              {simulationSpeed}x
            </span>
            <button
              id="increase-speed-btn"
              onClick={onIncreaseSpeed}
              disabled={simulationSpeed >= 4}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded"
              title="Speed Up Simulation"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Button */}
          <button
            id="reset-simulation-btn"
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
            title="Reset Simulation to Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Dedicated 3-Minute Demo Mode Trigger */}
          <button
            id="demo-mode-trigger-btn"
            onClick={onTriggerDemoMode}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isAutoDemo
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 animate-pulse'
                : 'bg-purple-950/70 hover:bg-purple-900 border-purple-700 text-purple-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>3-MIN DEMO MODE</span>
          </button>
        </div>
      </div>

      {/* Ambulance Real-time Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Unit Status */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>AMBULANCE UNIT</span>
            <Radio className="w-3 h-3 text-red-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono mt-1 flex items-center gap-2">
            <span>{ambulance.callsign}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold ${
                ambulance.status === 'EN_ROUTE'
                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                  : ambulance.status === 'ARRIVED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {ambulance.status}
            </span>
          </div>
          <div className="text-[10px] text-red-400 mt-1 font-medium truncate">
            {ambulance.patientCondition}
          </div>
        </div>

        {/* Speed & Velocity */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">CURRENT SPEED</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            {ambulance.speed} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Heading: {Math.round(ambulance.heading)}° (NW)
          </div>
        </div>

        {/* Destination & ETA */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>DESTINATION ETA</span>
            <Clock className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-0.5">
            {isArrived ? 'ARRIVED' : `${etaMin}m ${etaSec < 10 ? '0' : ''}${etaSec}s`}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {ambulance.destination.hospital}
          </div>
        </div>

        {/* Emergency Corridor Scope */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>CORRIDOR SCOPE</span>
            <Shield className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {corridor.active ? (
              <span className="text-red-400 font-mono">
                {corridor.outerMeters}m Reach
              </span>
            ) : (
              <span className="text-slate-400">STANDBY</span>
            )}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
            {corridor.affectedVehiclesCount} alerted • {corridor.clearedVehiclesCount} cleared
          </div>
        </div>
      </div>

      {/* AI Trajectory & Traffic Bottleneck Insight */}
      <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-700/80 rounded-lg text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">
                AI PREDICTIVE ARTERIAL CORRIDOR ENGINE
              </span>
              <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                Bedrock / SageMaker Ready
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              {bottleneckDetected
                ? `⚠️ High bottleneck detected at ${bottleneckLocation}. Signal override dynamically pre-calculated.`
                : 'Corridor vector projection nominal. Dynamic clearance cone tracking forward trajectory.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Arterial Congestion</span>
            <span
              className={`font-bold ${
                congestionIndex > 70
                  ? 'text-red-400'
                  : congestionIndex > 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {congestionIndex}%
            </span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Corridor Compliance</span>
            <span className="font-bold text-emerald-400">
              {corridor.affectedVehiclesCount > 0
                ? `${Math.round((corridor.clearedVehiclesCount / Math.max(1, corridor.affectedVehiclesCount)) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Traffic Junctions & Green Wave Preemption Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-300 uppercase tracking-wider">
            UPCOMING JUNCTIONS & SIGNAL PREEMPTION
          </h3>
          <span className="text-slate-500 text-[11px]">
            Green corridor auto-activates when within 500m
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Junction</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Corridor Status</th>
                <th className="py-2.5 px-3">Signal State</th>
                <th className="py-2.5 px-3 text-right">Green Wave Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {junctions.map((j) => {
                const isGreenWave = j.status === 'GREEN_WAVE_ACTIVE';
                return (
                  <tr key={j.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-200 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          j.signal === 'GREEN'
                            ? 'bg-emerald-400'
                            : j.signal === 'YELLOW'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <span>{j.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {j.currentDistanceMeters > 1000
                        ? `${(j.currentDistanceMeters / 1000).toFixed(1)} km`
                        : `${j.currentDistanceMeters} m`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isGreenWave
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
                            : j.status === 'ALERT'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : j.status === 'PREPARE'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`font-semibold ${
                          j.signal === 'GREEN'
                            ? 'text-emerald-400'
                            : j.signal === 'YELLOW'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {j.signal}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        id={`toggle-greenwave-${j.id}`}
                        onClick={() => onToggleGreenWaveJunction(j.id)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          j.greenWaveOverridden
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {j.greenWaveOverridden ? 'OVERRIDE ACTIVE' : 'FORCE GREEN'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
