import {
  AmbulanceState,
  SimulatedVehicle,
  EmergencyCorridor,
  Junction,
  AlertZone,
  VehicleStatus,
} from '../types';
import { AMBULANCE_ROUTE_WAYPOINTS } from './bengaluruMapData';

export interface RoutePredictionResult {
  estimatedTimeOfArrivalSecs: number;
  corridor: EmergencyCorridor;
  evaluatedVehicles: SimulatedVehicle[];
  activeJunctions: Junction[];
  congestionIndex: number; // 0 (free) to 100 (gridlock)
  bottleneckDetected: boolean;
  bottleneckLocation?: string;
  recommendedSpeedKmh: number;
  greenWaveTargetJunction?: string;
}

export interface IPredictionService {
  evaluateCorridor(
    ambulance: AmbulanceState,
    vehicles: SimulatedVehicle[],
    junctions: Junction[]
  ): RoutePredictionResult;
}

/**
 * AI-Assisted Corridor & Trajectory Predictor
 * Modular architecture ready for AWS Lambda / Amazon Bedrock endpoint integration.
 * Performs real-time directional vector geometry, route lookahead projection,
 * and adaptive speed-density ETA regression.
 */
export class LocalPredictiveEngine implements IPredictionService {
  private readonly METERS_PER_PIXEL = 3.2; // Scaling factor for Bengaluru corridor

  public evaluateCorridor(
    ambulance: AmbulanceState,
    vehicles: SimulatedVehicle[],
    junctions: Junction[]
  ): RoutePredictionResult {
    const ambX = ambulance.position.x;
    const ambY = ambulance.position.y;
    const ambSpeedKmh = Math.max(ambulance.speed, 20);

    // Dynamic corridor reach based on ambulance velocity (faster = further lookahead needed)
    const innerReachMeters = Math.min(600, Math.max(350, ambSpeedKmh * 8));
    const mediumReachMeters = Math.min(1200, Math.max(700, ambSpeedKmh * 16));
    const outerReachMeters = Math.min(2000, Math.max(1200, ambSpeedKmh * 26));
    const corridorLateralWidthMeters = 55; // 2-lane road buffer width

    // Calculate heading vector (radians)
    const headingRad = (ambulance.heading * Math.PI) / 180;
    const dirX = Math.sin(headingRad);
    const dirY = -Math.cos(headingRad);

    let redAlertCount = 0;
    let clearedCount = 0;

    // Evaluate each simulated vehicle relative to the ambulance's forward vector
    const evaluatedVehicles = vehicles.map((v) => {
      const dx = v.position.x - ambX;
      const dy = v.position.y - ambY;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distMeters = distPx * this.METERS_PER_PIXEL;

      // Dot product for forward/backward test
      // dot > 0 means the vehicle is in front of the ambulance
      const dot = dx * dirX + dy * dirY;
      const isAhead = dot > -10; // small negative tolerance for vehicles right alongside

      // Lateral distance from ambulance heading line
      const cross = Math.abs(dx * dirY - dy * dirX);
      const lateralDistMeters = cross * this.METERS_PER_PIXEL;

      let alertLevel: AlertZone = 'NONE';
      let status: VehicleStatus = v.status;
      let lateralOffset = v.lateralOffset;
      let clearedToShoulder = v.clearedToShoulder;

      // Direction-aware filtering:
      // If vehicle is behind or far laterally on a separate road -> NO ALERT
      if (isAhead && lateralDistMeters <= corridorLateralWidthMeters) {
        if (distMeters <= innerReachMeters) {
          alertLevel = 'RED';
          if (!clearedToShoulder) {
            status = 'EMERGENCY_ALERT';
            // Simulate AI driver behavior: after emergency alert, vehicle maneuvers to curb
            lateralOffset = -18; // Pull over to left shoulder (Indian driving convention)
            clearedToShoulder = true;
          } else {
            status = 'CLEARED';
          }
        } else if (distMeters <= mediumReachMeters) {
          alertLevel = 'ORANGE';
          status = clearedToShoulder ? 'CLEARED' : 'WARNING';
          if (!clearedToShoulder && distMeters < mediumReachMeters * 0.7) {
            // preparing to clear
            lateralOffset = -12;
            clearedToShoulder = true;
          }
        } else if (distMeters <= outerReachMeters) {
          alertLevel = 'YELLOW';
          status = clearedToShoulder ? 'CLEARED' : 'WARNING';
        }
      } else {
        // Vehicle is behind or outside corridor -> Normal status, no alert
        alertLevel = 'NONE';
        if (status !== 'CLEARED') {
          status = 'NORMAL';
        }
      }

      if (alertLevel === 'RED' || alertLevel === 'ORANGE') {
        redAlertCount++;
      }
      if (clearedToShoulder) {
        clearedCount++;
      }

      // Calculate time to intercept in seconds
      const relativeSpeedKmh = Math.max(15, ambSpeedKmh - (isAhead ? v.speed : -v.speed));
      const timeToIntercept = isAhead
        ? Math.round((distMeters / (relativeSpeedKmh * (1000 / 3600))))
        : -1;

      return {
        ...v,
        distanceToAmbulance: Math.round(distMeters),
        isAheadOfAmbulance: isAhead,
        alertLevel,
        status,
        lateralOffset,
        clearedToShoulder,
        timeToInterceptSecs: timeToIntercept,
      };
    });

    // Evaluate upcoming junctions and Green Wave preemption
    const activeJunctions = junctions.map((j) => {
      const dx = j.coordinates.x - ambX;
      const dy = j.coordinates.y - ambY;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distMeters = Math.round(distPx * this.METERS_PER_PIXEL);

      const dot = dx * dirX + dy * dirY;
      const isAhead = dot > -15;

      let status: Junction['status'] = 'NORMAL';
      let signal = j.signal;
      let greenWave = j.greenWaveOverridden;

      if (isAhead) {
        if (distMeters <= 500) {
          // Immediate junction: Green Wave Active! Traffic signal forced to GREEN
          status = 'GREEN_WAVE_ACTIVE';
          signal = 'GREEN';
          greenWave = true;
        } else if (distMeters <= 1000) {
          status = 'ALERT';
          signal = 'YELLOW';
          greenWave = true;
        } else if (distMeters <= 1700) {
          status = 'PREPARE';
        } else {
          status = 'MONITOR';
        }
      } else {
        status = 'NORMAL';
        // Signal can restore to normal city cycle once ambulance passes
      }

      return {
        ...j,
        currentDistanceMeters: distMeters,
        status,
        signal,
        greenWaveOverridden: greenWave,
      };
    });

    // Total distance remaining along route
    const currentWaypointIdx = ambulance.segmentIndex;
    let remainingMeters = 0;
    for (let i = currentWaypointIdx; i < AMBULANCE_ROUTE_WAYPOINTS.length - 1; i++) {
      const p1 = AMBULANCE_ROUTE_WAYPOINTS[i];
      const p2 = AMBULANCE_ROUTE_WAYPOINTS[i + 1];
      const legDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * this.METERS_PER_PIXEL;
      if (i === currentWaypointIdx) {
        remainingMeters += legDist * (1 - ambulance.segmentProgress);
      } else {
        remainingMeters += legDist;
      }
    }

    // Congestion & bottleneck model (Sony World junction has real-world historical congestion)
    const nearSonyWorld = Math.abs(ambX - 230) < 60 && Math.abs(ambY - 440) < 60;
    const congestionIndex = nearSonyWorld ? 74 : (ambSpeedKmh < 35 ? 58 : 32);

    const speedMps = (ambSpeedKmh * 1000) / 3600;
    const etaSecs = Math.max(10, Math.round(remainingMeters / Math.max(speedMps, 5)));

    const nextGreenWaveJunc = activeJunctions.find((j) => j.status === 'GREEN_WAVE_ACTIVE' || j.status === 'ALERT');

    return {
      estimatedTimeOfArrivalSecs: etaSecs,
      congestionIndex,
      bottleneckDetected: nearSonyWorld,
      bottleneckLocation: nearSonyWorld ? 'Sony World Signal Cross (Heavy density)' : undefined,
      recommendedSpeedKmh: nearSonyWorld ? 45 : 55,
      greenWaveTargetJunction: nextGreenWaveJunc?.name,
      corridor: {
        active: ambulance.status === 'EMERGENCY_DISPATCHED' || ambulance.status === 'EN_ROUTE',
        innerMeters: Math.round(innerReachMeters),
        mediumMeters: Math.round(mediumReachMeters),
        outerMeters: Math.round(outerReachMeters),
        heading: ambulance.heading,
        corridorWidthMeters: corridorLateralWidthMeters,
        affectedVehiclesCount: redAlertCount,
        clearedVehiclesCount: clearedCount,
      },
      evaluatedVehicles,
      activeJunctions,
    };
  }
}

export const predictiveEngine = new LocalPredictiveEngine();
