import { useState, useEffect } from 'react';

/**
 * Like useState, but persists to sessionStorage.
 * Survives tab switches inside the same VK Mini App session,
 * but resets when the user fully closes the VK tab.
 */
export function useSessionState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}
