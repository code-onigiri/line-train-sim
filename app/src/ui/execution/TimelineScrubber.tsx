import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Timeline event marker
 */
export interface TimelineEvent {
  time: number; // seconds
  type: 'arrival' | 'departure' | 'stop' | 'conflict';
  label: string;
  trainId?: string;
}

/**
 * Props for TimelineScrubber component
 */
export interface TimelineScrubberProps {
  currentTime: number; // current simulation time in seconds
  totalDuration: number; // total duration in seconds
  events?: TimelineEvent[];
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
  onEventClick?: (event: TimelineEvent) => void;
}

/**
 * UI component for manual time navigation in execution mode.
 * Provides a visual timeline with event markers and scrubbing capability.
 */
export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentTime,
  totalDuration,
  events = [],
  isPlaying = false,
  onSeek,
  onEventClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e.nativeEvent);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleSeek(e);
      }
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSeek = (e: MouseEvent) => {
    if (!scrubberRef.current || !onSeek) return;

    const rect = scrubberRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * totalDuration;

    onSeek(newTime);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventColor = (type: TimelineEvent['type']): string => {
    switch (type) {
      case 'arrival':
        return '#27ae60';
      case 'departure':
        return '#3498db';
      case 'stop':
        return '#f39c12';
      case 'conflict':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.currentTime}>{formatTime(currentTime)}</span>
        <span style={styles.totalTime}>{formatTime(totalDuration)}</span>
      </div>

      <div ref={scrubberRef} style={styles.scrubber} onMouseDown={handleMouseDown}>
        {/* Timeline background */}
        <div style={styles.track}>
          {/* Progress fill */}
          <div
            style={{
              ...styles.progress,
              width: `${progress}%`,
            }}
          />

          {/* Event markers */}
          {events.map((event, idx) => {
            const eventPosition = (event.time / totalDuration) * 100;
            return (
              <div
                key={`event-${event.type}-${event.time}-${idx}`}
                style={{
                  ...styles.eventMarker,
                  left: `${eventPosition}%`,
                  backgroundColor: getEventColor(event.type),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEventClick) {
                    onEventClick(event);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    if (onEventClick) {
                      onEventClick(event);
                    }
                  }
                }}
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
                role="button"
                tabIndex={0}
                aria-label={`${event.label} at ${formatTime(event.time)}`}
              />
            );
          })}

          {/* Playhead */}
          <div
            style={{
              ...styles.playhead,
              left: `${progress}%`,
            }}
          >
            <div style={styles.playheadHandle} />
          </div>
        </div>

        {/* Time markers */}
        <div style={styles.timeMarkers}>
          {Array.from({ length: 11 }).map((_, idx) => {
            const time = (idx / 10) * totalDuration;
            const markerId = `marker-${time.toFixed(2)}`;
            return (
              <div key={markerId} style={styles.timeMarker}>
                <div style={styles.tick} />
                <span style={styles.timeLabel}>{formatTime(time)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event tooltip */}
      {hoveredEvent && (
        <div style={styles.tooltip}>
          <strong>{hoveredEvent.label}</strong>
          <div style={styles.tooltipTime}>Time: {formatTime(hoveredEvent.time)}</div>
          {hoveredEvent.trainId && (
            <div style={styles.tooltipTrain}>Train: {hoveredEvent.trainId.slice(0, 8)}</div>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div style={styles.status}>
        {isPlaying ? (
          <span style={styles.playingIndicator}>▶ Playing</span>
        ) : (
          <span style={styles.pausedIndicator}>⏸ Paused</span>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '15px',
    backgroundColor: '#34495e',
    borderRadius: '8px',
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#ecf0f1',
    fontFamily: 'monospace',
  },
  currentTime: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  totalTime: {
    color: '#95a5a6',
  },
  scrubber: {
    position: 'relative',
    cursor: 'pointer',
  },
  track: {
    position: 'relative',
    height: '40px',
    backgroundColor: '#2c3e50',
    borderRadius: '6px',
    overflow: 'visible',
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#3498db',
    opacity: 0.3,
    borderRadius: '6px 0 0 6px',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  },
  eventMarker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 2,
    transition: 'all 0.2s',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '2px',
    backgroundColor: '#e74c3c',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    zIndex: 3,
  },
  playheadHandle: {
    position: 'absolute',
    top: '-6px',
    left: '-6px',
    width: '14px',
    height: '14px',
    backgroundColor: '#e74c3c',
    borderRadius: '50%',
    border: '2px solid #fff',
  },
  timeMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
  },
  timeMarker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  tick: {
    width: '1px',
    height: '5px',
    backgroundColor: '#7f8c8d',
    marginBottom: '3px',
  },
  timeLabel: {
    fontSize: '10px',
    color: '#95a5a6',
    fontFamily: 'monospace',
  },
  tooltip: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#2c3e50',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#ecf0f1',
  },
  tooltipTime: {
    fontSize: '11px',
    color: '#95a5a6',
    marginTop: '3px',
  },
  tooltipTrain: {
    fontSize: '11px',
    color: '#3498db',
    marginTop: '2px',
  },
  status: {
    marginTop: '10px',
    textAlign: 'center',
  },
  playingIndicator: {
    fontSize: '12px',
    color: '#27ae60',
    fontWeight: 'bold',
  },
  pausedIndicator: {
    fontSize: '12px',
    color: '#f39c12',
    fontWeight: 'bold',
  },
};
