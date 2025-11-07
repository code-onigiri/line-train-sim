import { useEffect, useRef } from 'react';
import { type PixiApp, destroyPixiApp, getPixiApp } from '../../canvas/renderer/PixiApp';
import { TrainRenderer } from '../../canvas/renderer/TrainRenderer';
import { TurnRenderer } from '../../canvas/renderer/TurnRenderer';
import type { ScheduledTrainModel } from '../../models/ScheduledTrain';

type ExecutionCanvasProps = {
  scheduledTrains: ScheduledTrainModel[];
  simulationTime: number;
  isPlaying: boolean;
  selectedTrainId: string | null;
  onTrainClick?: (trainId: string) => void;
};

/**
 * ExecutionCanvas - Renders trains in execution mode using TrainRenderer and TurnRenderer
 * Displays trains as rectangles on straight tracks and trapezoids when turning
 */
export function ExecutionCanvas({
  scheduledTrains,
  simulationTime,
  isPlaying: _isPlaying,
  selectedTrainId,
  onTrainClick,
}: ExecutionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<ExecutionScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const pixi = getPixiApp();
    let disposed = false;

    pixi
      .initialize(canvas)
      .then(() => {
        if (disposed) {
          return;
        }

        const scene = new ExecutionScene(pixi, { onTrainClick });
        sceneRef.current = scene;
        // Initial render will be handled by the separate effect
      })
      .catch((error) => {
        console.error('Failed to initialize execution canvas', error);
      });

    return () => {
      disposed = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
      destroyPixiApp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTrainClick]);

  // Update trains when simulation time changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateTrains(scheduledTrains, simulationTime);
    }
  }, [scheduledTrains, simulationTime]);

  // Update selection highlight
  useEffect(() => {
    if (sceneRef.current && selectedTrainId) {
      sceneRef.current.highlightTrain(selectedTrainId);
    }
  }, [selectedTrainId]);

  return (
    <canvas
      ref={canvasRef}
      id="execution-canvas"
      style={{ width: '100%', height: '100%' }}
      aria-label="Execution canvas"
    />
  );
}

/**
 * ExecutionScene - Manages train rendering in execution mode
 */
class ExecutionScene {
  private trainRenderer: TrainRenderer;
  private turnRenderer: TurnRenderer;
  private previousSelectedTrainId: string | null = null;

  constructor(
    private pixiApp: PixiApp,
    private callbacks: {
      onTrainClick?: (trainId: string) => void;
    },
  ) {
    const app = pixiApp.getApp();
    this.trainRenderer = new TrainRenderer(app);
    this.turnRenderer = new TurnRenderer(app);
  }

  /**
   * Update train positions based on simulation time
   */
  updateTrains(trains: ScheduledTrainModel[], _simulationTime: number): void {
    // Clear existing trains
    this.trainRenderer.clearAll();
    this.turnRenderer.clearAll();

    // Render each train
    // TODO: Calculate actual positions based on routes and simulation time
    // For now, just render placeholder trains
    for (const train of trains) {
      // Placeholder position calculation
      const x = 200 + Math.random() * 400;
      const y = 200 + Math.random() * 300;
      const rotation = Math.random() * Math.PI * 2;

      this.trainRenderer.renderTrain(train, x, y, rotation);
    }
  }

  /**
   * Highlight a specific train
   */
  highlightTrain(trainId: string): void {
    // Remove previous highlight
    if (this.previousSelectedTrainId) {
      this.trainRenderer.removeHighlight(this.previousSelectedTrainId);
      this.turnRenderer.removeHighlight(this.previousSelectedTrainId);
    }

    // Add new highlight
    this.trainRenderer.highlightTrain(trainId);
    this.turnRenderer.highlightTurn(trainId);
    this.previousSelectedTrainId = trainId;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.trainRenderer.clearAll();
    this.turnRenderer.clearAll();
  }
}
