import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Panel } from '@vkontakte/vkui';
import BottleSpinner from '../components/BottleSpinner.jsx';
import TaskCard from '../components/TaskCard.jsx';
import AnswerSwipeCard from '../components/AnswerSwipeCard.jsx';
import TableFeed from '../components/TableFeed.jsx';
import { inviteFriend } from '../lib/invite.js';

const CHAT_KEEP = 50; // столько сообщений держим на экране, как история на сервере
import { showBanner, hideBanner, showRewardedAd, getAdCooldownMs } from '../hooks/useAds.js';
import { useServer, useSocketEvent, CURRENCY } from '../lib/server.jsx';

const goal = (name, params) => {
  if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', name, params);
};

// Секунды до дедлайна по часам сервера (разница часов учтена в offset)
function useSecondsLeft(deadline, offset) {
  const calc = () => (deadline ? Math.max(0, Math.ceil((deadline - (Date.now() + offset)) / 1000)) : null);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!deadline) return;
    const id = setInterval(() => setLeft(calc()), 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, offset]);
  return left;
}

export default function Game({ id, onEndGame }) {
  const { status, me, wallet, call } = useServer();
  const [table, setTable] = useState(null);
  const [chat, setChat] = useState([]);
  const [blocked, setBlocked] = useState(() => new Set()); // кого я заблокировал: их ответы и сообщения скрыты
  const [confirmBlock, setConfirmBlock] = useState(null); // id игрока, которого собираемся заблокировать
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [adLoading, setAdLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(() => getAdCooldownMs());
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const errorTimer = useRef(null);
  const spinSent = useRef(false); // двойное нажатие на бутылку не шлёт второй запрос

  const applyState = (s) => {
    setOffset(s.serverNow - Date.now());
    setTable(s);
  };
  const flash = (msg) => {
    setError(msg);
    clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(''), 3000);
  };

  // Садимся за стол при входе и после переподключения (сервер мог перезапуститься)
  useEffect(() => {
    if (status !== 'online') return;
    call('tasks:join').then((res) => {
      if (res.ok) {
        applyState(res.state);
        setChat(res.chat || []);
        setBlocked(new Set(res.blocked || []));
        goal('game_start', { players: res.state.seats.filter(Boolean).length });
      } else flash(res.message || 'Не удалось сесть за стол');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useSocketEvent('tasks:state', applyState);
  useSocketEvent('tasks:chat', (msg) => setChat((c) => [...c, msg].slice(-CHAT_KEEP)));

  useEffect(() => {
    showBanner();
    return () => hideBanner();
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const tick = () => setCooldownLeft(getAdCooldownMs());
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [cooldownLeft > 0]);

  useEffect(() => {
    if (!confirmEndOpen) return;
    document.body.classList.add('modal-open');
    const onKey = (e) => e.key === 'Escape' && setConfirmEndOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [confirmEndOpen]);

  const secondsLeft = useSecondsLeft(table?.deadline, offset);
  // Длительность ответа считаем один раз на раунд, чтобы полоска таймера не перезапускалась.
  // Прямо от дедлайна: secondsLeft в этот момент ещё показывает остаток прошлой фазы (≈0)
  const answerSeconds = useMemo(
    () =>
      table?.phase === 'answer' && table.deadline
        ? Math.max(1, Math.round((table.deadline - (Date.now() + offset)) / 1000))
        : 30,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table?.round, table?.phase]
  );

  if (!table || !me) {
    return (
      <Panel id={id}>
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          {status === 'error' ? 'Не удалось войти. Перезапустите приложение.' : 'Ищем стол…'}
        </div>
        {error && <div className="empty-state">{error}</div>}
      </Panel>
    );
  }

  const seats = table.seats;
  const spinner = seats[table.turn];
  const target = table.target != null ? seats[table.target] : null;
  const myTurn = table.phase === 'spin' && spinner?.id === me.id;
  const iAnswer = table.phase === 'answer' && target?.id === me.id;
  const players = seats.filter(Boolean);

  async function claimBonus() {
    const res = await call('bonus:claim');
    if (res.ok) {
      flash(`+${res.amount} ${CURRENCY} — ежедневный бонус`);
      goal('bonus_claim', { amount: res.amount });
    } else flash(res.message || 'Не получилось');
  }

  async function toggleBlock(id) {
    const unblock = blocked.has(id);
    const res = await call(unblock ? 'user:unblock' : 'user:block', { id });
    setConfirmBlock(null);
    if (!res.ok) return flash(res.message || 'Не получилось');
    setBlocked((b) => {
      const next = new Set(b);
      unblock ? next.delete(id) : next.add(id);
      return next;
    });
    flash(unblock ? 'Игрок разблокирован' : 'Игрок заблокирован: его ответы и сообщения скрыты');
    goal(unblock ? 'player_unblock' : 'player_block');
  }

  async function spin() {
    if (spinSent.current) return;
    spinSent.current = true;
    goal('round_spin', { players: players.length });
    const res = await call('tasks:spin');
    spinSent.current = false;
    if (!res.ok) flash(res.message || 'Не получилось');
  }

  async function answer(text) {
    setSubmitting(true);
    const res = await call('tasks:answer', { text });
    setSubmitting(false);
    if (res.ok) goal('answer_submit', { level: table.task?.level, answer_length: text.length });
    else flash(res.message || 'Ответ не отправлен');
  }

  async function skip() {
    if (adLoading || cooldownLeft > 0) return;
    setAdLoading(true);
    try {
      // Реклама за пропуск. Вне ВК или без слота — пропускаем без неё, но не ждём дольше 8 с
      await Promise.race([showRewardedAd(), new Promise((r) => setTimeout(r, 8000))]);
    } catch {
      // всегда отпускаем интерфейс
    } finally {
      setAdLoading(false);
      setCooldownLeft(getAdCooldownMs());
    }
    const res = await call('tasks:skip');
    if (res.ok) goal('task_skip');
  }

  async function endGame() {
    setConfirmEndOpen(false);
    goal('game_end', { players: players.length });
    await call('tasks:leave');
    onEndGame(players.map((p) => ({ ...p, photo_100: p.photo, isMe: p.id === me.id })));
  }

  let statusLine = null;
  if (table.phase === 'waiting') statusLine = 'Ждём второго игрока…';
  else if (table.phase === 'spinning') statusLine = 'Бутылка крутится…';
  else if (table.phase === 'spin' && !myTurn) statusLine = `Крутит ${spinner?.name || ''} · ${secondsLeft ?? ''} с`;

  return (
    <Panel id={id}>
      <div className="banner" style={{ marginTop: '1rem' }}>
        <div>
          <div className="banner-label">Сейчас крутит</div>
          <div className="banner-value">{myTurn ? 'Вы' : spinner?.name || '—'}</div>
        </div>
        {wallet && (
          <div className="banner-score" title="Ваши сердечки" style={{ flex: 'none', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
            {wallet.coins} {CURRENCY}
          </div>
        )}
      </div>

      {wallet?.bonusAvailable && (
        <div style={{ padding: '0 1rem', marginTop: '0.75rem' }}>
          <button className="btn-success" onClick={claimBonus}>
            🎁 Забрать ежедневный бонус
          </button>
        </div>
      )}

      <BottleSpinner
        seats={seats}
        isSpinning={table.phase === 'spinning'}
        targetIndex={table.target}
        spinnerIndex={table.turn}
        restorePhase={table.phase === 'answer' || table.phase === 'result'}
        onSpin={myTurn ? spin : undefined}
        onInvite={() => inviteFriend(flash)}
      />

      {table.phase === 'spin' && table.missed && (
        <div className="empty-state" style={{ padding: '0.25rem 1.5rem 0.875rem' }}>
          {table.missed.name} {table.missed.reason === 'skipped' ? 'пропускает задание' : 'не успел(а) ответить'}
        </div>
      )}

      {myTurn && (
        <div style={{ padding: '0 1rem', marginBottom: '0.75rem' }}>
          <button className="btn-gradient" onClick={spin}>
            Крутить бутылку ({secondsLeft})
          </button>
        </div>
      )}

      {statusLine && <div className="empty-state">{statusLine}</div>}
      {status !== 'online' && <div className="empty-state">Нет связи с сервером, переподключаемся…</div>}
      {error && <div className="empty-state">{error}</div>}

      {table.phase === 'answer' && table.task && (
        <TaskCard
          key={table.round}
          task={table.task}
          toPlayer={target?.bot ? { ...target, name: `🤖 ${target.name}` } : target}
          onComplete={answer}
          onSkip={skip}
          showTimer
          timerSeconds={answerSeconds}
          actionsDisabled={!iAnswer}
          submitting={submitting}
          skipLabel={
            cooldownLeft > 0 ? `Пропуск через ${Math.ceil(cooldownLeft / 1000)} с` : adLoading ? 'Реклама…' : 'Пропустить 📺'
          }
          skipDisabled={adLoading || cooldownLeft > 0}
        />
      )}

      {table.phase === 'result' && (
        <AnswerSwipeCard
          key={table.round}
          name={`${target?.bot ? '🤖 ' : ''}${target?.name || 'Игрок'}`}
          answer={table.answer}
          blockedAuthor={!!target && blocked.has(target.id)}
          canReact={!!(table.answer?.id && target && target.id !== me.id)}
          // На бота тоже можно: жалоба попадёт в журнал заготовок, а не в мут
          canReport={!!(table.answer?.id && target && target.id !== me.id)}
          secondsLeft={secondsLeft}
          onReport={(answerId) =>
            call('tasks:report', { answerId }).then((r) => {
              flash(r.ok ? 'Жалоба отправлена, спасибо' : r.message);
              return r;
            })
          }
          onLike={(answerId) =>
            call('tasks:like', { answerId }).then((r) => {
              if (r.ok) goal('answer_like', { bot: !!target?.bot });
              else if (r.error !== 'already_liked') flash(r.message);
              return r;
            })
          }
          onDislike={(answerId) =>
            call('tasks:dislike', { answerId }).then((r) => {
              if (r.ok) goal('answer_dislike', { bot: !!target?.bot });
              return r;
            })
          }
        />
      )}

      <div className="scoreboard-mini">
        <div className="scoreboard-mini-title">Заработано за столом</div>
        {seats.map((p, i) =>
          p ? (
            <div key={p.id} className={`scoreboard-row${i === table.turn ? ' current' : ''}`}>
              <span className="scoreboard-name">
                {p.bot ? '🤖 ' : ''}
                {p.name}
                {p.id === me.id ? ' (я)' : ''}
                {blocked.has(p.id) ? ' · заблокирован' : ''}
              </span>
              {confirmBlock === p.id ? (
                <span className="block-confirm">
                  <button onClick={() => toggleBlock(p.id)}>{blocked.has(p.id) ? 'Разблокировать' : 'Заблокировать'}</button>
                  <button onClick={() => setConfirmBlock(null)}>Отмена</button>
                </span>
              ) : (
                <span className="scoreboard-score">
                  {p.score || 0} {CURRENCY}
                  {!p.bot && p.id !== me.id && (
                    <button
                      className="block-btn"
                      title={blocked.has(p.id) ? 'Разблокировать' : 'Заблокировать'}
                      aria-label={blocked.has(p.id) ? 'Разблокировать игрока' : 'Заблокировать игрока'}
                      onClick={() => setConfirmBlock(p.id)}
                    >
                      {blocked.has(p.id) ? '↺' : '🚫'}
                    </button>
                  )}
                </span>
              )}
            </div>
          ) : null
        )}
      </div>

      <TableFeed
        meId={me.id}
        chat={chat.filter((m) => !blocked.has(m.from))}
        history={table.history || []}
        blocked={blocked}
        onSend={(text) =>
          call('tasks:chat', { text }).then((r) => {
            if (r.ok) goal('chat_send');
            else flash(r.message || 'Сообщение не отправлено');
            return r;
          })
        }
        onReport={(messageId) =>
          call('tasks:report', { messageId }).then((r) => {
            flash(r.ok ? 'Жалоба отправлена, спасибо' : r.message);
            return r;
          })
        }
        onReportAnswer={(answerId) =>
          call('tasks:report', { answerId }).then((r) => {
            flash(r.ok ? (r.hidden ? 'Жалоба отправлена, ответ скрыт' : 'Жалоба отправлена, спасибо') : r.message);
            return r;
          })
        }
      />

      <div style={{ padding: '1rem' }}>
        <button className="btn-ghost" onClick={() => setConfirmEndOpen(true)}>
          Выйти из-за стола
        </button>
      </div>
      {/* Чтобы нижний рекламный баннер ВК не закрывал последнюю кнопку */}
      <div style={{ height: 72 }} />

      {confirmEndOpen && (
        <div className="modal-overlay" onClick={() => setConfirmEndOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              Выйти из-за стола?
            </div>
            <div className="text-secondary" style={{ marginBottom: '1.25rem' }}>
              Сердечки уже на вашем счету. Появится итоговая таблица этого стола.
            </div>
            <div className="btn-row">
              <button className="btn-gradient" onClick={endGame}>
                Выйти
              </button>
              <button className="btn-ghost" onClick={() => setConfirmEndOpen(false)}>
                Остаться
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
