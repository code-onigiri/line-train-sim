import { useEffect, useRef } from 'react';
import type { InteractionEvent } from '../../canvas/interactions/InteractionManager';
import { InteractionManager } from '../../canvas/interactions/InteractionManager';
import type { SelectedEntity } from '../../canvas/interactions/SelectionHandler';
import { SelectionHandler } from '../../canvas/interactions/SelectionHandler';
import { ViewportController } from '../../canvas/interactions/ViewportController';
import { DepotRenderer } from '../../canvas/renderer/DepotRenderer';
import { LandmarkRenderer } from '../../canvas/renderer/LandmarkRenderer';
import { type PixiApp, destroyPixiApp, getPixiApp } from '../../canvas/renderer/PixiApp';
import { StationRenderer } from '../../canvas/renderer/StationRenderer';
import { TrackRenderer } from '../../canvas/renderer/TrackRenderer';
import { DepotService } from '../../services/placement/DepotService';
import { LandmarkService } from '../../services/placement/LandmarkService';
import { StationService } from '../../services/placement/StationService';
import { TrackSegmentService } from '../../services/placement/TrackSegmentService';
import type { PlacementTool } from './PlacementToolbar';

type PlacementCanvasProps = {
  activeTool: PlacementTool;
  onSelectionChange: (selection: SelectedEntity[]) => void;
  onSceneMetrics?: (metrics: { landmarks: number; tracks: number }) => void;
  onNotify?: (message: string) => void;
};

export function PlacementCanvas({
  activeTool,
  onSelectionChange,
  onSceneMetrics,
  onNotify,
}: PlacementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<PlacementScene | null>(null);

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

        const scene = new PlacementScene(pixi, {
          onSelectionChange,
          onSceneMetrics,
          onNotify,
        });
        sceneRef.current = scene;
        scene.bootstrapDemo();
        scene.setTool(activeTool);
      })
      .catch((error) => {
        console.error('Failed to initialise placement canvas', error);
        onNotify?.('Canvas initialisation failed. Check console for details.');
      });

    return () => {
      disposed = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
      destroyPixiApp();
    };
  }, [activeTool, onSelectionChange, onSceneMetrics, onNotify]);

  useEffect(() => {
    sceneRef.current?.setTool(activeTool);
  }, [activeTool]);

  return (
    <canvas
      ref={canvasRef}
      id="placement-canvas"
      style={{ width: '100%', height: '100%' }}
      aria-label="Placement canvas"
    />
  );
}

class PlacementScene {
  private landmarkService = new LandmarkService();
  private stationService = new StationService();
  private depotService = new DepotService();
  private trackService = new TrackSegmentService(this.landmarkService);
  private landmarkRenderer: LandmarkRenderer;
  private trackRenderer: TrackRenderer;
  private stationRenderer: StationRenderer;
  private depotRenderer: DepotRenderer;
  private interactionManager: InteractionManager;
  private selectionHandler: SelectionHandler;
  private viewportController: ViewportController;
  private activeTool: PlacementTool = 'select';
  private pendingTrackStart: string | null = null;

  constructor(
    private pixiApp: PixiApp,
    private callbacks: {
      onSelectionChange: (selection: SelectedEntity[]) => void;
      onSceneMetrics?: (metrics: { landmarks: number; tracks: number }) => void;
      onNotify?: (message: string) => void;
    },
  ) {
    const container = pixiApp.getMainContainer();
    this.landmarkRenderer = new LandmarkRenderer(container);
    this.trackRenderer = new TrackRenderer(container, this.landmarkService);
    this.stationRenderer = new StationRenderer(container);
    this.depotRenderer = new DepotRenderer(container);
    this.interactionManager = new InteractionManager(pixiApp.getApp());
    this.viewportController = new ViewportController(container);
    this.selectionHandler = new SelectionHandler(
      this.landmarkService,
      this.trackService,
      this.stationService,
      this.depotService,
    );

    this.selectionHandler.onSelectionChange((selected) => {
      this.callbacks.onSelectionChange(selected);
    });

    this.interactionManager.on('pointerdown', this.handlePointerDown);
    this.interactionManager.on('pointermove', this.handlePointerMove);
    this.interactionManager.on('pointerup', this.handlePointerUp);
    this.interactionManager.on('wheel', this.handleWheel);
    this.interactionManager.on('keydown', this.handleKeyDown);

    this.callbacks.onSelectionChange([]);
    this.emitMetrics();
  }

  setTool(tool: PlacementTool): void {
    this.activeTool = tool;
    this.pendingTrackStart = null;

    if (tool === 'select') {
      this.selectionHandler.activate({ multiSelect: true, selectDistance: 12 });
    } else {
      this.selectionHandler.deactivate();
    }

    if (tool === 'track') {
      this.callbacks.onNotify?.('Select two landmarks to create a track.');
    }
  }

  bootstrapDemo(): void {
    if (this.landmarkService.count() > 0) {
      return;
    }

    const junction = this.landmarkService.create(220, 200, 0, {
      label: 'Junction',
    });
    const north = this.landmarkService.create(420, 160, 12, { label: 'North Station' });
    const south = this.landmarkService.create(260, 380, -5, { label: 'South Depot' });

    this.trackService.create(junction.id, north.id, 'mainline', { permissibleSpeedKph: 110 });
    this.trackService.create(junction.id, south.id, 'mainline', { permissibleSpeedKph: 80 });

    this.renderAll();
    this.emitMetrics();
    this.callbacks.onNotify?.('Demo map loaded. Use the toolbar to add landmarks or tracks.');
  }

  destroy(): void {
    this.viewportController.destroy();
    this.interactionManager.destroy();
    this.landmarkRenderer.destroy();
    this.trackRenderer.destroy();
    this.stationRenderer.destroy();
    this.depotRenderer.destroy();
    this.selectionHandler.deactivate();
    this.callbacks.onSelectionChange([]);
  }

  private handlePointerDown = (event: InteractionEvent): void => {
    // Check if this is a viewport control action (middle mouse or shift+left)
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      this.viewportController.handlePointerDown(event);
      return;
    }

    switch (this.activeTool) {
      case 'landmark':
        this.createLandmark(event);
        break;
      case 'track':
        this.handleTrackPointerDown(event);
        break;
      case 'select':
        this.selectionHandler.handlePointerDown(event);
        break;
      case 'station':
      case 'depot':
        this.callbacks.onNotify?.(
          'Station and depot drawing are coming soon. Please use landmarks and tracks for now.',
        );
        break;
      default:
        break;
    }

    if (this.activeTool === 'select') {
      this.callbacks.onSelectionChange(this.selectionHandler.getSelection());
    }

    if (this.activeTool === 'landmark' || this.activeTool === 'track') {
      this.renderAll();
      this.emitMetrics();
    }
  };

  private createLandmark(event: InteractionEvent): void {
    const landmark = this.landmarkService.create(event.point.x, event.point.y);
    this.landmarkRenderer.render(landmark, true);
    this.callbacks.onSelectionChange([{ type: 'landmark', id: landmark.id }]);
  }

  private handleTrackPointerDown(event: InteractionEvent): void {
    const target = this.landmarkService.findByPosition(event.point.x, event.point.y, 16);

    if (!target) {
      this.callbacks.onNotify?.('Click near an existing landmark to start or finish a track.');
      return;
    }

    if (!this.pendingTrackStart) {
      this.pendingTrackStart = target.id;
      this.callbacks.onNotify?.('Select a second landmark to finish the track.');
      this.callbacks.onSelectionChange([{ type: 'landmark', id: target.id }]);
      return;
    }

    if (this.pendingTrackStart === target.id) {
      this.callbacks.onNotify?.('Choose a different landmark to create a valid track segment.');
      return;
    }

    const existing = this.trackService
      .getAll()
      .find(
        (segment) =>
          (segment.startLandmarkId === this.pendingTrackStart &&
            segment.endLandmarkId === target.id) ||
          (segment.startLandmarkId === target.id &&
            segment.endLandmarkId === this.pendingTrackStart),
      );

    if (existing) {
      this.callbacks.onNotify?.('A track already exists between those landmarks.');
      this.pendingTrackStart = null;
      return;
    }

    const segment = this.trackService.create(this.pendingTrackStart, target.id, 'mainline');
    this.trackRenderer.render(segment);

    this.callbacks.onSelectionChange([{ type: 'track', id: segment.id }]);
    this.callbacks.onNotify?.('Track created successfully.');
    this.pendingTrackStart = null;
  }

  private handlePointerMove = (event: InteractionEvent): void => {
    // Always handle viewport panning
    this.viewportController.handlePointerMove(event);

    if (this.activeTool !== 'track' || !this.pendingTrackStart) {
      return;
    }

    // Track preview rendering will be added in a future iteration.
    void event;
  };

  private handlePointerUp = (event: InteractionEvent): void => {
    this.viewportController.handlePointerUp(event);
  };

  private handleWheel = (event: InteractionEvent): void => {
    this.viewportController.handleWheel(event);
  };

  private handleKeyDown = (event: InteractionEvent): void => {
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      return;
    }

    if (this.selectionHandler.getSelection().length === 0) {
      return;
    }

    this.selectionHandler.deleteSelected();
    this.callbacks.onSelectionChange([]);
    this.renderAll();
    this.emitMetrics();
    this.callbacks.onNotify?.('Selected entities deleted.');
  };

  private renderAll(): void {
    this.landmarkRenderer.renderAll(this.landmarkService.getAll());
    this.trackRenderer.renderAll(this.trackService.getAll());
    this.stationRenderer.renderAll(this.stationService.getAll());
    this.depotRenderer.renderAll(this.depotService.getAll());
  }

  private emitMetrics(): void {
    if (!this.callbacks.onSceneMetrics) {
      return;
    }

    this.callbacks.onSceneMetrics({
      landmarks: this.landmarkService.count(),
      tracks: this.trackService.count(),
    });
  }
}
