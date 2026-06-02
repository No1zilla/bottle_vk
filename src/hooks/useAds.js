import bridge from '@vkontakte/vk-bridge';

// VK Mini Apps rule 5.1.5.2: at most one ad per 30 seconds.
const LAST_AD_KEY = 'bottle_last_ad_ts';
const AD_INTERVAL_MS = 30 * 1000;

export function getAdCooldownMs() {
  try {
    const last = parseInt(localStorage.getItem(LAST_AD_KEY) || '0', 10);
    if (!last) return 0;
    const elapsed = Date.now() - last;
    return Math.max(0, AD_INTERVAL_MS - elapsed);
  } catch {
    return 0;
  }
}

function markAdShown() {
  try {
    localStorage.setItem(LAST_AD_KEY, String(Date.now()));
  } catch {}
}

// Banner ads (bottom of the screen during gameplay)
export async function showBanner() {
  try {
    await bridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' });
    return true;
  } catch (e) {
    // banner unavailable (outside VK, ad slot not approved, etc.) — silently skip
    return false;
  }
}

export async function hideBanner() {
  try {
    await bridge.send('VKWebAppHideBannerAd');
  } catch (e) {
    // ignore
  }
}

// Rewarded interstitial ad. Returns true if the ad was successfully shown,
// false otherwise (cooldown active, no ad available, or user declined).
export async function showRewardedAd() {
  if (getAdCooldownMs() > 0) {
    // 30s cooldown still active — refuse to show another ad (rule 5.1.5.2)
    return false;
  }
  try {
    const check = await bridge.send('VKWebAppCheckNativeAds', {
      ad_format: 'reward',
    });
    if (!check?.result) return false;
  } catch (e) {
    return false;
  }
  try {
    const res = await bridge.send('VKWebAppShowNativeAds', {
      ad_format: 'reward',
    });
    const shown = Boolean(res?.result);
    if (shown) markAdShown();
    return shown;
  } catch (e) {
    return false;
  }
}
