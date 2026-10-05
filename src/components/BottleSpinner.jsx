import React, { useEffect, useState } from 'react';
import BottleSVG from './BottleSVG.jsx';

const ARENA = 260;
const RADIUS_BASE = 100;
const TOTAL_SLOTS = 8;

// seats — места стола с сервера (null — свободно). Место i всегда на одной и той же позиции круга,
// поэтому у всех игроков за столом бутылочка указывает на одного и того же человека.
export default function BottleSpinner({
  seats,
  isSpinning,
  targetIndex,
  spinnerIndex,
  restorePhase = false,
  onSpin, // есть — сейчас мой ход, бутылку можно крутить нажатием на неё
  onInvite, // свободное место — «Позвать друга»
}) {
  const totalSlots = Math.max(seats.length, TOTAL_SLOTS);
  const angleOf = (i) => (360 / totalSlots) * i;
  const [rotation, setRotation] = useState(() => (restorePhase && targetIndex != null ? angleOf(targetIndex) : 0));

  useEffect(() => {
    if (!isSpinning || targetIndex == null) return;
    const fullTurns = (3 + Math.floor(Math.random() * 3)) * 360;
    setRotation((r) => {
      const currentMod = ((r % 360) + 360) % 360;
      return r + fullTurns + ((angleOf(targetIndex) - currentMod + 360) % 360);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetIndex]);

  const slots = Array.from({ length: totalSlots }, (_, i) =>
    seats[i] ? { type: 'player', player: seats[i], playerIndex: i } : { type: 'empty', key: `empty_${i}` }
  );

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
              <button
                type="button"
                className="player-dot player-dot-empty"
                style={dotStyle}
                title="Позвать друга"
                aria-label="Позвать друга"
                onClick={onInvite}
              >
                +
              </button>
              <div
                className="player-name-label invite-label"
                style={{ left: x, top: y, marginTop: dotSize / 2 + 2 }}
              >
                Позвать друга
              </div>
            </React.Fragment>
          );
        }

        const { player: p, playerIndex } = slot;
        const isTarget = !isSpinning && playerIndex === targetIndex;
        const isSpinnerDot = playerIndex === spinnerIndex;
        const photo = p.photo_100 || p.photo || '';
        const initials = (p.name || '?').slice(0, 1).toUpperCase();
        const className = [
          'player-dot',
          isTarget ? 'target' : '',
          isSpinnerDot ? 'spinner-active' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const name = p.name || '';
        return (
          <React.Fragment key={p.id}>
            <div className={className} style={dotStyle} title={name}>
              {photo ? <img src={photo} alt="" /> : <span>{initials}</span>}
              {/* Бот с именем и аватаркой, но всегда помечен — за столом живые люди */}
              {p.bot && (
                <span className="bot-badge" title="Бот" aria-label="бот">
                  🤖
                </span>
              )}
            </div>
            <div
              className="player-name-label"
              // Подпись всегда под кружком — и у игроков, и у «Позвать друга»
              style={{ left: x, top: y, marginTop: dotSize / 2 + 4 }}
            >
              {name.length > maxNameLen ? name.slice(0, maxNameLen) + '…' : name}
            </div>
          </React.Fragment>
        );
      })}
      <BottleSVG
        className={`bottle-svg${onSpin ? ' clickable' : ''}`}
        width={80}
        height={160}
        {...(onSpin && {
          onClick: onSpin,
          role: 'button',
          tabIndex: 0,
          'aria-label': 'Крутить бутылку',
          onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onSpin(),
        })}
        style={{
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transformOrigin: '50% 50%',
        }}
      />
    </div>
  );
}
