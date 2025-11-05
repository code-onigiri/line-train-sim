import { useEffect, useState } from 'react';
import './ValidationFeedback.css';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationMessage {
  id: string;
  severity: ValidationSeverity;
  message: string;
  details?: string;
  timestamp: number;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
}

interface ValidationFeedbackProps {
  messages: ValidationMessage[];
  onDismiss?: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

/**
 * Component for displaying validation messages and error feedback
 * Supports auto-dismiss and manual dismiss for different severity levels
 */
export function ValidationFeedback({
  messages,
  onDismiss,
  position = 'top-right',
}: ValidationFeedbackProps) {
  const [visibleMessages, setVisibleMessages] = useState<ValidationMessage[]>([]);

  useEffect(() => {
    setVisibleMessages(messages);

    // Setup auto-hide timers for messages
    const timers: NodeJS.Timeout[] = [];

    for (const message of messages) {
      if (message.autoHide) {
        const duration = message.autoHideDuration ?? getDefaultDuration(message.severity);
        const timer = setTimeout(() => {
          handleDismiss(message.id);
        }, duration);
        timers.push(timer);
      }
    }

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [messages]);

  const handleDismiss = (id: string) => {
    setVisibleMessages((prev) => prev.filter((m) => m.id !== id));
    onDismiss?.(id);
  };

  if (visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className={`validation-feedback validation-feedback--${position}`}>
      {visibleMessages.map((message) => (
        <ValidationMessageItem
          key={message.id}
          message={message}
          onDismiss={message.dismissible !== false ? handleDismiss : undefined}
        />
      ))}
    </div>
  );
}

function ValidationMessageItem({
  message,
  onDismiss,
}: {
  message: ValidationMessage;
  onDismiss?: (id: string) => void;
}) {
  const iconMap: Record<ValidationSeverity, string> = {
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    success: '✓',
  };

  return (
    <div className={`validation-message validation-message--${message.severity}`} role="alert">
      <div className="validation-message__icon">{iconMap[message.severity]}</div>
      <div className="validation-message__content">
        <div className="validation-message__text">{message.message}</div>
        {message.details && <div className="validation-message__details">{message.details}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="validation-message__dismiss"
          onClick={() => onDismiss(message.id)}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
}

function getDefaultDuration(severity: ValidationSeverity): number {
  switch (severity) {
    case 'error':
      return 10000; // 10 seconds
    case 'warning':
      return 8000; // 8 seconds
    case 'info':
      return 5000; // 5 seconds
    case 'success':
      return 3000; // 3 seconds
  }
}

/**
 * Hook for managing validation messages
 */
export function useValidationMessages() {
  const [messages, setMessages] = useState<ValidationMessage[]>([]);

  const addMessage = (
    severity: ValidationSeverity,
    message: string,
    details?: string,
    options?: {
      dismissible?: boolean;
      autoHide?: boolean;
      autoHideDuration?: number;
    },
  ) => {
    const newMessage: ValidationMessage = {
      id: `${Date.now()}-${Math.random()}`,
      severity,
      message,
      details,
      timestamp: Date.now(),
      dismissible: options?.dismissible ?? true,
      autoHide: options?.autoHide ?? severity !== 'error',
      autoHideDuration: options?.autoHideDuration,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  const showError = (message: string, details?: string) => {
    addMessage('error', message, details, { autoHide: false });
  };

  const showWarning = (message: string, details?: string) => {
    addMessage('warning', message, details);
  };

  const showInfo = (message: string, details?: string) => {
    addMessage('info', message, details);
  };

  const showSuccess = (message: string, details?: string) => {
    addMessage('success', message, details);
  };

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    showError,
    showWarning,
    showInfo,
    showSuccess,
  };
}

/**
 * Validation error factory functions
 */
export const ValidationErrors = {
  landmarkExists: (x: number, y: number): ValidationMessage => ({
    id: `landmark-exists-${Date.now()}`,
    severity: 'error',
    message: 'Landmark already exists at this position',
    details: `Position: (${x.toFixed(1)}, ${y.toFixed(1)})`,
    timestamp: Date.now(),
    dismissible: true,
    autoHide: true,
  }),

  invalidTrack: (reason: string): ValidationMessage => ({
    id: `invalid-track-${Date.now()}`,
    severity: 'error',
    message: 'Cannot create track segment',
    details: reason,
    timestamp: Date.now(),
    dismissible: true,
    autoHide: false,
  }),

  noLandmarkFound: (): ValidationMessage => ({
    id: `no-landmark-${Date.now()}`,
    severity: 'warning',
    message: 'No landmark found near cursor',
    details: 'Place landmarks first before drawing tracks',
    timestamp: Date.now(),
    dismissible: true,
    autoHide: true,
  }),

  invalidArea: (entityType: string): ValidationMessage => ({
    id: `invalid-area-${Date.now()}`,
    severity: 'error',
    message: `Invalid ${entityType} area`,
    details: 'Area must have at least 3 points',
    timestamp: Date.now(),
    dismissible: true,
    autoHide: true,
  }),

  saveSuccess: (itemCount: number): ValidationMessage => ({
    id: `save-success-${Date.now()}`,
    severity: 'success',
    message: 'Map saved successfully',
    details: `${itemCount} items saved`,
    timestamp: Date.now(),
    dismissible: true,
    autoHide: true,
  }),

  loadSuccess: (itemCount: number): ValidationMessage => ({
    id: `load-success-${Date.now()}`,
    severity: 'success',
    message: 'Map loaded successfully',
    details: `${itemCount} items loaded`,
    timestamp: Date.now(),
    dismissible: true,
    autoHide: true,
  }),

  saveFailed: (error: string): ValidationMessage => ({
    id: `save-failed-${Date.now()}`,
    severity: 'error',
    message: 'Failed to save map',
    details: error,
    timestamp: Date.now(),
    dismissible: true,
    autoHide: false,
  }),
};
