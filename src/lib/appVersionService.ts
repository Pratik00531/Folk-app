// App Version & In-App Auto-Update Service for FOLK Sādhana
export const CURRENT_APP_VERSION = '1.2.0';
export const CURRENT_BUILD_NUMBER = 120;

export interface AppVersionInfo {
  version: string;
  buildNumber: number;
  releaseDate: string;
  releaseNotes: string[];
  mandatory: boolean;
  apkDownloadUrl?: string;
}

// In-memory or remote latest version details
export const LATEST_VERSION_INFO: AppVersionInfo = {
  version: '1.2.0',
  buildNumber: 120,
  releaseDate: 'October 2026',
  releaseNotes: [
    'Śrīmad Bhāgavatam hearing tracker added to analytics comparison',
    'Level 5 full 10 Cantos with high-res Prabhupada covers',
    'Duolingo-style animated streak counter & celebratory confetti',
    'Dark mode high-contrast color scheme refinement',
    'Supabase cloud synchronization for Guides & Devotees',
    'Instant in-app one-tap version updating system',
  ],
  mandatory: false,
};

export async function checkForAppUpdates(): Promise<{
  updateAvailable: boolean;
  latest: AppVersionInfo;
  current: string;
}> {
  try {
    // Try fetching from static version.json or API route with cache busting
    let res = await fetch(`/version.json?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) {
      res = await fetch(`/api/version?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
    }
    if (res.ok) {
      const remoteInfo: AppVersionInfo = await res.json();
      const hasNewVersion = remoteInfo.buildNumber > CURRENT_BUILD_NUMBER;
      return {
        updateAvailable: hasNewVersion,
        latest: remoteInfo,
        current: CURRENT_APP_VERSION,
      };
    }
  } catch (err) {
    console.warn('Checking remote version failed, falling back to local metadata:', err);
  }

  // Fallback to checking local storage / memory
  const storedVersion = typeof window !== 'undefined' ? localStorage.getItem('folk_app_simulated_update') : null;
  if (storedVersion && storedVersion !== CURRENT_APP_VERSION) {
    return {
      updateAvailable: true,
      latest: {
        ...LATEST_VERSION_INFO,
        version: storedVersion,
        buildNumber: CURRENT_BUILD_NUMBER + 1,
      },
      current: CURRENT_APP_VERSION,
    };
  }

  return {
    updateAvailable: false,
    latest: LATEST_VERSION_INFO,
    current: CURRENT_APP_VERSION,
  };
}

export async function applyAppUpdate(): Promise<void> {
  // 1. Purge all Service Worker registrations
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    } catch (e) {
      console.warn('Failed unregistering service worker:', e);
    }
  }

  // 2. Clear all browser cache storage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    } catch (e) {
      console.warn('Failed clearing caches:', e);
    }
  }

  // 3. Mark current version in localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('folk_app_simulated_update');
    localStorage.setItem('folk_app_installed_version', CURRENT_APP_VERSION);
    // 4. Force hard reload bypassing cache
    window.location.href = window.location.origin + window.location.pathname + '?updated=' + Date.now();
  }
}
