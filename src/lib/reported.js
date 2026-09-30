import { useEffect, useState } from 'react';

// На что игрок уже пожаловался: флажок остаётся красным, в том числе после перезагрузки.
// Ключи — 'msg:<id>' и 'answer:<id>'. Только для вида: повторную жалобу сервер всё равно не засчитает.
const KEY = 'bottle_reported';
const LIMIT = 300;
const EVENT = 'bottle-reported-change';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function markReported(key) {
  const list = load().filter((k) => k !== key);
  list.push(key);
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-LIMIT)));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

// Возвращает функцию has(key); компонент перерисуется, когда где-то отметят новую жалобу
export function useReported() {
  const [set, setSet] = useState(() => new Set(load()));
  useEffect(() => {
    const update = () => setSet(new Set(load()));
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return (key) => set.has(key);
}
