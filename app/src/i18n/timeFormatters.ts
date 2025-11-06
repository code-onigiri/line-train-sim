/**
 * Time formatting utilities for diagram axis and display
 * Provides locale-specific time formatting for the diagram time axis
 */

/**
 * Format time in minutes to HH:MM format
 * @param minutes - Time in minutes (e.g., 90 for 01:30)
 * @param locale - Locale code (e.g., 'en-US', 'ja-JP')
 * @returns Formatted time string
 */
export function formatMinutesToTime(minutes: number, locale = 'en-US'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Use Intl.NumberFormat for locale-specific formatting
  const hourFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });
  const minFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });

  return `${hourFormat.format(hours)}:${minFormat.format(mins)}`;
}

/**
 * Format seconds to MM:SS format
 * @param seconds - Time in seconds
 * @param locale - Locale code
 * @returns Formatted time string
 */
export function formatSecondsToTime(seconds: number, locale = 'en-US'): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const minFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });
  const secFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });

  return `${minFormat.format(minutes)}:${secFormat.format(secs)}`;
}

/**
 * Format time in milliseconds to HH:MM:SS format
 * @param milliseconds - Time in milliseconds
 * @param locale - Locale code
 * @returns Formatted time string
 */
export function formatMillisecondsToTime(milliseconds: number, locale = 'en-US'): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hourFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });
  const minFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });
  const secFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });

  return `${hourFormat.format(hours)}:${minFormat.format(minutes)}:${secFormat.format(seconds)}`;
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @param locale - Locale code
 * @returns Formatted duration string (e.g., "1h 30m" or "1時間30分")
 */
export function formatDuration(minutes: number, locale = 'en-US'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale.startsWith('ja')) {
    if (hours > 0 && mins > 0) {
      return `${hours}時間${mins}分`;
    }
    if (hours > 0) {
      return `${hours}時間`;
    }
    return `${mins}分`;
  }

  // Default to English format
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format time scale multiplier
 * @param scale - Time scale (e.g., 1.0, 2.0, 0.5)
 * @param locale - Locale code
 * @returns Formatted scale string (e.g., "1.0x" or "2.0倍")
 */
export function formatTimeScale(scale: number, locale = 'en-US'): string {
  const scaleFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  if (locale.startsWith('ja')) {
    return `${scaleFormat.format(scale)}倍`;
  }

  return `${scaleFormat.format(scale)}x`;
}

/**
 * Parse time string (HH:MM) to minutes
 * @param timeString - Time string in HH:MM format
 * @returns Time in minutes or null if invalid
 */
export function parseTimeToMinutes(timeString: string): number | null {
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Get time scale presets for UI
 * @returns Array of common time scale values with labels
 */
export function getTimeScalePresets(locale = 'en-US'): Array<{ value: number; label: string }> {
  const presets = [
    { value: 0.1, label: formatTimeScale(0.1, locale) },
    { value: 0.25, label: formatTimeScale(0.25, locale) },
    { value: 0.5, label: formatTimeScale(0.5, locale) },
    { value: 1.0, label: formatTimeScale(1.0, locale) },
    { value: 2.0, label: formatTimeScale(2.0, locale) },
    { value: 5.0, label: formatTimeScale(5.0, locale) },
  ];

  return presets;
}
