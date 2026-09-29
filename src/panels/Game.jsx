import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Panel } from '@vkontakte/vkui';
import BottleSpinner from '../components/BottleSpinner.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { getRandomTask } from '../data/tasks.js';
import { addScore, bumpStats } from '../hooks/useStorage.js';
import { showBanner, hideBanner, showRewardedAd, getAdCooldownMs } from '../hooks/useAds.js';
import { useSessionState } from '../hooks/useSessionState.js';

export default function Game({ id, players, setPlayers, onEndGame }) {
  const [spinnerIndex, setSpinnerIndex] = useSessionState('bottle_game_spinnerIndex', 0);

  // Whenever players list changes and we're in ready phase, ensure human spins first
  useEffect(() => {
    if (phase !== 'ready') return;
    const meIdx = players.findIndex((p) => p.isMe);
    if (meIdx >= 0) setSpinnerIndex(meIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);
  const [targetIndex, setTargetIndex] = useSessionState('bottle_game_targetIndex', null);
  const [task, setTask] = useSessionState('bottle_game_task', null);
  const [phase, setPhase] = useSessionState('bottle_game_phase', 'ready'); // ready | spinning | task | between
  const [isSpinning, setIsSpinning] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(() => getAdCooldownMs());
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [autoSpinCountdown, setAutoSpinCountdown] = useState(null);
  const autoSpinTimerRef = useRef(null);
  const autoSpinIntervalRef = useRef(null);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const roundResolvedRef = useRef(false);

  // Tick down the ad cooldown timer while it's active
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const tick = () => setCooldownLeft(getAdCooldownMs());
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [cooldownLeft > 0]);

  // If we were in the middle of a spin animation when the user left,
  // restore to the resulting task screen on mount.
  useEffect(() => {
    if (phase === 'spinning') {
      setPhase('task');
      if (!task) setTask(getRandomTask());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    showBanner();
    return () => {
      hideBanner();
    };
  }, []);

  // Lock body scroll while the end-game confirmation modal is open + ESC closes it
  useEffect(() => {
    if (!confirmEndOpen) return;
    document.body.classList.add('modal-open');
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmEndOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [confirmEndOpen]);

  function openAddPlayer() {
    if (isSpinning || phase === 'spinning') return;
    setNewPlayerName('');
    setAddPlayerOpen(true);
  }

  function confirmAddPlayer() {
    const trimmed = newPlayerName.trim().slice(0, 16);
    if (!trimmed || !/\p{L}/u.test(trimmed)) return;
    setPlayers((ps) => [
      ...ps,
      { id: 'p_' + Date.now(), name: trimmed, score: 0 },
    ]);
    setAddPlayerOpen(false);
  }

  function startSpin() {
    if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', phase === 'ready' ? 'game_start' : 'round_spin', { players: players.length });
    if (players.length < 2) return;
    // After the previous round the player who got the task (targetIndex) becomes
    // the next spinner. The very first spin just uses the current spinnerIndex.
    let fromIndex = spinnerIndex;
    if (phase === 'between' && targetIndex != null) {
      fromIndex = targetIndex;
      setSpinnerIndex(targetIndex);
    }
    // Ensure human player gets picked at least every other turn
    const humanIndex = players.findIndex((p) => p.isMe);
    let t;
    if (humanIndex >= 0 && humanIndex !== fromIndex) {
      // 50% chance to land on human player to keep them engaged
      t = Math.random() < 0.5 ? humanIndex : Math.floor(Math.random() * players.length);
      // fallback: if we accidentally picked fromIndex, pick human
      if (t === fromIndex) t = humanIndex;
    } else {
      t = Math.floor(Math.random() * players.length);
      while (t === fromIndex && players.length > 1) {
        t = Math.floor(Math.random() * players.length);
      }
    }
    setTargetIndex(t);
    setTask(null);
    roundResolvedRef.current = false;
    setAutoSpinCountdown(null);
    clearTimeout(autoSpinTimerRef.current);
    clearInterval(autoSpinIntervalRef.current);
    setPhase('spinning');
    setIsSpinning(true);
  }

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setTask(getRandomTask());
    setPhase('task');
  }, []);

  // Auto-spin when it is a bot's turn to spin
  useEffect(() => {
    if (phase !== 'between' && phase !== 'ready') return;
    // Don't auto-spin until the human player has loaded
    const hasHuman = players.some((p) => p.isMe);
    if (!hasHuman) return;
    // Determine who spins next
    const nextSpinnerIndex = (phase === 'between' && targetIndex != null) ? targetIndex : spinnerIndex;
    const nextSpinner = players[nextSpinnerIndex];
    if (!nextSpinner?.isBot) return;
    const timer = setTimeout(() => {
      startSpin();
    }, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetIndex, spinnerIndex, players]);

  // Auto-complete bot turns after 2 seconds
  useEffect(() => {
    if (phase !== 'task' || !task) return;
    const currentPlayer = players[targetIndex];
    if (!currentPlayer?.isBot) return;
    const timer = setTimeout(() => {
      handleComplete();
    }, 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, task, targetIndex]);

  async function handleComplete() {
    if (!task || roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', 'task_complete', { level: task?.level });
    const earned = task.points;
    // Points go to the player the bottle pointed at (who performed the task).
    const playerId = players[targetIndex]?.id;
    setPlayers((ps) =>
      ps.map((p) => (p.id === playerId ? { ...p, score: (p.score || 0) + earned } : p))
    );
    setPhase('between');
    setTask(null);
    // keep targetIndex around — startSpin uses it to pick the next spinner
    try {
      await addScore(earned);
      await bumpStats({ tasks: 1 });
    } catch {}
  }

  async function handleSkip() {
    if (roundResolvedRef.current || adLoading || cooldownLeft > 0) return;
    setAdLoading(true);
    try {
      // Show rewarded ad before granting skip. If ads aren't available
      // (running outside VK, slot not approved yet, etc.) — skip silently.
      // Guard against the bridge never resolving (e.g. ad closed by user
      // outside VK's standard flow) — fall through after 8 seconds.
      await Promise.race([
        showRewardedAd(),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    } catch {
      // swallow — we always want to release the UI
    } finally {
      setAdLoading(false);
      setCooldownLeft(getAdCooldownMs());
    }
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', 'task_skip');
    setPhase('between');
    setTask(null);
    // keep targetIndex so the next spinner is the player who got the task
  }

  function requestEndGame() {
    setConfirmEndOpen(true);
  }
  function cancelEndGame() {
    setConfirmEndOpen(false);
  }
  function handleEndGame() {
    setConfirmEndOpen(false);
    bumpStats({ games: 1 }).catch(() => {});
    if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', 'game_end', { players: players.length });
    try {
      sessionStorage.removeItem('bottle_game_spinnerIndex');
      sessionStorage.removeItem('bottle_game_targetIndex');
      sessionStorage.removeItem('bottle_game_task');
      sessionStorage.removeItem('bottle_game_phase');
    } catch {}
    if (typeof onEndGame === 'function') {
      onEndGame();
    }
  }

  const spinner = players[spinnerIndex];
  const target = targetIndex != null ? players[targetIndex] : null;
  const showSpinButton = phase === 'ready' || phase === 'between';
  const spinnerName = spinner?.name || spinner?.first_name || '';
  const spinnerScore = spinner?.score || 0;

  return (
    <Panel id={id}>
      <div className="banner" style={{ marginTop: '1rem' }}>
        <div>
          <div className="banner-label">Сейчас крутит</div>
          <div className="banner-value">
            {spinnerName}{' '}
            <span className="banner-score" style={{ fontSize: '1rem' }}>
              · {spinnerScore} очков
            </span>
          </div>
        </div>
      </div>

      <BottleSpinner
        players={players}
        isSpinning={isSpinning}
        targetIndex={targetIndex}
        spinnerIndex={spinnerIndex}
        onSpinComplete={handleSpinComplete}
        onAddPlayer={openAddPlayer}
        restorePhase={phase === 'task' || phase === 'between'}
      />

      {showSpinButton && (
        <div style={{ padding: '0 1rem' }}>
          <button className="btn-gradient" onClick={startSpin}>
            Крутить бутылку
          </button>
        </div>
      )}

      {autoSpinCountdown !== null && (
        <div className="empty-state" style={{ fontSize: '0.95rem' }}>
          Ход переходит через <strong style={{ color: autoSpinCountdown <= 5 ? '#f44336' : '#fff' }}>{autoSpinCountdown}</strong> сек...
        </div>
      )}

      {phase === 'spinning' && (
        <div className="empty-state">Бутылка крутится...</div>
      )}

      {phase === 'task' && task && (
        <TaskCard
          task={task}
          fromPlayer={spinner}
          toPlayer={target}
          onComplete={handleComplete}
          onSkip={handleSkip}
          showTimer={true}
          timerSeconds={players[targetIndex]?.isBot ? 5 : 10}
          actionsDisabled={!players[targetIndex]?.isMe}
          onTimeout={() => {
            if (roundResolvedRef.current) return;
            roundResolvedRef.current = true;
            setPhase('between');
            setTask(null);
            // Auto-spin after timeout regardless of who spins next
            setAutoSpinCountdown(10);
            clearInterval(autoSpinIntervalRef.current);
            autoSpinIntervalRef.current = setInterval(() => {
              setAutoSpinCountdown((v) => {
                if (v <= 1) { clearInterval(autoSpinIntervalRef.current); return null; }
                return v - 1;
              });
            }, 1000);
            clearTimeout(autoSpinTimerRef.current);
            autoSpinTimerRef.current = setTimeout(() => startSpin(), 10000);
          }}
          skipLabel={
            cooldownLeft > 0
              ? `Пропуск через ${Math.ceil(cooldownLeft / 1000)} с`
              : adLoading
                ? 'Реклама…'
                : 'Пропустить 📺'
          }
          skipDisabled={adLoading || cooldownLeft > 0}
        />
      )}

      <div className="scoreboard-mini">
        <div className="scoreboard-mini-title">Счёт игроков</div>
        {players.map((p, i) => {
          const isCurrent = i === spinnerIndex;
          return (
            <div
              key={p.id}
              className={`scoreboard-row${isCurrent ? ' current' : ''}`}
            >
              <span className="scoreboard-name">{p.name || p.first_name}</span>
              <span className="scoreboard-score">{p.score || 0}</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '1rem' }}>
        <button className="btn-ghost" onClick={requestEndGame}>
          Завершить игру
        </button>
      </div>
      {/* Spacer so the bottom VK banner ad doesn't overlap the last button */}
      <div style={{ height: 72 }} />

      {confirmEndOpen && (
        <div className="modal-overlay" onClick={cancelEndGame}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#fff',
              }}
            >
              Завершить игру?
            </div>
            <div
              className="text-secondary"
              style={{ marginBottom: '1.25rem' }}
            >
              Прогресс текущей партии не сохранится. Появится итоговая таблица результатов.
            </div>
            <div className="btn-row">
              <button className="btn-gradient" onClick={handleEndGame}>
                Завершить
              </button>
              <button className="btn-ghost" onClick={cancelEndGame}>
                Продолжить игру
              </button>
            </div>
          </div>
        </div>
      )}
      {addPlayerOpen && (
        <div className="modal-overlay" onClick={() => setAddPlayerOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-label">Имя игрока</div>
            <input
              className="modal-input"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value.slice(0, 16))}
              placeholder="Например, Маша"
              maxLength={16}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAddPlayer(); if (e.key === 'Escape') setAddPlayerOpen(false); }}
            />
            <div className="btn-row">
              <button className="btn-gradient" onClick={confirmAddPlayer} disabled={!newPlayerName.trim()}>
                Добавить
              </button>
              <button className="btn-ghost" onClick={() => setAddPlayerOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
