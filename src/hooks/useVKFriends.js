import { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

const MOCK_FRIENDS = [
  { id: 101, first_name: 'Мария', last_name: 'Иванова', photo_100: '', score: 240 },
  { id: 102, first_name: 'Дмитрий', last_name: 'Соколов', photo_100: '', score: 180 },
  { id: 103, first_name: 'Анна', last_name: 'Лебедева', photo_100: '', score: 320 },
  { id: 104, first_name: 'Иван', last_name: 'Петров', photo_100: '', score: 90 },
  { id: 105, first_name: 'Ольга', last_name: 'Морозова', photo_100: '', score: 410 },
];

export function useVKFriends() {
  const [friends, setFriends] = useState([]);
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
        score: Math.floor(Math.random() * 500),
      }));
      setFriends(list);
    } catch (e) {
      setError(e);
      setFriends(MOCK_FRIENDS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setFriends(MOCK_FRIENDS);
  }, []);

  return { friends, loading, error, load };
}
