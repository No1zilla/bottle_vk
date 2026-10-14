import React, { useEffect, useState } from 'react';

const PING_URL = 'https://no1zilla.github.io/bottle_vk/favicon.svg';
const PING_INTERVAL_MS = 10000;
const PING_TIMEOUT_MS = 4000;

async function checkOnline() {
  // navigator.onLine is unreliable in mobile WebViews — do a real network probe.
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    // Cache-buster so the request actually hits the network.
    const url = `${PING_URL}?_=${Date.now()}`;
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      const ok = await checkOnline();
      if (!cancelled) setOnline(ok);
    }

    // Initial check + periodic polling.
    probe();
    const id = setInterval(probe, PING_INTERVAL_MS);

    // Also react to browser events as a fast hint.
    const handleOnline = () => probe();
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="offline-banner">
      ⚠️ Нет интернета. Прогресс сохраняется локально и синхронизируется при подключении.
    </div>
  );
}
