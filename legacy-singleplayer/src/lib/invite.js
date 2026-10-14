import bridge from '@vkontakte/vk-bridge';

// «Позвать друга» — как в хабе (vk-games-hub/client/src/panels/BottleTable.jsx).
// Окна приглашений ВК есть не везде (веб-версия, неопубликованное приложение) — тогда делимся ссылкой,
// а если и шеринг недоступен — копируем её. notify — показать короткое сообщение игроку.
export async function inviteFriend(notify) {
  const appId = new URLSearchParams(window.location.search).get('vk_app_id');
  if (!appId) return notify('Приглашения работают внутри ВКонтакте');
  const link = `https://vk.com/app${appId}`;
  if (typeof window.ym === 'function') window.ym(113107611, 'reachGoal', 'invite');
  const cancelled = (e) => e?.error_data?.error_code === 4 || e?.error_data?.error_reason === 'User denied';
  try {
    await bridge.send('VKWebAppShowInviteBox');
    return;
  } catch (e) {
    if (cancelled(e)) return;
    console.warn('invite box', e);
  }
  try {
    await bridge.send('VKWebAppShare', { link });
  } catch (e) {
    if (cancelled(e)) return;
    console.warn('share', e);
    try {
      await bridge.send('VKWebAppCopyText', { text: link });
      notify('Ссылка скопирована — отправьте её другу');
    } catch {
      notify(`Отправьте другу ссылку: ${link}`);
    }
  }
}
