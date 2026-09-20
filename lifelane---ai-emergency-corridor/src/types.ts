export type EmergencyStatus = 'IDLE' | 'EMERGENCY_DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'PAUSED';

export type VehicleStatus = 'NORMAL' | 'WARNING' | 'EMERGENCY_ALERT' | 'CLEARED';

export type AlertZone = 'NONE' | 'YELLOW' | 'ORANGE' | 'RED';

export type VehicleType = 'car' | 'auto_rickshaw' | 'bus' | 'bike';

export interface Coordinates {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export interface AmbulanceState {
  id: string;
  callsign: string;
  position: Coordinates;
  speed: number; // km/h
  heading: number; // degrees
  segmentIndex: number;
  segmentProgress: number; // 0 to 1
  destination: {
    name: string;
    hospital: string;
    lat: number;
    lng: number;
    totalDistanceMeters: number;
  };
  status: EmergencyStatus;
  patientCondition: 'CRITICAL (Cardiac Event)' | 'SEVERE (Trauma)' | 'STABLE';
  dispatchedAt: string;
}

export interface CorridorZone {
  type: 'RED' | 'ORANGE' | 'YELLOW';
  label: string;
  distanceAheadMeters: number;
  color: string;
  description: string;
}

export interface EmergencyCorridor {
  active: boolean;
  innerMeters: number; // RED zone (e.g. 450m)
  mediumMeters: number; // ORANGE zone (e.g. 1000m)
  outerMeters: number; // YELLOW zone (e.g. 1800m)
  heading: number;
  corridorWidthMeters: number;
  affectedVehiclesCount: number;
  clearedVehiclesCount: number;
}

export interface SimulatedVehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  position: { x: number; y: number; lat: number; lng: number };
  heading: number;
  speed: number; // km/h
  status: VehicleStatus;
  alertLevel: AlertZone;
  distanceToAmbulance: number; // meters
  isAheadOfAmbulance: boolean;
  angleRelativeToRoute: number;
  timeToInterceptSecs: number;
  clearedToShoulder: boolean;
  lateralOffset: number; // for visual pull-over animation
  laneIndex: number;
  driverName?: string;
  vehicleModel?: string;
}

export interface Junction {
  id: string;
  name: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  distanceFromStartMeters: number;
  currentDistanceMeters: number;
  status: 'NORMAL' | 'MONITOR' | 'PREPARE' | 'ALERT' | 'GREEN_WAVE_ACTIVE';
  signal: 'RED' | 'YELLOW' | 'GREEN';
  greenWaveOverridden: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  category: 'AMBULANCE' | 'CORRIDOR' | 'VEHICLE' | 'JUNCTION' | 'AI_PREDICTION';
  message: string;
  severity: 'info' | 'warning' | 'emergency' | 'success';
}

export interface RouteWaypoint {
  id: string;
  label: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  speedLimit: number;
}
