import { useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import enUSMessages from '../i18n/locales/en-US.json';
import { getPreferences } from '../services/storage/preferences';
import type { SelectedEntity } from '../canvas/interactions/SelectionHandler';
import { PlacementCanvas } from '../ui/placement/PlacementCanvas';
import { PlacementToolbar, type PlacementTool } from '../ui/placement/PlacementToolbar';

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
  const [sceneMetrics, setSceneMetrics] = useState<{ landmarks: number; tracks: number }>(
    () => ({ landmarks: 0, tracks: 0 }),
  );

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
  return (
    <div style={{ width: '100%', height: '100%', padding: '2rem' }}>
      <h2>Diagram Configuration</h2>
      <p>Diagram configuration interface will be implemented in Phase 4</p>
    </div>
  );
}

function ExecutionView() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '2rem' }}>
      <h2>Execution Preview</h2>
      <p>Execution preview interface will be implemented in Phase 5</p>
    </div>
  );
}

export default App;
