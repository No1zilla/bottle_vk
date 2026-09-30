import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import bridge from '@vkontakte/vk-bridge';

export const CURRENCY = '❤'; // как в хабе: сердечки общие для обоих приложений

// Игровой сервер общий с vk-games-hub. Пусто — тот же адрес (в разработке Vite проксирует на localhost:3000)
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

const inVK = () => /[?&]vk_app_id=/.test(window.location.search);

// Вне ВК — dev-вход: ?dev_user=2 во второй вкладке, чтобы поиграть с самим собой.
// Сервер пускает так только с localhost и при DEV_AUTH=1.
function devLaunchParams() {
  const fromUrl = new URLSearchParams(window.location.search).get('dev_user');
  if (fromUrl) return `dev:${fromUrl}`;
  let id = localStorage.getItem('dev_user');
  if (!id) {
    id = String(1_000_000 + Math.floor(Math.random() * 1_000_000));
    localStorage.setItem('dev_user', id);
  }
  return `dev:${id}`;
}

async function vkProfile() {
  try {
    const u = await Promise.race([
      bridge.send('VKWebAppGetUserInfo'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), inVK() ? 5000 : 800)),
    ]);
    return { name: `${u.first_name} ${u.last_name}`.trim(), photo: u.photo_100 || '', sex: u.sex || 0 };
  } catch {
    const id = devLaunchParams().slice(4);
    return { name: `Игрок ${id}`, photo: '', sex: 0 };
  }
}

const ServerContext = createContext(null);

export function ServerProvider({ children }) {
  const [status, setStatus] = useState('connecting'); // connecting | online | offline | error
  const [me, setMe] = useState(null);
  const [wallet, setWallet] = useState(null); // { coins, bonusAvailable, vip, ... } — присылает сервер
  const socketRef = useRef(null);

  useEffect(() => {
    let socket;
    let cancelled = false;
    (async () => {
      const profile = await vkProfile();
      if (cancelled) return;
      socket = io(SERVER_URL || undefined, {
        // app нужен только в dev-режиме: в ВК сервер узнаёт приложение по подписи
        auth: { launchParams: inVK() ? window.location.search : devLaunchParams(), profile, app: 'tasks' },
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('connect', async () => {
        const res = await call(socket, 'me');
        if (res.ok) {
          setMe(res.user);
          setWallet(res.wallet);
        }
        setStatus('online');
      });
      socket.on('disconnect', () => setStatus('offline'));
      socket.on('connect_error', (e) => setStatus(e.message === 'unauthorized' ? 'error' : 'offline'));
      socket.on('wallet', setWallet);
    })();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      me,
      wallet,
      socket: socketRef.current,
      call: (event, data) => call(socketRef.current, event, data),
    }),
    [status, me, wallet]
  );

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
}

function call(socket, event, data = {}) {
  if (!socket?.connected) return Promise.resolve({ ok: false, error: 'offline', message: 'Нет связи с сервером' });
  return socket
    .timeout(10_000)
    .emitWithAck(event, data)
    .catch(() => ({ ok: false, error: 'timeout', message: 'Сервер не ответил' }));
}

export const useServer = () => useContext(ServerContext);

// Подписка на событие сокета с автоматической отпиской
export function useSocketEvent(event, handler) {
  const { socket } = useServer();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!socket) return;
    const fn = (...args) => ref.current(...args);
    socket.on(event, fn);
    return () => socket.off(event, fn);
  }, [socket, event]);
}
