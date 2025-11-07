import { useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import type { SelectedEntity } from '../canvas/interactions/SelectionHandler';
import enUSMessages from '../i18n/locales/en-US.json';
import type { DiagramConfig } from '../models/RouteComponents';
import { DEFAULT_DIAGRAM_CONFIG } from '../models/RouteComponents';
import { RouteService } from '../services/diagram/RouteService';
import { DepotService } from '../services/placement/DepotService';
import { LandmarkService } from '../services/placement/LandmarkService';
import { StationService } from '../services/placement/StationService';
import { getPreferences } from '../services/storage/preferences';
import { DiagramSettings } from '../ui/diagram/DiagramSettings';
import { RouteBuilder, type RouteStop } from '../ui/diagram/RouteBuilder';
import { StationOrderEditor } from '../ui/diagram/StationOrderEditor';
import { ExecutionControls } from '../ui/execution/ExecutionControls';
import { PreviewPanel } from '../ui/execution/PreviewPanel';
import { PlacementCanvas } from '../ui/placement/PlacementCanvas';
import { type PlacementTool, PlacementToolbar } from '../ui/placement/PlacementToolbar';

type AppMode = 'placement' | 'diagram' | 'execution';

function App() {
  const [mode, setMode] = useState<AppMode>('placement');
  const preferences = getPreferences();

  return (
    <IntlProvider locale={preferences.locale} messages={enUSMessages}>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h1>Line Train Simulator</h1>
          <nav style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setMode('placement')}
              disabled={mode === 'placement'}
            >
              Placement
            </button>
            <button type="button" onClick={() => setMode('diagram')} disabled={mode === 'diagram'}>
              Diagram
            </button>
            <button
              type="button"
              onClick={() => setMode('execution')}
              disabled={mode === 'execution'}
            >
              Execution
            </button>
          </nav>
        </header>
        <main style={{ flex: 1, position: 'relative' }}>
          {mode === 'placement' && <PlacementView />}
          {mode === 'diagram' && <DiagramView />}
          {mode === 'execution' && <ExecutionView />}
        </main>
      </div>
    </IntlProvider>
  );
}

function PlacementView() {
  const [activeTool, setActiveTool] = useState<PlacementTool>('select');
  const [selection, setSelection] = useState<SelectedEntity[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sceneMetrics, setSceneMetrics] = useState<{ landmarks: number; tracks: number }>(() => ({
    landmarks: 0,
    tracks: 0,
  }));

  const selectionSummary = useMemo(() => {
    if (selection.length === 0) {
      return 'Nothing selected';
    }

    const counts = selection.reduce<Record<string, number>>((acc, entity) => {
      acc[entity.type] = (acc[entity.type] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }, [selection]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: '1px solid #ddd', padding: '0.5rem 0.75rem' }}>
        <PlacementToolbar activeTool={activeTool} onToolChange={setActiveTool} />
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, background: '#f0f0f0', position: 'relative' }}>
          <PlacementCanvas
            activeTool={activeTool}
            onSelectionChange={setSelection}
            onSceneMetrics={setSceneMetrics}
            onNotify={setStatusMessage}
          />
        </div>
        <aside
          style={{
            width: '320px',
            padding: '1rem',
            borderLeft: '1px solid #ccc',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>Scene Metrics</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: '0.25rem' }}>
              <dt>Landmarks</dt>
              <dd>{sceneMetrics.landmarks}</dd>
              <dt>Tracks</dt>
              <dd>{sceneMetrics.tracks}</dd>
            </dl>
          </section>

          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>Selection</h2>
            <p style={{ margin: 0 }}>{selectionSummary}</p>
          </section>

          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>Tips</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', rowGap: '0.35rem' }}>
              <li>Use the Landmark tool to drop anchor points before drawing tracks.</li>
              <li>Select two landmarks in Track mode to connect them.</li>
              <li>Use Delete to remove the current selection.</li>
            </ul>
          </section>

          {statusMessage && (
            <section>
              <h2 style={{ marginBottom: '0.5rem' }}>Status</h2>
              <p style={{ margin: 0 }}>{statusMessage}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function DiagramView() {
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [diagramConfig, setDiagramConfig] = useState<DiagramConfig>(DEFAULT_DIAGRAM_CONFIG);
  const [_stationOrder, setStationOrder] = useState<string[]>([]);

  // Initialize services
  const stationService = useMemo(() => new StationService(), []);
  const depotService = useMemo(() => new DepotService(), []);

  // Get available stations and depots
  const availableStations = useMemo(
    () => stationService.getAll().map((s) => ({ id: s.id, name: s.name })),
    [stationService],
  );

  const availableDepots = useMemo(
    () => depotService.getAll().map((d) => ({ id: d.id, name: d.name })),
    [depotService],
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        gap: '1rem',
      }}
    >
      <h2>Diagram Configuration</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Route Builder</h3>
          <RouteBuilder
            availableStations={availableStations}
            availableDepots={availableDepots}
            onRouteChange={setRouteStops}
            initialStops={routeStops}
          />
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Station Order</h3>
          <StationOrderEditor
            stations={routeStops
              .filter((s) => s.entityType === 'station')
              .map((s) => ({
                id: s.entityId,
                name: s.name,
                order: 0,
              }))}
            onOrderChange={(stations) => setStationOrder(stations.map((s) => s.id))}
          />
        </div>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '4px',
            gridColumn: 'span 2',
          }}
        >
          <h3>Diagram Settings</h3>
          <DiagramSettings config={diagramConfig} onConfigChange={setDiagramConfig} />
        </div>
      </div>
      <div style={{ padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Route Summary:</strong> {routeStops.length} stops configured
      </div>
    </div>
  );
}

function ExecutionView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeScale, setTimeScale] = useState(1.0);
  const [simulationTime, setSimulationTime] = useState(0);
  const [_selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const totalDuration = 3600; // 1 hour simulation

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleStop = () => {
    setIsPlaying(false);
    setSimulationTime(0);
  };

  const handleTrainSelect = (trainId: string) => {
    setSelectedTrainId(trainId);
    // Future: Update execution canvas to highlight selected train
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h2>Execution Preview</h2>
        <ExecutionControls
          isPlaying={isPlaying}
          currentTimeScale={timeScale}
          simulationTime={simulationTime}
          totalDuration={totalDuration}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onTimeScaleChange={setTimeScale}
          onSeek={setSimulationTime}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <PreviewPanel scheduledTrains={[]} onTrainSelect={handleTrainSelect} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
          }}
        >
          <p style={{ color: '#666' }}>Execution canvas will render trains here</p>
        </div>
      </div>
    </div>
  );
}

export default App;
