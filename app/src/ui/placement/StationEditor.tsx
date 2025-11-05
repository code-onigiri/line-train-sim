import { useState } from 'react';
import type { StationModel } from '../../models/Station';
import './StationEditor.css';

interface StationEditorProps {
  station: StationModel | null;
  onSave?: (station: Partial<StationModel>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

/**
 * UI component for station area selection and platform configuration
 * Allows editing station name, platforms, and stopping tracks
 */
export function StationEditor({ station, onSave, onCancel, onDelete }: StationEditorProps) {
  const [name, setName] = useState(station?.name ?? '');
  const [diagramOrder, setDiagramOrder] = useState(station?.diagramOrderIndex ?? 0);
  const [platforms, setPlatforms] = useState<string[]>(station?.platforms ?? []);
  const [stoppingTracks, setStoppingTracks] = useState<string[]>(station?.stoppingTracks ?? []);
  const [isDrawingArea, setIsDrawingArea] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Station name is required');
      return;
    }

    const updates: Partial<StationModel> = {
      name: name.trim(),
      diagramOrderIndex: diagramOrder,
      platforms,
      stoppingTracks,
    };

    onSave?.(updates);
  };

  const addPlatform = () => {
    const platformId = `platform-${Date.now()}`;
    setPlatforms([...platforms, platformId]);
  };

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const addStoppingTrack = () => {
    const trackId = `track-${Date.now()}`;
    setStoppingTracks([...stoppingTracks, trackId]);
  };

  const removeStoppingTrack = (index: number) => {
    setStoppingTracks(stoppingTracks.filter((_, i) => i !== index));
  };

  const startDrawingArea = () => {
    setIsDrawingArea(true);
    // TODO: Activate area drawing mode in canvas
  };

  return (
    <div className="station-editor">
      <div className="station-editor__header">
        <h3>{station ? 'Edit Station' : 'New Station'}</h3>
      </div>

      <div className="station-editor__body">
        {/* Basic Information */}
        <div className="form-group">
          <label htmlFor="station-name">Station Name *</label>
          <input
            id="station-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter station name"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="diagram-order">Diagram Order Index</label>
          <input
            id="diagram-order"
            type="number"
            value={diagramOrder}
            onChange={(e) => setDiagramOrder(Number(e.target.value))}
            className="form-control"
            min={0}
          />
          <small className="form-text">Order in which station appears in route diagrams</small>
        </div>

        {/* Area Definition */}
        <div className="form-group">
          <div className="form-group__label">Station Area</div>
          <div className="area-controls">
            {station?.areaPolygon?.length ? (
              <div className="area-status">
                <span className="status-badge status-badge--success">
                  Area defined ({station.areaPolygon.length} points)
                </span>
                <button type="button" onClick={startDrawingArea} className="btn btn-secondary">
                  Redraw Area
                </button>
              </div>
            ) : (
              <button type="button" onClick={startDrawingArea} className="btn btn-primary">
                Draw Station Area
              </button>
            )}
          </div>
          {isDrawingArea && (
            <div className="drawing-instructions">
              <p>Click on the canvas to define station area boundary</p>
              <p>Press Enter to finish or Escape to cancel</p>
            </div>
          )}
        </div>

        {/* Platforms */}
        <div className="form-group">
          <div className="form-group__label">Platforms</div>
          <div className="item-list">
            {platforms.length === 0 && <p className="empty-message">No platforms configured</p>}
            {platforms.map((platformId, index) => (
              <div key={platformId} className="item-list__item">
                <span className="item-list__label">Platform {index + 1}</span>
                <span className="item-list__id">{platformId}</span>
                <button
                  type="button"
                  onClick={() => removePlatform(index)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Remove platform ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addPlatform} className="btn btn-secondary">
            Add Platform
          </button>
        </div>

        {/* Stopping Tracks */}
        <div className="form-group">
          <div className="form-group__label">Stopping Tracks</div>
          <div className="item-list">
            {stoppingTracks.length === 0 && (
              <p className="empty-message">No stopping tracks configured</p>
            )}
            {stoppingTracks.map((trackId, index) => (
              <div key={trackId} className="item-list__item">
                <span className="item-list__label">Track {index + 1}</span>
                <span className="item-list__id">{trackId}</span>
                <button
                  type="button"
                  onClick={() => removeStoppingTrack(index)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Remove stopping track ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStoppingTrack} className="btn btn-secondary">
            Add Stopping Track
          </button>
        </div>
      </div>

      <div className="station-editor__footer">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        {station && (
          <button type="button" onClick={onDelete} className="btn btn-danger">
            Delete Station
          </button>
        )}
        <button type="button" onClick={handleSave} className="btn btn-primary">
          Save Station
        </button>
      </div>
    </div>
  );
}
