import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
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

  async function share() {
    try {
      await bridge.send('VKWebAppShowWallPostBox', {
        message: `Я набрал ${score} очков в игре "Бутылочка"! Сыграно: ${stats.games}, выполнено заданий: ${stats.tasks}. Присоединяйся!`,
      });
    } catch (e) {
      alert('Поделиться можно только из приложения ВК');
    }
  }

  async function invite() {
    try {
      await bridge.send('VKWebAppShowInviteBox');
    } catch (e) {
      alert('Приглашать друзей можно только из приложения ВК');
    }
  }

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

      <div className="action-list">
        <button className="action-row" onClick={share}>
          <div className="action-icon">📤</div>
          <div className="action-text">Поделиться результатом</div>
        </button>
        <button className="action-row" onClick={invite}>
          <div className="action-icon">👥</div>
          <div className="action-text">Пригласить друзей</div>
        </button>
      </div>

      <div style={{ height: 40 }} />
    </Panel>
  );
}
