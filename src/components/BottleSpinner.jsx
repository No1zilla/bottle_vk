import React, { useEffect, useRef, useState } from 'react';
import BottleSVG from './BottleSVG.jsx';

const ARENA = 260;
const RADIUS = 100;

export default function BottleSpinner({
  players,
  isSpinning,
  targetIndex,
  spinnerIndex,
  onSpinComplete,
}) {
  const bottleRef = useRef(null);
  // When the user returns from another tab, initialize rotation so the bottle
  // is already pointing at the saved target (no animation, just the correct
  // resting position).
  const [rotation, setRotation] = useState(() => {
    if (targetIndex == null || !players?.length) return 0;
    return (360 / players.length) * targetIndex;
  });

  useEffect(() => {
    if (targetIndex == null || !players?.length) return;
    const targetAngle = (360 / players.length) * targetIndex;
    if (!isSpinning) {
      // Snap to target without animation (e.g. when re-mounting on tab return).
      const el = bottleRef.current;
      if (el) {
        const prev = el.style.transition;
        el.style.transition = 'none';
        const base = Math.floor(rotation / 360) * 360;
        setRotation(base + targetAngle);
        // force reflow before restoring transition
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
        requestAnimationFrame(() => {
          el.style.transition = prev;
        });
      }
      return;
    }
    const fullTurns = 720 + Math.floor(Math.random() * 720);
    const base = Math.floor(rotation / 360) * 360;
    const next = base + fullTurns + targetAngle;
    setRotation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetIndex, players.length]);

  useEffect(() => {
    const el = bottleRef.current;
    if (!el) return;
    function handler() {
      if (isSpinning && onSpinComplete) onSpinComplete();
    }
    el.addEventListener('transitionend', handler);
    return () => el.removeEventListener('transitionend', handler);
  }, [isSpinning, onSpinComplete]);

  return (
    <div className="bottle-arena">
      <div className={`arena-glow${isSpinning ? ' active' : ''}`} />
      {players.map((p, i) => {
        const angle = (360 / players.length) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const x = ARENA / 2 + RADIUS * Math.cos(rad);
        const y = ARENA / 2 + RADIUS * Math.sin(rad);
        const isTarget = !isSpinning && i === targetIndex;
        const isSpinner = i === spinnerIndex;
        const photo = p.photo_100 || p.photo || '';
        const initials = (p.name || p.first_name || '?').slice(0, 1).toUpperCase();
        const className = [
          'player-dot',
          isTarget ? 'target' : '',
          isSpinner ? 'spinner-active' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const name = p.name || p.first_name || '';
        return (
          <React.Fragment key={p.id || i}>
            <div className={className} style={{ left: x, top: y }} title={name}>
              {photo ? <img src={photo} alt="" /> : initials}
            </div>
            <div className="player-name-label" style={{ left: x, top: y }}>
              {name.length > 10 ? name.slice(0, 10) + '…' : name}
            </div>
          </React.Fragment>
        );
      })}
      <BottleSVG
        ref={bottleRef}
        className="bottle-svg"
        width={80}
        height={160}
        style={{
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transformOrigin: '50% 50%',
        }}
      />
    </div>
  );
}
