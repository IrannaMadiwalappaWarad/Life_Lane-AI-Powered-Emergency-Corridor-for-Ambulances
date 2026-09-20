import React, { useState, useRef } from 'react';
import {
  AmbulanceState,
  SimulatedVehicle,
  EmergencyCorridor,
  Junction,
} from '../types';
import {
  AMBULANCE_ROUTE_WAYPOINTS,
  BENGALURU_SECONDARY_STREETS,
  BENGALURU_LANDMARKS,
} from '../services/bengaluruMapData';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation2,
  Building2,
  Hospital,
  Compass,
  AlertTriangle,
  Volume2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LiveMapProps {
  ambulance: AmbulanceState;
  vehicles: SimulatedVehicle[];
  corridor: EmergencyCorridor;
  junctions: Junction[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  showCorridorZones: boolean;
  onToggleCorridorZones: () => void;
  showTrafficDensity: boolean;
  onToggleTrafficDensity: () => void;
  onClearVehicleManual?: (vehicleId: string) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  ambulance,
  vehicles,
  corridor,
  junctions,
  selectedVehicleId,
  onSelectVehicle,
  showCorridorZones,
  onToggleCorridorZones,
  showTrafficDensity,
  onToggleTrafficDensity,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking on an interactive node
    if ((e.target as HTMLElement).tagName === 'circle' || (e.target as HTMLElement).tagName === 'text') {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetMapTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Convert route waypoints to SVG path
  const routePointsString = AMBULANCE_ROUTE_WAYPOINTS.map((wp) => `${wp.x},${wp.y}`).join(' ');

  // Dynamic corridor geometry: compute directional cone forward along ambulance heading
  const ambX = ambulance.position.x;
  const ambY = ambulance.position.y;
  const headingRad = (ambulance.heading * Math.PI) / 180;

  // Forward unit vector
  const fwdX = Math.sin(headingRad);
  const fwdY = -Math.cos(headingRad);

  // Perpendicular unit vector
  const perpX = -fwdY;
  const perpY = fwdX;

  // Scaled reach in pixels (meters / 3.2)
  const innerPx = Math.min(180, corridor.innerMeters / 3.2);
  const mediumPx = Math.min(350, corridor.mediumMeters / 3.2);
  const outerPx = Math.min(520, corridor.outerMeters / 3.2);
  const halfWidthPx = 28;

  // Build directional cone polygon points
  const makeConePath = (forwardDist: number, lateralSpread: number) => {
    // Tip forward
    const tipX = ambX + fwdX * forwardDist;
    const tipY = ambY + fwdY * forwardDist;
    // Left shoulder forward
    const leftX = ambX + fwdX * (forwardDist * 0.85) + perpX * lateralSpread;
    const leftY = ambY + fwdY * (forwardDist * 0.85) + perpY * lateralSpread;
    // Right shoulder forward
    const rightX = ambX + fwdX * (forwardDist * 0.85) - perpX * lateralSpread;
    const rightY = ambY + fwdY * (forwardDist * 0.85) - perpY * lateralSpread;
    // Base right
    const baseRightX = ambX - perpX * (halfWidthPx * 0.6);
    const baseRightY = ambY - perpY * (halfWidthPx * 0.6);
    // Base left
    const baseLeftX = ambX + perpX * (halfWidthPx * 0.6);
    const baseLeftY = ambY + perpY * (halfWidthPx * 0.6);

    return `M ${ambX} ${ambY} L ${baseLeftX} ${baseLeftY} L ${leftX} ${leftY} Q ${tipX} ${tipY} ${rightX} ${rightY} L ${baseRightX} ${baseRightY} Z`;
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div
      id="live-map-container"
      ref={mapContainerRef}
      className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Tactical Grid Background & Overlay Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg shadow-lg flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ambulance.status === 'EN_ROUTE' || ambulance.status === 'EMERGENCY_DISPATCHED' ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ambulance.status === 'EN_ROUTE' || ambulance.status === 'EMERGENCY_DISPATCHED' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-slate-200">
            BENGALURU TACTICAL ARTERIAL CORRIDOR
          </span>
          <span className="text-[10px] text-slate-400 font-mono border-l border-slate-700 pl-2">
            12.935°N, 77.625°E
          </span>
        </div>

        {/* Dynamic Corridor Status Tag */}
        {corridor.active && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border border-red-700/60 text-red-300 rounded-lg text-xs font-semibold backdrop-blur-md animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>AI DIRECTIONAL CORRIDOR ACTIVE ({corridor.affectedVehiclesCount} VEHICLES ALERTED)</span>
          </div>
        )}
      </div>

      {/* Map Interactive Control Toolbars */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layer Toggles */}
        <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-1 shadow-lg text-xs">
          <button
            id="toggle-zones-btn"
            onClick={onToggleCorridorZones}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
              showCorridorZones ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 3-Tier Emergency Corridor Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-Tier Corridor</span>
          </button>
          <button
            id="toggle-density-btn"
            onClick={onToggleTrafficDensity}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
              showTrafficDensity ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Traffic Density Heatmap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Density</span>
          </button>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-1 shadow-lg">
          <button
            id="zoom-in-btn"
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-out-btn"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="reset-view-btn"
            onClick={resetMapTransform}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Surface */}
      <svg
        id="tactical-svg-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox="0 0 1020 620"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.2)" strokeWidth="0.8" />
          </pattern>

          {/* Gradients for Corridor Zones */}
          <linearGradient id="inner-red-cone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="medium-orange-cone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="outer-yellow-cone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.04" />
          </linearGradient>

          {/* Route Active Glow */}
          <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Emergency Pulse Filter */}
          <filter id="ambulance-beacon" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="1020" height="620" fill="#030712" />
        <rect width="1020" height="620" fill="url(#city-grid)" />

        {/* City Blocks & Urban Features */}
        <g id="urban-blocks" opacity="0.4">
          <rect x="90" y="320" width="120" height="80" rx="6" fill="#1e293b" />
          <rect x="250" y="310" width="110" height="65" rx="6" fill="#1e293b" />
          <rect x="420" y="240" width="90" height="100" rx="6" fill="#1e293b" />
          <rect x="580" y="170" width="80" height="60" rx="6" fill="#1e293b" />
          <rect x="720" y="110" width="80" height="70" rx="6" fill="#1e293b" />
          <rect x="250" y="500" width="120" height="60" rx="6" fill="#1e293b" />
          <rect x="410" y="440" width="100" height="70" rx="6" fill="#1e293b" />
          <rect x="570" y="350" width="100" height="80" rx="6" fill="#1e293b" />
          <rect x="710" y="290" width="100" height="70" rx="6" fill="#1e293b" />
        </g>

        {/* Traffic Density Heatmap (Optional Toggle) */}
        {showTrafficDensity && (
          <g id="traffic-density-layer" opacity="0.3">
            <circle cx="230" cy="440" r="70" fill="#dc2626" filter="blur(16px)" />
            <circle cx="540" cy="310" r="85" fill="#f97316" filter="blur(20px)" />
            <circle cx="390" cy="380" r="50" fill="#eab308" filter="blur(14px)" />
          </g>
        )}

        {/* Secondary Cross Streets */}
        <g id="secondary-streets" stroke="#334155" strokeWidth="14" strokeLinecap="round" opacity="0.6">
          {BENGALURU_SECONDARY_STREETS.map((st, i) => (
            <line
              key={`sec-street-${i}`}
              x1={st.from.x}
              y1={st.from.y}
              x2={st.to.x}
              y2={st.to.y}
            />
          ))}
        </g>

        {/* Secondary Streets Centerlines */}
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" opacity="0.8">
          {BENGALURU_SECONDARY_STREETS.map((st, i) => (
            <line
              key={`sec-street-dash-${i}`}
              x1={st.from.x}
              y1={st.from.y}
              x2={st.to.x}
              y2={st.to.y}
            />
          ))}
        </g>

        {/* Secondary Street Labels */}
        <g fill="#64748b" fontSize="9" fontFamily="monospace">
          <text x="240" y="240" transform="rotate(90 240 240)">Koramangala 80ft Rd</text>
          <text x="550" y="110" transform="rotate(90 550 110)">100ft Rd Indiranagar</text>
          <text x="830" y="120" transform="rotate(90 830 120)">Wind Tunnel Rd</text>
        </g>

        {/* Primary Arterial Emergency Route (Thick roadway) */}
        <g id="primary-emergency-route">
          {/* Road Asphalt */}
          <polyline
            points={routePointsString}
            fill="none"
            stroke="#1e293b"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Road Curbs */}
          <polyline
            points={routePointsString}
            fill="none"
            stroke="#475569"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={routePointsString}
            fill="none"
            stroke="#0f172a"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lane Divider Dashed Line */}
          <polyline
            points={routePointsString}
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />

          {/* Active Navigation Glow along Route */}
          <polyline
            points={routePointsString}
            fill="none"
            stroke={corridor.active ? '#ef4444' : '#38bdf8'}
            strokeWidth={corridor.active ? '5' : '3'}
            strokeOpacity={corridor.active ? '0.85' : '0.4'}
            filter="url(#corridor-glow)"
          />
        </g>

        {/* DYNAMIC 3-TIER EMERGENCY CORRIDOR CONE (Moves dynamically with ambulance!) */}
        {corridor.active && showCorridorZones && (
          <g id="dynamic-emergency-corridor-cones">
            {/* Zone 3: Outer Advance-Warning Zone (Yellow: 1200m - 1800m ahead) */}
            <path
              d={makeConePath(outerPx, 70)}
              fill="url(#outer-yellow-cone)"
              stroke="#eab308"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              strokeOpacity="0.7"
            />

            {/* Zone 2: Medium Warning Zone (Orange: 500m - 1000m ahead) */}
            <path
              d={makeConePath(mediumPx, 52)}
              fill="url(#medium-orange-cone)"
              stroke="#f97316"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              strokeOpacity="0.8"
            />

            {/* Zone 1: Inner Immediate Emergency Zone (Red: 0 - 450m ahead) */}
            <path
              d={makeConePath(innerPx, 38)}
              fill="url(#inner-red-cone)"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeOpacity="0.9"
            />

            {/* Directional Corridor Centerline Projection */}
            <line
              x1={ambX}
              y1={ambY}
              x2={ambX + fwdX * outerPx}
              y2={ambY + fwdY * outerPx}
              stroke="#f87171"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeOpacity="0.9"
            />
          </g>
        )}

        {/* Major Junctions with Traffic Signals */}
        <g id="traffic-junctions">
          {junctions.map((j) => {
            const isGreenWave = j.status === 'GREEN_WAVE_ACTIVE';
            return (
              <g key={j.id} transform={`translate(${j.coordinates.x}, ${j.coordinates.y})`}>
                {/* Junction Radar Ring */}
                <circle
                  r={isGreenWave ? '24' : '16'}
                  fill="none"
                  stroke={isGreenWave ? '#10b981' : j.status === 'ALERT' ? '#f59e0b' : '#64748b'}
                  strokeWidth={isGreenWave ? '2' : '1'}
                  strokeDasharray={isGreenWave ? 'none' : '3 3'}
                  className={isGreenWave ? 'animate-pulse' : ''}
                />

                {/* Junction Box */}
                <circle r="7" fill="#0f172a" stroke="#334155" strokeWidth="2" />

                {/* Signal Light Indicator */}
                <circle
                  r="4"
                  fill={
                    j.signal === 'GREEN'
                      ? '#10b981'
                      : j.signal === 'YELLOW'
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  className={isGreenWave ? 'animate-ping' : ''}
                />

                {/* Junction Label */}
                <text
                  y="26"
                  textAnchor="middle"
                  fill={isGreenWave ? '#34d399' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {j.name}
                </text>
                <text
                  y="36"
                  textAnchor="middle"
                  fill={isGreenWave ? '#6ee7b7' : '#94a3b8'}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {isGreenWave ? '⚡ GREEN WAVE' : `${j.currentDistanceMeters}m [${j.status}]`}
                </text>
              </g>
            );
          })}
        </g>

        {/* Landmarks */}
        <g id="landmarks" opacity="0.85">
          {BENGALURU_LANDMARKS.map((lm, i) => (
            <g key={`landmark-${i}`} transform={`translate(${lm.x}, ${lm.y})`}>
              <circle
                r="3"
                fill={lm.type === 'hospital_target' ? '#38bdf8' : '#64748b'}
              />
              <text
                x="6"
                y="3"
                fill={lm.type === 'hospital_target' ? '#38bdf8' : '#94a3b8'}
                fontSize="9"
                fontWeight={lm.type === 'hospital_target' ? 'bold' : 'normal'}
              >
                {lm.name}
              </text>
            </g>
          ))}
        </g>

        {/* Destination: Manipal Hospital Emergency Trauma Center */}
        <g transform="translate(930, 160)" className="cursor-pointer">
          <circle r="22" fill="#0284c7" fillOpacity="0.2" className="animate-ping" />
          <circle r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
          <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <text x="0" y="-18" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
            MANIPAL HOSPITAL (EMERGENCY)
          </text>
        </g>

        {/* SIMULATED VEHICLES */}
        <g id="simulated-vehicles">
          {vehicles.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            const isAlerted = v.alertLevel === 'RED';
            const isWarning = v.alertLevel === 'ORANGE' || v.alertLevel === 'YELLOW';
            const isCleared = v.status === 'CLEARED' || v.clearedToShoulder;

            // Shift coordinate laterally if pulled over to shoulder
            const rad = (v.heading * Math.PI) / 180;
            const pxPerp = -Math.cos(rad);
            const pyPerp = -Math.sin(rad);
            const displayX = v.position.x + (isCleared ? pxPerp * 14 : 0);
            const displayY = v.position.y + (isCleared ? pyPerp * 14 : 0);

            let statusColor = '#94a3b8'; // Normal slate
            if (isAlerted) statusColor = '#ef4444'; // Red alert
            else if (isWarning) statusColor = '#f59e0b'; // Amber warning
            if (isCleared) statusColor = '#10b981'; // Green cleared

            return (
              <g
                key={v.id}
                id={`vehicle-marker-${v.id}`}
                transform={`translate(${displayX}, ${displayY})`}
                onClick={() => onSelectVehicle(v.id)}
                className="cursor-pointer group"
              >
                {/* Alert Radar / Pulsing Ring */}
                {isAlerted && (
                  <circle
                    r="18"
                    fill="#ef4444"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Selection Aura */}
                {isSelected && (
                  <circle
                    r="15"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Status Indicator Outer Ring */}
                <circle
                  r="9"
                  fill="#0f172a"
                  stroke={statusColor}
                  strokeWidth="2"
                />

                {/* Vehicle Type Icon Representation */}
                {v.type === 'bus' ? (
                  <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill={statusColor} />
                ) : v.type === 'auto_rickshaw' ? (
                  <polygon points="0,-4 4,3 -4,3" fill={statusColor} />
                ) : v.type === 'bike' ? (
                  <circle r="3" fill={statusColor} />
                ) : (
                  <circle r="4" fill={statusColor} />
                )}

                {/* Direction Heading Pointer */}
                <line
                  x1="0"
                  y1="0"
                  x2={Math.sin((v.heading * Math.PI) / 180) * 11}
                  y2={-Math.cos((v.heading * Math.PI) / 180) * 11}
                  stroke={statusColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Vehicle Plate Tag */}
                <text
                  x="0"
                  y="-12"
                  textAnchor="middle"
                  fill={isAlerted ? '#fca5a5' : isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight={isAlerted || isSelected ? 'bold' : 'normal'}
                >
                  {v.plateNumber.split('-').slice(-2).join('-')}
                </text>

                {/* Cleared to shoulder badge */}
                {isCleared && (
                  <g transform="translate(8, -8)">
                    <circle r="4" fill="#059669" />
                    <path d="M -2 0 L -0.5 1.5 L 2 -1" stroke="#ffffff" strokeWidth="1" fill="none" />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* AMBULANCE SPRITE & LIGHTBAR */}
        <g
          id="ambulance-sprite-marker"
          transform={`translate(${ambulance.position.x}, ${ambulance.position.y})`}
        >
          {/* Outer Emergency Dispatch Halo */}
          <circle
            r="32"
            fill="#dc2626"
            fillOpacity="0.2"
            filter="url(#ambulance-beacon)"
            className="animate-pulse"
          />

          <circle
            r="16"
            fill="#991b1b"
            stroke="#f87171"
            strokeWidth="2.5"
          />

          {/* Flashing Emergency Lightbars (Red / Blue alternating) */}
          <circle
            r="5"
            cx="-4"
            cy="-2"
            fill="#ef4444"
            className="animate-ping"
          />
          <circle
            r="5"
            cx="4"
            cy="-2"
            fill="#3b82f6"
            className="animate-ping"
          />

          {/* Medical Red Cross Icon in Center */}
          <path
            d="M -3 0 L 3 0 M 0 -3 L 0 3"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="square"
          />

          {/* Ambulance Velocity & Heading Arrow */}
          <line
            x1="0"
            y1="0"
            x2={fwdX * 22}
            y2={fwdY * 22}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Callsign & Speed Badge */}
          <g transform="translate(0, 24)">
            <rect
              x="-42"
              y="-8"
              width="84"
              height="16"
              rx="4"
              fill="#7f1d1d"
              stroke="#ef4444"
              strokeWidth="1"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              🚑 {ambulance.callsign} | {ambulance.speed} km/h
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Legend / Quick Guide in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-semibold text-slate-300">Corridor Zones & Indicators</span>
          <span className="text-[10px] text-slate-500 font-mono">V2X Grid</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Red Zone (&lt;450m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Orange (&lt;1000m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Yellow (&lt;1800m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Lane Cleared</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
            <span>💡 Tip: Click any vehicle to inspect Driver In-Cabin Alert HUD.</span>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Quick Inspector in Bottom Right */}
      {selectedVehicle && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs w-72 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span>{selectedVehicle.vehicleModel || selectedVehicle.type}</span>
              <span className="font-mono text-[10px] text-slate-400">({selectedVehicle.plateNumber})</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedVehicle.alertLevel === 'RED'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : selectedVehicle.alertLevel === 'ORANGE'
                  ? 'bg-orange-950 text-orange-400 border border-orange-800'
                  : selectedVehicle.status === 'CLEARED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {selectedVehicle.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <div>Distance to Amb:</div>
            <div className="text-right font-mono font-medium text-slate-200">
              {selectedVehicle.distanceToAmbulance} m {selectedVehicle.isAheadOfAmbulance ? '(Ahead)' : '(Behind)'}
            </div>
            <div>Driver:</div>
            <div className="text-right text-slate-200 truncate">{selectedVehicle.driverName}</div>
            <div>Lane Status:</div>
            <div className="text-right font-medium text-slate-200">
              {selectedVehicle.clearedToShoulder ? (
                <span className="text-emerald-400 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Pulled to Curb
                </span>
              ) : (
                <span className="text-amber-400">Active in Lane</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
