import posthog from 'posthog-js';

// PostHog is disabled in local dev (MODE === 'development') and whenever no
// project key is configured. The key/host are baked in at build time via
// `import.meta.env.VITE_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_HOST`.
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

export const isPostHogEnabled = import.meta.env.MODE !== 'development' && Boolean(posthogKey);

export function initPostHog() {
  if (!isPostHogEnabled) {
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Only fire pageviews once we've bootstrapped; we let the router drive them.
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    // Session replay.
    disable_session_recording: false,
    session_recording: {
      // Mask user-entered text by default so we don't record sensitive input
      // (candidate code, credentials, etc.). Loosen per-element with
      // `ph-no-mask` if you want specific fields recorded verbatim.
      maskAllInputs: true,
      maskTextSelector: '[data-ph-mask]',
    },
  });
}

export { posthog };
