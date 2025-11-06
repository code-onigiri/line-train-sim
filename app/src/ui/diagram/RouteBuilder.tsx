import type React from 'react';
import { useEffect, useState } from 'react';
import './RouteBuilder.css';

export interface RouteStop {
  entityId: string;
  entityType: 'station' | 'depot';
  name: string;
}

interface RouteBuilderProps {
  availableStations: Array<{ id: string; name: string }>;
  availableDepots: Array<{ id: string; name: string }>;
  onRouteChange: (stops: RouteStop[]) => void;
  initialStops?: RouteStop[];
}

export const RouteBuilder: React.FC<RouteBuilderProps> = ({
  availableStations,
  availableDepots,
  onRouteChange,
  initialStops = [],
}) => {
  const [stops, setStops] = useState<RouteStop[]>(initialStops);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: 'station' | 'depot';
  } | null>(null);

  useEffect(() => {
    onRouteChange(stops);
  }, [stops, onRouteChange]);

  const addStop = () => {
    if (!selectedEntity) return;

    const entities = selectedEntity.type === 'station' ? availableStations : availableDepots;
    const entity = entities.find((e) => e.id === selectedEntity.id);
    if (!entity) return;

    setStops([
      ...stops,
      {
        entityId: entity.id,
        entityType: selectedEntity.type,
        name: entity.name,
      },
    ]);
    setSelectedEntity(null);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stops.length - 1)
    ) {
      return;
    }

    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    setStops(newStops);
  };

  const isValidRoute = () => {
    if (stops.length < 2) return false;

    // FR-008: Start and end must be station or depot
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    if (!firstStop || !lastStop) return false;

    // Intermediate stops (if any) must be stations only
    for (let i = 1; i < stops.length - 1; i++) {
      if (stops[i].entityType === 'depot') {
        return false;
      }
    }

    return true;
  };

  return (
    <section className="route-builder" aria-label="Route configuration">
      <div className="route-builder-header">
        <h3>Route Configuration</h3>
        {!isValidRoute() && stops.length > 0 && (
          <p className="validation-warning" role="alert">
            Route must have at least 2 stops. Start and end must be station or depot. Intermediate
            stops must be stations only.
          </p>
        )}
      </div>

      <div className="route-builder-controls">
        <div className="entity-selector">
          <label htmlFor="entity-type-select">Add Stop:</label>
          <select
            id="entity-type-select"
            value={selectedEntity?.type || ''}
            onChange={(e) => {
              const type = e.target.value as 'station' | 'depot';
              if (type) {
                const entities = type === 'station' ? availableStations : availableDepots;
                if (entities.length > 0) {
                  setSelectedEntity({ id: entities[0].id, type });
                }
              } else {
                setSelectedEntity(null);
              }
            }}
          >
            <option value="">Select type...</option>
            <option value="station">Station</option>
            <option value="depot">Depot</option>
          </select>

          {selectedEntity && (
            <>
              <select
                id="entity-select"
                value={selectedEntity.id}
                onChange={(e) => {
                  if (selectedEntity) {
                    setSelectedEntity({ ...selectedEntity, id: e.target.value });
                  }
                }}
                aria-label={`Select ${selectedEntity.type}`}
              >
                {(selectedEntity.type === 'station' ? availableStations : availableDepots).map(
                  (entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                onClick={addStop}
                className="add-stop-button"
                aria-label="Add stop to route"
              >
                Add
              </button>
            </>
          )}
        </div>
      </div>

      <ul className="route-stops-list" aria-label="Route stops">
        {stops.length === 0 && (
          <p className="empty-state">
            No stops added yet. Add stations or depots to create a route.
          </p>
        )}

        {stops.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === stops.length - 1;
          const position = isFirst ? 'start' : isLast ? 'end' : 'intermediate';

          return (
            <li key={`${stop.entityId}-${index}`} className={`route-stop ${position}`}>
              <span className="stop-number">{index + 1}</span>
              <span className="stop-type-icon" aria-label={stop.entityType}>
                {stop.entityType === 'station' ? '■' : '▣'}
              </span>
              <span className="stop-name">{stop.name}</span>
              <span className="stop-position-label">({position})</span>

              <div className="stop-actions">
                <button
                  type="button"
                  onClick={() => moveStop(index, 'up')}
                  disabled={isFirst}
                  className="move-button"
                  aria-label="Move stop up"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStop(index, 'down')}
                  disabled={isLast}
                  className="move-button"
                  aria-label="Move stop down"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeStop(index)}
                  className="remove-button"
                  aria-label="Remove stop"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {stops.length >= 2 && (
        <div className="route-validation-status">
          {isValidRoute() ? (
            <output className="validation-success">✓ Valid route configuration</output>
          ) : (
            <span className="validation-error" role="alert">
              ✗ Invalid route: check stop requirements
            </span>
          )}
        </div>
      )}
    </section>
  );
};
