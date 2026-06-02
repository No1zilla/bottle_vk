import React, { useState, useEffect } from 'react';
import { Panel } from '@vkontakte/vkui';
import BottleSVG from '../components/BottleSVG.jsx';

const NAME_MAX_LEN = 16;

export default function Home({ id, players, setPlayers, currentUser, onStart }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [modalOpen]);

  function onNameChange(e) {
    setName(e.target.value.slice(0, NAME_MAX_LEN));
  }

  function addPlayer() {
    const trimmed = name.trim().slice(0, NAME_MAX_LEN);
    if (!trimmed) return;
    setPlayers([
      ...players,
      {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        score: 0,
      },
    ]);
    setName('');
    setModalOpen(false);
  }

  function removePlayer(pid) {
    setPlayers(players.filter((p) => p.id !== pid));
  }

  function addMe() {
    if (!currentUser) return;
    if (players.some((p) => p.id === `vk_${currentUser.id}`)) return;
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
        <span className="text-secondary">{players.length} в игре</span>
      </div>

      {players.length === 0 ? (
        <div className="empty-state">
          Добавьте минимум 2 игроков, чтобы начать партию
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
          <div
            className="player-chip player-chip-add"
            onClick={() => setModalOpen(true)}
            title="Добавить"
          >
            +
          </div>
        </div>
      )}

      <div style={{ padding: '1.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {players.length === 0 && (
          <button className="btn-ghost" onClick={() => setModalOpen(true)}>
            Добавить игрока
          </button>
        )}
        {currentUser && !players.some((p) => p.isMe) && (
          <button className="btn-ghost" onClick={addMe}>
            Добавить меня
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
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
            <div className="btn-row">
              <button className="btn-gradient" onClick={addPlayer}>
                Добавить
              </button>
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
