import type React from 'react';
import { useEffect, useState } from 'react';
import type { DiagramConfig } from '../../models/RouteComponents';
import { DEFAULT_DIAGRAM_CONFIG } from '../../models/RouteComponents';
import './DiagramSettings.css';

interface DiagramSettingsProps {
  config: DiagramConfig;
  onConfigChange: (config: DiagramConfig) => void;
}

export const DiagramSettings: React.FC<DiagramSettingsProps> = ({ config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState<DiagramConfig>({
    ...DEFAULT_DIAGRAM_CONFIG,
    ...config,
  });

  useEffect(() => {
    onConfigChange(localConfig);
  }, [localConfig, onConfigChange]);

  const updateTimeAxis = (updates: Partial<DiagramConfig['timeAxis']>) => {
    setLocalConfig({
      ...localConfig,
      timeAxis: {
        ...DEFAULT_DIAGRAM_CONFIG.timeAxis,
        ...localConfig.timeAxis,
        ...updates,
      },
    });
  };

  const updateStationAxis = (updates: Partial<DiagramConfig['stationAxis']>) => {
    setLocalConfig({
      ...localConfig,
      stationAxis: {
        ...DEFAULT_DIAGRAM_CONFIG.stationAxis,
        ...localConfig.stationAxis,
        ...updates,
      },
    });
  };

  const updateDisplay = (updates: Partial<DiagramConfig['display']>) => {
    setLocalConfig({
      ...localConfig,
      display: {
        ...DEFAULT_DIAGRAM_CONFIG.display,
        ...localConfig.display,
        ...updates,
      },
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <section className="diagram-settings" aria-label="Diagram configuration settings">
      <div className="diagram-settings-header">
        <h3>Diagram Settings</h3>
        <p className="settings-description">
          Configure the time and station axes for the route diagram.
        </p>
      </div>

      <div className="settings-section">
        <h4>Horizontal Time Axis</h4>
        <div className="settings-group">
          <div className="setting-item">
            <label htmlFor="start-time">
              Start Time (minutes):
              <span className="time-display">
                {formatTime(localConfig.timeAxis?.startTime ?? 0)}
              </span>
            </label>
            <input
              id="start-time"
              type="number"
              min="0"
              max="1440"
              step="15"
              value={localConfig.timeAxis?.startTime ?? 0}
              onChange={(e) => updateTimeAxis({ startTime: Number(e.target.value) })}
              aria-describedby="start-time-help"
            />
            <small id="start-time-help">Simulation start time (0-1440 minutes / 24 hours)</small>
          </div>

          <div className="setting-item">
            <label htmlFor="end-time">
              End Time (minutes):
              <span className="time-display">
                {formatTime(localConfig.timeAxis?.endTime ?? 1440)}
              </span>
            </label>
            <input
              id="end-time"
              type="number"
              min="0"
              max="1440"
              step="15"
              value={localConfig.timeAxis?.endTime ?? 1440}
              onChange={(e) => updateTimeAxis({ endTime: Number(e.target.value) })}
              aria-describedby="end-time-help"
            />
            <small id="end-time-help">Simulation end time (0-1440 minutes / 24 hours)</small>
          </div>

          <div className="setting-item">
            <label htmlFor="time-scale">Time Scale (minutes per pixel):</label>
            <input
              id="time-scale"
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={localConfig.timeAxis?.scale ?? 1}
              onChange={(e) => updateTimeAxis({ scale: Number(e.target.value) })}
              aria-describedby="time-scale-help"
            />
            <small id="time-scale-help">How many minutes each pixel represents (0.1-10)</small>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Vertical Station Axis</h4>
        <div className="settings-group">
          <div className="setting-item">
            <label htmlFor="station-spacing">Station Spacing (pixels):</label>
            <input
              id="station-spacing"
              type="number"
              min="30"
              max="200"
              step="10"
              value={localConfig.stationAxis?.spacing ?? 60}
              onChange={(e) => updateStationAxis({ spacing: Number(e.target.value) })}
              aria-describedby="station-spacing-help"
            />
            <small id="station-spacing-help">Vertical space between stations (30-200 pixels)</small>
          </div>

          <div className="setting-item">
            <p className="info-text">
              <strong>Station Order:</strong> Drag and drop stations in the preview panel to
              reorder.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Display Options</h4>
        <div className="settings-group">
          <div className="setting-item checkbox-item">
            <label htmlFor="show-grid">
              <input
                id="show-grid"
                type="checkbox"
                checked={localConfig.display?.showGrid ?? true}
                onChange={(e) => updateDisplay({ showGrid: e.target.checked })}
              />
              Show Grid Lines
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <label htmlFor="show-time-markers">
              <input
                id="show-time-markers"
                type="checkbox"
                checked={localConfig.display?.showTimeMarkers ?? true}
                onChange={(e) => updateDisplay({ showTimeMarkers: e.target.checked })}
              />
              Show Time Markers
            </label>
          </div>

          <div className="setting-item">
            <label htmlFor="theme">Theme:</label>
            <select
              id="theme"
              value={localConfig.display?.theme ?? 'light'}
              onChange={(e) => updateDisplay({ theme: e.target.value as 'light' | 'dark' })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-summary">
        <h4>Summary</h4>
        <ul className="summary-list">
          <li>
            Time Range: {formatTime(localConfig.timeAxis?.startTime ?? 0)} -{' '}
            {formatTime(localConfig.timeAxis?.endTime ?? 1440)}
          </li>
          <li>
            Duration:{' '}
            {(localConfig.timeAxis?.endTime ?? 1440) - (localConfig.timeAxis?.startTime ?? 0)}{' '}
            minutes
          </li>
          <li>Station Spacing: {localConfig.stationAxis?.spacing ?? 60}px</li>
          <li>Theme: {localConfig.display?.theme ?? 'light'}</li>
        </ul>
      </div>
    </section>
  );
};
