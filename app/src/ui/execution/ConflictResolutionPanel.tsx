import type React from 'react';
import type { ValidationError } from '../../services/validation/ExecutionValidator';

/**
 * Conflict information for display
 */
export interface ConflictInfo {
  stationId: string;
  trainIds: string[];
  type: 'overlap' | 'capacity';
  message: string;
  suggestedResolution?: string;
}

/**
 * Props for ConflictResolutionPanel component
 */
export interface ConflictResolutionPanelProps {
  errors: ValidationError[];
  onResolve?: (errorIndex: number) => void;
  onIgnore?: (errorIndex: number) => void;
  onCancelExecution?: () => void;
}

/**
 * UI component for displaying conflicts and resolution guidance.
 * Shows validation errors and suggests fixes before execution.
 */
export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  errors,
  onResolve,
  onIgnore,
  onCancelExecution,
}) => {
  const conflictErrors = errors.filter((e) => e.type === 'conflict_detected');
  const capacityErrors = errors.filter((e) => e.type === 'capacity_exceeded');
  const otherErrors = errors.filter(
    (e) => e.type !== 'conflict_detected' && e.type !== 'capacity_exceeded',
  );

  const getResolutionGuidance = (error: ValidationError): string => {
    switch (error.type) {
      case 'conflict_detected':
        return 'Adjust train schedules to avoid overlapping dwell times, or assign trains to different stopping tracks.';
      case 'capacity_exceeded':
        return 'Reduce the number of concurrent trains at this station, or add additional stopping tracks.';
      case 'route_incomplete':
        return 'Complete the route configuration by setting start and end points.';
      case 'invalid_schedule':
        return 'Review and fix the train schedule to ensure all dwell assignments are valid.';
      default:
        return 'Review the error details and make necessary corrections.';
    }
  };

  if (errors.length === 0) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✓</div>
        <h3>No Conflicts Detected</h3>
        <p>All validation checks passed. Ready for execution.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>⚠️ Conflicts Detected</h2>
        <p style={styles.subtitle}>
          {errors.length} issue{errors.length !== 1 ? 's' : ''} must be resolved before execution
        </p>
      </div>

      {conflictErrors.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Schedule Conflicts ({conflictErrors.length})</h3>
          {conflictErrors.map((error, idx) => (
            <div key={`conflict-${error.stationId}-${idx}`} style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={styles.errorType}>CONFLICT</span>
                <span style={styles.errorStation}>
                  Station: {error.stationId?.slice(0, 8) || 'Unknown'}
                </span>
              </div>
              <p style={styles.errorMessage}>{error.message}</p>
              <div style={styles.guidance}>
                <strong>Resolution:</strong> {getResolutionGuidance(error)}
              </div>
              <div style={styles.errorActions}>
                {onResolve && (
                  <button type="button" style={styles.resolveButton} onClick={() => onResolve(idx)}>
                    Auto-Resolve
                  </button>
                )}
                {onIgnore && (
                  <button type="button" style={styles.ignoreButton} onClick={() => onIgnore(idx)}>
                    Ignore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {capacityErrors.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Capacity Issues ({capacityErrors.length})</h3>
          {capacityErrors.map((error, idx) => (
            <div key={`capacity-${error.stationId}-${idx}`} style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={{ ...styles.errorType, backgroundColor: '#e74c3c' }}>CAPACITY</span>
                <span style={styles.errorStation}>
                  Station: {error.stationId?.slice(0, 8) || 'Unknown'}
                </span>
              </div>
              <p style={styles.errorMessage}>{error.message}</p>
              <div style={styles.guidance}>
                <strong>Resolution:</strong> {getResolutionGuidance(error)}
              </div>
              <div style={styles.errorActions}>
                {onResolve && (
                  <button
                    type="button"
                    style={styles.resolveButton}
                    onClick={() => onResolve(conflictErrors.length + idx)}
                  >
                    Auto-Resolve
                  </button>
                )}
                {onIgnore && (
                  <button
                    type="button"
                    style={styles.ignoreButton}
                    onClick={() => onIgnore(conflictErrors.length + idx)}
                  >
                    Ignore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {otherErrors.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Other Issues ({otherErrors.length})</h3>
          {otherErrors.map((error, idx) => (
            <div key={`other-${error.type}-${idx}`} style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={{ ...styles.errorType, backgroundColor: '#95a5a6' }}>
                  {error.type.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <p style={styles.errorMessage}>{error.message}</p>
              <div style={styles.guidance}>
                <strong>Resolution:</strong> {getResolutionGuidance(error)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <button type="button" style={styles.cancelButton} onClick={onCancelExecution}>
          Cancel Execution
        </button>
        <p style={styles.footerNote}>
          Resolve all conflicts before starting execution, or use "Ignore" to proceed at your own
          risk.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '1000px',
    margin: '0 auto',
    border: '2px solid #e74c3c',
  },
  successContainer: {
    padding: '40px',
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #28a745',
  },
  successIcon: {
    fontSize: '48px',
    color: '#28a745',
    marginBottom: '10px',
  },
  header: {
    marginBottom: '20px',
    borderBottom: '2px solid #e74c3c',
    paddingBottom: '10px',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginTop: '5px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  errorCard: {
    padding: '15px',
    backgroundColor: '#fff5f5',
    borderRadius: '6px',
    border: '1px solid #ffcdd2',
    marginBottom: '15px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  errorType: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#e67e22',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  errorStation: {
    fontSize: '13px',
    color: '#666',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#2c3e50',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  guidance: {
    fontSize: '13px',
    color: '#555',
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  errorActions: {
    display: 'flex',
    gap: '10px',
  },
  resolveButton: {
    padding: '6px 16px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  ignoreButton: {
    padding: '6px 16px',
    backgroundColor: '#95a5a6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '25px',
    paddingTop: '15px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 30px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  footerNote: {
    fontSize: '12px',
    color: '#777',
    textAlign: 'center',
  },
};
