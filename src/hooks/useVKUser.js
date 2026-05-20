import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

const MOCK_USER = {
  id: 1,
  first_name: 'Алексей',
  last_name: 'Краснов',
  photo_100: '',
};

function withTimeout(promise, ms = 1500) {
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
      try {
        const data = await withTimeout(bridge.send('VKWebAppGetUserInfo'));
        if (!cancelled) setUser(data);
      } catch (e) {
        if (!cancelled) setUser(MOCK_USER);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
