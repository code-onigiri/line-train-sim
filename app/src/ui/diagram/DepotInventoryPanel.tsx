import type React from 'react';
import { useState } from 'react';
import './DepotInventoryPanel.css';

export interface DepotInventoryItem {
  depotId: string;
  depotName: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  quantity: number;
  speedCategory: 'slow' | 'standard' | 'fast';
}

interface Depot {
  id: string;
  name: string;
}

interface VehicleType {
  id: string;
  name: string;
  speedCategory: 'slow' | 'standard' | 'fast';
}

interface DepotInventoryPanelProps {
  depots: Depot[];
  vehicleTypes: VehicleType[];
  inventory: DepotInventoryItem[];
  onInventoryChange: (inventory: DepotInventoryItem[]) => void;
}

export const DepotInventoryPanel: React.FC<DepotInventoryPanelProps> = ({
  depots,
  vehicleTypes,
  inventory,
  onInventoryChange,
}) => {
  const [selectedDepot, setSelectedDepot] = useState<string>(depots[0]?.id || '');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(vehicleTypes[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);

  const addInventoryItem = () => {
    if (!selectedDepot || !selectedVehicleType) return;

    const depot = depots.find((d) => d.id === selectedDepot);
    const vehicleType = vehicleTypes.find((vt) => vt.id === selectedVehicleType);
    if (!depot || !vehicleType) return;

    // Check if item already exists
    const existingIndex = inventory.findIndex(
      (item) => item.depotId === selectedDepot && item.vehicleTypeId === selectedVehicleType,
    );

    let newInventory: DepotInventoryItem[];
    if (existingIndex >= 0) {
      // Update existing item
      newInventory = [...inventory];
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        quantity: newInventory[existingIndex].quantity + quantity,
      };
    } else {
      // Add new item
      newInventory = [
        ...inventory,
        {
          depotId: selectedDepot,
          depotName: depot.name,
          vehicleTypeId: selectedVehicleType,
          vehicleTypeName: vehicleType.name,
          quantity,
          speedCategory: vehicleType.speedCategory,
        },
      ];
    }

    onInventoryChange(newInventory);
    setQuantity(1);
  };

  const removeInventoryItem = (depotId: string, vehicleTypeId: string) => {
    const newInventory = inventory.filter(
      (item) => !(item.depotId === depotId && item.vehicleTypeId === vehicleTypeId),
    );
    onInventoryChange(newInventory);
  };

  const updateQuantity = (depotId: string, vehicleTypeId: string, newQuantity: number) => {
    const newInventory = inventory.map((item) =>
      item.depotId === depotId && item.vehicleTypeId === vehicleTypeId
        ? { ...item, quantity: Math.max(0, newQuantity) }
        : item,
    );
    onInventoryChange(newInventory);
  };

  const getDepotInventory = (depotId: string) => {
    return inventory.filter((item) => item.depotId === depotId);
  };

  return (
    <section className="depot-inventory-panel" aria-label="Depot vehicle inventory">
      <div className="inventory-header">
        <h3>Depot Inventory</h3>
        <p className="inventory-description">
          Assign vehicle types and quantities to depots for route operations.
        </p>
      </div>

      {depots.length === 0 || vehicleTypes.length === 0 ? (
        <div className="empty-state">
          <p>
            {depots.length === 0
              ? 'No depots available. Create depots in placement mode first.'
              : 'No vehicle types available. Define vehicle types first.'}
          </p>
        </div>
      ) : (
        <>
          <div className="inventory-controls">
            <h4>Add Vehicles to Depot</h4>
            <div className="controls-grid">
              <div className="control-item">
                <label htmlFor="select-depot">Depot:</label>
                <select
                  id="select-depot"
                  value={selectedDepot}
                  onChange={(e) => setSelectedDepot(e.target.value)}
                >
                  {depots.map((depot) => (
                    <option key={depot.id} value={depot.id}>
                      {depot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-item">
                <label htmlFor="select-vehicle-type">Vehicle Type:</label>
                <select
                  id="select-vehicle-type"
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                >
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {vt.name} ({vt.speedCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-item">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <button type="button" onClick={addInventoryItem} className="add-button">
                Add Vehicles
              </button>
            </div>
          </div>

          <div className="inventory-list">
            <h4>Current Inventory</h4>
            {inventory.length === 0 ? (
              <p className="no-inventory">No vehicles assigned to any depot yet.</p>
            ) : (
              <div className="depots-grid">
                {depots.map((depot) => {
                  const depotInv = getDepotInventory(depot.id);
                  if (depotInv.length === 0) return null;

                  return (
                    <div key={depot.id} className="depot-card">
                      <h5 className="depot-name">
                        <span className="depot-icon">▣</span>
                        {depot.name}
                      </h5>
                      <ul className="vehicle-list">
                        {depotInv.map((item) => (
                          <li
                            key={`${item.depotId}-${item.vehicleTypeId}`}
                            className="vehicle-item"
                          >
                            <div className="vehicle-info">
                              <span className="vehicle-name">{item.vehicleTypeName}</span>
                              <span className={`speed-badge speed-${item.speedCategory}`}>
                                {item.speedCategory}
                              </span>
                            </div>
                            <div className="vehicle-controls">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.depotId,
                                    item.vehicleTypeId,
                                    Number(e.target.value),
                                  )
                                }
                                className="quantity-input"
                                aria-label={`Quantity of ${item.vehicleTypeName}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeInventoryItem(item.depotId, item.vehicleTypeId)
                                }
                                className="remove-button"
                                aria-label={`Remove ${item.vehicleTypeName}`}
                                title="Remove"
                              >
                                ✕
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};
