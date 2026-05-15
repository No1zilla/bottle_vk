import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

const MOCK_USER = {
  id: 1,
  first_name: 'Алексей',
  last_name: 'Краснов',
  photo_100: '',
};

export function useVKUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await bridge.send('VKWebAppGetUserInfo');
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
