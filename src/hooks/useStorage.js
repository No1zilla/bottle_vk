import bridge from '@vkontakte/vk-bridge';

const SCORE_KEY = 'bottle_score';
const STATS_KEY = 'bottle_stats';

function withTimeout(promise, ms = 800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function storageGet(key) {
  try {
    const res = await withTimeout(bridge.send('VKWebAppStorageGet', { keys: [key] }));
    const item = res.keys?.find((k) => k.key === key);
    return item?.value || '';
  } catch (e) {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }
}

async function storageSet(key, value) {
  try {
    await withTimeout(bridge.send('VKWebAppStorageSet', { key, value: String(value) }));
  } catch (e) {
    try {
      localStorage.setItem(key, String(value));
    } catch {}
  }
}

export async function getScore() {
  const v = await storageGet(SCORE_KEY);
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function setScore(n) {
  await storageSet(SCORE_KEY, n);
}

export async function addScore(delta) {
  const cur = await getScore();
  const next = cur + delta;
  await setScore(next);
  return next;
}

export async function getStats() {
  const v = await storageGet(STATS_KEY);
  if (!v) return { games: 0, tasks: 0 };
  try {
    const obj = JSON.parse(v);
    return {
      games: obj.games || 0,
      tasks: obj.tasks || 0,
    };
  } catch {
    return { games: 0, tasks: 0 };
  }
}

export async function setStats(obj) {
  await storageSet(STATS_KEY, JSON.stringify(obj));
}

export async function bumpStats(patch) {
  const cur = await getStats();
  const next = {
    games: cur.games + (patch.games || 0),
    tasks: cur.tasks + (patch.tasks || 0),
  };
  await setStats(next);
  return next;
}

export default {
  getScore,
  setScore,
  addScore,
  getStats,
  setStats,
  bumpStats,
};
