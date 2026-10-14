import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge';
import { AdaptivityProvider, ConfigProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import App from './App.jsx';
import './styles.css';

// Expose bridge globally so VK moderation auto-checks can find it
if (typeof window !== 'undefined') {
  window.vkBridge = bridge;
  window.vkConnect = bridge;
}

// Init VK Bridge (safe to call outside VK — falls through to catch)
try {
  bridge.send('VKWebAppInit', {});
} catch (e) {
  console.warn('VK Bridge init failed (running outside VK):', e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <App />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>
);
