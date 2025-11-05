import type React from 'react';
import './PlacementToolbar.css';

export type PlacementTool = 'select' | 'landmark' | 'track' | 'station' | 'depot';

interface PlacementToolbarProps {
  activeTool: PlacementTool;
  onToolChange: (tool: PlacementTool) => void;
}

export const PlacementToolbar: React.FC<PlacementToolbarProps> = ({ activeTool, onToolChange }) => {
  const tools: Array<{ id: PlacementTool; label: string; icon: string }> = [
    { id: 'select', label: 'Select', icon: '⌖' },
    { id: 'landmark', label: 'Landmark', icon: '●' },
    { id: 'track', label: 'Track', icon: '─' },
    { id: 'station', label: 'Station', icon: '■' },
    { id: 'depot', label: 'Depot', icon: '▣' },
  ];

  return (
    <div className="placement-toolbar" role="toolbar" aria-label="Placement tools">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={`toolbar-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onToolChange(tool.id)}
          aria-pressed={activeTool === tool.id}
          aria-label={tool.label}
          title={tool.label}
        >
          <span className="tool-icon" aria-hidden="true">
            {tool.icon}
          </span>
          <span className="tool-label">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};
