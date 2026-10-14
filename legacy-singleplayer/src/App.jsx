import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  SplitLayout,
  SplitCol,
  View,
  Epic,
  Tabbar,
  TabbarItem,
  ConfigProvider,
} from '@vkontakte/vkui';
import {
  Icon28GameOutline,
  Icon28FavoriteOutline,
  Icon28UserCircleOutline,
} from '@vkontakte/icons';
import Game from './panels/Game.jsx';
import Results from './panels/Results.jsx';
import Leaderboard from './panels/Leaderboard.jsx';
import Profile from './panels/Profile.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import { useVKUser } from './hooks/useVKUser.js';
import { ServerProvider } from './lib/server.jsx';

export default function App() {
  const [story, setStory] = useState('game');
  const [activePanel, setActivePanel] = useState('gameplay');
  // Итоговая таблица стола, из-за которого вышли
  const [finalPlayers, setFinalPlayers] = useState([]);
  // Новый ключ — новый вход за стол при «Играть снова»
  const [gameKey, setGameKey] = useState(0);
  const [scheme, setScheme] = useState('space_gray');
  const { user } = useVKUser();

  useEffect(() => {
    let unsub;
    try {
      unsub = bridge.subscribe(({ detail }) => {
        if (!detail) return;
        if (detail.type === 'VKWebAppUpdateConfig') {
          const s = detail.data?.scheme;
          if (s) setScheme(s);
        }
      });
    } catch (e) {
      // ignore in browser
    }
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  function endGame(players) {
    setFinalPlayers(players);
    setActivePanel('results');
  }

  function playAgain() {
    setGameKey((k) => k + 1);
    setActivePanel('gameplay');
  }

  const appearance =
    scheme === 'space_gray' || scheme === 'vkcom_dark' || scheme === 'client_dark'
      ? 'dark'
      : 'light';

  return (
    <ServerProvider>
    <ConfigProvider appearance={appearance}>
      <SplitLayout>
        <SplitCol>
          <OfflineBanner />
          <Epic
            activeStory={story}
            tabbar={
              <Tabbar>
                <TabbarItem
                  onClick={() => setStory('game')}
                  selected={story === 'game'}
                  text="Игра"
                >
                  <Icon28GameOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('leaderboard')}
                  selected={story === 'leaderboard'}
                  text="Рейтинг"
                >
                  <Icon28FavoriteOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('profile')}
                  selected={story === 'profile'}
                  text="Профиль"
                >
                  <Icon28UserCircleOutline />
                </TabbarItem>
              </Tabbar>
            }
          >
            <View id="game" activePanel={activePanel}>
              <Game key={gameKey} id="gameplay" onEndGame={endGame} />
              <Results id="results" players={finalPlayers} onPlayAgain={playAgain} />
            </View>

            <View id="leaderboard" activePanel="leaderboard">
              <Leaderboard id="leaderboard" />
            </View>

            <View id="profile" activePanel="profile">
              <Profile id="profile" currentUser={user} />
            </View>
          </Epic>
        </SplitCol>
      </SplitLayout>
    </ConfigProvider>
    </ServerProvider>
  );
}
