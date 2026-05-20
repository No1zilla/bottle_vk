import bridge from '@vkontakte/vk-bridge';

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

// Rewarded interstitial ad. Returns true if the ad was shown (or skipped successfully),
// false if it failed and the caller should fall back to the no-ad path.
export async function showRewardedAd() {
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
    return Boolean(res?.result);
  } catch (e) {
    return false;
  }
}
