import { useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import type { SelectedEntity } from '../canvas/interactions/SelectionHandler';
import enUSMessages from '../i18n/locales/en-US.json';
import type { DepotModel } from '../models/Depot';
import type { DiagramConfig } from '../models/RouteComponents';
import { DEFAULT_DIAGRAM_CONFIG } from '../models/RouteComponents';
import type { StationModel } from '../models/Station';
import { RouteService } from '../services/diagram/RouteService';
import { VehicleTypeService } from '../services/diagram/VehicleTypeService';
import { DepotService } from '../services/placement/DepotService';
import { LandmarkService } from '../services/placement/LandmarkService';
import { StationService } from '../services/placement/StationService';
import { getPreferences } from '../services/storage/preferences';
import type { ConsistConfig } from '../ui/diagram/ConsistEditor';
import { ConsistEditor } from '../ui/diagram/ConsistEditor';
import type { DepotInventoryItem } from '../ui/diagram/DepotInventoryPanel';
import { DepotInventoryPanel } from '../ui/diagram/DepotInventoryPanel';
import { DiagramSettings } from '../ui/diagram/DiagramSettings';
import { LivePreviewPanel } from '../ui/diagram/LivePreviewPanel';
import { RouteBuilder, type RouteStop } from '../ui/diagram/RouteBuilder';
import { StationOrderEditor } from '../ui/diagram/StationOrderEditor';
import { ConflictResolutionPanel } from '../ui/execution/ConflictResolutionPanel';
import { ExecutionCanvas } from '../ui/execution/ExecutionCanvas';
import { ExecutionControls } from '../ui/execution/ExecutionControls';
import { PreviewPanel } from '../ui/execution/PreviewPanel';
import { TimelineScrubber } from '../ui/execution/TimelineScrubber';
import { DepotEditor } from '../ui/placement/DepotEditor';
import { PlacementCanvas } from '../ui/placement/PlacementCanvas';
import { type PlacementTool, PlacementToolbar } from '../ui/placement/PlacementToolbar';
import { StationEditor } from '../ui/placement/StationEditor';

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

  // Initialize services
  const stationService = useMemo(() => new StationService(), []);
  const depotService = useMemo(() => new DepotService(), []);

  // Get selected station or depot for editing
  const selectedStation = useMemo(() => {
    const stationSelection = selection.find((s) => s.type === 'station');
    if (!stationSelection) return null;
    return stationService.getById(stationSelection.id);
  }, [selection, stationService]);

  const selectedDepot = useMemo(() => {
    const depotSelection = selection.find((s) => s.type === 'depot');
    if (!depotSelection) return null;
    return depotService.getById(depotSelection.id);
  }, [selection, depotService]);

  const handleStationSave = (updates: Partial<StationModel>) => {
    if (!selectedStation) return;
    stationService.update(selectedStation.id, updates);
    setStatusMessage(`Station "${updates.name ?? selectedStation.name}" updated`);
  };

  const handleStationDelete = () => {
    if (!selectedStation) return;
    stationService.delete(selectedStation.id);
    setSelection([]);
    setStatusMessage('Station deleted');
  };

  const handleDepotSave = (updates: Partial<DepotModel>) => {
    if (!selectedDepot) return;
    depotService.update(selectedDepot.id, updates);
    setStatusMessage(`Depot "${updates.name ?? selectedDepot.name}" updated`);
  };

  const handleDepotDelete = () => {
    if (!selectedDepot) return;
    depotService.delete(selectedDepot.id);
    setSelection([]);
    setStatusMessage('Depot deleted');
  };

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
            overflowY: 'auto',
          }}
        >
          {selectedStation ? (
            <StationEditor
              station={selectedStation}
              onSave={handleStationSave}
              onCancel={() => setSelection([])}
              onDelete={handleStationDelete}
            />
          ) : selectedDepot ? (
            <DepotEditor
              depot={selectedDepot}
              onSave={handleDepotSave}
              onCancel={() => setSelection([])}
              onDelete={handleDepotDelete}
            />
          ) : (
            <>
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
                <ul
                  style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', rowGap: '0.35rem' }}
                >
                  <li>Use the Landmark tool to drop anchor points before drawing tracks.</li>
                  <li>Select two landmarks in Track mode to connect them.</li>
                  <li>Use Delete to remove the current selection.</li>
                  <li>Select a station or depot to edit its properties.</li>
                </ul>
              </section>
            </>
          )}

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
  const [stationOrder, setStationOrder] = useState<string[]>([]);
  const [consist, setConsist] = useState<ConsistConfig | null>(null);
  const [depotInventory, setDepotInventory] = useState<DepotInventoryItem[]>([]);

  // Initialize services
  const stationService = useMemo(() => new StationService(), []);
  const depotService = useMemo(() => new DepotService(), []);
  const vehicleTypeService = useMemo(() => new VehicleTypeService(), []);

  // Get available stations and depots
  const availableStations = useMemo(
    () => stationService.getAll().map((s) => ({ id: s.id, name: s.name })),
    [stationService],
  );

  const availableDepots = useMemo(
    () => depotService.getAll().map((d) => ({ id: d.id, name: d.name })),
    [depotService],
  );

  const availableVehicleTypes = useMemo(
    () =>
      vehicleTypeService.getAll().map((vt) => ({
        id: vt.id,
        name: vt.name,
        lengthMeters: vt.lengthMeters,
        maxSpeedKmh: vt.maxSpeedKmh,
        speedCategory: vt.speedCategory,
      })),
    [vehicleTypeService],
  );

  const orderedStations = useMemo(() => {
    const stations = routeStops
      .filter((s) => s.entityType === 'station')
      .map((s) => ({
        id: s.entityId,
        name: s.name,
        order: stationOrder.indexOf(s.entityId),
      }));
    return stations.sort((a, b) => {
      if (a.order === -1) return 1;
      if (b.order === -1) return -1;
      return a.order - b.order;
    });
  }, [routeStops, stationOrder]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        gap: '1rem',
        overflowY: 'auto',
      }}
    >
      <h2>Diagram Configuration</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            stations={orderedStations}
            onOrderChange={(stations) => setStationOrder(stations.map((s) => s.id))}
          />
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Depot Inventory</h3>
          <DepotInventoryPanel
            depots={availableDepots}
            vehicleTypes={availableVehicleTypes}
            inventory={depotInventory}
            onInventoryChange={setDepotInventory}
          />
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
          <h3>Consist Configuration</h3>
          {availableVehicleTypes.length > 0 ? (
            <ConsistEditor
              vehicleTypes={availableVehicleTypes}
              onConsistChange={setConsist}
              initialConsist={consist ?? undefined}
            />
          ) : (
            <p>No vehicle types available. Create vehicle types first.</p>
          )}
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
        <div
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '4px',
            gridColumn: 'span 2',
            minHeight: '300px',
          }}
        >
          <h3>Live Preview</h3>
          <LivePreviewPanel stations={orderedStations} diagramConfig={diagramConfig} />
        </div>
      </div>
      <div style={{ padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Route Summary:</strong> {routeStops.length} stops configured
        {consist && ` | Consist: ${consist.name} (${consist.carCount} cars)`}
        {depotInventory.length > 0 &&
          ` | Total vehicles: ${depotInventory.reduce((sum, item) => sum + item.quantity, 0)}`}
      </div>
    </div>
  );
}

function ExecutionView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeScale, setTimeScale] = useState(1.0);
  const [simulationTime, setSimulationTime] = useState(0);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Array<{ type: string; message: string }>
  >([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const totalDuration = 3600; // 1 hour simulation

  const handlePlay = () => {
    // Check for validation errors before starting
    if (validationErrors.length > 0) {
      setShowConflicts(true);
      return;
    }
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  const handleStop = () => {
    setIsPlaying(false);
    setSimulationTime(0);
  };

  const handleTrainSelect = (trainId: string) => {
    setSelectedTrainId(trainId);
  };

  // Sample scheduled trains for demonstration
  const scheduledTrains = [];

  // For demonstration, add a sample validation error if no trains
  // In real implementation, this would come from ExecutionValidator
  const hasConflicts = validationErrors.length > 0;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h2>Execution Preview</h2>
        {hasConflicts && (
          <div
            style={{
              padding: '0.5rem',
              marginBottom: '0.5rem',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
            }}
          >
            <strong>⚠ Warning:</strong> Validation errors detected.{' '}
            <button
              type="button"
              onClick={() => setShowConflicts(!showConflicts)}
              style={{
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showConflicts ? 'Hide' : 'Show'} details
            </button>
          </div>
        )}
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
      {showConflicts && validationErrors.length > 0 && (
        <div style={{ padding: '1rem', borderBottom: '1px solid #ccc', background: '#f8f9fa' }}>
          <ConflictResolutionPanel
            errors={validationErrors}
            onResolve={(index) => {
              const newErrors = [...validationErrors];
              newErrors.splice(index, 1);
              setValidationErrors(newErrors);
            }}
            onIgnore={(index) => {
              const newErrors = [...validationErrors];
              newErrors.splice(index, 1);
              setValidationErrors(newErrors);
            }}
            onCancelExecution={() => setShowConflicts(false)}
          />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <PreviewPanel scheduledTrains={scheduledTrains} onTrainSelect={handleTrainSelect} />
          <div style={{ flex: 1, position: 'relative', background: '#f5f5f5' }}>
            <ExecutionCanvas
              scheduledTrains={scheduledTrains}
              simulationTime={simulationTime}
              isPlaying={isPlaying}
              selectedTrainId={selectedTrainId}
              onTrainClick={handleTrainSelect}
            />
          </div>
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid #ccc' }}>
          <TimelineScrubber
            currentTime={simulationTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            onSeek={setSimulationTime}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
