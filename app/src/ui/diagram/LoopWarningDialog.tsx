import type React from 'react';
import './LoopWarningDialog.css';

interface LoopWarningDialogProps {
  isOpen: boolean;
  loopStationName: string;
  onClose: () => void;
  onInsertLandmark: () => void;
}

export const LoopWarningDialog: React.FC<LoopWarningDialogProps> = ({
  isOpen,
  loopStationName,
  onClose,
  onInsertLandmark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <dialog className="dialog-container" open aria-labelledby="dialog-title">
        <div className="dialog-header">
          <h3 id="dialog-title">⚠️ Route Loop Detected</h3>
          <button
            type="button"
            onClick={onClose}
            className="close-button"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="dialog-content">
          <p className="warning-message">
            The route returns to <strong>{loopStationName}</strong> creating a circular path.
          </p>

          <div className="info-box">
            <h4>Why is this a problem?</h4>
            <p>
              Routes cannot loop back to a previously visited station because it creates ambiguity
              in the timetable and can cause conflicts in train scheduling.
            </p>
          </div>

          <div className="solution-box">
            <h4>How to fix this:</h4>
            <ol>
              <li>
                <strong>Insert an intermediate landmark</strong> between the stations that form the
                loop
              </li>
              <li>This will create a distinct path segment and break the circular reference</li>
              <li>Alternatively, restructure your route to avoid returning to the same station</li>
            </ol>
          </div>

          <div className="example-box">
            <h4>Example:</h4>
            <div className="example-content">
              <div className="example-item">
                <span className="example-label error">❌ Invalid:</span>
                <span className="example-route">Station A → Station B → Station A</span>
              </div>
              <div className="example-item">
                <span className="example-label success">✓ Valid:</span>
                <span className="example-route">
                  Station A → Station B → Landmark C → Station A
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" onClick={onInsertLandmark} className="action-button primary">
            Insert Intermediate Landmark
          </button>
          <button type="button" onClick={onClose} className="action-button secondary">
            Close
          </button>
        </div>
      </dialog>
    </div>
  );
};
