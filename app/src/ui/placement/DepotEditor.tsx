import { useState } from 'react';
import type { DepotModel } from '../../models/Depot';
import './DepotEditor.css';

interface DepotEditorProps {
  depot: DepotModel | null;
  onSave?: (depot: Partial<DepotModel>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

interface InventoryItem {
  vehicleTypeId: string;
  quantity: number;
}

/**
 * UI component for depot area selection and lane configuration
 * Allows editing depot name, stopping lanes, service tracks, and vehicle inventory
 */
export function DepotEditor({ depot, onSave, onCancel, onDelete }: DepotEditorProps) {
  const [name, setName] = useState(depot?.name ?? '');
  const [stoppingLanes, setStoppingLanes] = useState<string[]>(depot?.stoppingLanes ?? []);
  const [serviceTracks, setServiceTracks] = useState<string[]>(depot?.serviceTracks ?? []);
  const [inventory, setInventory] = useState<InventoryItem[]>(depot?.inventory ?? []);
  const [isDrawingArea, setIsDrawingArea] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Depot name is required');
      return;
    }

    const updates: Partial<DepotModel> = {
      name: name.trim(),
      stoppingLanes,
      serviceTracks,
      inventory,
    };

    onSave?.(updates);
  };

  const addStoppingLane = () => {
    const laneId = `lane-${Date.now()}`;
    setStoppingLanes([...stoppingLanes, laneId]);
  };

  const removeStoppingLane = (index: number) => {
    setStoppingLanes(stoppingLanes.filter((_, i) => i !== index));
  };

  const addServiceTrack = () => {
    const trackId = `service-${Date.now()}`;
    setServiceTracks([...serviceTracks, trackId]);
  };

  const removeServiceTrack = (index: number) => {
    setServiceTracks(serviceTracks.filter((_, i) => i !== index));
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      vehicleTypeId: `vehicle-${Date.now()}`,
      quantity: 1,
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (
    index: number,
    field: keyof InventoryItem,
    value: string | number,
  ) => {
    const updated = [...inventory];
    if (field === 'quantity') {
      updated[index] = { ...updated[index], quantity: Number(value) };
    } else {
      updated[index] = { ...updated[index], vehicleTypeId: String(value) };
    }
    setInventory(updated);
  };

  const removeInventoryItem = (index: number) => {
    setInventory(inventory.filter((_, i) => i !== index));
  };

  const startDrawingArea = () => {
    setIsDrawingArea(true);
    // TODO: Activate area drawing mode in canvas
  };

  return (
    <div className="depot-editor">
      <div className="depot-editor__header">
        <h3>{depot ? 'Edit Depot' : 'New Depot'}</h3>
      </div>

      <div className="depot-editor__body">
        {/* Basic Information */}
        <div className="form-group">
          <label htmlFor="depot-name">Depot Name *</label>
          <input
            id="depot-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter depot name"
            className="form-control"
          />
        </div>

        {/* Area Definition */}
        <div className="form-group">
          <div className="form-group__label">Depot Area</div>
          <div className="area-controls">
            {depot?.areaPolygon?.length ? (
              <div className="area-status">
                <span className="status-badge status-badge--success">
                  Area defined ({depot.areaPolygon.length} points)
                </span>
                <button type="button" onClick={startDrawingArea} className="btn btn-secondary">
                  Redraw Area
                </button>
              </div>
            ) : (
              <button type="button" onClick={startDrawingArea} className="btn btn-primary">
                Draw Depot Area
              </button>
            )}
          </div>
          {isDrawingArea && (
            <div className="drawing-instructions">
              <p>Click on the canvas to define depot area boundary</p>
              <p>Press Enter to finish or Escape to cancel</p>
            </div>
          )}
        </div>

        {/* Stopping Lanes */}
        <div className="form-group">
          <div className="form-group__label">Stopping Lanes</div>
          <small className="form-text">Lanes where trains stop for boarding/storage</small>
          <div className="item-list">
            {stoppingLanes.length === 0 && (
              <p className="empty-message">No stopping lanes configured</p>
            )}
            {stoppingLanes.map((laneId, index) => (
              <div key={laneId} className="item-list__item">
                <span className="item-list__label">Lane {index + 1}</span>
                <span className="item-list__id">{laneId}</span>
                <button
                  type="button"
                  onClick={() => removeStoppingLane(index)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Remove stopping lane ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStoppingLane} className="btn btn-secondary">
            Add Stopping Lane
          </button>
        </div>

        {/* Service Tracks */}
        <div className="form-group">
          <div className="form-group__label">Service Tracks</div>
          <small className="form-text">Regular tracks within depot for maintenance/routing</small>
          <div className="item-list">
            {serviceTracks.length === 0 && (
              <p className="empty-message">No service tracks configured</p>
            )}
            {serviceTracks.map((trackId, index) => (
              <div key={trackId} className="item-list__item">
                <span className="item-list__label">Track {index + 1}</span>
                <span className="item-list__id">{trackId}</span>
                <button
                  type="button"
                  onClick={() => removeServiceTrack(index)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Remove service track ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addServiceTrack} className="btn btn-secondary">
            Add Service Track
          </button>
        </div>

        {/* Vehicle Inventory */}
        <div className="form-group">
          <div className="form-group__label">Vehicle Inventory</div>
          <small className="form-text">Assign vehicles to this depot by type and quantity</small>
          <div className="item-list">
            {inventory.length === 0 && <p className="empty-message">No vehicles assigned</p>}
            {inventory.map((item, index) => (
              <div key={`${item.vehicleTypeId}-${index}`} className="inventory-item">
                <div className="inventory-item__field">
                  <label htmlFor={`vehicle-type-${index}`}>Vehicle Type ID</label>
                  <input
                    id={`vehicle-type-${index}`}
                    type="text"
                    value={item.vehicleTypeId}
                    onChange={(e) => updateInventoryItem(index, 'vehicleTypeId', e.target.value)}
                    className="form-control"
                    placeholder="vehicle-type-id"
                  />
                </div>
                <div className="inventory-item__field inventory-item__field--quantity">
                  <label htmlFor={`quantity-${index}`}>Quantity</label>
                  <input
                    id={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateInventoryItem(index, 'quantity', e.target.value)}
                    className="form-control"
                    min={0}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInventoryItem(index)}
                  className="btn btn-danger btn-sm inventory-item__remove"
                  aria-label={`Remove inventory item ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addInventoryItem} className="btn btn-secondary">
            Add Vehicle Type
          </button>
        </div>
      </div>

      <div className="depot-editor__footer">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        {depot && (
          <button type="button" onClick={onDelete} className="btn btn-danger">
            Delete Depot
          </button>
        )}
        <button type="button" onClick={handleSave} className="btn btn-primary">
          Save Depot
        </button>
      </div>
    </div>
  );
}
