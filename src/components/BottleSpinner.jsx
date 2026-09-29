import React, { useEffect, useMemo, useRef, useState } from 'react';
import BottleSVG from './BottleSVG.jsx';

const ARENA = 260;
const RADIUS_BASE = 100;
const TOTAL_SLOTS = 8;

export default function BottleSpinner({
  players,
  isSpinning,
  targetIndex,
  spinnerIndex,
  onSpinComplete,
  onAddPlayer,
}) {
  const bottleRef = useRef(null);
  const wasSpinningRef = useRef(false);

  const n = players.length;
  const totalSlots = Math.max(n, TOTAL_SLOTS);

  // Shuffle and map must be computed before effects that use them
  const shuffledOrder = useMemo(() => {
    const order = Array.from({ length: totalSlots }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const playerIndexToSlot = useMemo(() => {
    const map = {};
    shuffledOrder.forEach((si, slotPos) => {
      if (si < n) map[si] = slotPos;
    });
    return map;
  }, [shuffledOrder, n]);

  const [rotation, setRotation] = useState(-90);

  useEffect(() => {
    if (!isSpinning || targetIndex == null || !n) return;
    if (wasSpinningRef.current) return;
    wasSpinningRef.current = true;
    const targetSlotPos = playerIndexToSlot[targetIndex] ?? targetIndex;
    const targetAngle = (360 / totalSlots) * targetSlotPos;
    const fullTurns = (3 + Math.floor(Math.random() * 3)) * 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = (targetAngle - currentMod + 360) % 360;
    const next = rotation + fullTurns + delta;
    setRotation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetIndex, players.length]);

  useEffect(() => {
    if (!isSpinning) wasSpinningRef.current = false;
  }, [isSpinning]);

  // On mount: snap bottle to target position without animation (session restore)
  useEffect(() => {
    if (targetIndex == null || !n) return;
    const targetSlotPos = playerIndexToSlot[targetIndex] ?? targetIndex;
    const angle = (360 / totalSlots) * targetSlotPos;
    setRotation(angle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSpinningRef = useRef(isSpinning);
  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);
  const onSpinCompleteRef = useRef(onSpinComplete);
  useEffect(() => { onSpinCompleteRef.current = onSpinComplete; }, [onSpinComplete]);

  useEffect(() => {
    const el = bottleRef.current;
    if (!el) return;
    function handler(e) {
      if (e.target !== el) return;
      if (isSpinningRef.current && onSpinCompleteRef.current) onSpinCompleteRef.current();
    }
    el.addEventListener('transitionend', handler);
    return () => el.removeEventListener('transitionend', handler);
  }, []);


  // Build slot list using pre-computed shuffledOrder
  const emptyCount = totalSlots - n;
  const playerSlots = players.map((p, i) => ({ type: 'player', player: p, playerIndex: i }));
  const emptySlots = Array.from({ length: emptyCount }, (_, i) => ({ type: 'empty', key: `empty_${i}` }));
  const allSlots = [...playerSlots, ...emptySlots];
  const slots = shuffledOrder.map((si) => allSlots[si]);

  const RADIUS = totalSlots >= 9 ? 115 : totalSlots >= 7 ? 108 : RADIUS_BASE;
  const dotSize = totalSlots >= 9 ? 40 : totalSlots >= 7 ? 46 : 52;
  const maxNameLen = totalSlots >= 9 ? 5 : totalSlots >= 7 ? 7 : 10;

  return (
    <div className="bottle-arena">
      <div className={`arena-glow${isSpinning ? ' active' : ''}`} />
      {slots.map((slot, i) => {
        const angle = (360 / totalSlots) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const x = ARENA / 2 + RADIUS * Math.cos(rad);
        const y = ARENA / 2 + RADIUS * Math.sin(rad);
        const dotStyle = {
          left: x,
          top: y,
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          fontSize: totalSlots >= 9 ? '0.75rem' : '0.9rem',
        };

        if (slot.type === 'empty') {
          return (
            <React.Fragment key={slot.key}>
              <div
                className="player-dot player-dot-empty"
                style={dotStyle}
                onClick={!isSpinning && onAddPlayer ? onAddPlayer : undefined}
                title="Добавить игрока"
              >
                +
              </div>
            </React.Fragment>
          );
        }

        const { player: p, playerIndex } = slot;
        const isTarget = !isSpinning && playerIndex === targetIndex;
        const isSpinnerDot = playerIndex === spinnerIndex;
        const photo = p.photo_100 || p.photo || '';
        const initials = p.avatar || (p.name || p.first_name || '?').slice(0, 1).toUpperCase();
        const isEmoji = !!p.avatar;
        const className = [
          'player-dot',
          isTarget ? 'target' : '',
          isSpinnerDot ? 'spinner-active' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const name = p.name || p.first_name || '';
        return (
          <React.Fragment key={p.id || playerIndex}>
            <div className={className} style={dotStyle} title={name}>
              {photo ? <img src={photo} alt="" /> : <span style={isEmoji ? { fontSize: dotSize * 0.55 } : {}}>{initials}</span>}
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
