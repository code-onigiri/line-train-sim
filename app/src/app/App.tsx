import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import enUSMessages from '../i18n/locales/en-US.json';
import { getPreferences } from '../services/storage/preferences';

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
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ flex: 1, background: '#f0f0f0' }}>
        <canvas id="placement-canvas" style={{ width: '100%', height: '100%' }} />
      </div>
      <aside style={{ width: '300px', padding: '1rem', borderLeft: '1px solid #ccc' }}>
        <h2>Tools</h2>
        <p>Placement mode tools will appear here</p>
      </aside>
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
