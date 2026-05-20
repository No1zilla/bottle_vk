import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Panel } from '@vkontakte/vkui';
import BottleSpinner from '../components/BottleSpinner.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { getRandomTask } from '../data/tasks.js';
import { addScore, bumpStats } from '../hooks/useStorage.js';
import { showBanner, hideBanner, showRewardedAd } from '../hooks/useAds.js';

export default function Game({ id, players, setPlayers, onEndGame }) {
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [task, setTask] = useState(null);
  const [phase, setPhase] = useState('ready'); // ready | spinning | task | between
  const [adLoading, setAdLoading] = useState(false);
  const roundResolvedRef = useRef(false);

  useEffect(() => {
    showBanner();
    return () => {
      hideBanner();
    };
  }, []);

  function startSpin() {
    if (players.length < 2) return;
    if (phase === 'between') {
      setSpinnerIndex((i) => (i + 1) % players.length);
    }
    const fromIndex = phase === 'between' ? (spinnerIndex + 1) % players.length : spinnerIndex;
    let t = Math.floor(Math.random() * players.length);
    while (t === fromIndex && players.length > 1) {
      t = Math.floor(Math.random() * players.length);
    }
    setTargetIndex(t);
    setTask(null);
    roundResolvedRef.current = false;
    setPhase('spinning');
    setIsSpinning(true);
  }

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setTask(getRandomTask());
    setPhase('task');
  }, []);

  async function handleComplete() {
    if (!task || roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    const earned = task.points;
    const playerId = players[spinnerIndex]?.id;
    setPlayers((ps) =>
      ps.map((p) => (p.id === playerId ? { ...p, score: (p.score || 0) + earned } : p))
    );
    setPhase('between');
    setTask(null);
    setTargetIndex(null);
    try {
      await addScore(earned);
      await bumpStats({ tasks: 1 });
    } catch {}
  }

  async function handleSkip() {
    if (roundResolvedRef.current || adLoading) return;
    setAdLoading(true);
    // Show rewarded ad before granting skip. If ads aren't available
    // (running outside VK, slot not approved yet, etc.) — skip silently.
    await showRewardedAd();
    setAdLoading(false);
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;
    setPhase('between');
    setTask(null);
    setTargetIndex(null);
  }

  function handleEndGame() {
    bumpStats({ games: 1 }).catch(() => {});
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
      />

      {showSpinButton && (
        <div style={{ padding: '0 1rem' }}>
          <button className="btn-gradient" onClick={startSpin}>
            Крутить бутылку
          </button>
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
          skipLabel={adLoading ? 'Реклама…' : 'Пропустить 📺'}
          skipDisabled={adLoading}
        />
      )}

      <div style={{ padding: '1rem' }}>
        <button className="btn-ghost" onClick={handleEndGame}>
          Завершить игру
        </button>
      </div>
      {/* Spacer so the bottom VK banner ad doesn't overlap the last button */}
      <div style={{ height: 72 }} />
    </Panel>
  );
}
