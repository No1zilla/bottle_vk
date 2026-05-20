import React, { useEffect, useState } from 'react';
import { Panel } from '@vkontakte/vkui';
import { getScore, getStats } from '../hooks/useStorage.js';

export default function Profile({ id, currentUser }) {
  const [score, setScoreState] = useState(0);
  const [stats, setStats] = useState({ games: 0, tasks: 0 });

  useEffect(() => {
    (async () => {
      setScoreState(await getScore());
      setStats(await getStats());
    })();
  }, []);

  if (!currentUser) {
    return (
      <Panel id={id}>
        <div className="empty-state">Загрузка профиля...</div>
      </Panel>
    );
  }

  const initials = (currentUser.first_name || '?')[0].toUpperCase();
  const photo = currentUser.photo_100 || '';

  return (
    <Panel id={id}>
      <div className="panel-head">
        <h1 className="h-display">
          <span className="gradient-text">Профиль</span>
        </h1>
      </div>

      <div className="profile-hero">
        <div className="avatar-ring">
          <div className="avatar-inner">
            {photo ? <img src={photo} alt="" /> : initials}
          </div>
        </div>
        <h2 className="h-section" style={{ textAlign: 'center', marginBottom: 6 }}>
          {currentUser.first_name} {currentUser.last_name || ''}
        </h2>
        <div className="text-secondary">Игрок «Бутылочки»</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.games}</div>
          <div className="stat-label">Игр</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.tasks}</div>
          <div className="stat-label">Заданий</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{score}</div>
          <div className="stat-label">Очков</div>
        </div>
      </div>

      <div style={{ height: 40 }} />
    </Panel>
  );
}
