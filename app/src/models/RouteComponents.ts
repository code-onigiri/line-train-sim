/**
 * Components and sub-entities for Route model
 * Includes RouteStop and DiagramConfig structures
 */

export interface RouteStop {
  /** ID of the station or depot */
  entityId: string;
  /** Type of entity (station or depot) */
  entityType: 'station' | 'depot';
  /** Optional stop sequence index */
  sequence?: number;
  /** Optional dwell duration in seconds (for stations) */
  dwellDurationSeconds?: number;
}

export interface DiagramConfig {
  /** Horizontal time axis settings */
  timeAxis?: {
    /** Start time in simulation minutes */
    startTime: number;
    /** End time in simulation minutes */
    endTime: number;
    /** Time scale for display (minutes per pixel) */
    scale: number;
  };
  /** Vertical station axis settings */
  stationAxis?: {
    /** Ordered list of station IDs for vertical display */
    stationOrder: string[];
    /** Spacing between stations in pixels */
    spacing: number;
  };
  /** Visual display options */
  display?: {
    /** Show grid lines */
    showGrid: boolean;
    /** Show time markers */
    showTimeMarkers: boolean;
    /** Theme (light/dark) */
    theme: 'light' | 'dark';
  };
}

/**
 * Default diagram configuration
 */
export const DEFAULT_DIAGRAM_CONFIG: DiagramConfig = {
  timeAxis: {
    startTime: 0,
    endTime: 1440, // 24 hours in minutes
    scale: 1,
  },
  stationAxis: {
    stationOrder: [],
    spacing: 60,
  },
  display: {
    showGrid: true,
    showTimeMarkers: true,
    theme: 'light',
  },
};
