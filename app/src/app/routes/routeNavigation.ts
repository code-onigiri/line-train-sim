/**
 * Route navigation utilities for managing transitions between
 * placement mode and diagram configuration mode.
 * Per FR-008 and User Story 2 requirements.
 */

export type AppMode = 'placement' | 'diagram' | 'execution';

export interface NavigationState {
  currentMode: AppMode;
  previousMode?: AppMode;
  routeId?: string;
  canNavigate: boolean;
}

/**
 * Navigation manager for handling mode transitions
 */
export class RouteNavigationManager {
  private currentState: NavigationState = {
    currentMode: 'placement',
    canNavigate: true,
  };

  private listeners: Array<(state: NavigationState) => void> = [];

  /**
   * Get the current navigation state
   */
  getState(): NavigationState {
    return { ...this.currentState };
  }

  /**
   * Navigate to a specific mode
   */
  navigateTo(mode: AppMode, routeId?: string): boolean {
    if (!this.currentState.canNavigate) {
      console.warn('Navigation is currently blocked');
      return false;
    }

    // Validate navigation transitions
    if (!this.canTransition(this.currentState.currentMode, mode)) {
      console.warn(`Cannot transition from ${this.currentState.currentMode} to ${mode}`);
      return false;
    }

    // Update state
    this.currentState = {
      currentMode: mode,
      previousMode: this.currentState.currentMode,
      routeId,
      canNavigate: true,
    };

    // Notify listeners
    this.notifyListeners();
    return true;
  }

  /**
   * Go back to the previous mode
   */
  goBack(): boolean {
    if (!this.currentState.previousMode) {
      console.warn('No previous mode to navigate to');
      return false;
    }

    return this.navigateTo(this.currentState.previousMode);
  }

  /**
   * Block navigation (e.g., during unsaved changes)
   */
  blockNavigation(): void {
    this.currentState.canNavigate = false;
  }

  /**
   * Unblock navigation
   */
  unblockNavigation(): void {
    this.currentState.canNavigate = true;
  }

  /**
   * Subscribe to navigation state changes
   */
  subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Validate if a transition is allowed
   */
  private canTransition(from: AppMode, to: AppMode): boolean {
    // Define allowed transitions
    const allowedTransitions: Record<AppMode, AppMode[]> = {
      placement: ['diagram'],
      diagram: ['placement', 'execution'],
      execution: ['diagram'],
    };

    return allowedTransitions[from].includes(to);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }
}

/**
 * Singleton instance for global navigation management
 */
export const navigationManager = new RouteNavigationManager();

/**
 * Hook-like function for subscribing to navigation changes
 */
export function onNavigationChange(callback: (state: NavigationState) => void): () => void {
  return navigationManager.subscribe(callback);
}

/**
 * Navigate from placement mode to diagram mode
 */
export function navigateToDiagram(routeId?: string): boolean {
  return navigationManager.navigateTo('diagram', routeId);
}

/**
 * Navigate from diagram mode to placement mode
 */
export function navigateToPlacement(): boolean {
  return navigationManager.navigateTo('placement');
}

/**
 * Navigate from diagram mode to execution mode
 */
export function navigateToExecution(routeId?: string): boolean {
  return navigationManager.navigateTo('execution', routeId);
}

/**
 * Navigate from execution mode to diagram mode
 */
export function navigateFromExecution(): boolean {
  return navigationManager.navigateTo('diagram');
}
