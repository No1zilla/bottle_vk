import React from 'react';

const LEVEL_LABEL = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export default function TaskCard({
  task,
  fromPlayer,
  toPlayer,
  onComplete,
  onSkip,
  skipLabel = 'Пропустить',
  skipDisabled = false,
}) {
  if (!task) return null;
  const fromName = fromPlayer?.name || fromPlayer?.first_name || '?';
  const toName = toPlayer?.name || toPlayer?.first_name || '?';
  return (
    <div className={`task-card task-card-anim ${task.level}`}>
      <div className="from-to">
        <b>{fromName}</b> → <b>{toName}</b>
      </div>
      <span className={`task-badge ${task.level}`}>
        {LEVEL_LABEL[task.level]} · +{task.points}
      </span>
      <p className="task-text">{task.text}</p>
      <div className="btn-row">
        <button className="btn-success" onClick={onComplete}>
          Выполнено
        </button>
        <button className="btn-ghost" onClick={onSkip} disabled={skipDisabled}>
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
