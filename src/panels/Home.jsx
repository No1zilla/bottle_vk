import React, { useState, useEffect } from 'react';
import { Panel } from '@vkontakte/vkui';
import BottleSVG from '../components/BottleSVG.jsx';

const NAME_MAX_LEN = 16;
const PLAYERS_MAX = 12;

// Strip emoji / symbol unicode ranges to keep names rendering cleanly inside chips.
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|️|[‍]/gu;
function stripEmoji(s) {
  try {
    return s.replace(EMOJI_RE, '');
  } catch {
    // Safari / older engines without /u + property escapes — fall back to a coarser strip.
    return s.replace(/[☀-➿\u{1F000}-\u{1FFFF}]/gu, '');
  }
}

export default function Home({ id, players, setPlayers, currentUser, onStart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  // Lock body scroll while modal is open + close by ESC.
  useEffect(() => {
    if (!modalOpen) return;
    document.body.classList.add('modal-open');
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  function openModal() {
    setName('');
    setNameError('');
    setModalOpen(true);
  }

  function closeModal() {
    setName('');
    setNameError('');
    setModalOpen(false);
  }

  function onNameChange(e) {
    const v = stripEmoji(e.target.value).slice(0, NAME_MAX_LEN);
    setName(v);
    if (nameError) setNameError('');
  }

  function addPlayer() {
    const trimmed = name.trim().slice(0, NAME_MAX_LEN);
    if (!trimmed) {
      setNameError('Имя не может быть пустым или состоять только из пробелов');
      return;
    }
    // Require at least one letter (any language) — names made of only digits
    // or punctuation aren't real names.
    if (!/\p{L}/u.test(trimmed)) {
      setNameError('Имя должно содержать хотя бы одну букву');
      return;
    }
    if (players.length >= PLAYERS_MAX) {
      setNameError(`Максимум ${PLAYERS_MAX} игроков в одной игре`);
      return;
    }
    setPlayers([
      ...players,
      {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        score: 0,
      },
    ]);
    closeModal();
  }

  function removePlayer(pid) {
    setPlayers(players.filter((p) => p.id !== pid));
  }

  function addMe() {
    if (!currentUser) return;
    if (players.some((p) => p.id === `vk_${currentUser.id}`)) return;
    if (players.length >= PLAYERS_MAX) return;
    const myName = `${currentUser.first_name} (я)`.slice(0, NAME_MAX_LEN);
    setPlayers([
      ...players,
      {
        id: `vk_${currentUser.id}`,
        name: myName,
        photo_100: currentUser.photo_100,
        isMe: true,
        score: 0,
      },
    ]);
  }

  // Close only when the click started AND ended on the overlay itself
  // (prevents accidental close when user starts text selection inside the
  // input and releases the mouse outside).
  function onOverlayMouseDown(e) {
    if (e.target === e.currentTarget) {
      e.currentTarget.dataset.startedOnOverlay = '1';
    } else {
      e.currentTarget.dataset.startedOnOverlay = '';
    }
  }
  function onOverlayClick(e) {
    if (
      e.target === e.currentTarget &&
      e.currentTarget.dataset.startedOnOverlay === '1'
    ) {
      closeModal();
    }
  }

  const canAddMore = players.length < PLAYERS_MAX;

  return (
    <Panel id={id}>
      <div className="panel-head">
        <h1 className="h-display">
          <span className="gradient-text">Бутылочка</span>
        </h1>
        <div className="text-secondary" style={{ marginTop: 6 }}>
          Крути, выполняй задания, набирай очки
        </div>
      </div>

      <div className="home-bottle-wrap">
        <BottleSVG className="home-bottle-svg" width={140} height={300} />
      </div>

      <div style={{ padding: '0 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="h-section">Игроки</h2>
        <span className="text-secondary">{players.length} / {PLAYERS_MAX}</span>
      </div>

      {players.length === 0 ? (
        <div className="empty-state">
          Добавь минимум 2 игроков, чтобы начать партию
        </div>
      ) : (
        <div className="players-row">
          {players.map((p) => {
            const photo = p.photo_100 || '';
            const initials = (p.name || '?')[0].toUpperCase();
            return (
              <div className="player-chip" key={p.id} title={p.name}>
                {photo ? <img src={photo} alt="" /> : initials}
                <button
                  className="player-chip-remove"
                  onClick={() => removePlayer(p.id)}
                  aria-label="Удалить"
                >
                  ×
                </button>
              </div>
            );
          })}
          {canAddMore && (
            <div
              className="player-chip player-chip-add"
              onClick={openModal}
              title="Добавить"
            >
              +
            </div>
          )}
        </div>
      )}

      {!canAddMore && (
        <div
          className="text-secondary"
          style={{ textAlign: 'center', padding: '0.5rem 1rem' }}
        >
          Достигнут лимит {PLAYERS_MAX} игроков
        </div>
      )}

      <div style={{ padding: '1.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {players.length === 0 && (
          <button className="btn-ghost" onClick={openModal}>
            Добавить игрока
          </button>
        )}
        {currentUser && !players.some((p) => p.isMe) && canAddMore && (
          <button className="btn-ghost" onClick={addMe}>
            Добавить меня
          </button>
        )}
        {players.length > 0 && (
          <button
            className="btn-ghost"
            style={{ color: '#ff6b6b' }}
            onClick={() => setPlayers([])}
          >
            Удалить всех
          </button>
        )}
        <button
          className="btn-gradient"
          disabled={players.length < 2}
          onClick={onStart}
        >
          Начать игру
        </button>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={onOverlayMouseDown}
          onClick={onOverlayClick}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-label">
              Имя игрока
              <span style={{ float: 'right', opacity: 0.6 }}>
                {name.length}/{NAME_MAX_LEN}
              </span>
            </div>
            <input
              className="modal-input"
              value={name}
              onChange={onNameChange}
              placeholder="Например, Маша"
              maxLength={NAME_MAX_LEN}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') addPlayer();
              }}
            />
            {nameError && (
              <div
                style={{
                  color: '#ff6b6b',
                  fontSize: '0.8rem',
                  marginTop: '-0.5rem',
                  marginBottom: '0.875rem',
                }}
              >
                {nameError}
              </div>
            )}
            <div className="btn-row">
              <button
                className="btn-gradient"
                onClick={addPlayer}
                disabled={!name.trim() || !/\p{L}/u.test(name)}
              >
                Добавить
              </button>
              <button className="btn-ghost" onClick={closeModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
