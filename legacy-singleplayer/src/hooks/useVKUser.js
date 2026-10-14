import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

const MOCK_USER = {
  id: 1,
  first_name: 'Алексей',
  last_name: 'Краснов',
  photo_100: '',
};

function isInVK() {
  try {
    return /vk_app_id=/.test(window.location.search);
  } catch {
    return false;
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function useVKUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const inVK = isInVK();
      // In real VK clients give the bridge plenty of time (mobile webview can be slow).
      // Outside VK fail fast to the mock so the UI doesn't hang.
      const timeoutMs = inVK ? 15000 : 1500;
      // Retry a few times inside VK before giving up — transient bridge stalls happen.
      const maxAttempts = inVK ? 3 : 1;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const data = await withTimeout(bridge.send('VKWebAppGetUserInfo'), timeoutMs);
          if (!cancelled && data && data.id) {
            setUser(data);
            setLoading(false);
          }
          return;
        } catch (e) {
          // try again
        }
      }

      // All attempts failed.
      if (cancelled) return;
      if (!inVK) {
        setUser(MOCK_USER);
      }
      // Inside VK: keep user=null so we keep showing the loader instead of a fake name.
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
