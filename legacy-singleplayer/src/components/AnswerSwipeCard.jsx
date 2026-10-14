import React, { useRef, useState } from 'react';
import { useReported, markReported } from '../lib/reported.js';
import { quoted } from '../lib/quote.js';

const SWIPE_AT = 90; // px: дальше — решение принято
const CURRENCY = '❤';

// Ответ карточкой, как в дейтинге: вправо — лайк, влево — дизлайк. Кнопки ✕ / ❤️ дублируют свайп.
// Лайк человеку идёт в рейтинг, дизлайк — только счётчик на карточке. Боту можно и то и другое.
// Жалоба — флажок в углу: без неё каталог ВК не пропустит игру с текстами от игроков.
export default function AnswerSwipeCard({ name, answer, blockedAuthor, canReact, canReport, secondsLeft, onLike, onDislike, onReport }) {
  const [dx, setDx] = useState(0);
  const [decision, setDecision] = useState(null); // 'like' | 'dislike'
  const isReported = useReported();
  const reported = !!answer?.id && isReported(`answer:${answer.id}`);
  const start = useRef(null);

  async function decide(d) {
    if (decision || !canReact) return;
    setDecision(d);
    setDx(0); // карточка возвращается на место, счётчик обновит сервер
    await (d === 'like' ? onLike : onDislike)(answer.id);
  }

  const onPointerDown = (e) => {
    if (!canSwipe) return;
    start.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (start.current != null) setDx(e.clientX - start.current);
  };
  const onPointerUp = () => {
    if (start.current == null) return;
    start.current = null;
    if (dx > SWIPE_AT) decide('like');
    else if (dx < -SWIPE_AT) decide('dislike');
    else setDx(0);
  };

  const likes = answer?.likes || 0;
  const dislikes = answer?.dislikes || 0;
  const counters = `❤️ ${likes}` + (dislikes ? ` · ✕ ${dislikes}` : '');
  const canSwipe = canReact && !decision;

  // Скрыт по жалобам или автор у меня в блоке — текст не показываем, оценивать нечего
  if (answer?.hidden || blockedAuthor) {
    return (
      <div className="answer-screen">
        <div className="answer-screen-name">{name}</div>
        <div className="text-secondary" style={{ margin: '0.25rem 0 0.75rem' }}>
          {answer?.hidden ? 'Ответ скрыт по жалобам игроков' : 'Ответ скрыт: вы заблокировали игрока'}
        </div>
        {secondsLeft != null && <div className="text-secondary">Следующий ход через {secondsLeft} с</div>}
      </div>
    );
  }

  const hint = dx > 30 ? 'like' : dx < -30 ? 'dislike' : null;
  return (
    <div className="swipe-wrap">
      <div
        className={`swipe-card${start.current != null ? ' dragging' : ''}`}
        style={{ transform: `translateX(${dx}px) rotate(${dx / 20}deg)`, touchAction: canSwipe ? 'pan-y' : 'auto', cursor: canSwipe ? undefined : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {hint && <div className={`swipe-stamp ${hint}`}>{hint === 'like' ? '❤️' : '✕'}</div>}
        {canReport && (
          <button
            className={`swipe-report${reported ? ' reported' : ''}`}
            title={reported ? 'Жалоба отправлена' : 'Пожаловаться на ответ'}
            aria-label={reported ? 'Жалоба отправлена' : 'Пожаловаться на ответ'}
            disabled={reported}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={async () => {
              const res = await onReport(answer.id);
              if (res.ok) markReported(`answer:${answer.id}`);
            }}
          >
            ⚑
          </button>
        )}
        <div className="answer-screen-name">
          {name} · +{answer.points} {CURRENCY} ·{' '}
          <span className={decision ? `swipe-counters voted-${decision}` : 'swipe-counters'}>{counters}</span>
        </div>
        <div className="answer-screen-text">{quoted(answer.text)}</div>
        {secondsLeft != null && <div className="text-secondary">Следующий ход через {secondsLeft} с</div>}
      </div>
      {canSwipe && (
        <div className="swipe-buttons">
          <button className="swipe-btn dislike" aria-label="Не нравится" onClick={() => decide('dislike')}>
            ✕
          </button>
          <button className="swipe-btn like" aria-label="Нравится" onClick={() => decide('like')}>
            ❤️
          </button>
        </div>
      )}
    </div>
  );
}
