import type React from 'react';
import { useState } from 'react';
import type { RouteModel } from '../../models/Route';
import type { ScheduledTrainModel } from '../../models/ScheduledTrain';

/**
 * Props for PreviewPanel component
 */
export interface PreviewPanelProps {
  route: RouteModel;
  scheduledTrains: ScheduledTrainModel[];
  onStartExecution?: () => void;
  onCancelPreview?: () => void;
}

/**
 * UI component for displaying execution preview.
 * Shows scheduled trains and preview summary before execution starts.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  route,
  scheduledTrains,
  onStartExecution,
  onCancelPreview,
}) => {
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  const handleTrainClick = (trainId: string) => {
    setSelectedTrain(trainId === selectedTrain ? null : trainId);
  };

  const selectedTrainData = scheduledTrains.find((t) => t.id === selectedTrain);

  return (
    <div className="preview-panel" style={styles.container}>
      <div style={styles.header}>
        <h2>Execution Preview</h2>
        <div style={styles.routeInfo}>
          <span>Route: {route.name || route.id}</span>
          <span>Trains: {scheduledTrains.length}</span>
        </div>
      </div>

      <div style={styles.trainList}>
        <h3>Scheduled Trains</h3>
        <div style={styles.trainGrid}>
          {scheduledTrains.map((train) => (
            <div
              key={train.id}
              style={{
                ...styles.trainCard,
                ...(selectedTrain === train.id ? styles.trainCardSelected : {}),
              }}
              onClick={() => handleTrainClick(train.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTrainClick(train.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div style={styles.trainHeader}>
                <span style={styles.trainId}>Train {train.id.slice(0, 8)}</span>
                <span style={styles.trainType}>{train.vehicleTypeId}</span>
              </div>
              <div style={styles.trainDetails}>
                <span>Stops: {train.dwellAssignments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTrainData && (
        <div style={styles.detailPanel}>
          <h4>Train Details</h4>
          <div style={styles.detailContent}>
            <p>
              <strong>Train ID:</strong> {selectedTrainData.id}
            </p>
            <p>
              <strong>Vehicle Type:</strong> {selectedTrainData.vehicleTypeId}
            </p>
            <p>
              <strong>Route:</strong> {selectedTrainData.routeId}
            </p>

            {selectedTrainData.dwellAssignments &&
              selectedTrainData.dwellAssignments.length > 0 && (
                <div style={styles.dwellList}>
                  <strong>Dwell Schedule:</strong>
                  <ul>
                    {selectedTrainData.dwellAssignments.map((dwell, idx) => (
                      <li key={`dwell-${dwell.stationId}-${dwell.arrivalTime}-${idx}`}>
                        Station: {dwell.stationId.slice(0, 8)} - Arrival:{' '}
                        {new Date(dwell.arrivalTime * 1000).toLocaleTimeString()} - Departure:{' '}
                        {new Date(dwell.departureTime * 1000).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button
          type="button"
          style={{ ...styles.button, ...styles.cancelButton }}
          onClick={onCancelPreview}
        >
          Cancel
        </button>
        <button
          type="button"
          style={{ ...styles.button, ...styles.startButton }}
          onClick={onStartExecution}
        >
          Start Execution
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  routeInfo: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
  },
  trainList: {
    marginBottom: '20px',
  },
  trainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginTop: '10px',
  },
  trainCard: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  trainCardSelected: {
    border: '2px solid #3498db',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
  },
  trainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  trainId: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trainType: {
    fontSize: '12px',
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  trainDetails: {
    fontSize: '13px',
    color: '#555',
  },
  detailPanel: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #ddd',
    marginBottom: '20px',
  },
  detailContent: {
    fontSize: '14px',
    lineHeight: '1.6',
  },
  dwellList: {
    marginTop: '10px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
};
