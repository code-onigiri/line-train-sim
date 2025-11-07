import type React from 'react';
import { useEffect, useState } from 'react';
import { TimeScaleController } from '../../services/execution/TimeScaleController';

/**
 * Props for ExecutionControls component
 */
export interface ExecutionControlsProps {
  isPlaying: boolean;
  currentTimeScale: number;
  simulationTime: number; // in seconds
  totalDuration?: number; // in seconds
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onTimeScaleChange?: (scale: number) => void;
  onSeek?: (time: number) => void;
}

/**
 * UI component for execution mode controls.
 * Provides playback controls and time scaling (0.1x to 5.0x).
 */
export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  isPlaying,
  currentTimeScale,
  simulationTime,
  totalDuration,
  onPlay,
  onPause,
  onStop,
  onTimeScaleChange,
  onSeek,
}) => {
  const timeScaleController = new TimeScaleController();
  const [selectedPreset, setSelectedPreset] = useState<number>(currentTimeScale);

  useEffect(() => {
    setSelectedPreset(currentTimeScale);
  }, [currentTimeScale]);

  const handleTimeScaleChange = (scale: number) => {
    setSelectedPreset(scale);
    if (onTimeScaleChange) {
      onTimeScaleChange(scale);
    }
  };

  const handleIncreaseSpeed = () => {
    const newScale = timeScaleController.setTimeScale(currentTimeScale + 0.5);
    handleTimeScaleChange(newScale);
  };

  const handleDecreaseSpeed = () => {
    const newScale = timeScaleController.setTimeScale(currentTimeScale - 0.5);
    handleTimeScaleChange(newScale);
  };

  const handlePresetClick = (preset: number) => {
    handleTimeScaleChange(preset);
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

  const presets = [0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0];
  const scaleRange = timeScaleController.getScaleRange();

  return (
    <div style={styles.container}>
      <div style={styles.playbackControls}>
        {!isPlaying ? (
          <button type="button" style={{ ...styles.button, ...styles.playButton }} onClick={onPlay}>
            ▶ Play
          </button>
        ) : (
          <button
            type="button"
            style={{ ...styles.button, ...styles.pauseButton }}
            onClick={onPause}
          >
            ⏸ Pause
          </button>
        )}
        <button type="button" style={{ ...styles.button, ...styles.stopButton }} onClick={onStop}>
          ⏹ Stop
        </button>
      </div>

      <div style={styles.timeDisplay}>
        <div style={styles.timeInfo}>
          <span style={styles.label}>Simulation Time:</span>
          <span style={styles.timeValue}>{formatTime(simulationTime)}</span>
          {totalDuration !== undefined && (
            <span style={styles.timeTotal}>/ {formatTime(totalDuration)}</span>
          )}
        </div>
      </div>

      <div style={styles.speedControls}>
        <div style={styles.speedHeader}>
          <span style={styles.label}>Playback Speed:</span>
          <span style={styles.speedValue}>{currentTimeScale.toFixed(1)}x</span>
        </div>

        <div style={styles.speedAdjust}>
          <button
            type="button"
            style={styles.speedButton}
            onClick={handleDecreaseSpeed}
            disabled={currentTimeScale <= scaleRange.min}
          >
            -
          </button>
          <button
            type="button"
            style={styles.speedButton}
            onClick={handleIncreaseSpeed}
            disabled={currentTimeScale >= scaleRange.max}
          >
            +
          </button>
        </div>

        <div style={styles.presets}>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              style={{
                ...styles.presetButton,
                ...(Math.abs(selectedPreset - preset) < 0.01 ? styles.presetButtonActive : {}),
              }}
              onClick={() => handlePresetClick(preset)}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {totalDuration !== undefined && (
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(simulationTime / totalDuration) * 100}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={simulationTime}
            onChange={(e) => onSeek?.(Number(e.target.value))}
            style={styles.progressSlider}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  playbackControls: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  playButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
    color: '#fff',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
  timeDisplay: {
    padding: '10px',
    backgroundColor: '#34495e',
    borderRadius: '6px',
  },
  timeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '13px',
    color: '#95a5a6',
  },
  timeValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3498db',
    fontFamily: 'monospace',
  },
  timeTotal: {
    fontSize: '14px',
    color: '#95a5a6',
    fontFamily: 'monospace',
  },
  speedControls: {
    padding: '10px',
    backgroundColor: '#34495e',
    borderRadius: '6px',
  },
  speedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  speedValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#3498db',
  },
  speedAdjust: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  speedButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  presets: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  presetButton: {
    flex: '1 0 auto',
    padding: '6px 12px',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    border: '1px solid #7f8c8d',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  presetButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
    fontWeight: 'bold',
  },
  progressBar: {
    position: 'relative',
    height: '30px',
    backgroundColor: '#34495e',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#3498db',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  },
  progressSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
};
