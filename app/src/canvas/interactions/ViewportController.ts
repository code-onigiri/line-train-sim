import type { Container } from 'pixi.js';
import type { InteractionEvent } from './InteractionManager';

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
  minScale: number;
  maxScale: number;
}

/**
 * Controls canvas viewport with pan and zoom
 * Supports WASD keys, arrow keys, and pinch-to-zoom gestures
 */
export class ViewportController {
  private state: ViewportState = {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 0.1,
    maxScale: 10,
  };

  private isPanning = false;
  private lastPointerPos = { x: 0, y: 0 };
  private panSpeed = 5;
  private zoomSpeed = 0.1;

  constructor(private container: Container) {}

  /**
   * Handle pointer down for panning
   */
  handlePointerDown(event: InteractionEvent): void {
    // Middle mouse button or space+left click for panning
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      this.isPanning = true;
      this.lastPointerPos = { x: event.point.x, y: event.point.y };
    }
  }

  /**
   * Handle pointer move for panning
   */
  handlePointerMove(event: InteractionEvent): void {
    if (!this.isPanning) {
      return;
    }

    const dx = event.point.x - this.lastPointerPos.x;
    const dy = event.point.y - this.lastPointerPos.y;

    this.pan(dx, dy);

    this.lastPointerPos = { x: event.point.x, y: event.point.y };
  }

  /**
   * Handle pointer up to stop panning
   */
  handlePointerUp(_event: InteractionEvent): void {
    this.isPanning = false;
  }

  /**
   * Handle wheel event for zooming
   */
  handleWheel(event: InteractionEvent): void {
    if (!event.deltaY) {
      return;
    }

    const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
    this.zoom(zoomDelta, event.point.x, event.point.y);
  }

  /**
   * Handle keyboard input for viewport navigation
   */
  handleKeyDown(event: InteractionEvent): void {
    if (!event.key) {
      return;
    }

    const key = event.key.toLowerCase();

    // Pan controls
    switch (key) {
      case 'w':
      case 'arrowup':
        this.pan(0, this.panSpeed * 10);
        break;
      case 's':
      case 'arrowdown':
        this.pan(0, -this.panSpeed * 10);
        break;
      case 'a':
      case 'arrowleft':
        this.pan(this.panSpeed * 10, 0);
        break;
      case 'd':
      case 'arrowright':
        this.pan(-this.panSpeed * 10, 0);
        break;
      // Zoom controls
      case '+':
      case '=':
        this.zoom(this.zoomSpeed * 2, this.container.width / 2, this.container.height / 2);
        break;
      case '-':
      case '_':
        this.zoom(-this.zoomSpeed * 2, this.container.width / 2, this.container.height / 2);
        break;
      // Reset view
      case '0':
        this.resetView();
        break;
    }
  }

  /**
   * Pan the viewport by delta
   */
  private pan(dx: number, dy: number): void {
    this.state.x += dx;
    this.state.y += dy;
    this.applyTransform();
  }

  /**
   * Zoom the viewport around a point
   * @param delta - Zoom delta (positive = zoom in, negative = zoom out)
   * @param centerX - X coordinate to zoom around
   * @param centerY - Y coordinate to zoom around
   */
  private zoom(delta: number, centerX: number, centerY: number): void {
    const oldScale = this.state.scale;
    const newScale = Math.max(this.state.minScale, Math.min(this.state.maxScale, oldScale + delta));

    if (newScale === oldScale) {
      return;
    }

    // Calculate the world position of the cursor before zoom
    const worldX = (centerX - this.state.x) / oldScale;
    const worldY = (centerY - this.state.y) / oldScale;

    // Update scale
    this.state.scale = newScale;

    // Adjust position to keep cursor at the same world position
    this.state.x = centerX - worldX * newScale;
    this.state.y = centerY - worldY * newScale;

    this.applyTransform();
  }

  /**
   * Apply current viewport transform to container
   */
  private applyTransform(): void {
    this.container.position.set(this.state.x, this.state.y);
    this.container.scale.set(this.state.scale, this.state.scale);
  }

  /**
   * Reset viewport to default view
   */
  resetView(): void {
    this.state.x = 0;
    this.state.y = 0;
    this.state.scale = 1;
    this.applyTransform();
  }

  /**
   * Set viewport position
   */
  setPosition(x: number, y: number): void {
    this.state.x = x;
    this.state.y = y;
    this.applyTransform();
  }

  /**
   * Set viewport scale
   */
  setScale(scale: number): void {
    this.state.scale = Math.max(this.state.minScale, Math.min(this.state.maxScale, scale));
    this.applyTransform();
  }

  /**
   * Get current viewport state
   */
  getState(): ViewportState {
    return { ...this.state };
  }

  /**
   * Set zoom limits
   */
  setZoomLimits(minScale: number, maxScale: number): void {
    this.state.minScale = minScale;
    this.state.maxScale = maxScale;
    // Clamp current scale within new limits
    this.state.scale = Math.max(minScale, Math.min(maxScale, this.state.scale));
    this.applyTransform();
  }

  /**
   * Set pan speed
   */
  setPanSpeed(speed: number): void {
    this.panSpeed = speed;
  }

  /**
   * Set zoom speed
   */
  setZoomSpeed(speed: number): void {
    this.zoomSpeed = speed;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.state.x) / this.state.scale,
      y: (screenY - this.state.y) / this.state.scale,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.state.scale + this.state.x,
      y: worldY * this.state.scale + this.state.y,
    };
  }

  /**
   * Fit viewport to bounds
   */
  fitToBounds(minX: number, minY: number, maxX: number, maxY: number, padding = 50): void {
    const width = maxX - minX;
    const height = maxY - minY;

    // Calculate scale to fit
    const scaleX = (this.container.width - 2 * padding) / width;
    const scaleY = (this.container.height - 2 * padding) / height;
    const scale = Math.min(scaleX, scaleY, this.state.maxScale);

    // Center the bounds
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.state.scale = Math.max(this.state.minScale, scale);
    this.state.x = this.container.width / 2 - centerX * this.state.scale;
    this.state.y = this.container.height / 2 - centerY * this.state.scale;

    this.applyTransform();
  }
}
