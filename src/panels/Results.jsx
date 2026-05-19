import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Panel } from '@vkontakte/vkui';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Results({ id, players, onPlayAgain }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted[0];
  const winnerScore = winner?.score || 0;

  async function share() {
    let appUrl = 'https://vk.com/app54583678';
    try {
      const params = new URLSearchParams(window.location.search);
      const appId = params.get('vk_app_id');
      if (appId) appUrl = `https://vk.com/app${appId}`;
    } catch {}

    const winnerName = winner?.name || 'Победитель';
    const title = `🍾 ${winnerName}`;
    const sub = `${winnerScore} очков в Бутылочке`;

    try {
      await bridge.send('VKWebAppShowStoryBox', {
        background_type: 'none',
        stickers: [
          {
            sticker_type: 'renderable',
            sticker: {
              content_type: 'image',
              // Inline SVG -> data URL, rendered as the story canvas
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

  return (
    <Panel id={id}>
      <div className="panel-head" style={{ textAlign: 'center' }}>
        <h1 className="h-display">Игра завершена! 🎉</h1>
        <div className="text-secondary" style={{ marginTop: 6 }}>
          Поздравляем победителя
        </div>
      </div>

      {winner && (
        <div
          className="leader-row is-me"
          style={{
            margin: '1rem',
            padding: '1.5rem 1.25rem',
            borderColor: '#FFD700',
            boxShadow: '0 0 0 4px rgba(255, 215, 0, 0.2), 0 12px 40px rgba(255, 215, 0, 0.25)',
            animationDelay: '0ms',
          }}
        >
          <div className="leader-rank gold" style={{ width: 48, height: 48, fontSize: '1.25rem' }}>
            🥇
          </div>
          <div className="leader-avatar" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>
            {winner.photo_100 ? (
              <img src={winner.photo_100} alt="" />
            ) : (
              (winner.name || '?')[0].toUpperCase()
            )}
          </div>
          <div className="leader-name" style={{ fontSize: '1.125rem' }}>
            {winner.name}
            <small style={{ color: '#FFD700' }}>Победитель</small>
          </div>
          <div
            className="leader-score"
            style={{
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #FFD700, #FFA000)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {winnerScore}
          </div>
        </div>
      )}

      {sorted.slice(1).map((p, idx) => {
        const i = idx + 1;
        const photo = p.photo_100 || '';
        const initials = (p.name || '?')[0].toUpperCase();
        const rankClass = i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        return (
          <div
            key={p.id}
            className="leader-row"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`leader-rank ${rankClass}`}>
              {i < 3 ? MEDAL[i] : i + 1}
            </div>
            <div className="leader-avatar">
              {photo ? <img src={photo} alt="" /> : initials}
            </div>
            <div className="leader-name">{p.name}</div>
            <div className="leader-score">{p.score || 0}</div>
          </div>
        );
      })}

      <div
        style={{
          padding: '1.5rem 1rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <button className="btn-gradient" onClick={onPlayAgain}>
          Играть снова
        </button>
        <button className="btn-ghost" onClick={share}>
          Поделиться 🍾
        </button>
      </div>
    </Panel>
  );
}
