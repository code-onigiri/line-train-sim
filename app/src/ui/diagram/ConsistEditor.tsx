import type React from 'react';
import { useState } from 'react';
import './ConsistEditor.css';

export interface ConsistConfig {
  id?: string;
  name: string;
  vehicleTypeId: string;
  carCount: number;
  speedCategory: 'slow' | 'standard' | 'fast';
}

interface VehicleType {
  id: string;
  name: string;
  lengthMeters: number;
  maxSpeedKmh: number;
}

interface ConsistEditorProps {
  vehicleTypes: VehicleType[];
  onConsistChange: (consist: ConsistConfig) => void;
  initialConsist?: ConsistConfig;
}

export const ConsistEditor: React.FC<ConsistEditorProps> = ({
  vehicleTypes,
  onConsistChange,
  initialConsist,
}) => {
  const [consist, setConsist] = useState<ConsistConfig>(
    initialConsist ?? {
      name: 'New Consist',
      vehicleTypeId: vehicleTypes[0]?.id || '',
      carCount: 1,
      speedCategory: 'standard',
    },
  );

  const updateConsist = (updates: Partial<ConsistConfig>) => {
    const newConsist = { ...consist, ...updates };
    setConsist(newConsist);
    onConsistChange(newConsist);
  };

  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === consist.vehicleTypeId);
  const totalLength = selectedVehicleType ? selectedVehicleType.lengthMeters * consist.carCount : 0;

  return (
    <section className="consist-editor" aria-label="Train consist configuration">
      <div className="consist-editor-header">
        <h3>Consist Configuration</h3>
        <p className="editor-description">
          Configure the train composition, car counts, and speed profiles.
        </p>
      </div>

      {vehicleTypes.length === 0 ? (
        <div className="empty-state">
          <p>No vehicle types available. Please define vehicle types first.</p>
        </div>
      ) : (
        <div className="consist-form">
          <div className="form-group">
            <label htmlFor="consist-name">Consist Name:</label>
            <input
              id="consist-name"
              type="text"
              value={consist.name}
              onChange={(e) => updateConsist({ name: e.target.value })}
              placeholder="Enter consist name..."
              aria-describedby="consist-name-help"
            />
            <small id="consist-name-help">A descriptive name for this train consist</small>
          </div>

          <div className="form-group">
            <label htmlFor="vehicle-type">Vehicle Type:</label>
            <select
              id="vehicle-type"
              value={consist.vehicleTypeId}
              onChange={(e) => updateConsist({ vehicleTypeId: e.target.value })}
              aria-describedby="vehicle-type-help"
            >
              {vehicleTypes.map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name} ({vt.lengthMeters}m, max {vt.maxSpeedKmh}km/h)
                </option>
              ))}
            </select>
            <small id="vehicle-type-help">Select the type of train cars</small>
          </div>

          <div className="form-group">
            <label htmlFor="car-count">
              Number of Cars:
              <span className="count-badge">{consist.carCount}</span>
            </label>
            <input
              id="car-count"
              type="range"
              min="1"
              max="20"
              value={consist.carCount}
              onChange={(e) => updateConsist({ carCount: Number(e.target.value) })}
              aria-describedby="car-count-help"
            />
            <div className="range-labels">
              <span>1</span>
              <span>20</span>
            </div>
            <small id="car-count-help">Number of cars in this consist (1-20)</small>
          </div>

          <div className="form-group">
            <label htmlFor="speed-category">Speed Category:</label>
            <select
              id="speed-category"
              value={consist.speedCategory}
              onChange={(e) =>
                updateConsist({ speedCategory: e.target.value as ConsistConfig['speedCategory'] })
              }
              aria-describedby="speed-category-help"
            >
              <option value="slow">Slow (local/stopping service)</option>
              <option value="standard">Standard (regular service)</option>
              <option value="fast">Fast (express/limited stops)</option>
            </select>
            <small id="speed-category-help">Operating speed profile for this consist</small>
          </div>

          <div className="consist-summary">
            <h4>Consist Summary</h4>
            <dl className="summary-details">
              <div className="detail-row">
                <dt>Name:</dt>
                <dd>{consist.name}</dd>
              </div>
              <div className="detail-row">
                <dt>Vehicle Type:</dt>
                <dd>{selectedVehicleType?.name || 'Not selected'}</dd>
              </div>
              <div className="detail-row">
                <dt>Number of Cars:</dt>
                <dd>{consist.carCount}</dd>
              </div>
              <div className="detail-row">
                <dt>Total Length:</dt>
                <dd>{totalLength.toFixed(1)}m</dd>
              </div>
              <div className="detail-row">
                <dt>Speed Category:</dt>
                <dd className={`speed-${consist.speedCategory}`}>{consist.speedCategory}</dd>
              </div>
              <div className="detail-row">
                <dt>Max Speed:</dt>
                <dd>{selectedVehicleType?.maxSpeedKmh || 0}km/h</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
};
