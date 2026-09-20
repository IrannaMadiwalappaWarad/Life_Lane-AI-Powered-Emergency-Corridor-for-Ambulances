import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AmbulanceState,
  SimulatedVehicle,
  EmergencyCorridor,
  Junction,
  ActivityLogItem,
  EmergencyStatus,
} from './types';
import {
  AMBULANCE_ROUTE_WAYPOINTS,
  INITIAL_JUNCTIONS,
  INITIAL_SIMULATED_VEHICLES,
} from './services/bengaluruMapData';
import { predictiveEngine, RoutePredictionResult } from './services/predictionEngine';
import { soundEffects } from './services/soundEffects';
import { LiveMap } from './components/LiveMap';
import { DriverAlertHUD } from './components/DriverAlertHUD';
import { TrafficControlDashboard } from './components/TrafficControlDashboard';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { AwsArchitectureModal } from './components/AwsArchitectureModal';
import { SafetyDisclaimerModal } from './components/SafetyDisclaimerModal';
import { DemoTourModal } from './components/DemoTourModal';
import {
  Shield,
  Activity,
  Cloud,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  RotateCcw,
  Radio,
  MapPin,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export default function App() {
  // Format current local time helper for logs
  const getLogTimestamp = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Ambulance State
  const [ambulance, setAmbulance] = useState<AmbulanceState>({
    id: 'KA-01-EA-108',
    callsign: 'KA-01-EA-108',
    position: {
      x: AMBULANCE_ROUTE_WAYPOINTS[0].x,
      y: AMBULANCE_ROUTE_WAYPOINTS[0].y,
      lat: AMBULANCE_ROUTE_WAYPOINTS[0].lat,
      lng: AMBULANCE_ROUTE_WAYPOINTS[0].lng,
    },
    speed: 52, // km/h
    heading: 340, // degrees
    segmentIndex: 0,
    segmentProgress: 0,
    destination: {
      name: 'Manipal Hospital Emergency Trauma Bay',
      hospital: 'Manipal Hospital, HAL Old Airport Rd',
      lat: 12.9592,
      lng: 77.6565,
      totalDistanceMeters: 2950,
    },
    status: 'IDLE',
    patientCondition: 'CRITICAL (Cardiac Event)',
    dispatchedAt: '09:31:02',
  });

  // Simulated Vehicles & Junctions
  const [vehicles, setVehicles] = useState<SimulatedVehicle[]>(INITIAL_SIMULATED_VEHICLES);
  const [junctions, setJunctions] = useState<Junction[]>(INITIAL_JUNCTIONS);

  // Corridor State
  const [corridor, setCorridor] = useState<EmergencyCorridor>({
    active: false,
    innerMeters: 450,
    mediumMeters: 1000,
    outerMeters: 1800,
    heading: 340,
    corridorWidthMeters: 55,
    affectedVehiclesCount: 0,
    clearedVehiclesCount: 0,
  });

  // Analytics & AI Insights
  const [congestionIndex, setCongestionIndex] = useState<number>(42);
  const [bottleneckDetected, setBottleneckDetected] = useState<boolean>(false);
  const [bottleneckLocation, setBottleneckLocation] = useState<string | undefined>(undefined);
  const [etaSeconds, setEtaSeconds] = useState<number>(240);

  // UI & Simulation Controls
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('v-103'); // default Priya Creta
  const [showCorridorZones, setShowCorridorZones] = useState<boolean>(true);
  const [showTrafficDensity, setShowTrafficDensity] = useState<boolean>(false);

  // Modals
  const [isAwsModalOpen, setIsAwsModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [activeDemoStep, setActiveDemoStep] = useState<number>(1);
  const [isAutoDemoRunning, setIsAutoDemoRunning] = useState<boolean>(false);

  // Real-time Event Log with initial pre-dispatch context
  const [logs, setLogs] = useState<ActivityLogItem[]>([
    {
      id: 'log-1',
      timestamp: '09:30:45',
      category: 'AMBULANCE',
      message: 'Ambulance KA-01-EA-108 standby at Koramangala station',
      severity: 'info',
    },
    {
      id: 'log-2',
      timestamp: '09:30:58',
      category: 'AI_PREDICTION',
      message: 'Optimal corridor calculated: Koramangala -> Sony World -> Domlur -> Manipal Hospital',
      severity: 'info',
    },
  ]);

  const addLog = useCallback((category: ActivityLogItem['category'], message: string, severity: ActivityLogItem['severity'] = 'info') => {
    const newItem: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: getLogTimestamp(),
      category,
      message,
      severity,
    };
    setLogs((prev) => [newItem, ...prev.slice(0, 49)]); // keep latest 50 logs
  }, []);

  // Track state transitions to avoid spamming logs
  const previousAlertedVehiclesRef = useRef<Set<string>>(new Set());
  const previousClearedVehiclesRef = useRef<Set<string>>(new Set());

  // Master Simulation Loop
  useEffect(() => {
    if (ambulance.status !== 'EN_ROUTE') return;

    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTimestamp;
      lastTimestamp = currentTime;

      // Rate of movement along polyline
      const speedFactor = (ambulance.speed / 40) * (deltaMs / 1000) * 0.045 * simulationSpeed;

      setAmbulance((prev) => {
        let segIdx = prev.segmentIndex;
        let progress = prev.segmentProgress + speedFactor;

        if (progress >= 1) {
          segIdx += 1;
          progress = 0;
        }

        // Check if destination arrived
        if (segIdx >= AMBULANCE_ROUTE_WAYPOINTS.length - 1) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          soundEffects.playSuccessChime();
          addLog('AMBULANCE', 'Ambulance KA-01-EA-108 arrived at Manipal Hospital Emergency Bay. Corridor released.', 'success');
          return {
            ...prev,
            status: 'ARRIVED',
            segmentIndex: AMBULANCE_ROUTE_WAYPOINTS.length - 1,
            segmentProgress: 1,
            position: {
              x: AMBULANCE_ROUTE_WAYPOINTS[AMBULANCE_ROUTE_WAYPOINTS.length - 1].x,
              y: AMBULANCE_ROUTE_WAYPOINTS[AMBULANCE_ROUTE_WAYPOINTS.length - 1].y,
              lat: AMBULANCE_ROUTE_WAYPOINTS[AMBULANCE_ROUTE_WAYPOINTS.length - 1].lat,
              lng: AMBULANCE_ROUTE_WAYPOINTS[AMBULANCE_ROUTE_WAYPOINTS.length - 1].lng,
            },
          };
        }

        const p1 = AMBULANCE_ROUTE_WAYPOINTS[segIdx];
        const p2 = AMBULANCE_ROUTE_WAYPOINTS[segIdx + 1];

        // Linear interpolation along waypoint segment
        const curX = p1.x + (p2.x - p1.x) * progress;
        const curY = p1.y + (p2.y - p1.y) * progress;
        const curLat = p1.lat + (p2.lat - p1.lat) * progress;
        const curLng = p1.lng + (p2.lng - p1.lng) * progress;

        // Heading angle (degrees)
        const angleRad = Math.atan2(p2.x - p1.x, -(p2.y - p1.y));
        const headingDeg = (angleRad * 180) / Math.PI;

        return {
          ...prev,
          segmentIndex: segIdx,
          segmentProgress: progress,
          position: { x: curX, y: curY, lat: curLat, lng: curLng },
          heading: (headingDeg + 360) % 360,
        };
      });

      // Ambient vehicle micro-movements
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          // Cleared vehicles stay parked on shoulder
          if (v.status === 'CLEARED' || v.clearedToShoulder) {
            return v;
          }
          // Ambient vehicles advance forward slowly
          const vSpeed = (v.speed / 50) * (deltaMs / 1000) * 0.8 * simulationSpeed;
          const rad = (v.heading * Math.PI) / 180;
          return {
            ...v,
            position: {
              ...v.position,
              x: v.position.x + Math.sin(rad) * vSpeed,
              y: v.position.y - Math.cos(rad) * vSpeed,
            },
          };
        })
      );

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animFrame);
  }, [ambulance.status, ambulance.speed, simulationSpeed, addLog]);

  // AI Evaluation & Corridor Updates triggered by ambulance state
  useEffect(() => {
    if (ambulance.status === 'IDLE') return;

    const evaluation: RoutePredictionResult = predictiveEngine.evaluateCorridor(
      ambulance,
      vehicles,
      junctions
    );

    setCorridor(evaluation.corridor);
    setVehicles(evaluation.evaluatedVehicles);
    setJunctions(evaluation.activeJunctions);
    setCongestionIndex(evaluation.congestionIndex);
    setBottleneckDetected(evaluation.bottleneckDetected);
    setBottleneckLocation(evaluation.bottleneckLocation);
    setEtaSeconds(evaluation.estimatedTimeOfArrivalSecs);

    // Track newly alerted vehicles to log & trigger sound
    evaluation.evaluatedVehicles.forEach((v) => {
      if (v.alertLevel === 'RED') {
        if (!previousAlertedVehiclesRef.current.has(v.id)) {
          previousAlertedVehiclesRef.current.add(v.id);
          soundEffects.playEmergencyAlert(true);
          addLog('VEHICLE', `Vehicle ${v.plateNumber} (${v.vehicleModel || v.type}) received RED Emergency Alert [${v.distanceToAmbulance}m ahead]`, 'emergency');
        }
      }
      if (v.status === 'CLEARED' && !previousClearedVehiclesRef.current.has(v.id)) {
        previousClearedVehiclesRef.current.add(v.id);
        soundEffects.playSuccessChime();
        addLog('VEHICLE', `Vehicle ${v.plateNumber} cleared to shoulder. Lane unblocked.`, 'success');
      }
    });

    // Track Green Wave Junctions
    evaluation.activeJunctions.forEach((j) => {
      if (j.status === 'GREEN_WAVE_ACTIVE' && !j.greenWaveOverridden) {
        addLog('JUNCTION', `Green wave preemption active at ${j.name}. Traffic light overridden to GREEN.`, 'success');
      }
    });
  }, [ambulance.position.x, ambulance.position.y, ambulance.status, addLog]);

  // Handlers for Dispatch Controls
  const handleStartEmergency = () => {
    setAmbulance((prev) => ({
      ...prev,
      status: 'EN_ROUTE',
      dispatchedAt: getLogTimestamp(),
    }));
    setCorridor((prev) => ({ ...prev, active: true }));
    soundEffects.playWarningChime();
    addLog('AMBULANCE', 'Ambulance emergency started (Patient: Cardiac Event, Priority: 1)', 'emergency');
    addLog('AI_PREDICTION', 'AI Route Calculated: Koramangala to Manipal Hospital (2.95 km)', 'info');
    addLog('CORRIDOR', 'Dynamic 3-tier Emergency Corridor activated (Reach: 1800m forward cone)', 'warning');
  };

  const handlePauseResume = () => {
    if (ambulance.status === 'EN_ROUTE') {
      setAmbulance((prev) => ({ ...prev, status: 'PAUSED' }));
      addLog('AMBULANCE', 'Emergency corridor paused by dispatcher', 'warning');
    } else if (ambulance.status === 'PAUSED') {
      setAmbulance((prev) => ({ ...prev, status: 'EN_ROUTE' }));
      addLog('AMBULANCE', 'Emergency corridor resumed', 'info');
    }
  };

  const handleReset = () => {
    setAmbulance({
      id: 'KA-01-EA-108',
      callsign: 'KA-01-EA-108',
      position: {
        x: AMBULANCE_ROUTE_WAYPOINTS[0].x,
        y: AMBULANCE_ROUTE_WAYPOINTS[0].y,
        lat: AMBULANCE_ROUTE_WAYPOINTS[0].lat,
        lng: AMBULANCE_ROUTE_WAYPOINTS[0].lng,
      },
      speed: 52,
      heading: 340,
      segmentIndex: 0,
      segmentProgress: 0,
      destination: {
        name: 'Manipal Hospital Emergency Trauma Bay',
        hospital: 'Manipal Hospital, HAL Old Airport Rd',
        lat: 12.9592,
        lng: 77.6565,
        totalDistanceMeters: 2950,
      },
      status: 'IDLE',
      patientCondition: 'CRITICAL (Cardiac Event)',
      dispatchedAt: getLogTimestamp(),
    });
    setVehicles(INITIAL_SIMULATED_VEHICLES);
    setJunctions(INITIAL_JUNCTIONS);
    setCorridor({
      active: false,
      innerMeters: 450,
      mediumMeters: 1000,
      outerMeters: 1800,
      heading: 340,
      corridorWidthMeters: 55,
      affectedVehiclesCount: 0,
      clearedVehiclesCount: 0,
    });
    previousAlertedVehiclesRef.current.clear();
    previousClearedVehiclesRef.current.clear();
    addLog('AMBULANCE', 'Simulation reset to baseline state', 'info');
  };

  const handleIncreaseSpeed = () => {
    setSimulationSpeed((s) => Math.min(4, s * 2));
  };

  const handleDecreaseSpeed = () => {
    setSimulationSpeed((s) => Math.max(0.5, s / 2));
  };

  // Toggle lane clearance manually for a vehicle
  const handleClearVehicleManual = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const willClear = !v.clearedToShoulder;
          if (willClear) {
            soundEffects.playSuccessChime();
            addLog('VEHICLE', `Driver in ${v.plateNumber} voluntarily pulled over to shoulder.`, 'success');
          }
          return {
            ...v,
            clearedToShoulder: willClear,
            status: willClear ? 'CLEARED' : 'NORMAL',
            lateralOffset: willClear ? -18 : 0,
          };
        }
        return v;
      })
    );
  };

  // Force Green Wave on Junction manually
  const handleToggleGreenWaveJunction = (junctionId: string) => {
    setJunctions((prev) =>
      prev.map((j) => {
        if (j.id === junctionId) {
          const newStatus = !j.greenWaveOverridden;
          addLog('JUNCTION', `Dispatcher ${newStatus ? 'FORCED GREEN WAVE' : 'RESTORED AUTOMATIC CYCLE'} on ${j.name}`, newStatus ? 'success' : 'info');
          return {
            ...j,
            greenWaveOverridden: newStatus,
            signal: newStatus ? 'GREEN' : 'RED',
            status: newStatus ? 'GREEN_WAVE_ACTIVE' : 'ALERT',
          };
        }
        return j;
      })
    );
  };

  // Sound Mute Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEffects.setMuted(nextMute);
  };

  // 3-Minute Guided Demo step handler
  const handleStartDemoStep = (stepNumber: number) => {
    setActiveDemoStep(stepNumber);
    if (stepNumber === 1) {
      handleReset();
    } else if (stepNumber === 2) {
      handleStartEmergency();
    } else if (stepNumber === 3) {
      if (ambulance.status === 'IDLE') handleStartEmergency();
      setShowCorridorZones(true);
      addLog('CORRIDOR', 'Demo: Showcasing direction-aware cone geometry (trailing vehicles spared)', 'warning');
    } else if (stepNumber === 4) {
      if (ambulance.status === 'IDLE') handleStartEmergency();
      setSelectedVehicleId('v-103');
      soundEffects.playEmergencyAlert(false);
      addLog('VEHICLE', 'Demo: In-cabin HUD warning displayed to Creta (V-103)', 'emergency');
    } else if (stepNumber === 5) {
      setSimulationSpeed(2);
      if (ambulance.status === 'IDLE' || ambulance.status === 'PAUSED') {
        setAmbulance((prev) => ({ ...prev, status: 'EN_ROUTE' }));
      }
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;

  return (
    <div id="lifelane-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Professional Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 shadow-lg shadow-red-600/30">
              <span className="text-xl">🚑</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-white">
                  LIFELANE
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold font-mono tracking-tight">
                  AI EMERGENCY CORRIDOR
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                  WeMakeDevs Hackathon
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                "Clear the way before the ambulance arrives."
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* 3-Minute Demo Tour Guide */}
            <button
              id="open-demo-tour-btn"
              onClick={() => setIsDemoTourOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-200 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Judge Demo Script</span>
            </button>

            {/* AWS Architecture Overview */}
            <button
              id="open-aws-modal-btn"
              onClick={() => setIsAwsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>AWS Cloud Pipeline</span>
            </button>

            {/* Safety & Real-World Boundaries */}
            <button
              id="open-safety-modal-btn"
              onClick={() => setIsSafetyModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Real-world limitations & authorization requirements"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Scope & Safety</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="sound-mute-header-btn"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-red-950/80 border-red-800 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Grid Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Top Operational Status Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Route: Koramangala 80ft Rd ➔ Sony World ➔ Domlur Flyover ➔ Manipal Hospital</span>
            </span>
            <span className="hidden md:inline-block text-slate-500">|</span>
            <span className="hidden md:inline-block text-slate-400">
              Corridor Strategy: <strong className="text-red-400 font-medium">Forward Directional Cone (Zero rear distraction)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">Ambulance State:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                ambulance.status === 'EN_ROUTE'
                  ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  : ambulance.status === 'ARRIVED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {ambulance.status}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7/12): Live Map & Activity Log */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Map View */}
            <LiveMap
              ambulance={ambulance}
              vehicles={vehicles}
              corridor={corridor}
              junctions={junctions}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              showCorridorZones={showCorridorZones}
              onToggleCorridorZones={() => setShowCorridorZones((z) => !z)}
              showTrafficDensity={showTrafficDensity}
              onToggleTrafficDensity={() => setShowTrafficDensity((d) => !d)}
              onClearVehicleManual={handleClearVehicleManual}
            />

            {/* Real-time Activity Log */}
            <ActivityLogPanel
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>

          {/* Right Column (5/12): Traffic Command & In-Cabin Driver HUD */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dispatcher Traffic Control Dashboard */}
            <TrafficControlDashboard
              ambulance={ambulance}
              corridor={corridor}
              junctions={junctions}
              congestionIndex={congestionIndex}
              bottleneckDetected={bottleneckDetected}
              bottleneckLocation={bottleneckLocation}
              etaSeconds={etaSeconds}
              simulationSpeed={simulationSpeed}
              isAutoDemo={isAutoDemoRunning}
              onStartEmergency={handleStartEmergency}
              onPauseResume={handlePauseResume}
              onReset={handleReset}
              onIncreaseSpeed={handleIncreaseSpeed}
              onDecreaseSpeed={handleDecreaseSpeed}
              onTriggerDemoMode={() => setIsDemoTourOpen(true)}
              onToggleGreenWaveJunction={handleToggleGreenWaveJunction}
            />

            {/* In-Cabin Connected Vehicle Driver Alert HUD */}
            <DriverAlertHUD
              vehicle={selectedVehicle}
              vehicles={vehicles}
              ambulance={ambulance}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              onClearLane={handleClearVehicleManual}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AwsArchitectureModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
      />

      <SafetyDisclaimerModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onStartDemoStep={handleStartDemoStep}
        currentStep={activeDemoStep}
      />
    </div>
  );
}
