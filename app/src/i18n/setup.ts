import { type IntlShape, createIntl, createIntlCache } from 'react-intl';
import enUSMessages from './locales/en-US.json';

export type Locale = 'en-US' | 'ja-JP';

const messages: Record<Locale, Record<string, string>> = {
  'en-US': enUSMessages,
  'ja-JP': {}, // To be added in Phase 7
};

// Create cache for performance
const cache = createIntlCache();

let currentIntl: IntlShape;

export function setupIntl(locale: Locale = 'en-US'): IntlShape {
  currentIntl = createIntl(
    {
      locale,
      messages: messages[locale] || messages['en-US'],
    },
    cache,
  );
  return currentIntl;
}

export function getIntl(): IntlShape {
  if (!currentIntl) {
    return setupIntl();
  }
  return currentIntl;
}

export function getSupportedLocales(): Locale[] {
  return ['en-US', 'ja-JP'];
}

export function isLocaleSupported(locale: string): locale is Locale {
  return getSupportedLocales().includes(locale as Locale);
}
