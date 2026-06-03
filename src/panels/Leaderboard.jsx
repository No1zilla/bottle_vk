import React, { useEffect, useState } from 'react';
import { Panel } from '@vkontakte/vkui';
import { useVKFriends } from '../hooks/useVKFriends.js';
import { getScore } from '../hooks/useStorage.js';

// Plain digits instead of emoji medals — colored backgrounds (.gold/.silver/.bronze)
// convey the rank reliably even on systems without an emoji font (Windows w/o Segoe UI Emoji).
const RANK = ['1', '2', '3'];

export default function Leaderboard({ id, currentUser }) {
  const { friends, load } = useVKFriends();
  const [myScore, setMyScore] = useState(0);

  useEffect(() => {
    (async () => {
      const s = await getScore();
      setMyScore(s);
    })();
  }, []);

  const myEntry = currentUser
    ? {
        id: currentUser.id,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        photo_100: currentUser.photo_100,
        score: myScore,
        isMe: true,
      }
    : null;

  const friendsList = [...friends];
  if (myEntry && !friendsList.some((f) => f.id === myEntry.id)) {
    friendsList.push(myEntry);
  }
  friendsList.sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <Panel id={id}>
      <div className="panel-head">
        <h1 className="h-display">
          <span className="gradient-text">Рейтинг</span>
        </h1>
        <div className="text-secondary" style={{ marginTop: 6 }}>
          Сравни свои очки с друзьями
        </div>
      </div>

      <div style={{ padding: '0 1rem 0.5rem' }}>
        <button className="btn-ghost" onClick={load}>
          Загрузить друзей из ВК
        </button>
      </div>

      {friendsList.length === 0 && <div className="empty-state">Пока пусто</div>}

      {friendsList.map((p, i) => {
        const photo = p.photo_100 || '';
        const initials = (p.first_name || '?')[0].toUpperCase();
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        return (
          <div
            key={p.id}
            className={`leader-row${p.isMe ? ' is-me' : ''}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`leader-rank ${rankClass}`}>
              {i < 3 ? RANK[i] : i + 1}
            </div>
            <div className="leader-avatar">
              {photo ? <img src={photo} alt="" /> : initials}
            </div>
            <div className="leader-name">
              {p.first_name} {p.last_name || ''}
              {p.isMe && <small>Это вы</small>}
            </div>
            <div className="leader-score">{p.score || 0}</div>
          </div>
        );
      })}

      <div style={{ height: 32 }} />
    </Panel>
  );
}
