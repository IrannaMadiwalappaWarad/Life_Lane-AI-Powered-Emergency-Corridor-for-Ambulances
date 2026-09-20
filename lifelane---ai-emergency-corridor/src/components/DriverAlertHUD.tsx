import React from 'react';
import { SimulatedVehicle, AmbulanceState } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowDownCircle,
  CheckCircle2,
  Car,
  ChevronRight,
  Info,
  Radio,
} from 'lucide-react';

interface DriverAlertHUDProps {
  vehicle: SimulatedVehicle | null;
  vehicles: SimulatedVehicle[];
  ambulance: AmbulanceState;
  onSelectVehicle: (vehicleId: string) => void;
  onClearLane: (vehicleId: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const DriverAlertHUD: React.FC<DriverAlertHUDProps> = ({
  vehicle,
  vehicles,
  ambulance,
  onSelectVehicle,
  onClearLane,
  isMuted,
  onToggleMute,
}) => {
  // If no vehicle selected, default to the one with the highest alert level or first in list
  const activeVehicle =
    vehicle ||
    vehicles.find((v) => v.alertLevel === 'RED') ||
    vehicles.find((v) => v.alertLevel === 'ORANGE') ||
    vehicles[0];

  if (!activeVehicle) return null;

  const isRedAlert = activeVehicle.alertLevel === 'RED';
  const isOrangeWarning = activeVehicle.alertLevel === 'ORANGE';
  const isYellowAdvisory = activeVehicle.alertLevel === 'YELLOW';
  const isCleared = activeVehicle.status === 'CLEARED' || activeVehicle.clearedToShoulder;
  const isNormal = activeVehicle.alertLevel === 'NONE';

  const handleTestAlertAudio = () => {
    soundEffects.playEmergencyAlert(false);
  };

  return (
    <div
      id="driver-alert-hud-panel"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Ambience Glow when Emergency Alert is Active */}
      {isRedAlert && !isCleared && (
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse" />
      )}
      {isOrangeWarning && !isCleared && (
        <div className="absolute inset-0 bg-orange-600/5 pointer-events-none" />
      )}

      {/* Top Header: In-Vehicle Cockpit Display Title & Vehicle Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                IN-CABIN DRIVER HUD
              </h3>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/80 rounded text-[10px] font-mono">
                V2X TELEMATICS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Connected Vehicle On-Board Unit (OBU) Preview
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            id="test-alert-sound-btn"
            onClick={handleTestAlertAudio}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Preview recognizable emergency alert tone"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Sound</span>
          </button>
          <button
            id="toggle-mute-sound-btn"
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isMuted
                ? 'bg-red-950/60 border-red-800 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Vehicle Selector Pills */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-10">
        <span className="text-[11px] text-slate-400 whitespace-nowrap mr-1">
          Vehicle:
        </span>
        {vehicles.map((v) => {
          const isCurrent = v.id === activeVehicle.id;
          const hasRed = v.alertLevel === 'RED';
          return (
            <button
              key={v.id}
              id={`select-car-${v.id}`}
              onClick={() => onSelectVehicle(v.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? 'bg-slate-100 text-slate-900 border-white font-bold shadow-md'
                  : hasRed
                  ? 'bg-red-950/60 text-red-300 border-red-800 hover:bg-red-900/60 animate-pulse'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{v.plateNumber.split('-').slice(-2).join('-')}</span>
              {hasRed && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              {v.status === 'CLEARED' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Vehicle Info Header */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 my-2 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200">
            <Car className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>{activeVehicle.vehicleModel || 'Connected Vehicle'}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {activeVehicle.plateNumber}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Driver: <span className="text-slate-300">{activeVehicle.driverName}</span> • Current Speed: <span className="font-mono text-slate-300">{activeVehicle.speed} km/h</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              isRedAlert
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse'
                : isOrangeWarning
                ? 'bg-orange-500 text-slate-950 font-bold'
                : isYellowAdvisory
                ? 'bg-amber-400 text-slate-950 font-bold'
                : isCleared
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isCleared ? 'LANE CLEARED' : activeVehicle.status}
          </span>
        </div>
      </div>

      {/* In-Cabin Alert Banner & Cockpit Telematics */}
      <div className="my-2 z-10 flex-1 flex flex-col justify-center">
        {isRedAlert && !isCleared ? (
          <div className="bg-gradient-to-br from-red-950/90 via-red-900/60 to-red-950/90 border-2 border-red-500 rounded-xl p-4 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-red-400 font-extrabold text-sm sm:text-base tracking-wider uppercase animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span>🚨 EMERGENCY VEHICLE APPROACHING</span>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>

            <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-lg p-3 border border-red-800/40 font-mono">
              <div>
                <div className="text-[10px] text-red-300 uppercase">Distance</div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {activeVehicle.distanceToAmbulance} <span className="text-xs">m</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-red-300 uppercase">Direction</div>
                <div className="text-base sm:text-lg font-bold text-red-200">
                  Behind You
                </div>
              </div>
              <div>
                <div className="text-[10px] text-red-300 uppercase">Est. Intercept</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300">
                  {activeVehicle.timeToInterceptSecs > 0 ? `${activeVehicle.timeToInterceptSecs}s` : '--'}
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-white bg-red-800/50 py-2 px-3 rounded-lg border border-red-400/50">
              ⚠️ Please clear the lane immediately. Pull over to the left shoulder.
            </p>
          </div>
        ) : isOrangeWarning && !isCleared ? (
          <div className="bg-gradient-to-br from-orange-950/80 to-amber-950/60 border border-orange-500/80 rounded-xl p-4 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-2 text-orange-400 font-bold text-sm tracking-wide uppercase">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              <span>PREPARE TO CLEAR ROUTE</span>
            </div>
            <div className="text-xs text-orange-200">
              Ambulance {ambulance.callsign} approaching in <span className="font-bold text-white">{activeVehicle.distanceToAmbulance} meters</span>.
            </div>
            <p className="text-xs text-slate-300 bg-black/30 p-2 rounded">
              Prepare to maneuver left when safe. Do not block the upcoming junction.
            </p>
          </div>
        ) : isYellowAdvisory && !isCleared ? (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-center space-y-2">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              ADVANCE CORRIDOR ADVISORY (~{activeVehicle.distanceToAmbulance}m)
            </div>
            <p className="text-xs text-slate-300">
              An active emergency corridor has formed along this route. Monitor lane flow.
            </p>
          </div>
        ) : isCleared ? (
          <div className="bg-emerald-950/60 border border-emerald-500/80 rounded-xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>LANE CLEARED • SAFE ON SHOULDER</span>
            </div>
            <p className="text-xs text-emerald-200">
              Vehicle successfully shifted to curb. Stand by until emergency unit {ambulance.callsign} clears past.
            </p>
          </div>
        ) : (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center space-y-1.5 text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs font-semibold">
              <Info className="w-4 h-4 text-slate-400" />
              <span>TRAFFIC FLOW NORMAL</span>
            </div>
            <p className="text-xs text-slate-400">
              {activeVehicle.isAheadOfAmbulance
                ? 'Outside active corridor reach. No emergency clearance required.'
                : 'Vehicle is trailing behind the emergency unit or on a non-intersecting avenue. No alert needed.'}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Compliance Action Button */}
      <div className="pt-2 z-10 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <span>OBU Telemetry:</span>
          <span className="text-emerald-400 font-mono font-semibold">LIVE</span>
        </div>

        {!isCleared && (isRedAlert || isOrangeWarning) ? (
          <button
            id="clear-lane-action-btn"
            onClick={() => onClearLane(activeVehicle.id)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Pull Over to Shoulder</span>
          </button>
        ) : isCleared ? (
          <button
            id="re-enter-lane-btn"
            onClick={() => onClearLane(activeVehicle.id)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Reset Vehicle Position
          </button>
        ) : null}
      </div>
    </div>
  );
};
