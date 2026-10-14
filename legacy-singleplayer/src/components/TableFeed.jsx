import React, { useEffect, useRef, useState } from 'react';
import { useReported, markReported } from '../lib/reported.js';
import { quoted } from '../lib/quote.js';

const CURRENCY = '❤';
const LEVEL_LABEL = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
const MAX_LEN = 200; // как у фильтра на сервере

// Под столом: чат и последние ответы. Тексты фильтрует сервер; жалоба — флажок у чужого сообщения.
export default function TableFeed({ meId, chat, history, blocked, onSend, onReport, onReportAnswer }) {
  const [tab, setTab] = useState('chat');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const isReported = useReported();
  const listRef = useRef(null);

  // Новое сообщение — прокручиваем вниз
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length, tab]);

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    const res = await onSend(t);
    setSending(false);
    if (res.ok) setText('');
  }

  // Ключи с префиксом: id сообщений и ответов из разных таблиц могут совпасть
  async function report(kind, id) {
    const res = await (kind === 'msg' ? onReport : onReportAnswer)(id);
    if (res.ok) markReported(`${kind}:${id}`);
  }
  // Серый флажок — можно пожаловаться; красный — жалоба уже отправлена
  const flag = (kind, id, label) => {
    const done = isReported(`${kind}:${id}`);
    return (
      <button
        className={`feed-report${done ? ' reported' : ''}`}
        title={done ? 'Жалоба отправлена' : 'Пожаловаться'}
        aria-label={done ? 'Жалоба отправлена' : label}
        disabled={done}
        onClick={() => report(kind, id)}
      >
        ⚑
      </button>
    );
  };

  return (
    <div className="feed">
      <div className="feed-tabs">
        <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>
          Чат
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          Ответы{history.length ? ` · ${history.length}` : ''}
        </button>
      </div>

      {tab === 'chat' ? (
        <>
          <div className="feed-chat" ref={listRef}>
            {chat.length === 0 && <div className="feed-empty">Пока тихо. Поздоровайтесь!</div>}
            {chat.map((m) => (
              <div key={m.id} className={`feed-msg${m.from === meId ? ' mine' : ''}`}>
                <span className="feed-msg-name">{m.from === meId ? 'Вы' : m.name}</span>
                <span className="feed-msg-text">{m.text}</span>
                {m.from !== meId && flag('msg', m.id, 'Пожаловаться на сообщение')}
              </div>
            ))}
          </div>
          <div className="feed-input">
            <input
              value={text}
              maxLength={MAX_LEN}
              placeholder="Написать за столом…"
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="btn-gradient" disabled={!text.trim() || sending} onClick={send}>
              ➤
            </button>
          </div>
        </>
      ) : (
        <div className="feed-history">
          {history.length === 0 && <div className="feed-empty">Здесь появятся ответы игроков</div>}
          {history.map((h) => (
            <div key={h.round} className="feed-card">
              {h.id && !h.hidden && h.userId !== meId && flag('answer', h.id, 'Пожаловаться на ответ')}
              <div className="feed-card-head">
                {h.bot ? '🤖 ' : ''}
                {h.name} · {LEVEL_LABEL[h.level]} · +{h.points} {CURRENCY} · ❤️ {h.likes || 0}
                {h.dislikes ? ` · ✕ ${h.dislikes}` : ''}
              </div>
              <div className="feed-card-task">{h.task}</div>
              {h.hidden || blocked.has(h.userId) ? (
                <div className="feed-card-task">
                  {h.hidden ? 'Ответ скрыт по жалобам игроков' : 'Ответ скрыт: вы заблокировали игрока'}
                </div>
              ) : (
                <div className="feed-card-answer">{quoted(h.text)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
