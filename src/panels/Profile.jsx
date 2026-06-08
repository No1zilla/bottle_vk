import React, { useEffect } from 'react';
import { Panel } from '@vkontakte/vkui';
import { getScore, getStats } from '../hooks/useStorage.js';
import { useSessionState } from '../hooks/useSessionState.js';

function pluralGames(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'игра';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'игры';
  return 'игр';
}

export default function Profile({ id, currentUser }) {
  // Cache the last known values in sessionStorage so they don't flash to 0
  // when the user returns to the Profile tab.
  const [score, setScoreState] = useSessionState('bottle_profile_score', 0);
  const [stats, setStats] = useSessionState('bottle_profile_stats', { games: 0, tasks: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getScore();
        if (!cancelled) setScoreState(s);
      } catch {}
      try {
        const st = await getStats();
        if (!cancelled) setStats(st);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!currentUser) {
    return (
      <Panel id={id}>
        <div className="empty-state">Загрузка профиля...</div>
      </Panel>
    );
  }

  const initials = (currentUser.first_name || '?')[0].toUpperCase();
  // Prefer higher-resolution avatar variants to avoid pixelated images.
  const photo =
    currentUser.photo_max_orig ||
    currentUser.photo_max ||
    currentUser.photo_400_orig ||
    currentUser.photo_400 ||
    currentUser.photo_200_orig ||
    currentUser.photo_200 ||
    currentUser.photo_100 ||
    '';

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
          <div className="stat-label">{pluralGames(stats.games)}</div>
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
