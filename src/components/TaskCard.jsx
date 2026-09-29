import React, { useState, useEffect, useRef } from 'react';

const LEVEL_LABEL = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

const TIMER_SECONDS = 10; // default for humans

export default function TaskCard({
  task,
  fromPlayer,
  toPlayer,
  onComplete,
  onSkip,
  skipLabel = 'Пропустить',
  skipDisabled = false,
  showTimer = false,
  timerSeconds = 10,
  onTimeout = null,
  actionsDisabled = false,
}) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const startedRef = useRef(Date.now());

  useEffect(() => {
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
  const timerColor = timeLeft <= 3 ? '#f44336' : timeLeft <= 6 ? '#ff9800' : '#4caf50';

  return (
    <div className={`task-card task-card-anim ${task.level}`}>
      <div className="from-to">
        <b>{toName}</b> отвечает
      </div>
      <span className={`task-badge ${task.level}`}>
        {LEVEL_LABEL[task.level]} · +{task.points}
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
      <div className="btn-row">
        <button className="btn-success" onClick={onComplete} disabled={actionsDisabled}>
          Выполнено
        </button>
        <button className="btn-ghost" onClick={onSkip} disabled={skipDisabled || actionsDisabled}>
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
