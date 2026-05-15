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
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isSpinning || targetIndex == null || players.length === 0) return;
    const targetAngle = (360 / players.length) * targetIndex;
    const fullTurns = 720 + Math.floor(Math.random() * 720);
    const base = Math.floor(rotation / 360) * 360;
    const next = base + fullTurns + targetAngle;
    setRotation(next);
  }, [isSpinning, targetIndex]);

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
        height={176}
        style={{
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
}
