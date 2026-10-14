import React, { useState, useEffect, useRef } from 'react';

const LEVEL_LABEL = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export default function TaskCard({
  task,
  toPlayer,
  onComplete,
  onSkip,
  skipLabel = 'Пропустить',
  skipDisabled = false,
  showTimer = false,
  timerSeconds = 10,
  onTimeout = null,
  actionsDisabled = false,
  submitting = false, // сервер проверяет ответ (ИИ-модерация) — ждём
}) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [answer, setAnswer] = useState('');
  const startedRef = useRef(Date.now());

  useEffect(() => {
    setAnswer('');
    if (!showTimer) return;
    startedRef.current = Date.now();
    setTimeLeft(timerSeconds);
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedRef.current) / 1000;
      const left = Math.max(0, timerSeconds - elapsed);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) {
        clearInterval(interval);
        if (onTimeout) onTimeout();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [task?.id, showTimer, timerSeconds]);

  if (!task) return null;
  const toName = toPlayer?.name || toPlayer?.first_name || '?';
  const timerFrac = showTimer ? timeLeft / timerSeconds : 1;
  // Цвет по доле оставшегося времени: зелёный → после половины оранжевый → последняя четверть красная
  const timerColor = timerFrac <= 0.25 ? '#f44336' : timerFrac <= 0.5 ? '#ff9800' : '#4caf50';

  const BAD_WORDS = ['блять','блядь','сука','пизд','хуй','ебат','ебать','еблан','залупа','мудак','шлюх','говно','пидор','гандон','уебок','уёбок'];
  const isBad = BAD_WORDS.some((w) => answer.toLowerCase().replace(/ё/g,'е').includes(w.replace(/ё/g,'е')));

  function handleSubmit() {
    if (!answer.trim() || isBad || submitting) return;
    onComplete(answer.trim());
  }

  return (
    <div className={`task-card task-card-anim ${task.level}`}>
      <div className="from-to">
        <b>{toName}</b> отвечает
      </div>
      <span className={`task-badge ${task.level}`}>
        {LEVEL_LABEL[task.level]} · +{task.reward} ❤
      </span>
      {showTimer && (
        <div className="task-timer">
          <div
            className="task-timer-bar"
            style={{
              width: `${timerFrac * 100}%`,
              background: timerColor,
              transition: 'background 0.5s',
            }}
          />
          <span className="task-timer-label" style={{ color: timerColor }}>
            {timeLeft}
          </span>
        </div>
      )}
      <p className="task-text">{task.text}</p>
      {!actionsDisabled ? (
        <>
          <textarea
            className="answer-input"
            placeholder="Напиши свой ответ..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
          />
          {isBad && (
            <div style={{ color: '#f44336', fontSize: '0.85rem', margin: '0.25rem 0' }}>
              Пожалуйста, без матов 🙏
            </div>
          )}
          <div className="btn-row">
            <button className="btn-success" onClick={handleSubmit} disabled={!answer.trim() || isBad || submitting}>
              {submitting ? 'Проверяем…' : 'Отправить ответ'}
            </button>
            <button className="btn-ghost" onClick={onSkip} disabled={skipDisabled}>
              {skipLabel}
            </button>
          </div>
        </>
      ) : (
        <div className="answer-waiting">Ждём ответа...</div>
      )}
    </div>
  );
}
