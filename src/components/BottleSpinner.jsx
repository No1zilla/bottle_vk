import React, { useEffect, useRef, useState } from 'react';
import BottleSVG from './BottleSVG.jsx';

const ARENA = 260;
const RADIUS_BASE = 100;

export default function BottleSpinner({
  players,
  isSpinning,
  targetIndex,
  spinnerIndex,
  onSpinComplete,
}) {
  const bottleRef = useRef(null);
  const wasSpinningRef = useRef(false);

  // Rotation tracked as a single source of truth; updated synchronously below.
  const [rotation, setRotation] = useState(() => {
    if (targetIndex == null || !players?.length) return 0;
    return (360 / players.length) * targetIndex;
  });

  // Effect 1: a fresh spin was requested.
  // Compute final angle (with random whole turns) ONCE and rely on CSS
  // transition to animate. No post-stop "snap" — the bottle ends at the
  // exact angle of the target.
  useEffect(() => {
    if (!isSpinning || targetIndex == null || !players?.length) return;
    if (wasSpinningRef.current) return; // already spinning, don't recompute
    wasSpinningRef.current = true;
    const n = players.length;
    const targetAngle = (360 / n) * targetIndex;
    const fullTurns = (3 + Math.floor(Math.random() * 3)) * 360; // 3-5 full turns
    const currentMod = ((rotation % 360) + 360) % 360;
    // distance from current mod-angle to targetAngle going clockwise (0..360)
    let delta = (targetAngle - currentMod + 360) % 360;
    const next = rotation + fullTurns + delta;
    setRotation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetIndex, players.length]);

  // Reset the "is currently spinning" guard when the parent ends the spin.
  useEffect(() => {
    if (!isSpinning) wasSpinningRef.current = false;
  }, [isSpinning]);

  // Effect 2: state restoration on tab return (NOT spinning, target known).
  // Snap to target WITHOUT animation so the bottle is in the saved orientation.
  useEffect(() => {
    if (isSpinning || targetIndex == null || !players?.length) return;
    const n = players.length;
    const targetAngle = (360 / n) * targetIndex;
    const el = bottleRef.current;
    if (!el) return;
    const prev = el.style.transition;
    el.style.transition = 'none';
    setRotation(targetAngle);
    // force reflow to commit "no transition" before re-enabling
    // eslint-disable-next-line no-unused-expressions
    el.getBoundingClientRect();
    requestAnimationFrame(() => {
      el.style.transition = prev;
    });
    // Run only on mount — don't re-snap mid-life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {(() => {
        const n = players.length;
        const RADIUS = n >= 9 ? 115 : n >= 7 ? 108 : RADIUS_BASE;
        const dotSize = n >= 9 ? 40 : n >= 7 ? 46 : 52;
        const maxNameLen = n >= 9 ? 5 : n >= 7 ? 7 : 10;
        return players.map((p, i) => {
          const angle = (360 / n) * i - 90;
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
          const dotStyle = {
            left: x,
            top: y,
            width: dotSize,
            height: dotSize,
            marginLeft: -dotSize / 2,
            marginTop: -dotSize / 2,
            fontSize: n >= 9 ? '0.75rem' : '0.9rem',
          };
          return (
            <React.Fragment key={p.id || i}>
              <div className={className} style={dotStyle} title={name}>
                {photo ? <img src={photo} alt="" /> : initials}
              </div>
              <div
                className="player-name-label"
                style={
                  y < ARENA / 2
                    ? { left: x, top: y, marginTop: -(dotSize / 2 + 16) }
                    : { left: x, top: y, marginTop: dotSize / 2 + 4 }
                }
              >
                {name.length > maxNameLen ? name.slice(0, maxNameLen) + '…' : name}
              </div>
            </React.Fragment>
          );
        });
      })()}
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
