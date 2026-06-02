import { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { useSessionState } from './useSessionState.js';

function isInVK() {
  try {
    return /vk_app_id=/.test(window.location.search);
  } catch {
    return false;
  }
}

// Dev-only mock list — used when the app is opened outside of a real VK client
// (e.g. plain browser preview during development) so the leaderboard isn't empty.
const MOCK_FRIENDS = isInVK()
  ? []
  : [
      { id: 101, first_name: 'Мария', last_name: 'Иванова', photo_100: '', score: 0 },
      { id: 102, first_name: 'Дмитрий', last_name: 'Соколов', photo_100: '', score: 0 },
      { id: 103, first_name: 'Анна', last_name: 'Лебедева', photo_100: '', score: 0 },
    ];

export function useVKFriends() {
  const [friends, setFriends] = useSessionState('bottle_friends', MOCK_FRIENDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await bridge.send('VKWebAppGetFriends', { multi: true });
      const list = (res.users || []).map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        photo_100: u.photo_200 || u.photo_100 || '',
        score: 0,
      }));
      setFriends(list);
    } catch (e) {
      setError(e);
      // outside of VK — fall back to dev mocks
      if (!isInVK()) setFriends(MOCK_FRIENDS);
    } finally {
      setLoading(false);
    }
  }

  return { friends, loading, error, load };
}
