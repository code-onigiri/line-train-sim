import type React from 'react';
import { useState } from 'react';
import './StationOrderEditor.css';

export interface StationOrderItem {
  id: string;
  name: string;
}

interface StationOrderEditorProps {
  stations: StationOrderItem[];
  onOrderChange: (orderedStations: StationOrderItem[]) => void;
}

export const StationOrderEditor: React.FC<StationOrderEditorProps> = ({
  stations,
  onOrderChange,
}) => {
  const [orderedStations, setOrderedStations] = useState<StationOrderItem[]>(stations);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newOrder = [...orderedStations];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    setOrderedStations(newOrder);
    onOrderChange(newOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveStation = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedStations.length) {
      return;
    }

    const newOrder = [...orderedStations];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    setOrderedStations(newOrder);
    onOrderChange(newOrder);
  };

  return (
    <section className="station-order-editor" aria-label="Station order configuration">
      <div className="station-order-header">
        <h3>Station Order</h3>
        <p className="order-description">
          Drag and drop stations to reorder them vertically in the diagram.
        </p>
      </div>

      {orderedStations.length === 0 ? (
        <div className="empty-state">
          <p>No stations in this route. Add stations using the Route Builder.</p>
        </div>
      ) : (
        <ol className="station-list" aria-label="Draggable station list">
          {orderedStations.map((station, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <li
                key={station.id}
                className={`station-item ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
                aria-label={`Station ${index + 1}: ${station.name}`}
              >
                <span className="drag-handle" aria-hidden="true">
                  ⋮⋮
                </span>
                <span className="station-position">{index + 1}</span>
                <span className="station-name">{station.name}</span>
                <div className="station-actions">
                  <button
                    type="button"
                    onClick={() => moveStation(index, index - 1)}
                    disabled={index === 0}
                    className="move-button"
                    aria-label="Move station up"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStation(index, index + 1)}
                    disabled={index === orderedStations.length - 1}
                    className="move-button"
                    aria-label="Move station down"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {orderedStations.length > 0 && (
        <div className="order-info">
          <p>
            <strong>{orderedStations.length}</strong>{' '}
            {orderedStations.length === 1 ? 'station' : 'stations'} in route
          </p>
        </div>
      )}
    </section>
  );
};
