import React, { useEffect, useState } from 'react';
import { Panel } from '@vkontakte/vkui';
import { useVKFriends } from '../hooks/useVKFriends.js';
import { getScore } from '../hooks/useStorage.js';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ id, currentUser }) {
  const [tab, setTab] = useState('friends');
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
  friendsList.sort((a, b) => b.score - a.score);

  const allList = myEntry ? [myEntry] : [];
  const list = tab === 'friends' ? friendsList : allList;

  return (
    <Panel id={id}>
      <div className="panel-head">
        <h1 className="h-display">
          <span className="gradient-text">Рейтинг</span>
        </h1>
      </div>

      <div className="seg-tabs">
        <button
          className={`seg-tab${tab === 'friends' ? ' active' : ''}`}
          onClick={() => setTab('friends')}
        >
          Друзья
        </button>
        <button
          className={`seg-tab${tab === 'all' ? ' active' : ''}`}
          onClick={() => setTab('all')}
        >
          Все игроки
        </button>
      </div>

      {tab === 'friends' && (
        <div style={{ padding: '0 1rem 0.5rem' }}>
          <button className="btn-ghost" onClick={load}>
            Загрузить друзей из ВК
          </button>
        </div>
      )}

      {list.length === 0 && <div className="empty-state">Пока пусто</div>}

      {list.map((p, i) => {
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
              {i < 3 ? MEDAL[i] : i + 1}
            </div>
            <div className="leader-avatar">
              {photo ? <img src={photo} alt="" /> : initials}
            </div>
            <div className="leader-name">
              {p.first_name} {p.last_name || ''}
              {p.isMe && <small>Это вы</small>}
            </div>
            <div className="leader-score">{p.score}</div>
          </div>
        );
      })}

      <div style={{ height: 32 }} />
    </Panel>
  );
}
