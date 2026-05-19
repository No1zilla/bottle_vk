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
    let appUrl = 'https://vk.com/app54583678';
    try {
      const params = new URLSearchParams(window.location.search);
      const appId = params.get('vk_app_id');
      if (appId) appUrl = `https://vk.com/app${appId}`;
    } catch {}

    const title = `🍾 ${currentUser?.first_name || 'Игрок'}`;
    const sub = `${score} очков в Бутылочке`;

    try {
      await bridge.send('VKWebAppShowStoryBox', {
        background_type: 'none',
        stickers: [
          {
            sticker_type: 'renderable',
            sticker: {
              content_type: 'image',
              url:
                'data:image/svg+xml;utf8,' +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
                    <defs>
                      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#0077FF"/>
                        <stop offset="100%" stop-color="#7B61FF"/>
                      </linearGradient>
                    </defs>
                    <rect width="720" height="1280" fill="url(#bg)"/>
                    <text x="360" y="540" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#fff">${title}</text>
                    <text x="360" y="640" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="600" fill="#fff" opacity="0.9">${sub}</text>
                    <text x="360" y="780" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="500" fill="#fff" opacity="0.85">Сыграй и ты!</text>
                  </svg>`
                ),
              transform: { relation_width: 1, gravity: 'center' },
              can_delete: false,
            },
          },
        ],
        attachment: {
          text: 'open',
          type: 'url',
          url: appUrl,
        },
      });
    } catch (e) {
      console.warn('Share unavailable:', e);
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
      </div>

      <div style={{ height: 40 }} />
    </Panel>
  );
}
