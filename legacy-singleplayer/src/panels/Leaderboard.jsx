import React, { useEffect, useState } from 'react';
import { Panel } from '@vkontakte/vkui';
import { useServer, CURRENCY } from '../lib/server.jsx';

// Plain digits instead of emoji medals — colored backgrounds (.gold/.silver/.bronze)
// convey the rank reliably even on systems without an emoji font (Windows w/o Segoe UI Emoji).
const RANK = ['1', '2', '3'];

// Общий рейтинг всех игроков: сердечки, заработанные за ответы, плюс лайки ответов (трата сердечек место не меняет).
export default function Leaderboard({ id }) {
  const { status, me, call } = useServer();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (status !== 'online') return;
    call('tasks:leaderboard').then((res) => res.ok && setData(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const top = (data?.top || []).map((p) => ({ ...p, isMe: p.id === me?.id }));
  // Себя показываем внизу, если не попали в топ
  const mine = data?.me;
  const meOutside = me && mine?.rating > 0 && !top.some((p) => p.isMe);

  return (
    <Panel id={id}>
      <div className="panel-head">
        <h1 className="h-display">
          <span className="gradient-text">Рейтинг</span>
        </h1>
        <div className="text-secondary" style={{ marginTop: 6 }}>
          Сердечки за ответы + лайки от других игроков
        </div>
      </div>

      {!data && <div className="empty-state">Загрузка…</div>}
      {data && top.length === 0 && <div className="empty-state">Пока никто не заработал сердечек — будьте первым!</div>}

      {top.map((p, i) => (
        <LeaderRow key={p.id} p={p} rank={i + 1} delay={i * 50} />
      ))}
      {meOutside && (
        <LeaderRow p={{ id: me.id, name: me.name, photo: me.photo, ...mine, isMe: true }} rank={mine.rank} delay={0} />
      )}

      <div style={{ height: 32 }} />
    </Panel>
  );
}

function LeaderRow({ p, rank, delay }) {
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
  return (
    <div className={`leader-row${p.isMe ? ' is-me' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`leader-rank ${rankClass}`}>{rank <= 3 ? RANK[rank - 1] : rank}</div>
      <div className="leader-avatar">{p.photo ? <img src={p.photo} alt="" /> : (p.name || '?')[0].toUpperCase()}</div>
      <div className="leader-name">
        {p.name}
        <small>
          {p.score || 0} {CURRENCY} + ❤️ {p.likes || 0}
          {p.isMe ? ' · это вы' : ''}
        </small>
      </div>
      <div className="leader-score">{p.rating || 0}</div>
    </div>
  );
}
