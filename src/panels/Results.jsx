import React from 'react';
import { Panel } from '@vkontakte/vkui';

// Plain digits — color of the .gold/.silver/.bronze background indicates the rank.
const RANK = ['1', '2', '3'];

export default function Results({ id, players, onPlayAgain }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted[0];
  const winnerScore = winner?.score || 0;

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
            1
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
              {i < 3 ? RANK[i] : i + 1}
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
      </div>
    </Panel>
  );
}
