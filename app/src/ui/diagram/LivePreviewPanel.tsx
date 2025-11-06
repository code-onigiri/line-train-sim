import type React from 'react';
import { useEffect, useRef } from 'react';
import type { DiagramConfig } from '../../models/RouteComponents';
import type { StationOrderItem } from './StationOrderEditor';
import './LivePreviewPanel.css';

interface LivePreviewPanelProps {
  stations: StationOrderItem[];
  diagramConfig: DiagramConfig;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean,
) {
  ctx.fillStyle = isDark ? '#2d3748' : '#ffffff';
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: DiagramConfig,
  stationCount: number,
) {
  ctx.strokeStyle = config.display?.theme === 'dark' ? '#4a5568' : '#e2e8f0';
  ctx.lineWidth = 1;

  const timeScale = config.timeAxis?.scale ?? 1;
  const timeStart = config.timeAxis?.startTime ?? 0;
  const timeEnd = config.timeAxis?.endTime ?? 1440;
  const pixelsPerMinute = 1 / timeScale;

  // Vertical grid lines (time)
  for (let t = timeStart; t <= timeEnd; t += 60) {
    const x = (t - timeStart) * pixelsPerMinute + 50;
    if (x > 50 && x < width - 20) {
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
    }
  }

  // Horizontal grid lines (stations)
  const spacing = config.stationAxis?.spacing ?? 60;
  for (let i = 0; i < stationCount; i++) {
    const y = 50 + i * spacing;
    if (y < height - 20) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
  }
}

function drawTimeMarkers(ctx: CanvasRenderingContext2D, width: number, config: DiagramConfig) {
  const timeScale = config.timeAxis?.scale ?? 1;
  const timeStart = config.timeAxis?.startTime ?? 0;
  const timeEnd = config.timeAxis?.endTime ?? 1440;
  const pixelsPerMinute = 1 / timeScale;

  ctx.fillStyle = config.display?.theme === 'dark' ? '#cbd5e0' : '#4a5568';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';

  for (let t = timeStart; t <= timeEnd; t += 60) {
    const x = (t - timeStart) * pixelsPerMinute + 50;
    if (x > 50 && x < width - 20) {
      const hours = Math.floor(t / 60);
      const mins = t % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      ctx.fillText(timeStr, x, 20);
    }
  }
}

function drawStationLabels(
  ctx: CanvasRenderingContext2D,
  height: number,
  stations: StationOrderItem[],
  config: DiagramConfig,
) {
  ctx.fillStyle = config.display?.theme === 'dark' ? '#e2e8f0' : '#2d3748';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const spacing = config.stationAxis?.spacing ?? 60;
  for (let i = 0; i < stations.length; i++) {
    const y = 50 + i * spacing;
    if (y < height - 20) {
      ctx.fillText(stations[i].name, 45, y);
    }
  }
}

function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean,
) {
  ctx.fillStyle = isDark ? '#cbd5e0' : '#4a5568';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Time →', width / 2, height - 5);

  ctx.save();
  ctx.translate(10, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Stations ↓', 0, 0);
  ctx.restore();
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ stations, diagramConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isDark = diagramConfig.display?.theme === 'dark';

    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height, isDark);

    if (diagramConfig.display?.showGrid) {
      drawGrid(ctx, width, height, diagramConfig, stations.length);
    }

    if (diagramConfig.display?.showTimeMarkers) {
      drawTimeMarkers(ctx, width, diagramConfig);
    }

    drawStationLabels(ctx, height, stations, diagramConfig);
    drawAxisLabels(ctx, width, height, isDark);
  }, [stations, diagramConfig]);

  return (
    <section className="live-preview-panel" aria-label="Diagram preview">
      <div className="preview-header">
        <h3>Live Preview</h3>
        <p className="preview-description">
          Preview updates in real-time as you configure the diagram settings.
        </p>
      </div>

      <div className="preview-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="preview-canvas"
          aria-label="Route diagram preview canvas"
        />
      </div>

      <div className="preview-legend">
        <h4>Legend</h4>
        <ul>
          <li>
            <span className="legend-item">Horizontal axis</span>: Time (minutes)
          </li>
          <li>
            <span className="legend-item">Vertical axis</span>: Station order
          </li>
          <li>
            <span className="legend-item">Grid lines</span>: Help visualize time and station
            positions
          </li>
        </ul>
      </div>
    </section>
  );
};
