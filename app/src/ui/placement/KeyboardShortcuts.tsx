import { useEffect } from 'react';
import type { InteractionEvent } from '../../canvas/interactions/InteractionManager';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Component for managing keyboard shortcuts in placement mode
 * Supports Space toggle, Shift multi-select, and other hotkeys
 */
export function KeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === key;
        const ctrlMatch = s.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = s.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = s.altKey ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for using keyboard shortcuts in placement mode
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === key;
        const ctrlMatch = s.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = s.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = s.altKey ? event.altKey : !event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Convert InteractionEvent to keyboard shortcut action
 */
export function createShortcutFromEvent(
  event: InteractionEvent,
  action: () => void,
): KeyboardShortcut | null {
  if (!event.key) {
    return null;
  }

  return {
    key: event.key,
    description: 'Custom shortcut',
    action,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  };
}

/**
 * Default placement mode keyboard shortcuts
 */
export const defaultPlacementShortcuts: KeyboardShortcut[] = [
  {
    key: ' ',
    description: 'Toggle between placement tools',
    action: () => console.log('Toggle tool'),
  },
  {
    key: 'Escape',
    description: 'Cancel current operation',
    action: () => console.log('Cancel'),
  },
  {
    key: 'Delete',
    description: 'Delete selected entities',
    action: () => console.log('Delete'),
  },
  {
    key: 'Backspace',
    description: 'Delete selected entities',
    action: () => console.log('Delete'),
  },
  {
    key: 'z',
    ctrlKey: true,
    description: 'Undo last action',
    action: () => console.log('Undo'),
  },
  {
    key: 'y',
    ctrlKey: true,
    description: 'Redo last action',
    action: () => console.log('Redo'),
  },
  {
    key: 'a',
    ctrlKey: true,
    description: 'Select all',
    action: () => console.log('Select all'),
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Save map',
    action: () => console.log('Save'),
  },
  {
    key: 'o',
    ctrlKey: true,
    description: 'Open map',
    action: () => console.log('Open'),
  },
];

/**
 * Component to display keyboard shortcuts help
 */
export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  return (
    <div className="keyboard-shortcuts-help">
      <h3>Keyboard Shortcuts</h3>
      <ul>
        {shortcuts.map((shortcut) => {
          const keyCombo = `${shortcut.ctrlKey ? 'ctrl-' : ''}${shortcut.shiftKey ? 'shift-' : ''}${shortcut.altKey ? 'alt-' : ''}${shortcut.key}`;
          return (
            <li key={keyCombo}>
              <kbd>
                {shortcut.ctrlKey && 'Ctrl + '}
                {shortcut.shiftKey && 'Shift + '}
                {shortcut.altKey && 'Alt + '}
                {shortcut.key}
              </kbd>
              <span>{shortcut.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
